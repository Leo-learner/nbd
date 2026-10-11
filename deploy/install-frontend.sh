#!/usr/bin/env bash
set -euo pipefail
archive=${1:?archive required}
commit=${2:?commit required}
expected_hash=${3:?archive hash required}
[[ $EUID -eq 0 && $commit =~ ^[a-f0-9]{40}$ && $expected_hash =~ ^[a-f0-9]{64}$ ]]
[[ $archive =~ ^/tmp/nbd-frontend-[a-f0-9]{40}\.tar\.gz$ ]]
printf '%s  %s\n' "$expected_hash" "$archive" | sha256sum -c -
base=/opt/apps/nbd
previous=$(readlink -f "$base/frontend")
release="$base/frontend-releases/$commit"
[[ -d $previous ]]
staging=""
cleanup(){ if [[ -n $staging ]]; then rm -rf "$staging"; fi; }
trap cleanup EXIT
if [[ -e $release ]]; then
  [[ $(tar -xOf "$archive" ./frontend-release.json) == $(cat "$release/frontend-release.json") ]] || { echo 'Existing commit release differs from this build' >&2; exit 1; }
  candidate="$release"
else
  staging=$(mktemp -d "$base/frontend-releases/.install-$commit.XXXXXX")
  candidate="$staging"
  tar -xzf "$archive" -C "$candidate" --no-same-owner
  chmod -R u=rwX,go=rX "$candidate"
  chown -R root:root "$candidate"
fi
node --input-type=module - "$candidate" "$commit" <<'JS'
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const root=process.argv[2],manifest=JSON.parse(readFileSync(`${root}/frontend-release.json`));
if(manifest.commit!==process.argv[3]||!manifest.files['index.html'])throw Error('Invalid frontend release');
for(const [path,hash] of Object.entries(manifest.files)){if(path.startsWith('/')||path.split('/').includes('..'))throw Error('Invalid path');if(createHash('sha256').update(readFileSync(`${root}/${path}`)).digest('hex')!==hash)throw Error(`Hash mismatch: ${path}`);}
JS
if [[ -n $staging ]]; then mv "$staging" "$release"; staging=""; fi
switch_link() {
  node --input-type=module - "$1" "$2" <<'SWITCH_JS'
import { mkdtempSync, realpathSync, renameSync, rmSync, statSync, symlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
const [target, destination] = process.argv.slice(2);
if (!statSync(target).isDirectory()) throw new Error('Release target is not a directory');
const temporary = mkdtempSync(join(dirname(destination), '.nbd-switch-'));
try {
  const link = join(temporary, 'link');
  symlinkSync(target, link);
  renameSync(link, destination);
  if (realpathSync(destination) !== realpathSync(target)) throw new Error('Release switch target mismatch');
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
SWITCH_JS
}
rollback(){
  status=$?
  trap - ERR
  if switch_link "$previous" "$base/frontend"; then
    echo 'Frontend switch failed; previous release restored' >&2
  else
    echo 'Frontend switch failed; rollback link could not be restored' >&2
  fi
  exit "$status"
}
trap rollback ERR
switch_link "$release" "$base/frontend"
node --input-type=module - "$release" <<'JS'
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const root=process.argv[2],manifest=JSON.parse(readFileSync(`${root}/frontend-release.json`));
for(const [path,hash] of Object.entries(manifest.files)){const response=await fetch(`http://127.0.0.1:3230/${path}`,{headers:{Host:'nbd.dkz12345.com'}});if(!response.ok||createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex')!==hash)throw Error(`HTTP verification failed: ${path}`);}
JS
curl -fsS http://127.0.0.1:3230/readyz
trap - ERR
rm -f "$archive"
printf 'Frontend deployed commit %s; previous release: %s\n' "$commit" "$previous"
