import test from "node:test";
import assert from "node:assert/strict";
import { fixture, momentInput } from "./fixture.js";
import { momentStatus, statusSql } from "../src/domain/status.js";
import { computeNextReviewOn } from "../src/domain/schedule.js";
import { normalizeTag } from "../src/domain/tags.js";
import { fingerprint, contentFingerprint } from "../src/domain/fingerprint.js";
import {
  addDays,
  todayIn,
  parseHappened,
  DAY,
  localNoon,
} from "../src/time.js";
import { assertMigrated } from "../src/db/index.js";
import { createConfig } from "../src/config.js";
test("迁移可重复执行，数据库版本不符时拒绝启动", async () => {
  const f = await fixture();
  try {
    assertMigrated(f.db);
    assert.equal(
      (f.db.prepare("SELECT count(*) n FROM schema_migrations").get() as any).n,
      1,
    );
    f.db.prepare("UPDATE schema_migrations SET version=9").run();
    assert.throws(() => assertMigrated(f.db));
  } finally {
    await f.close();
  }
});
test("SQL 和 TypeScript 对拍全部状态向量", async () => {
  const f = await fixture();
  try {
    const now = f.getNow(),
      today = "2026-10-11",
      base = {
        archived_at: null,
        latest_resolution: null,
        next_review_on: "2026-10-14",
        editable_until: now - 1,
        reflection_count: 0,
      };
    const vectors = [
        {
          ...base,
          archived_at: now,
          latest_resolution: "let_go",
          next_review_on: "2026-10-01",
          reflection_count: 2,
        },
        {
          ...base,
          latest_resolution: "let_go",
          next_review_on: null,
          reflection_count: 1,
        },
        {
          ...base,
          latest_resolution: "easing",
          next_review_on: today,
          reflection_count: 1,
        },
        { ...base, next_review_on: "2026-10-09" },
        { ...base, editable_until: now + DAY },
        { ...base, next_review_on: today, editable_until: now + DAY },
        {
          ...base,
          latest_resolution: "still_matters",
          next_review_on: "2026-11-27",
          reflection_count: 2,
        },
        {
          ...base,
          latest_resolution: "still_matters",
          next_review_on: null,
          reflection_count: 3,
        },
        base,
      ],
      expected = [
        "archived",
        "settled",
        "due",
        "due",
        "fresh",
        "due",
        "reflected",
        "reflected",
        "cooling",
      ];
    for (const [i, v] of vectors.entries()) {
      const sql = f.db
        .prepare(
          `SELECT ${statusSql} status FROM (SELECT @archived_at archived_at,@latest_resolution latest_resolution,@next_review_on next_review_on,@editable_until editable_until,@reflection_count reflection_count) m`,
        )
        .get({ ...v, now, today }) as any;
      assert.equal(sql.status, expected[i]);
      assert.equal(momentStatus(v, now, today), expected[i]);
    }
  } finally {
    await f.close();
  }
});
test("自动排程已关闭，任何强度、结论和推迟参数都不生成日期", () => {
  for (const resolution of ["let_go", "easing", "still_matters"] as const)
    assert.equal(
      computeNextReviewOn({
        capturedOn: "2026-10-11",
        scheduleDays: [3, 14, 60],
        intensity: 8,
        reflections: [
          { reflectedOn: "2026-10-12", resolution, intensityNow: 3 },
        ],
        snoozedUntil: "2026-11-01",
        outcomeKnownBy: "2026-10-30",
      }),
      null,
    );
});
test("LocalDate 跨月、闰年、时区和夏令时换算", () => {
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(
    todayIn("Asia/Shanghai", Date.parse("2026-10-10T20:00:00Z")),
    "2026-10-11",
  );
  assert.equal(
    localNoon("2026-03-08", "America/New_York"),
    Date.parse("2026-03-08T16:00:00Z"),
  );
  const t = parseHappened(
    "2026-10-10T23:00:00-07:00",
    "Asia/Shanghai",
    Date.parse("2026-10-11T12:00Z"),
  );
  assert.equal(t.on, "2026-10-10");
  assert.equal(t.at, Date.parse("2026-10-11T06:00Z"));
  assert.throws(() => parseHappened("2026-02-30", "Asia/Shanghai", Date.now()));
});
test("标签规范化和幂等指纹不受键顺序、空白影响", () => {
  assert.equal(normalizeTag("  ＃Ｗｏｒｋ  "), "Work");
  assert.equal(
    fingerprint({ b: 2, a: 1, clientRequestId: "one" }),
    fingerprint({ clientRequestId: "two", a: 1, b: 2 }),
  );
  assert.equal(
    contentFingerprint("你好　世界", "2026-10-11"),
    contentFingerprint("你 好世界", "2026-10-11"),
  );
});
test("配置拒绝非法布尔、整数、域名和不安全生产配置", () => {
  assert.throws(() => createConfig({}, { COOKIE_SECURE: "yes" }));
  assert.throws(() => createConfig({}, { PORT: "3.14" }));
  assert.throws(() => createConfig({ env: "production" }, {}));
  assert.throws(() =>
    createConfig({ publicOrigin: "https://example.com/path" }, {}),
  );
});
test("Agent 冻结边界、修订原文、冲突和所有者更正", async () => {
  const f = await fixture();
  try {
    const id = f.s.moments.record(f.agent, momentInput()).moment.id;
    f.s.moments.patch(f.agent, id, { expectedRevision: 1, title: "更正标题" });
    assert.equal(
      f.s.moments.revisions(f.owner, id).items[0].snapshot.title,
      "周会叫错了名字",
    );
    assert.throws(
      () =>
        f.s.moments.patch(f.agent, id, { expectedRevision: 1, title: "冲突" }),
      { code: "MOMENT_CONFLICT" },
    );
    f.setNow(f.getNow() + DAY);
    assert.throws(
      () =>
        f.s.moments.patch(f.agent, id, { expectedRevision: 2, title: "冻结" }),
      { code: "MOMENT_FROZEN" },
    );
    f.s.moments.patch(f.owner, id, {
      expectedRevision: 2,
      title: "所有者更正",
    });
    assert.equal(f.s.moments.detail(f.owner, id).revision, 3);
  } finally {
    await f.close();
  }
});
test("规范化后的重复内容不创建修订，标题单字段只标记标题", async () => {
  const f = await fixture();
  try {
    const id = f.s.moments.record(
      f.agent,
      momentInput({
        happenedAt: "2026-10-01T10:00:45+08:00",
        emotions: [{ key: "embarrassed" }],
      }),
    ).moment.id;
    const unchanged = f.s.moments.patch(f.agent, id, {
      expectedRevision: 1,
      happenedAt: "2026-10-01T02:00:45.000Z",
      happenedAtPrecision: "exact",
      emotions: [{ key: "embarrassed" }],
    });
    assert.equal(unchanged.revision, 1);
    assert.deepEqual(unchanged.changedFields, []);
    const title = f.s.moments.patch(f.agent, id, {
      expectedRevision: 1,
      title: "更正标题",
    });
    assert.equal(title.revision, 2);
    assert.deepEqual(title.changedFields, ["title"]);
  } finally {
    await f.close();
  }
});
test("内容去重仅在同一主体、24 小时内生效", async () => {
  const f = await fixture();
  try {
    const input = momentInput(),
      a = f.s.moments.record(f.agent, input),
      b = f.s.moments.record(f.agent, {
        ...input,
        clientRequestId: "different-id",
      });
    assert.equal(a.moment.id, b.moment.id);
    assert.equal(b.replayed, true);
    const issued = f.s.access.create(f.owner, {
        label: "另一个",
        scopes: ["write"],
      }),
      other = f.s.access.authenticate(issued.secret);
    assert.notEqual(f.s.moments.record(other, input).moment.id, a.moment.id);
    f.setNow(f.getNow() + DAY + 1);
    assert.notEqual(f.s.moments.record(f.agent, input).moment.id, a.moment.id);
  } finally {
    await f.close();
  }
});
