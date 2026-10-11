import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fixture, password } from "../fixture.js";
import { createConfig } from "../../src/config.js";
import { openDb, migrate } from "../../src/db/index.js";
import { buildApp } from "../../src/app.js";

test("production responses keep explicit security headers and a restrictive CSP", async () => {
  const dir = await mkdtemp(join(tmpdir(), "nbd-security-"));
  const db = openDb(dir);
  migrate(db);
  const app = await buildApp(
    createConfig(
      {
        env: "production",
        secureCookie: true,
        publicOrigin: "https://nbd.invalid",
        dataDir: dir,
        publicDir: join(dir, "absent"),
        logger: false,
      },
      {},
    ),
    { db },
  );
  try {
    const response = await app.inject("/healthz");
    assert.equal(response.statusCode, 200);
    assert.equal(
      response.headers["strict-transport-security"],
      "max-age=31536000",
    );
    assert.equal(response.headers["x-content-type-options"], "nosniff");
    assert.equal(response.headers["x-frame-options"], "DENY");
    const csp = String(response.headers["content-security-policy"]);
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /script-src 'self'/);
    assert.match(csp, /connect-src 'self'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/);
  } finally {
    await app.close();
    db.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test("spoofed forwarding headers are ignored by the app and overwritten by Nginx", async () => {
  const f = await fixture();
  try {
    const response = await f.app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: {
        "x-nbd-request": "1",
        "x-forwarded-for": "198.51.100.88",
        "x-real-ip": "203.0.113.55",
        "x-forwarded-host": "attacker.invalid",
        "x-forwarded-proto": "https",
        forwarded: "for=192.0.2.77;host=attacker.invalid;proto=https",
      },
      payload: { username: "leo", password },
    });
    assert.equal(response.statusCode, 200);
    const audit = f.db
      .prepare(
        "SELECT ip FROM audit_events WHERE action='auth.login' ORDER BY id DESC LIMIT 1",
      )
      .get() as { ip: string };
    assert.equal(audit.ip, "127.0.0.1");

    const nginx = await readFile(
      new URL("../../deploy/nginx.conf", import.meta.url),
      "utf8",
    );
    assert.match(nginx, /proxy_set_header X-Forwarded-For \$remote_addr;/);
    assert.match(nginx, /proxy_set_header X-Real-IP \$remote_addr;/);
    assert.match(nginx, /proxy_set_header X-Forwarded-Host \$host;/);
    assert.match(nginx, /proxy_set_header X-Forwarded-Proto \$scheme;/);
    assert.match(nginx, /proxy_set_header Forwarded "";/);
    assert.match(nginx, /proxy_hide_header Strict-Transport-Security;/);
    assert.match(
      nginx,
      /add_header Strict-Transport-Security "max-age=31536000" always;/,
    );
  } finally {
    await f.close();
  }
});
