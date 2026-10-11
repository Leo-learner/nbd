import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import openapiTS, { astToString } from "openapi-typescript";
import { createConfig } from "../src/config.js";
import { openDb, migrate } from "../src/db/index.js";
import { buildApp } from "../src/app.js";
const dir = await mkdtemp(join(tmpdir(), "nbd-contract-")),
  db = openDb(dir);
migrate(db);
const app = await buildApp(
  createConfig(
    {
      dataDir: dir,
      publicOrigin: "https://nbd.dkz12345.com",
      logger: false,
      env: "test",
      publicDir: join(dir, "absent"),
    },
    {},
  ),
  { db },
);
try {
  const schema = app.swagger();
  await mkdir("sdk", { recursive: true });
  await writeFile("docs/openapi.json", JSON.stringify(schema, null, 2) + "\n");
  await writeFile(
    "sdk/generated.ts",
    astToString(await openapiTS(schema as any)),
  );
  console.log("Generated REST contract and TypeScript SDK");
} finally {
  await app.close();
  db.close();
  await rm(dir, { recursive: true, force: true });
}
