import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { randomBytes, createHash } from "node:crypto";
import { fixture, password } from "./fixture.js";
async function oauthFixture() {
  let origin = "";
  const server = createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        client_id: origin + "/client.json",
        client_name: "<script>evil</script>",
        redirect_uris: [origin + "/callback"],
        token_endpoint_auth_method: "none",
      }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = "http://127.0.0.1:" + (server.address() as any).port;
  const f = await fixture({ listen: true });
  const verifier = randomBytes(32).toString("base64url"),
    challenge = createHash("sha256").update(verifier).digest("base64url"),
    clientId = origin + "/client.json",
    redirectUri = origin + "/callback",
    resource = f.config.publicOrigin + "/mcp";
  const begin = async (extra: Record<string, string> = {}) =>
    f.app.inject({
      url:
        "/oauth/authorize?" +
        new URLSearchParams({
          response_type: "code",
          client_id: clientId,
          redirect_uri: redirectUri,
          code_challenge: challenge,
          code_challenge_method: "S256",
          scope: "read write",
          state: "test-state",
          resource,
          ...extra,
        }),
    });
  const approve = async (response: any, extra: Record<string, string> = {}) => {
    const requestId = response.body.match(
        /name="requestId" value="([^"]+)"/,
      )[1],
      csrf = response.body.match(/name="csrf" value="([^"]+)"/)[1],
      cookie = String(response.headers["set-cookie"]).split(";")[0];
    return f.app.inject({
      method: "POST",
      url: "/oauth/authorize",
      headers: {
        cookie: cookie + "; " + f.cookie,
        "content-type": "application/x-www-form-urlencoded",
        origin: f.config.publicOrigin,
      },
      payload: new URLSearchParams({
        requestId,
        csrf,
        decision: "approve",
        read: "1",
        write: "1",
        ...extra,
      }).toString(),
    });
  };
  const token = (data: Record<string, string>) =>
    f.app.inject({
      method: "POST",
      url: "/oauth/token",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      payload: new URLSearchParams({
        client_id: clientId,
        resource,
        ...data,
      }).toString(),
    });
  return {
    ...f,
    verifier,
    challenge,
    clientId,
    redirectUri,
    resource,
    begin,
    approve,
    tokenRequest: token,
    close: async () => {
      await f.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
test("真实 CIMD + 完整 PKCE：确认页转义、回调 iss、访问令牌和轮换", async () => {
  const f = await oauthFixture();
  try {
    const begin = await f.begin();
    assert.equal(begin.statusCode, 200, begin.body);
    assert.ok(begin.body.includes("&lt;script&gt;"));
    assert.ok(!begin.body.includes("<script>evil"));
    const approve = await f.approve(begin);
    assert.equal(approve.statusCode, 302, approve.body);
    const callback = new URL(approve.headers.location!);
    assert.equal(callback.searchParams.get("iss"), f.config.publicOrigin);
    assert.equal(callback.searchParams.get("state"), "test-state");
    const issued = await f.tokenRequest({
      grant_type: "authorization_code",
      code: callback.searchParams.get("code")!,
      redirect_uri: f.redirectUri,
      code_verifier: f.verifier,
    });
    assert.equal(issued.statusCode, 200, issued.body);
    assert.equal(issued.headers["cache-control"], "no-store");
    const t = issued.json();
    assert.deepEqual(f.s.access.authenticate(t.access_token).scopes, [
      "read",
      "write",
    ]);
    const rotated = await f.tokenRequest({
      grant_type: "refresh_token",
      refresh_token: t.refresh_token,
    });
    assert.equal(rotated.statusCode, 200, rotated.body);
    assert.notEqual(rotated.json().refresh_token, t.refresh_token);
    assert.equal(
      (await f.api("GET", "/connected-apps")).json().items.length,
      1,
    );
    const replay = await f.tokenRequest({
      grant_type: "refresh_token",
      refresh_token: t.refresh_token,
    });
    assert.equal(replay.json().error, "invalid_grant");
    assert.throws(() => f.s.access.authenticate(rotated.json().access_token));
  } finally {
    await f.close();
  }
});
test("PKCE、resource、回调地址和 SSRF 边界拒绝；错误页不重定向", async () => {
  const f = await oauthFixture();
  try {
    const invalidRequests: Record<string, string>[] = [
      { resource: "https://evil/mcp" },
      { redirect_uri: "https://evil/callback" },
      { code_challenge_method: "plain" },
      { client_id: "http://169.254.169.254/latest/meta-data" },
      { client_id: "https://claude.ai.evil.example/client.json" },
    ];
    for (const changes of invalidRequests) {
      const r = await f.begin(changes);
      assert.equal(r.statusCode, 400, r.body);
      assert.ok(!r.headers.location);
    }
    const begun = await f.begin(),
      approved = await f.approve(begun),
      code = new URL(approved.headers.location!).searchParams.get("code")!;
    assert.equal(
      (
        await f.tokenRequest({
          grant_type: "authorization_code",
          code,
          redirect_uri: f.redirectUri,
          code_verifier: "x".repeat(43),
        })
      ).json().error,
      "invalid_grant",
    );
    assert.equal(
      (
        await f.tokenRequest({
          grant_type: "authorization_code",
          code,
          redirect_uri: f.redirectUri,
          code_verifier: f.verifier,
          resource: "wrong",
        })
      ).json().error,
      "invalid_target",
    );
    const ok = await f.tokenRequest({
      grant_type: "authorization_code",
      code,
      redirect_uri: f.redirectUri,
      code_verifier: f.verifier,
    });
    assert.equal(ok.statusCode, 200);
    const replay = await f.tokenRequest({
      grant_type: "authorization_code",
      code,
      redirect_uri: f.redirectUri,
      code_verifier: f.verifier,
    });
    assert.equal(replay.json().error, "invalid_grant");
    assert.throws(() => f.s.access.authenticate(ok.json().access_token));
  } finally {
    await f.close();
  }
});
test("确认页 CSRF 绑定、拒绝授权、只写授权和撤销应用", async () => {
  const f = await oauthFixture();
  try {
    const begin = await f.begin();
    assert.equal((await f.approve(begin, { csrf: "invalid" })).statusCode, 400);
    const denied = await f.approve(begin, { decision: "deny" });
    assert.equal(
      new URL(denied.headers.location!).searchParams.get("error"),
      "access_denied",
    );
    assert.equal((await f.approve(begin)).statusCode, 400);
    const write = await f.begin(),
      approved = await f.approve(write, { read: "0" }),
      code = new URL(approved.headers.location!).searchParams.get("code")!,
      t = (
        await f.tokenRequest({
          grant_type: "authorization_code",
          code,
          redirect_uri: f.redirectUri,
          code_verifier: f.verifier,
        })
      ).json();
    assert.deepEqual(f.s.access.authenticate(t.access_token).scopes, ["write"]);
    const app = (await f.api("GET", "/connected-apps")).json().items[0];
    assert.equal(
      (await f.api("DELETE", "/connected-apps/" + app.id)).statusCode,
      204,
    );
    assert.throws(() => f.s.access.authenticate(t.access_token));
  } finally {
    await f.close();
  }
});
test("授权码过期、刷新作用域不能扩大、未知令牌撤销返回成功", async () => {
  const f = await oauthFixture();
  try {
    const begin = await f.begin(),
      approved = await f.approve(begin),
      code = new URL(approved.headers.location!).searchParams.get("code")!;
    f.setNow(f.getNow() + 60001);
    assert.equal(
      (
        await f.tokenRequest({
          grant_type: "authorization_code",
          code,
          redirect_uri: f.redirectUri,
          code_verifier: f.verifier,
        })
      ).json().error,
      "invalid_grant",
    );
    const r = await f.app.inject({
      method: "POST",
      url: "/oauth/revoke",
      payload: { token: "unknown", client_id: f.clientId },
    });
    assert.equal(r.statusCode, 200);
  } finally {
    await f.close();
  }
});
