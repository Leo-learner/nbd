import { cpSync, mkdirSync } from "node:fs";
mkdirSync("dist/src/db/migrations", { recursive: true });
cpSync("src/db/migrations", "dist/src/db/migrations", { recursive: true });
mkdirSync("dist/docs", { recursive: true });
for (const name of ["openapi.yaml", "mcp-tools.json"])
  cpSync(`docs/${name}`, `dist/docs/${name}`);
