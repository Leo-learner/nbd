import { fail } from "./errors.js";
export const DAY = 86400000;
export const iso = (value: number | null | undefined) =>
  value == null ? null : new Date(value).toISOString();
export function todayIn(timezone: string, now: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function isLocalDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value
  );
}
export function addDays(date: string, days: number): string {
  if (!isLocalDate(date)) fail(400, "INVALID_INPUT", "日期无效");
  return new Date(Date.parse(date + "T00:00:00Z") + days * DAY)
    .toISOString()
    .slice(0, 10);
}
export const daysBetween = (a: string, b: string) =>
  Math.round(
    (Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY,
  );
export function localNoon(date: string, timezone: string): number {
  let guess = Date.parse(date + "T12:00:00Z");
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(guess);
    const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
    guess +=
      Date.parse(date + "T12:00:00Z") -
      Date.parse(
        `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`,
      );
  }
  return guess;
}
export function parseHappened(
  value: string | undefined,
  timezone: string,
  now: number,
  precision?: string,
) {
  if (
    value !== undefined &&
    !isLocalDate(value) &&
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  )
    fail(400, "INVALID_INPUT", "发生时间必须带时区或为有效日期");
  const dayOnly = value !== undefined && isLocalDate(value);
  const on = value === undefined ? todayIn(timezone, now) : value.slice(0, 10);
  if (!isLocalDate(on)) fail(400, "INVALID_INPUT", "发生日期无效");
  const at =
    value === undefined
      ? now
      : dayOnly
        ? localNoon(on, timezone)
        : Date.parse(value);
  if (!Number.isFinite(at)) fail(400, "INVALID_INPUT", "发生时间无效");
  if (at > now + 600000)
    fail(400, "HAPPENED_AT_IN_FUTURE", "发生时间不能晚于现在十分钟");
  return { at, on, precision: precision ?? (dayOnly ? "day" : "exact") };
}
