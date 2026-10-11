import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  mkdir,
  readFile,
  writeFile,
  stat,
  readdir,
  cp,
  chmod,
  rm,
} from "node:fs/promises";
import { join } from "node:path";
import type { Config } from "../config.js";
import type { Db, Row } from "../db/index.js";
import { schemaVersion } from "../db/index.js";
export async function fileHash(path: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}
export async function verifyBackup(dir: string): Promise<Row> {
  const manifest = JSON.parse(
      await readFile(join(dir, "manifest.json"), "utf8"),
    ),
    path = join(dir, "nbd.sqlite");
  if (
    manifest.sha256 !== (await fileHash(path)) ||
    (await stat(path)).size !== manifest.bytes
  )
    throw Error("Backup checksum or size mismatch");
  const db = new Database(path, { readonly: true, fileMustExist: true });
  try {
    const integrity = db.pragma("integrity_check") as Row[],
      foreignKeys = db.pragma("foreign_key_check") as Row[],
      version = (
        db
          .prepare("SELECT MAX(version) version FROM schema_migrations")
          .get() as Row
      ).version;
    if (
      integrity.length !== 1 ||
      integrity[0]!.integrity_check !== "ok" ||
      foreignKeys.length ||
      manifest.schemaVersion !== version
    )
      throw Error("Backup integrity or schema mismatch");
    return manifest;
  } finally {
    db.close();
  }
}
export async function backup(db: Db, config: Config): Promise<Row> {
  const stamp = new Date(config.now()).toISOString().replace(/[:.]/g, "-"),
    root = join(config.dataDir, "backups"),
    dir = join(root, stamp);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const path = join(dir, "nbd.sqlite");
  await db.backup(path);
  await chmod(path, 0o600);
  const manifest = {
    createdAt: new Date(config.now()).toISOString(),
    schemaVersion,
    bytes: (await stat(path)).size,
    sha256: await fileHash(path),
    integrityCheck: "ok",
    foreignKeyCheck: [],
  };
  await writeFile(
    join(dir, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    { mode: 0o600 },
  );
  await verifyBackup(dir);
  for (const name of await readdir(root)) {
    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/.test(name) ||
      name === stamp
    )
      continue;
    const candidate = join(root, name);
    try {
      const old = JSON.parse(
        await readFile(join(candidate, "manifest.json"), "utf8"),
      );
      if (Date.parse(old.createdAt) < config.now() - 14 * 86400000)
        await rm(candidate, { recursive: true });
    } catch {
      /* Incomplete or unrelated folders are retained. */
    }
  }
  return { directory: dir, ...manifest };
}
export async function restoreBackup(
  source: string,
  target: string,
): Promise<Row> {
  const manifest = await verifyBackup(source);
  await mkdir(target, { recursive: true, mode: 0o700 });
  if ((await readdir(target)).length)
    throw Error("Restore destination must be empty");
  await cp(join(source, "nbd.sqlite"), join(target, "nbd.sqlite"), {
    errorOnExist: true,
    force: false,
  });
  await chmod(join(target, "nbd.sqlite"), 0o600);
  await writeFile(
    join(target, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    { mode: 0o600 },
  );
  await verifyBackup(target);
  return { directory: target, ...manifest };
}
