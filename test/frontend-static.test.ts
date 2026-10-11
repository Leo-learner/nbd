import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  symlink,
  rename,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createConfig } from "../src/config.js";
import { openDb, migrate } from "../src/db/index.js";
import { buildApp } from "../src/app.js";

test("frontend symlink swaps serve new hashed assets and preserve API boundaries without a restart", async () => {
  const dir = await mkdtemp(join(tmpdir(), "nbd-frontend-"));
  const first = join(dir, "first"),
    second = join(dir, "second"),
    publicDir = join(dir, "public");
  await mkdir(first);
  await mkdir(second);
  await mkdir(join(second, "assets"));
  await writeFile(join(first, "index.html"), "<h1>First</h1>");
  await writeFile(join(second, "index.html"), "<h1>Second</h1>");
  await writeFile(
    join(second, "assets", "app-new123.js"),
    'console.log("new release")',
  );
  await symlink(first, publicDir);
  const db = openDb(join(dir, "data"));
  migrate(db, Date.now());
  const app = await buildApp(
    createConfig(
      { env: "test", dataDir: join(dir, "data"), publicDir, logger: false },
      {},
    ),
    { db },
  );
  try {
    assert.equal(
      (await app.inject({ url: "/", headers: { accept: "text/html" } })).body,
      "<h1>First</h1>",
    );
    await symlink(second, join(dir, "next"));
    await rename(join(dir, "next"), publicDir);
    const asset = await app.inject("/assets/app-new123.js");
    assert.equal(asset.statusCode, 200);
    assert.match(asset.headers["content-type"]!, /javascript/);
    assert.equal(asset.body, 'console.log("new release")');
    assert.equal(
      (
        await app.inject({
          url: "/moments/example/reflect",
          headers: { accept: "text/html" },
        })
      ).body,
      "<h1>Second</h1>",
    );
    assert.equal(
      (
        await app.inject({
          url: "/api/v1/missing",
          headers: { accept: "text/html" },
        })
      ).statusCode,
      404,
    );
    assert.equal((await app.inject("/assets/missing.js")).statusCode, 404);
  } finally {
    await app.close();
    db.close();
    await rm(dir, { recursive: true, force: true });
  }
});
