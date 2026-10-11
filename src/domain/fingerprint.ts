import { createHash, timingSafeEqual } from "node:crypto";
export const digest = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
export const sameDigest = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k, v]) => k !== "clientRequestId" && v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonical(v)]),
    );
  return value;
}
export const fingerprint = (value: unknown) =>
  digest(JSON.stringify(canonical(value)));
export const contentFingerprint = (narrative: string, on: string) =>
  digest(narrative.normalize("NFKC").replace(/\s/g, "") + "|" + on);
