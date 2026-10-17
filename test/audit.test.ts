import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixture.js";

test("单一所有者仍能查看历史匿名登录失败；本人操作显示用户名且不包含任意匿名事件", async () => {
  const f = await fixture();
  try {
    // Password login is gone; failures recorded before the switch must stay visible.
    const historic = f.s.audit.start(null, "auth.login", "web");
    f.s.audit.finish(historic, "error", "INVALID_CREDENTIALS");
    const other = f.s.audit.start(null, "unrelated.event", "web");
    f.s.audit.finish(other, "error", "TEST");
    const failure = f.s.data.audit(f.owner, {}).items;
    assert.ok(
      failure.some(
        (item: any) =>
          item.action === "auth.login" &&
          item.status === "error" &&
          item.actor.kind === "anonymous",
      ),
    );
    assert.ok(!failure.some((item: any) => item.action === "unrelated.event"));
    await f.api("PATCH", "/settings", { timezone: "Asia/Shanghai" });
    const success = f.s.data
      .audit(f.owner, {})
      .items.find(
        (item: any) =>
          item.action === "updateSettings" && item.status === "success",
      );
    assert.equal(success.actor.kind, "owner");
    assert.equal(success.actor.label, "leo");
    assert.equal(f.s.data.audit(f.owner, { channel: "oauth" }).total, 0);
    assert.equal(
      f.s.data.audit(f.owner, { limit: 1 }).nextCursor !== null,
      true,
    );
  } finally {
    await f.close();
  }
});
