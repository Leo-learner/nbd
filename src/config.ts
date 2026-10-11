import { resolve } from "node:path";
export interface Config {
  env: string;
  host: string;
  port: number;
  publicOrigin: string;
  dataDir: string;
  publicDir: string;
  secureCookie: boolean;
  trustProxy: boolean;
  allowedOrigins: string[];
  timezone: string;
  sessionDays: number;
  scheduleDays: number[];
  freezeHours: number;
  trashDays: number;
  auditDays: number;
  mcpRate: number;
  recordRate: number;
  clientHosts: string[];
  redirectHosts: string[];
  loopbackRedirect: boolean;
  accessMinutes: number;
  refreshDays: number;
  apiDocs: boolean;
  spaFallback: boolean;
  logger: boolean;
  logLevel: string;
  now: () => number;
}
export function createConfig(
  overrides: Partial<Config> = {},
  env: NodeJS.ProcessEnv = process.env,
): Config {
  const int = (key: string, fallback: number) => {
    const value = env[key] ?? String(fallback);
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))
      throw new Error(`Invalid ${key}`);
    return Number(value);
  };
  const bool = (key: string, fallback: boolean) => {
    const value = env[key] ?? String(fallback);
    if (!["true", "false"].includes(value)) throw new Error(`Invalid ${key}`);
    return value === "true";
  };
  const list = (key: string, fallback = "") =>
    (env[key] ?? fallback)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  const schedule = list("REVIEW_SCHEDULE_DAYS", "3,14,60");
  if (!schedule.length || schedule.some((x) => !/^[1-9]\d*$/.test(x)))
    throw new Error("Invalid REVIEW_SCHEDULE_DAYS");
  const config: Config = {
    env: env.NODE_ENV ?? "development",
    host: env.HOST ?? "127.0.0.1",
    port: int("PORT", 3230),
    publicOrigin: env.PUBLIC_ORIGIN ?? "http://127.0.0.1:3230",
    dataDir: resolve(env.DATA_DIR ?? ".work/data"),
    publicDir: resolve(env.PUBLIC_DIR ?? "public"),
    secureCookie: bool("COOKIE_SECURE", false),
    trustProxy: bool("TRUST_PROXY", false),
    allowedOrigins: list("ALLOWED_ORIGINS"),
    timezone: env.DEFAULT_TIMEZONE ?? "Asia/Shanghai",
    sessionDays: int("SESSION_TTL_DAYS", 30),
    scheduleDays: schedule.map(Number),
    freezeHours: int("FREEZE_HOURS", 24),
    trashDays: int("TRASH_DAYS", 30),
    auditDays: int("AUDIT_RETENTION_DAYS", 365),
    mcpRate: int("MCP_RATE_PER_MIN", 120),
    recordRate: int("MCP_RECORD_PER_HOUR", 30),
    clientHosts: list(
      "OAUTH_CLIENT_ID_HOSTS",
      "claude.ai,claude.com,chatgpt.com",
    ),
    redirectHosts: list(
      "OAUTH_REDIRECT_HOSTS",
      "claude.ai,claude.com,chatgpt.com",
    ),
    loopbackRedirect: bool("OAUTH_ALLOW_LOOPBACK_REDIRECT", false),
    accessMinutes: int("OAUTH_ACCESS_TTL_MIN", 60),
    refreshDays: int("OAUTH_REFRESH_TTL_DAYS", 60),
    apiDocs: bool("API_DOCS", false),
    spaFallback: bool("SPA_FALLBACK", true),
    logger: true,
    logLevel: env.LOG_LEVEL ?? "info",
    now: Date.now,
    ...overrides,
  };
  const url = new URL(config.publicOrigin);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.origin !== config.publicOrigin ||
    url.username ||
    url.password
  )
    throw new Error("Invalid PUBLIC_ORIGIN");
  if (!["development", "test", "production"].includes(config.env))
    throw new Error("Invalid NODE_ENV");
  if (
    config.env === "production" &&
    (!config.secureCookie || url.protocol !== "https:")
  )
    throw new Error("Production requires HTTPS and secure cookies");
  new Intl.DateTimeFormat("en-CA", { timeZone: config.timezone });
  if (
    config.scheduleDays.some(
      (x, i, a) =>
        !Number.isSafeInteger(x) || x < 1 || (i > 0 && x <= a[i - 1]!),
    )
  )
    throw new Error("Schedule must be increasing");
  for (const origin of config.allowedOrigins)
    if (new URL(origin).origin !== origin)
      throw new Error("Invalid ALLOWED_ORIGINS");
  if (config.port > 65535) throw new Error("Invalid PORT");
  return config;
}
