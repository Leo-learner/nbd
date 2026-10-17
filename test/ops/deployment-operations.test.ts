import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  utimes,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { fixture, momentInput } from "../fixture.js";

const repository = new URL("../..", import.meta.url);
const releasePruner = new URL(
  "../../deploy/prune-releases.sh",
  import.meta.url,
);
const readonlyScript = new URL(
  "../../scripts/server-readonly.sh",
  import.meta.url,
);

test("atomic release switching ignores stale temporary links and validates rollback targets", async () => {
  const sources = await Promise.all(
    ["install.sh", "install-frontend.sh"].map((file) =>
      readFile(new URL(`../../deploy/${file}`, import.meta.url), "utf8"),
    ),
  );
  const functions = sources.map((source) => {
    const match = source.match(/switch_link\(\) \{\n[\s\S]*?\nSWITCH_JS\n\}/);
    assert.ok(match, "Deployer must define an atomic release switch");
    return match[0];
  });
  assert.equal(functions[0], functions[1]);
  const dir = await mkdtemp(join(tmpdir(), "nbd-switch-test-"));
  try {
    const oldRelease = join(dir, "old");
    const newRelease = join(dir, "new");
    const current = join(dir, "current");
    await mkdir(oldRelease);
    await mkdir(newRelease);
    await symlink(oldRelease, current);
    await symlink(join(dir, "removed"), join(dir, "current.rollback"));
    await symlink(join(dir, "removed"), join(dir, "current.next"));
    const switchTo = (target: string) =>
      spawnSync("bash", ["-s", "--", target, current], {
        input: `${functions[0]}\nswitch_link "$1" "$2"\n`,
        encoding: "utf8",
      });
    assert.equal(switchTo(newRelease).status, 0);
    assert.equal(await realpath(current), await realpath(newRelease));
    assert.equal(switchTo(oldRelease).status, 0);
    assert.equal(await realpath(current), await realpath(oldRelease));
    assert.notEqual(switchTo(join(dir, "removed")).status, 0);
    assert.equal(await realpath(current), await realpath(oldRelease));
    assert.ok(!(await readdir(dir)).some((name) => name.startsWith(".nbd-switch-")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("release pruning keeps the five newest releases and protected rollback targets", async () => {
  const dir = await mkdtemp(join(tmpdir(), "nbd-prune-test-"));
  const releasesRoot = join(dir, "releases");
  await mkdir(releasesRoot);
  const releases: string[] = [];
  try {
    for (let index = 0; index < 8; index++) {
      const commit = index.toString(16).padStart(40, "0");
      const release = join(releasesRoot, commit);
      await mkdir(release);
      await utimes(
        release,
        1_700_000_000 + index * 60,
        1_700_000_000 + index * 60,
      );
      releases.push(release);
    }
    execFileSync(
      "bash",
      [fileURLToPath(releasePruner), releasesRoot, releases[0]!, releases[1]!],
      { encoding: "utf8" },
    );
    const retained = new Set(await readdir(releasesRoot));
    const expected = [0, 1, 3, 4, 5, 6, 7].map((index) =>
      index.toString(16).padStart(40, "0"),
    );
    assert.deepEqual([...retained].sort(), expected.sort());
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("server-readonly reports counts without changing or printing database records", async () => {
  const f = await fixture();
  const marker = "READONLY-SECRET-MUST-NOT-APPEAR";
  try {
    const moment = f.s.moments.record(
      f.agent,
      momentInput({ narrative: marker }),
    ).moment;
    const row = f.db
      .prepare("SELECT * FROM moments WHERE id=?")
      .get(moment.id) as Record<string, any>;
    const snapshot = JSON.stringify(f.s.moments.snapshot(row));
    const insert = f.db.prepare(`
      INSERT INTO moment_revisions
        (id, moment_id, revision, snapshot_json, changed_fields_json,
         edited_by_kind, edited_by_label, edited_at)
      VALUES (?, ?, ?, ?, '[]', 'owner', '我', ?)
    `);
    insert.run(randomUUID(), moment.id, 1, snapshot, f.getNow());
    f.db.prepare("UPDATE moments SET revision=2 WHERE id=?").run(moment.id);

    const grant = f.db.prepare(`
      INSERT INTO oauth_grants
        (id, user_id, client_id, client_name, redirect_host, scopes_json,
         created_at, last_used_at, revoked_at)
      VALUES (?, ?, ?, 'Test client', 'localhost', '["read"]', ?, NULL, ?)
    `);
    const now = Date.now();
    grant.run(randomUUID(), f.user.id, "active-old", now - 3600001, null);
    grant.run(randomUUID(), f.user.id, "active-recent", now, null);
    grant.run(randomUUID(), f.user.id, "revoked-old", now - 3600001, now);

    const dbPath = join(f.dir, "nbd.sqlite");
    const filesBefore = (await readdir(f.dir)).sort();
    const databaseBefore = await readFile(dbPath);
    const result = spawnSync("bash", ["-s", "--", dbPath], {
      cwd: repository,
      env: {
        ...process.env,
        NBD_READONLY_APP_ROOT: fileURLToPath(repository),
      },
      encoding: "utf8",
      timeout: 30000,
      input: await readFile(fileURLToPath(readonlyScript), "utf8"),
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /moments=1/);
    assert.match(result.stdout, /moment_revisions=1/);
    assert.match(result.stdout, /adjacent_identical_snapshot_pairs=1/);
    assert.match(result.stdout, /empty_revision_rows=1/);
    assert.match(result.stdout, /unredeemed_active_grants=2/);
    assert.match(result.stdout, /old_unredeemed=1/);
    assert.match(result.stdout, /database_quick_check=ok/);
    assert.doesNotMatch(result.stdout, new RegExp(marker));
    assert.deepEqual((await readdir(f.dir)).sort(), filesBefore);
    assert.deepEqual(await readFile(dbPath), databaseBefore);
  } finally {
    await f.close();
  }
});
