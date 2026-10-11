import Database from "better-sqlite3";
import { mkdirSync, chmodSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
export type Db = Database.Database;
export type Row = Record<string, any>;
export const schemaVersion = 1;
export function openDb(dataDir: string): Db {
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const path = join(dataDir, "nbd.sqlite"),
    db = new Database(path);
  chmodSync(path, 0o600);
  db.pragma("journal_mode=WAL");
  db.pragma("foreign_keys=ON");
  db.pragma("busy_timeout=3000");
  return db;
}
export function migrate(db: Db, now = Date.now()) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY,applied_at INTEGER NOT NULL)",
  );
  const dir = fileURLToPath(new URL("./migrations/", import.meta.url));
  for (const name of readdirSync(dir)
    .filter((x) => /^\d+_.*\.sql$/.test(x))
    .sort()) {
    const version = Number(name.split("_")[0]);
    db.transaction(() => {
      if (
        db
          .prepare("SELECT 1 FROM schema_migrations WHERE version=?")
          .get(version)
      )
        return;
      db.exec(readFileSync(join(dir, name), "utf8"));
      db.prepare("INSERT INTO schema_migrations VALUES (?,?)").run(
        version,
        now,
      );
    }).immediate();
  }
}
export function assertMigrated(db: Db) {
  const row = db
    .prepare("SELECT MAX(version) AS version FROM schema_migrations")
    .get() as Row;
  if (row.version !== schemaVersion)
    throw new Error("Database migration version mismatch");
}
export function insert(db: Db, table: string, row: Row) {
  const keys = Object.keys(row);
  db.prepare(
    `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map((k) => "@" + k).join(",")})`,
  ).run(row);
}
export function update(
  db: Db,
  table: string,
  row: Row,
  where: string,
  params: Row,
) {
  db.prepare(
    `UPDATE ${table} SET ${Object.keys(row)
      .map((k) => `${k}=@${k}`)
      .join(",")} WHERE ${where}`,
  ).run({ ...row, ...params });
}
