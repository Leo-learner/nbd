import { fail } from "../errors.js";
export function normalizeTag(name: string): string {
  const normalized = name.normalize("NFKC").trim().replace(/^#+/, "").trim();
  if ([...normalized].length < 1 || [...normalized].length > 20)
    fail(400, "INVALID_INPUT", "标签长度必须为 1–20 字");
  return normalized;
}
