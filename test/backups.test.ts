import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fixture, momentInput } from "./fixture.js";
import { backup, verifyBackup, restoreBackup } from "../src/modules/backups.js";
import { DAY } from "../src/time.js";
test("在线备份、哈希校验、恢复到空目录以及篡改检测", async () => {
  const f = await fixture();
  try {
    f.s.moments.record(f.agent, momentInput());
    const b = await backup(f.db, f.config);
    assert.equal((await verifyBackup(b.directory)).sha256, b.sha256);
    const restored = join(f.dir, "restored");
    await restoreBackup(b.directory, restored);
    assert.equal((await verifyBackup(restored)).sha256, b.sha256);
    await assert.rejects(() => restoreBackup(b.directory, restored), /empty/);
    const path = join(b.directory, "nbd.sqlite"),
      data = await readFile(path);
    data[200] = data[200]! ^ 1;
    await writeFile(path, data);
    await assert.rejects(() => verifyBackup(b.directory), /checksum/);
  } finally {
    await f.close();
  }
});
test("30 天回收站清理级联删除子记录，保留经验并移除检索索引", async () => {
  const f = await fixture();
  try {
    const id = f.s.moments.record(f.agent, momentInput()).moment.id;
    f.s.moments.addNote(f.agent, id, "待清理补记");
    f.s.moments.patch(f.owner, id, { expectedRevision: 1, title: "测试更正" });
    const l = f.s.library.create(f.owner, {
      title: "保留的经验",
      momentIds: [id],
    });
    f.s.moments.addReflection(f.owner, id, {
      intensityNow: 2,
      resolution: "easing",
      lessonIds: [l.id],
    });
    f.s.moments.trash(f.owner, id);
    f.setNow(f.getNow() + 31 * DAY);
    f.s.data.cleanup();
    for (const table of [
      "moments",
      "moment_notes",
      "moment_revisions",
      "reflections",
      "lesson_moments",
      "reflection_lessons",
      "moment_tags",
      "moment_search",
    ])
      assert.equal(
        (f.db.prepare(`SELECT count(*) n FROM ${table}`).get() as any).n,
        0,
        table,
      );
    assert.equal(
      (f.db.prepare("SELECT count(*) n FROM lessons").get() as any).n,
      1,
    );
  } finally {
    await f.close();
  }
});
