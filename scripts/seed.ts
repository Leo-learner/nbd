import { existsSync } from "node:fs";
import { createConfig } from "../src/config.js";
import { openDb, migrate } from "../src/db/index.js";
import { createServices } from "../src/services.js";
import { secret } from "../src/modules/auth.js";
import { ownerPrincipal } from "../src/modules/principal.js";
import type { Row } from "../src/db/index.js";
if (existsSync(".env")) process.loadEnvFile(".env");
const config = createConfig();
if (config.env === "production") throw Error("Seed is forbidden in production");
const db = openDb(config.dataDir);
try {
  migrate(db, config.now());
  const s = createServices(db, config);
  await s.auth.init();
  let u = db.prepare("SELECT * FROM users LIMIT 1").get() as Row | undefined;
  if (!u) u = await s.auth.createOwner("demo", "NbdDemo-LocalOnly-2026");
  const owner = ownerPrincipal(u as { id: string; display_name: string }),
    agent = {
      ...owner,
      kind: "system" as const,
      id: null,
      label: "虚构演示数据",
    };
  for (const [i, title] of [
    "汇报时忘了下一句话",
    "发消息时写错了一个字",
    "问了一个怕被觉得简单的问题",
  ].entries()) {
    const r = s.moments.record(agent, {
      title,
      narrative: `这是虚构的开发演示记录 ${i + 1}，不是所有者的真实经历。`,
      happenedAt: "2026-10-01",
      scene: "study",
      emotions: [{ key: "embarrassed", intensity: 7 - i }],
      intensity: 7 - i,
      tags: ["演示"],
    });
    s.moments.addReflection(owner, r.moment.id, {
      intensityNow: 2,
      resolution: "easing",
      perspective: "这是虚构的复盘示例。",
    });
  }
  console.log(
    JSON.stringify({
      ok: true,
      username: "demo",
      note: "仅开发环境；演示密码见 scripts/seed.ts",
    }),
  );
} finally {
  db.close();
}
