import type { operations } from "../../sdk/generated";
import { ApiError } from "./errors";
export { ApiError } from "./errors";
export type ResponseOf<K extends keyof operations> = operations[K] extends {
  responses: { 200: { content: { "application/json": infer R } } };
}
  ? R
  : never;
export type Meta = ResponseOf<"getMeta">;
export type User = NonNullable<ResponseOf<"getMe">["user"]>;
export type MomentDetail = ResponseOf<"getMoment">;
export type MomentSummary = ResponseOf<"listMoments">["items"][number];
export type Lesson = ResponseOf<"getLesson">;
export async function api<T>(
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
  retried = false,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        ...(method === "GET" ? {} : { "X-NBD-Request": "1" }),
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "连接失败，请检查网络后重试");
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new ApiError(
      response.status,
      data?.error?.code ?? "INTERNAL_ERROR",
      data?.error?.message ?? "服务暂时不可用",
      data?.error?.details,
      data?.requestId ?? response.headers.get("X-Request-Id") ?? undefined,
      Number(response.headers.get("Retry-After")) || 0,
    );
    if (error.code === "STORAGE_BUSY" && method === "GET" && !retried)
      return api(method, path, body, headers, true);
    if (error.status === 401 && path !== "/auth/login")
      window.dispatchEvent(new Event("nbd-auth-required"));
    throw error;
  }
  return data as T;
}
export const idempotency = () => ({ "Idempotency-Key": crypto.randomUUID() });
export function localDate(value: string, approx = false) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return `${approx ? "约 " : ""}${year !== new Date().getFullYear() ? `${year}年` : ""}${month}月${day}日`;
}
export function instant(value: string | null | undefined, timezone: string) {
  return value
    ? new Intl.DateTimeFormat("zh-CN", {
        timeZone: timezone,
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(value))
    : "—";
}
export function today(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (name: string) => parts.find((p) => p.type === name)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function dateOffset(value: string, days: number) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
export const dayDiff = (a: string, b: string) => {
  const parse = (s: string) => {
    const [y, m, d] = s.slice(0, 10).split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((parse(a) - parse(b)) / 86400000);
};
