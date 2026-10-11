import test from "node:test";
import assert from "node:assert/strict";
import { fixture, password } from "./fixture.js";

test("单一所有者能查看匿名登录失败，成功登录显示用户名且不包含任意匿名事件", async () => {
  const f = await fixture();
  try {
    await f.api("POST", "/auth/login", {
      username: "leo",
      password: "incorrect",
    });
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
    await f.api("POST", "/auth/login", { username: "LEO", password });
    const success = f.s.data
      .audit(f.owner, {})
      .items.find(
        (item: any) =>
          item.action === "auth.login" && item.status === "success",
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
