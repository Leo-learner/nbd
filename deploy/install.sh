#!/usr/bin/env bash
set -euo pipefail
archive=${1:?archive required}
commit=${2:?commit required}
expected_hash=${3:?archive hash required}
[[ $EUID -eq 0 && $commit =~ ^[a-f0-9]{40}$ && $expected_hash =~ ^[a-f0-9]{64}$ ]]
[[ $archive =~ ^/tmp/nbd-[a-f0-9]{40}\.tar\.gz$ ]]
printf '%s  %s\n' "$expected_hash" "$archive" | sha256sum -c -
base=/opt/apps/nbd
release="$base/releases/$commit"
site=/etc/nginx/sites-available/nbd.dkz12345.com
previous=$(readlink -f "$base/current" 2>/dev/null || true)
previous_frontend=$(readlink -f "$base/frontend" 2>/dev/null || true)
staging=$(mktemp -d /tmp/nbd-install.XXXXXX)
previous_site=""
previous_env=""
if [[ -f $site ]]; then cp -a "$site" "$staging/site.previous"; previous_site="$staging/site.previous"; fi
if [[ -f /etc/nbd.env ]]; then cp -a /etc/nbd.env "$staging/env.previous"; previous_env="$staging/env.previous"; fi
rollback() {
  status=$?
  trap - ERR
  set +e
  if [[ -n $previous ]]; then
    ln -s "$previous" "$base/current.rollback"
    mv -Tf "$base/current.rollback" "$base/current"
  fi
  if [[ -n $previous_frontend ]]; then ln -s "$previous_frontend" "$base/frontend.rollback"; mv -Tf "$base/frontend.rollback" "$base/frontend"; fi
  if [[ -n $previous_env ]]; then cp -a "$previous_env" /etc/nbd.env; fi
  if [[ -n $previous_site ]]; then cp -a "$previous_site" "$site"; else rm -f /etc/nginx/sites-enabled/nbd.dkz12345.com "$site"; fi
  nginx -t && systemctl reload nginx
  if [[ -n $previous ]]; then systemctl restart nbd; else systemctl stop nbd; fi
  printf 'Deployment failed; compatible prior release restored. Database migrations were not reversed.\n' >&2
  exit "$status"
}
trap rollback ERR
if [[ -z $previous ]] && ss -ltnH 'sport = :3230' | grep -q .; then echo 'Port 3230 is already in use' >&2; exit 1; fi
if ! id nbd >/dev/null 2>&1; then useradd --system --home-dir /var/lib/nbd --shell /usr/sbin/nologin nbd; fi
install -d -m 700 -o nbd -g nbd /var/lib/nbd
install -d -m 755 "$base/releases" "$base/frontend-releases"
if [[ ! -d $release ]]; then
  install -d -m 755 "$release"
  tar -xzf "$archive" -C "$release" --no-same-owner
  [[ $(node -p "JSON.parse(require('fs').readFileSync('$release/RELEASE.json')).commit") == "$commit" ]]
  chown -R nbd:nbd "$release"
  (cd "$release" && runuser -u nbd -- npm ci --omit=dev --cache /var/lib/nbd/npm-cache --no-audit --no-fund)
  (cd "$release" && runuser -u nbd -- node --input-type=module -e 'import Database from "better-sqlite3"; import argon2 from "argon2";const db=new Database(":memory:");db.exec("CREATE VIRTUAL TABLE t USING fts5(text,tokenize=trigram)");db.close();await argon2.hash("native-module-check");')
  chown -R root:root "$release"
fi
install -m 644 "$release/deploy/nginx-logformat.conf" /etc/nginx/conf.d/nbd-logformat.conf
install -m 640 -o root -g nbd "$release/deploy/nbd.env" /etc/nbd.env
if [[ -n $previous ]]; then (cd "$previous" && runuser -u nbd -- node --env-file=/etc/nbd.env dist/scripts/admin.js backup); fi
systemctl stop nbd 2>/dev/null || true
(cd "$release" && runuser -u nbd -- node --env-file=/etc/nbd.env dist/scripts/admin.js migrate)
install -m 644 "$release/deploy/nbd.service" /etc/systemd/system/nbd.service
install -m 644 "$release/deploy/nbd-backup.service" /etc/systemd/system/nbd-backup.service
install -m 644 "$release/deploy/nbd-backup.timer" /etc/systemd/system/nbd-backup.timer
ln -s "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
if [[ -z $previous_frontend ]]; then
  install -d -m 755 "$base/frontend-releases/initial"
  cp "$release/public/index.html" "$base/frontend-releases/initial/index.html"
  chmod 644 "$base/frontend-releases/initial/index.html"
  ln -s "$base/frontend-releases/initial" "$base/frontend"
fi
systemctl daemon-reload
systemctl enable --now nbd nbd-backup.timer
ready=false
for attempt in {1..30}; do if curl -fsS http://127.0.0.1:3230/readyz; then ready=true; break; fi; sleep 1; done
[[ $ready == true ]]
install -d -m 755 /var/www/letsencrypt/.well-known/acme-challenge
if [[ ! -f /etc/letsencrypt/live/nbd.dkz12345.com/fullchain.pem ]]; then
  cat > "$site" <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name nbd.dkz12345.com;
    access_log /var/log/nginx/nbd.access.log nbd_noquery;
    location ^~ /.well-known/acme-challenge/ { root /var/www/letsencrypt; }
    location / { return 503; }
}
NGINX
  ln -sfn "$site" /etc/nginx/sites-enabled/nbd.dkz12345.com
  nginx -t
  systemctl reload nginx
  certbot certonly --webroot -w /var/www/letsencrypt -d nbd.dkz12345.com --non-interactive --agree-tos --register-unsafely-without-email
fi
install -m 644 "$release/deploy/nginx.conf" "$site"
ln -sfn "$site" /etc/nginx/sites-enabled/nbd.dkz12345.com
nginx -t
systemctl reload nginx
install -m 755 "$release/deploy/renew-certificate.sh" /etc/letsencrypt/renewal-hooks/deploy/nbd-reload.sh
curl -fsS --resolve nbd.dkz12345.com:443:127.0.0.1 https://nbd.dkz12345.com/readyz
[[ $(curl -s --resolve nbd.dkz12345.com:443:127.0.0.1 -o /dev/null -w '%{http_code}' -X POST https://nbd.dkz12345.com/mcp) == 401 ]]
trap - ERR
rm -f "$archive"
rm -rf "$staging"
printf 'NBD deployed commit %s\n' "$commit"
