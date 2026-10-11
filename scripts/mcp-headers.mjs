import { readFileSync } from "node:fs";
const credentials = JSON.parse(
  readFileSync(
    new URL("../docs/deployment-private/credentials.json", import.meta.url),
    "utf8",
  ),
);
if (!/^nbd_ak_[A-Za-z0-9_-]{43}$/.test(credentials.agentKey))
  throw Error("Invalid private Agent key");
process.stdout.write(
  JSON.stringify({ Authorization: "Bearer " + credentials.agentKey }) + "\n",
);
