import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, chmodSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const directory = join(root, "docs/deployment-private");
const file = join(directory, "credentials.json");
if (existsSync(file))
  throw Error("Credentials already exist; use the recovery CLI if needed");
mkdirSync(directory, { recursive: true, mode: 0o700 });
chmodSync(directory, 0o700);
const credentials = {
  origin: "https://nbd.dkz12345.com",
  mcpUrl: "https://nbd.dkz12345.com/mcp",
  username: "leo",
  password: randomBytes(24).toString("base64url"),
  agentKey: "nbd_ak_" + randomBytes(32).toString("base64url"),
  createdAt: new Date().toISOString(),
};
writeFileSync(file, JSON.stringify(credentials, null, 2) + "\n", {
  mode: 0o600,
  flag: "wx",
});

function remote(command, input) {
  const result = spawnSync(
    "ssh",
    [
      "-o",
      "BatchMode=yes",
      "-o",
      "IdentitiesOnly=yes",
      "-o",
      "StrictHostKeyChecking=accept-new",
      "-o",
      "ConnectTimeout=12",
      "-i",
      "/Users/leo/Desktop/ssh-key-removing-restricted/leo-web-key.pem",
      "leo@20.48.14.96",
      "cd /opt/apps/nbd/current && sudo -n -u nbd node --env-file=/etc/nbd.env dist/scripts/admin.js " +
        command,
    ],
    { input: input + "\n", encoding: "utf8", timeout: 30000 },
  );
  if (result.status !== 0)
    throw Error(
      "Bootstrap failed; private credentials retained for recovery. " +
        (result.error?.message ?? result.stderr),
    );
  return JSON.parse(result.stdout);
}
remote("create-owner leo", credentials.password);
const key = remote(
  "create-agent-key 'Owner Agent' read,write 365",
  credentials.agentKey,
);
credentials.agentKeyId = key.agentKey.id;
credentials.agentKeyExpiresAt = key.agentKey.expiresAt;
writeFileSync(file, JSON.stringify(credentials, null, 2) + "\n", {
  mode: 0o600,
});
console.log(
  JSON.stringify({
    ok: true,
    username: "leo",
    credentialsFile: file,
    agentKeyId: credentials.agentKeyId,
  }),
);
