import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createConfig } from "../src/config.js";
import { openDb, migrate, assertMigrated, type Row } from "../src/db/index.js";
import { createServices } from "../src/services.js";
import { ownerPrincipal } from "../src/modules/principal.js";
import { backup, verifyBackup, restoreBackup } from "../src/modules/backups.js";
if (existsSync(".env")) process.loadEnvFile(".env");
const config = createConfig(),
  [command, ...args] = process.argv.slice(2);
async function stdin(): Promise<string> {
  if (process.stdin.isTTY)
    throw Error(
      "Pipe credentials through stdin; do not put secrets in command arguments",
    );
  let value = "";
  for await (const chunk of process.stdin) {
    value += chunk;
    if (value.length > 4096) throw Error("Input too large");
  }
  return value.trimEnd();
}
try {
  if (command === "verify-backup") {
    console.log(JSON.stringify(await verifyBackup(resolve(args[0]!))));
  } else if (command === "restore") {
    console.log(
      JSON.stringify(await restoreBackup(resolve(args[0]!), resolve(args[1]!))),
    );
  } else {
    const db = openDb(config.dataDir);
    try {
      if (command === "migrate") {
        migrate(db, config.now());
        console.log(JSON.stringify({ ok: true, schemaVersion: 1 }));
      } else {
        assertMigrated(db);
        const s = createServices(db, config);
        if (command === "create-owner") {
          const u = await s.auth.createOwner(args[0] ?? "leo", await stdin());
          console.log(JSON.stringify({ id: u.id, username: u.username }));
        } else if (command === "backup")
          console.log(JSON.stringify(await backup(db, config)));
        else {
          const u = db.prepare("SELECT * FROM users LIMIT 1").get() as
            Row | undefined;
          if (!u) throw Error("Create owner first");
          const p = ownerPrincipal(u as { id: string; display_name: string });
          if (command === "create-agent-key") {
            const result = s.access.create(
              p,
              {
                label: args[0] ?? "CLI",
                scopes: (args[1] ?? "read,write").split(","),
                expiresInDays: Number(args[2] ?? 365),
              },
              await stdin(),
            );
            console.log(
              JSON.stringify({
                agentKey: result.agentKey,
                mcpUrl: result.mcpUrl,
              }),
            );
          } else if (command === "revoke-agent-key") {
            s.access.revoke(p, args[0]!);
            console.log(JSON.stringify({ ok: true }));
          } else if (command === "cleanup") {
            s.data.cleanup();
            console.log(JSON.stringify({ ok: true }));
          } else
            throw Error(
              "Usage: admin migrate|create-owner|create-agent-key|revoke-agent-key|backup|verify-backup|restore|cleanup",
            );
        }
      }
    } finally {
      db.close();
    }
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : "Admin command failed");
  process.exitCode = 1;
}
