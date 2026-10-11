import { readFileSync } from "node:fs";
import YAML from "yaml";
import type { Row } from "./db/index.js";
export const apiContract = YAML.parse(
  readFileSync(new URL("../docs/openapi.yaml", import.meta.url), "utf8"),
) as Row;
export const mcpContract = JSON.parse(
  readFileSync(new URL("../docs/mcp-tools.json", import.meta.url), "utf8"),
) as Row;
export function dereference(value: any): any {
  if (Array.isArray(value)) return value.map(dereference);
  if (!value || typeof value !== "object") return value;
  if (value.$ref) {
    const target = value.$ref
      .split("/")
      .slice(1)
      .reduce((a: Row, k: string) => a[k], apiContract);
    const { $ref, ...rest } = value;
    return dereference({ ...target, ...rest });
  }
  const resolved = Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, dereference(v)]),
  );
  if (resolved.allOf?.length === 1) {
    const { allOf, ...rest } = resolved;
    return { ...allOf[0], ...rest };
  }
  return resolved;
}
/** Map DTOs to the declared output shape; permission redaction happens in services. */
export function project(schema: Row, value: any): any {
  if (value == null) return value;
  if (schema.properties && typeof value === "object" && !Array.isArray(value))
    return Object.fromEntries(
      Object.entries(schema.properties)
        .filter(([k]) => k in value)
        .map(([k, s]) => [k, project(s as Row, value[k])]),
    );
  if (schema.items && Array.isArray(value))
    return value.map((v) => project(schema.items, v));
  return value;
}
