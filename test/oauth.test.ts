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

test("确认页 CSP 只放行已校验回调 origin，其他响应保持 self", async () => {
  const f = await oauthFixture();
  try {
    const begin = await f.begin();
    assert.match(
      String(begin.headers["content-security-policy"]),
      new RegExp(
        `form-action 'self' ${new URL(f.redirectUri).origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      ),
    );
    for (const url of [
      "/healthz",
      "/readyz",
      "/.well-known/oauth-authorization-server",
    ]) {
      const result = await f.app.inject({ url });
      assert.ok(
        String(result.headers["content-security-policy"]).endsWith(
          "form-action 'self'",
        ),
      );
    }
    const rejected = await f.begin({
      redirect_uri: "https://evil.example/callback",
    });
    assert.equal(rejected.statusCode, 400);
    assert.ok(
      !String(rejected.headers["content-security-policy"]).includes(
        "evil.example",
      ),
    );
  } finally {
    await f.close();
  }
});

test("换码成功才替换同客户端旧授权，失败换码保留旧令牌", async () => {
  const f = await oauthFixture();
  try {
    const exchange = (code: string, code_verifier = f.verifier) =>
      f.tokenRequest({
        grant_type: "authorization_code",
        code,
        redirect_uri: f.redirectUri,
        code_verifier,
      });
    const old = await f.approve(await f.begin());
    const oldToken = (
      await exchange(new URL(old.headers.location!).searchParams.get("code")!)
    ).json();
    const next = await f.approve(await f.begin());
    const code = new URL(next.headers.location!).searchParams.get("code")!;
    assert.equal(f.s.access.apps(f.owner).items.length, 1);
    assert.ok(f.s.access.authenticate(oldToken.access_token));
    assert.equal(
      (await exchange(code, "x".repeat(43))).json().error,
      "invalid_grant",
    );
    assert.ok(f.s.access.authenticate(oldToken.access_token));
    const minted = await exchange(code);
    assert.equal(minted.statusCode, 200, minted.body);
    assert.throws(() => f.s.access.authenticate(oldToken.access_token));
    assert.equal(
      (
        await f.tokenRequest({
          grant_type: "refresh_token",
          refresh_token: oldToken.refresh_token,
        })
      ).json().error,
      "invalid_grant",
    );
    assert.ok(f.s.access.authenticate(minted.json().access_token));
    assert.equal(f.s.access.apps(f.owner).items.length, 1);
  } finally {
    await f.close();
  }
});

test("弃用的未换码授权在一小时后撤销，已签发授权保留", async () => {
  const f = await oauthFixture();
  try {
    await f.approve(await f.begin());
    assert.equal(f.s.access.apps(f.owner).items.length, 0);
    f.setNow(f.getNow() + 3599999);
    f.s.data.cleanup();
    assert.equal(
      (
        f.db
          .prepare(
            "SELECT count(*) n FROM oauth_grants WHERE revoked_at IS NULL",
          )
          .get() as any
      ).n,
      1,
    );
    f.setNow(f.getNow() + 1);
    f.s.data.cleanup();
    assert.equal(
      (
        f.db
          .prepare(
            "SELECT count(*) n FROM oauth_grants WHERE revoked_at IS NULL",
          )
          .get() as any
      ).n,
      0,
    );
  } finally {
    await f.close();
  }
});

test("OAuth 密码错误重显表单，保留请求 CSRF 和勾选但不回显凭据", async () => {
  const f = await oauthFixture();
  try {
    const begin = await f.begin(),
      requestId = begin.body.match(/name="requestId" value="([^"]+)"/)![1],
      csrf = begin.body.match(/name="csrf" value="([^"]+)"/)![1],
      cookie = String(begin.headers["set-cookie"]).split(";")[0];
    const submit = (pass: string) =>
      f.app.inject({
        method: "POST",
        url: "/oauth/authorize",
        headers: {
          cookie,
          "content-type": "application/x-www-form-urlencoded",
          origin: f.config.publicOrigin,
        },
        payload: new URLSearchParams({
          requestId,
          csrf,
          decision: "approve",
          write: "1",
          username: "leo",
          password: pass,
        }).toString(),
      });
    const retry = await submit("incorrect-password");
    assert.equal(retry.statusCode, 401, retry.body);
    assert.match(String(retry.headers["content-type"]), /^text\/html/);
    assert.ok(retry.body.includes("用户名或密码错误"));
    assert.ok(retry.body.includes(`name="requestId" value="${requestId}"`));
    assert.ok(retry.body.includes(`name="csrf" value="${csrf}"`));
    assert.ok(!retry.body.includes("incorrect-password"));
    assert.ok(retry.body.includes('name="write" value="1" checked'));
    assert.ok(retry.body.includes('name="read" value="1">'));
    assert.ok(
      String(retry.headers["content-security-policy"]).endsWith(
        `form-action 'self' ${new URL(f.redirectUri).origin}`,
      ),
    );
    assert.equal((await submit(password)).statusCode, 302);
  } finally {
    await f.close();
  }
});

test("OAuth grant_type 优先校验，未知类型不被缺少 client/resource 掩盖", async () => {
  const f = await oauthFixture();
  try {
    const response = await f.app.inject({
      method: "POST",
      url: "/oauth/token",
      payload: { grant_type: "password" },
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error, "unsupported_grant_type");
    const client = await f.app.inject({
      method: "POST",
      url: "/oauth/token",
      payload: { grant_type: "authorization_code" },
    });
    assert.equal(client.json().error, "invalid_client");
  } finally {
    await f.close();
  }
});

test("OAuth 错误保留 429/Retry-After，服务错误返回 server_error 而不泄漏内部信息", async () => {
  const f = await oauthFixture();
  try {
    f.s.oauth.token = () => {
      throw Object.assign(new Error("internal database path"), {
        statusCode: 503,
      });
    };
    const unavailable = await f.tokenRequest({
      grant_type: "authorization_code",
    });
    assert.equal(unavailable.statusCode, 503);
    assert.equal(unavailable.json().error, "server_error");
    assert.ok(!unavailable.body.includes("internal database path"));
    f.s.oauth.token = () => {
      throw Object.assign(new Error("limited"), { statusCode: 429 });
    };
    const limited = await f.tokenRequest({ grant_type: "authorization_code" });
    assert.equal(limited.statusCode, 429);
    assert.equal(limited.headers["retry-after"], "60");
    // Exercise the real Fastify rate limiter, whose header is set before the error handler.
    for (let i = 0; i < 60; i++)
      await f.tokenRequest({ grant_type: "password" });
    const throttled = await f.tokenRequest({ grant_type: "password" });
    assert.equal(throttled.statusCode, 429);
    assert.ok(Number(throttled.headers["retry-after"]) > 0);
    const forbidden = await f.app.inject({
      method: "POST",
      url: "/oauth/authorize",
      headers: { origin: "https://evil.example" },
      payload: {},
    });
    assert.equal(forbidden.statusCode, 400);
    assert.equal(forbidden.json().error, "invalid_request");
  } finally {
    await f.close();
  }
});

test("OAuth 登录失败可见于单所有者审计，成功标识实际用户名", async () => {
  const f = await oauthFixture();
  try {
    const begin = await f.begin(),
      requestId = begin.body.match(/name="requestId" value="([^"]+)"/)![1],
      csrf = begin.body.match(/name="csrf" value="([^"]+)"/)![1],
      cookie = String(begin.headers["set-cookie"]).split(";")[0];
    const submit = (pass: string) =>
      f.app.inject({
        method: "POST",
        url: "/oauth/authorize",
        headers: { cookie },
        payload: {
          requestId,
          csrf,
          decision: "approve",
          write: "1",
          username: "LEO",
          password: pass,
        },
      });
    assert.equal((await submit("incorrect-password")).statusCode, 401);
    let audit = f.s.data
      .audit(f.owner, { channel: "oauth" })
      .items.find((item: any) => item.action === "oauth.login");
    assert.equal(audit.status, "error");
    assert.equal(audit.actor.label, "未登录");
    assert.equal((await submit(password)).statusCode, 302);
    audit = f.s.data
      .audit(f.owner, { channel: "oauth" })
      .items.find((item: any) => item.action === "oauth.login");
    assert.equal(audit.status, "success");
    assert.equal(audit.actor.label, "leo");
    assert.equal(audit.actor.kind, "owner");
  } finally {
    await f.close();
  }
});

test("换码签发中途失败时回滚撤销旧授权与消费授权码", async () => {
  const f = await oauthFixture();
  try {
    const exchange = (code: string) =>
      f.tokenRequest({
        grant_type: "authorization_code",
        code,
        redirect_uri: f.redirectUri,
        code_verifier: f.verifier,
      });
    const old = await f.approve(await f.begin());
    const oldToken = (
      await exchange(new URL(old.headers.location!).searchParams.get("code")!)
    ).json();
    const next = await f.approve(await f.begin());
    const nextCode = new URL(next.headers.location!).searchParams.get("code")!;
    f.db.exec(
      "CREATE TEMP TRIGGER fail_refresh BEFORE INSERT ON oauth_tokens WHEN NEW.kind='refresh' BEGIN SELECT RAISE(ABORT,'test mint failure'); END",
    );
    const failed = await exchange(nextCode);
    assert.equal(failed.statusCode, 500);
    assert.equal(failed.json().error, "server_error");
    assert.ok(f.s.access.authenticate(oldToken.access_token));
    assert.equal(f.s.access.apps(f.owner).items.length, 1);
    f.db.exec("DROP TRIGGER fail_refresh");
    const retried = await exchange(nextCode);
    assert.equal(retried.statusCode, 200, retried.body);
    assert.throws(() => f.s.access.authenticate(oldToken.access_token));
    assert.ok(f.s.access.authenticate(retried.json().access_token));
  } finally {
    await f.close();
  }
});
