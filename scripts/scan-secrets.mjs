import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
const root = process.argv[2] ?? ".";
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:ghp|github_pat|sk_live|sk-proj|sk-ant-api)_[A-Za-z0-9_-]{20,}/,
  /\bnbd_(?:ak|at|rt)_[A-Za-z0-9_-]{43}\b/,
];
let failed = false;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (
      [".git", "node_modules", ".work", "deployment-private", "dist"].includes(
        name,
      )
    )
      continue;
    const path = join(dir, name),
      stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else {
      const rel = relative(root, path);
      if (/(?:\.sqlite(?:-|$)|^\.env$|\.pem$)/.test(rel)) {
        console.error("Forbidden private artifact: " + rel);
        failed = true;
        continue;
      }
      // All-zero values are explicit documentation placeholders, never issued credentials.
      const data = readFileSync(path, "utf8").replace(/\bnbd_(?:ak|at|rt)_0{43}\b/g, "DOCUMENTATION_PLACEHOLDER");
      if (patterns.some((p) => p.test(data))) {
        console.error("Potential secret: " + rel);
        failed = true;
      }
    }
  }
}
walk(root);
if (failed) process.exit(1);
console.log("Secret scan passed");
