#!/usr/bin/env bash
set -euo pipefail

# Read-only health and count report. This script never restarts services,
# validates Nginx by opening its log files, edits files, or prints record data.
database=${1:-/var/lib/nbd/nbd.sqlite}
script_source=${BASH_SOURCE[0]:-}
if [[ -n ${NBD_READONLY_APP_ROOT:-} ]]; then
  app_root=$NBD_READONLY_APP_ROOT
elif [[ -z $script_source || $script_source == /dev/stdin || $script_source == bash || $script_source == - ]]; then
  # Supports `ssh host 'bash -s' < server-readonly.sh` without relying on the
  # remote shell's stdin path. Callers may override this for another layout.
  app_root=/opt/apps/nbd/current
else
  app_root=$(cd -- "$(dirname -- "$script_source")/.." && pwd -P)
fi

printf 'system:\n'
printf 'hostname=%s\n' "$(hostname 2>/dev/null || printf unavailable)"
printf 'kernel=%s\n' "$(uname -sr 2>/dev/null || printf unavailable)"
printf 'uptime=%s\n' "$(uptime -p 2>/dev/null || printf unavailable)"
if command -v free >/dev/null 2>&1; then
  free -b | awk 'NR == 2 { printf "memory_bytes_total=%s\nmemory_bytes_used=%s\nmemory_bytes_available=%s\n", $2, $3, $7 }'
else
  printf 'memory_statistics=unavailable\n'
fi
if [[ -e $database ]]; then
  df -P "$database" | awk 'NR == 2 { printf "database_filesystem_used=%s\n", $5 }'
else
  printf 'database_file=missing\n'
fi
for unit in nbd nginx; do
  state=$(systemctl is-active "$unit" 2>/dev/null || true)
  printf '%s_service=%s\n' "$unit" "${state:-unavailable}"
done
if command -v ss >/dev/null 2>&1; then
  ss -ltnH 2>/dev/null | awk 'END { printf "tcp_listeners=%d\n", NR }'
  ss -ltnH 2>/dev/null | awk '$4 ~ /:(80|443)$/ { n++ } END { printf "nginx_http_listeners=%d\n", n + 0 }'
else
  printf 'tcp_listeners=unavailable\n'
fi

printf 'nginx:\n'
if command -v nginx >/dev/null 2>&1; then
  version=$(nginx -v 2>&1 | sed -E 's/^nginx version: //')
  printf 'version=%s\n' "$version"
else
  printf 'version=unavailable\n'
fi
site_count=0
for site in /etc/nginx/sites-enabled/*; do
  if [[ -L $site ]]; then ((site_count += 1)); fi
done
printf 'enabled_site_links=%s\n' "$site_count"

printf 'database_counts:\n'
if [[ -f "$database-wal" && -f "$database-shm" ]]; then
  NBD_READONLY_APP_ROOT="$app_root" node - "$database" <<'NODE'
const Database = require(`${process.env.NBD_READONLY_APP_ROOT}/node_modules/better-sqlite3`);
let db;
try {
  db = new Database(process.argv[2], {
    readonly: true,
    fileMustExist: true,
    timeout: 1000,
  });
  db.pragma("query_only = ON");
  if (db.pragma("query_only", { simple: true }) !== 1) {
    throw new Error("query-only mode unavailable");
  }
  const tables = [
    "users", "sessions", "moments", "moment_revisions", "moment_notes",
    "reflections", "lessons", "lesson_moments", "reflection_lessons",
    "tags", "moment_tags", "idempotency_keys", "agent_keys",
    "oauth_clients", "oauth_requests", "oauth_grants", "oauth_codes",
    "oauth_tokens", "audit_events",
  ];
  for (const table of tables) {
    const count = db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n;
    console.log(`${table}=${count}`);
  }
  const snapshotKeys = [
    "title", "narrative", "agentSummary", "scene", "intensity", "severity",
    "fearedOutcome", "outcomeKnownBy", "thoughts", "bodySignals",
    "immediateResponse", "happenedAt", "happenedOn", "happenedAtPrecision",
    "emotions", "people",
  ];
  const normalizeSnapshot = (value) => {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Object.fromEntries(snapshotKeys.map((key) => [
      key,
      Object.hasOwn(parsed, key) ? parsed[key] : null,
    ]));
  };
  const revisions = db.prepare(`
    SELECT r.moment_id, r.revision, r.snapshot_json, m.revision AS current_revision,
      m.title, m.narrative, m.agent_summary, m.scene, m.intensity, m.severity,
      m.feared_outcome, m.outcome_known_by, m.thoughts, m.body_signals,
      m.immediate_response, m.happened_at, m.happened_on, m.happened_precision,
      m.emotions_json, m.people_json
    FROM moment_revisions AS r
    JOIN moments AS m ON m.id = r.moment_id
    ORDER BY r.moment_id, r.revision
  `).all();
  let identical = 0;
  let lastByMoment = new Map();
  for (const revision of revisions) {
    const prior = lastByMoment.get(revision.moment_id);
    const current = normalizeSnapshot(revision.snapshot_json);
    if (prior && revision.revision === prior.revision + 1 &&
        JSON.stringify(current) === JSON.stringify(prior.snapshot)) {
      identical++;
    }
    lastByMoment.set(revision.moment_id, {
      revision: revision.revision,
      currentRevision: revision.current_revision,
      snapshot: current,
      row: revision,
    });
  }
  for (const prior of lastByMoment.values()) {
    if (prior.currentRevision !== prior.revision + 1) continue;
    const row = prior.row;
    const current = normalizeSnapshot({
      title: row.title,
      narrative: row.narrative,
      agentSummary: row.agent_summary,
      scene: row.scene,
      intensity: row.intensity,
      severity: row.severity,
      fearedOutcome: row.feared_outcome,
      outcomeKnownBy: row.outcome_known_by,
      thoughts: row.thoughts,
      bodySignals: row.body_signals,
      immediateResponse: row.immediate_response,
      happenedAt: row.happened_at == null ? null : new Date(row.happened_at).toISOString(),
      happenedOn: row.happened_on,
      happenedAtPrecision: row.happened_precision,
      emotions: JSON.parse(row.emotions_json),
      people: JSON.parse(row.people_json),
    });
    if (JSON.stringify(current) === JSON.stringify(prior.snapshot)) identical++;
  }
  const empty = db.prepare(
    "SELECT count(*) AS n FROM moment_revisions WHERE changed_fields_json = '[]'",
  ).get().n;
  console.log(`adjacent_identical_snapshot_pairs=${identical}`);
  console.log(`empty_revision_rows=${empty}`);
  const unredeemed = db.prepare(`
    SELECT count(*) AS n
    FROM oauth_grants AS g
    WHERE g.revoked_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM oauth_tokens AS t WHERE t.grant_id = g.id)
  `).get().n;
  const oldUnredeemed = db.prepare(`
    SELECT count(*) AS n
    FROM oauth_grants AS g
    WHERE g.revoked_at IS NULL
      AND g.created_at <= ?
      AND NOT EXISTS (SELECT 1 FROM oauth_tokens AS t WHERE t.grant_id = g.id)
  `).get(Date.now() - 3600000).n;
  console.log(`unredeemed_active_grants=${unredeemed}`);
  console.log(`old_unredeemed=${oldUnredeemed}`);
  const check = db.pragma("quick_check", { simple: true });
  console.log(`database_quick_check=${check === "ok" ? "ok" : "failed"}`);
} catch {
  console.log("database_statistics=unavailable");
  process.exitCode = 1;
} finally {
  if (db?.open) db.close();
}
NODE
else
  printf 'database_statistics=unavailable (WAL sidecars absent; no files created)\n'
fi
