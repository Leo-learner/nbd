import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createConfig } from "../src/config.js";
import { openDb, migrate } from "../src/db/index.js";
import { buildApp } from "../src/app.js";
import { ownerPrincipal } from "../src/modules/principal.js";
import { randomUUID } from "node:crypto";
import {
  createTestSigner,
  TEST_PUBLISHABLE_KEY,
} from "../src/lib/clerk-gate/test-signer.js";
export const password = "Nbd-Test-Secret-2026";
export const OWNER = "user_owner";
// Clerk-shaped session tokens signed with a throwaway key: no network, no real instance.
const signer = createTestSigner();
export const momentInput = (changes: Record<string, unknown> = {}) => ({
  clientRequestId: randomUUID(),
  title: "周会叫错了名字",
  narrative: "这是用于验证的虚构原话：叫错名字以后脸发烫。",
  scene: "work",
  emotions: [{ key: "embarrassed", intensity: 8 }],
  intensity: 8,
  happenedAt: "2026-10-01T10:00:00+08:00",
  tags: ["＃工作"],
  ...changes,
});
export async function fixture(
  options: { fetcher?: typeof fetch; listen?: boolean } = {},
) {
  const dir = await mkdtemp(join(tmpdir(), "nbd-test-"));
  let now = Date.parse("2026-10-11T12:00:00Z");
  const config = createConfig(
      {
        dataDir: dir,
        env: "test",
        logger: false,
        now: () => now,
        clientHosts: ["127.0.0.1"],
        redirectHosts: ["127.0.0.1"],
        publicDir: join(dir, "absent"),
        clerk: {
          publishableKey: TEST_PUBLISHABLE_KEY,
          jwtKey: signer.jwtKey,
          ownerUserId: OWNER,
        },
      },
      {},
    ),
    db = openDb(dir);
  migrate(db, now);
  migrate(db, now);
  const app = await buildApp(config, { db, fetcher: options.fetcher }),
    s = app.services,
    user = await s.auth.createOwner("leo", password),
    owner = ownerPrincipal(user as { id: string; display_name: string });
  const issued = s.access.create(owner, {
      label: "测试 Agent",
      scopes: ["read", "write"],
    }),
    token = issued.secret as string,
    agent = s.access.authenticate(token);
  // A Clerk __session cookie; by default the owner, both factors just verified.
  const origin = config.publicOrigin;
  const clerkCookie = (claims: Record<string, unknown> = {}) => {
    const seconds = Math.floor(Date.now() / 1000);
    return `__session=${signer.token({ sub: OWNER, azp: origin, iat: seconds, nbf: seconds - 5, exp: seconds + 3600, fva: [0, 0], ...claims })}`;
  };
  const cookie = clerkCookie();
  if (options.listen)
    config.publicOrigin = await app.listen({ host: "127.0.0.1", port: 0 });
  const api = (
    method: string,
    url: string,
    body?: unknown,
    headers: Record<string, string> = {},
  ) =>
    app.inject({
      method: method as any,
      url: "/api/v1" + url,
      headers: { cookie, "x-nbd-request": "1", ...headers },
      ...(body === undefined ? {} : { payload: body as any }),
    });
  return {
    app,
    s,
    config,
    db,
    dir,
    user,
    owner,
    agent,
    token,
    cookie,
    clerkCookie,
    signer,
    api,
    setNow: (value: number) => {
      now = value;
    },
    getNow: () => now,
    close: async () => {
      await app.close();
      db.close();
      await rm(dir, { recursive: true, force: true });
    },
  };
}
