import { existsSync } from "node:fs";
import { createConfig } from "./config.js";
import { buildApp } from "./app.js";
if (existsSync(".env")) process.loadEnvFile(".env");
const config = createConfig(),
  app = await buildApp(config);
const cleanup = setInterval(() => {
  try {
    app.services.data.cleanup();
  } catch {
    app.log.error("Cleanup failed");
  }
}, 3600000);
cleanup.unref();
for (const signal of ["SIGTERM", "SIGINT"])
  process.once(signal, () => {
    clearInterval(cleanup);
    void app.close();
  });
await app.listen({ host: config.host, port: config.port });
