import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer, type AddressInfo } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createConfig } from "../../src/config.js";
import { openDb, migrate } from "../../src/db/index.js";
import { buildApp } from "../../src/app.js";

test("readyz returns 503 when the database migration version is incompatible", async () => {
  const dir = await mkdtemp(join(tmpdir(), "nbd-ready-"));
  const db = openDb(dir);
  migrate(db);
  const app = await buildApp(
    createConfig(
      {
        env: "test",
        dataDir: dir,
        publicDir: join(dir, "absent"),
        logger: false,
      },
      {},
    ),
    { db },
  );
  try {
    assert.equal((await app.inject("/readyz")).statusCode, 200);
    db.prepare("UPDATE schema_migrations SET version=99").run();
    const response = await app.inject("/readyz");
    assert.equal(response.statusCode, 503);
    assert.equal(response.json().error.code, "NOT_READY");
    assert.ok(response.json().requestId);
  } finally {
    await app.close();
    db.close();
    await rm(dir, { recursive: true, force: true });
  }
});

async function unusedPort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = (server.address() as AddressInfo).port;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForReady(
  child: ReturnType<typeof spawn>,
  url: string,
  output: () => string,
) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null)
      throw new Error(`Server exited before readiness: ${output()}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(300) });
      if (response.status === 200) return;
    } catch {}
    await delay(100);
  }
  throw new Error(`Server did not become ready: ${output()}`);
}

async function verifySignalShutdown(signal: NodeJS.Signals) {
  const dir = await mkdtemp(join(tmpdir(), "nbd-signal-"));
  const db = openDb(dir);
  migrate(db);
  db.close();
  const port = await unusedPort();
  const child = spawn(process.execPath, ["--import", "tsx", "src/server.ts"], {
    cwd: new URL("../..", import.meta.url),
    env: {
      ...process.env,
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: String(port),
      DATA_DIR: dir,
      PUBLIC_DIR: join(dir, "absent"),
      LOG_LEVEL: "fatal",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout?.on("data", (chunk) => (output += String(chunk)));
  child.stderr?.on("data", (chunk) => (output += String(chunk)));
  const exit = once(child, "exit").then(([code, exitSignal]) => ({
    code: code as number | null,
    signal: exitSignal as NodeJS.Signals | null,
  }));
  try {
    await waitForReady(child, `http://127.0.0.1:${port}/healthz`, () => output);
    assert.equal(child.kill(signal), true);
    let timer: NodeJS.Timeout | undefined;
    const result = await Promise.race([
      exit,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(new Error(`${signal} did not close the server: ${output}`)),
          10000,
        );
      }),
    ]).finally(() => clearTimeout(timer));
    assert.equal(result.code, 0, output);
    assert.equal(result.signal, null, output);
  } finally {
    if (child.exitCode === null && child.signalCode === null)
      child.kill("SIGKILL");
    await rm(dir, { recursive: true, force: true });
  }
}

test("SIGTERM and SIGINT close the listening server cleanly", async () => {
  await verifySignalShutdown("SIGTERM");
  await verifySignalShutdown("SIGINT");
});
