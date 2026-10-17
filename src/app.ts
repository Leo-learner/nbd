import Fastify, { LogController } from "fastify";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import formbody from "@fastify/formbody";
import swagger from "@fastify/swagger";
import staticPlugin from "@fastify/static";
import { existsSync } from "node:fs";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import type { Config } from "./config.js";
import {
  openDb,
  assertMigrated,
  schemaVersion,
  type Db,
  type Row,
} from "./db/index.js";
import { createServices, type Services } from "./services.js";
import { apiContract, dereference } from "./contract.js";
import { AppError, fail } from "./errors.js";
import { OAuthError, escapeHtml } from "./oauth/service.js";
import { registerApi } from "./routes/api.js";
import { createMcpServer } from "./mcp/tools.js";
import type { Principal } from "./modules/principal.js";
declare module "fastify" {
  interface FastifyInstance {
    services: Services;
  }
}
// clerk-js (headless, for the shared dkz12345 account) loads from our Clerk Frontend API and
// pulls in Clerk Protect from *.protect.clerk.com, as Clerk's CSP guide lists.
const csp =
  "default-src 'self'; script-src 'self' https://clerk.dkz12345.com https://*.protect.clerk.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://clerk.dkz12345.com https://*.protect.clerk.com:*; frame-src 'self' https://*.protect.clerk.com; worker-src 'self' blob:; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
export async function buildApp(
  config: Config,
  deps: { db?: Db; fetcher?: typeof fetch } = {},
) {
  const db = deps.db ?? openDb(config.dataDir);
  assertMigrated(db);
  const s = createServices(db, config, deps.fetcher);
  const app = Fastify({
    bodyLimit: 256 * 1024,
    requestTimeout: 30000,
    connectionTimeout: 35000,
    trustProxy: config.trustProxy ? ["127.0.0.1", "::1"] : false,
    logController: new LogController({ disableRequestLogging: true }),
    logger: config.logger
      ? {
          level: config.logLevel,
          redact: [
            "req.headers.authorization",
            "req.headers.cookie",
            "res.headers.set-cookie",
            "req.body",
          ],
          serializers: {
            req: (req) => ({
              id: req.id,
              method: req.method,
              path: req.url?.split("?")[0],
            }),
          },
        }
      : false,
    ajv: { customOptions: { removeAdditional: false, coerceTypes: "array" } },
  });
  app.decorate("services", s);
  await app.register(cookie);
  await app.register(formbody);
  await app.register(rateLimit, {
    max: 300,
    timeWindow: "1 minute",
    errorResponseBuilder: () =>
      new AppError(429, "RATE_LIMITED", "请求过于频繁，请稍后再试"),
  });
  await app.register(swagger, {
    openapi: {
      info: { title: "NBD（没什么大不了）网页 API", version: "1.0.0" },
      servers: [{ url: config.publicOrigin }],
      components: {
        securitySchemes: {
          cookieAuth: { type: "apiKey", in: "cookie", name: "__session" },
        },
      },
    },
  });
  app.addHook("onRequest", async (req, reply) => {
    reply
      .header("X-Request-Id", req.id)
      .header("X-Content-Type-Options", "nosniff")
      .header("Referrer-Policy", "same-origin")
      .header("X-Robots-Tag", "noindex")
      .header("Content-Security-Policy", csp)
      .header("X-Frame-Options", "DENY");
    if (config.env === "production")
      reply.header("Strict-Transport-Security", "max-age=31536000");
  });
  app.setErrorHandler((e, req, reply) => {
    reply.removeHeader("Content-Disposition");
    const status =
      e instanceof AppError
        ? e.status
        : ((e as { statusCode?: number }).statusCode ?? 500);
    const validation = !!(e as { validation?: unknown }).validation;
    const code =
      e instanceof AppError
        ? e.code
        : validation
          ? "VALIDATION_ERROR"
          : status === 413
            ? "PAYLOAD_TOO_LARGE"
            : status === 429
              ? "RATE_LIMITED"
              : (e as { code?: string }).code === "SQLITE_BUSY"
                ? "STORAGE_BUSY"
                : status >= 500
                  ? "INTERNAL_ERROR"
                  : "REQUEST_FAILED";
    if (status === 401 && req.url.split("?")[0] === "/mcp")
      reply.header(
        "WWW-Authenticate",
        `Bearer resource_metadata="${config.publicOrigin}/.well-known/oauth-protected-resource/mcp", scope="read write"`,
      );
    if (status >= 500)
      req.log.error({ code, requestId: req.id }, "Request failed");
    reply.code(code === "STORAGE_BUSY" ? 503 : validation ? 400 : status).send({
      error: {
        code,
        message:
          e instanceof AppError
            ? e.message
            : validation
              ? "请求参数不符合接口要求"
              : status >= 500
                ? "服务暂时不可用"
                : "请求失败",
        ...(e instanceof AppError && e.details ? { details: e.details } : {}),
      },
      requestId: req.id,
    });
  });
  app.addHook("onSend", async (_req, reply, payload) => {
    if (String(reply.getHeader("Content-Type") ?? "").startsWith("text/html")) {
      const cache = String(reply.getHeader("Cache-Control") ?? "no-cache");
      reply.header("Cache-Control", `${cache}, no-transform`);
    }
    return payload;
  });
  for (const path of ["/healthz", "/readyz"]) {
    const operation = apiContract.paths[path].get;
    const response = Object.fromEntries(
      Object.entries(operation.responses).map(([code, value]) => [
        code,
        dereference(value).content["application/json"].schema,
      ]),
    );
    app.get(
      path,
      {
        schema: {
          operationId: operation.operationId,
          tags: ["system"],
          response,
        },
      },
      async () => {
        if (path === "/healthz") return { ok: true };
        try {
          assertMigrated(db);
          db.prepare("SELECT 1").get();
          return { ok: true, schemaVersion };
        } catch {
          fail(503, "NOT_READY", "服务尚未就绪");
        }
      },
    );
  }
  await registerApi(app, s);
  await app.register(async (mcp) => {
    const windows = new Map<string, { start: number; count: number }>();
    const check = (key: string, max: number, period: number) => {
      const now = config.now(),
        prior = windows.get(key),
        state =
          !prior || now - prior.start >= period
            ? { start: now, count: 0 }
            : prior;
      state.count++;
      windows.set(key, state);
      if (windows.size > 1000)
        for (const [k, v] of windows)
          if (now - v.start >= 3600000) windows.delete(k);
      if (state.count > max)
        fail(429, "RATE_LIMITED", "调用过于频繁，请稍后再试");
    };
    mcp.addHook("onRequest", async (req, reply) => {
      reply.header("Cache-Control", "no-store");
      const token =
        req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/i)?.[1] ??
        "";
      const p = s.access.authenticate(token);
      if (req.headers.host !== new URL(config.publicOrigin).host)
        fail(403, "HOST_REJECTED", "Host 不被允许");
      if (
        req.headers.origin !== undefined &&
        ![config.publicOrigin, ...config.allowedOrigins].includes(
          req.headers.origin,
        )
      )
        fail(403, "ORIGIN_REJECTED", "Origin 不被允许");
      check("mcp:" + p.id, config.mcpRate, 60000);
      Object.assign(req, { principal: p, bearer: token });
    });
    mcp.post("/mcp", { schema: { hide: true } }, async (req, reply) => {
      const p = (req as any).principal as Principal,
        token = (req as any).bearer as string;
      const handler = createMcpHandler(
        () =>
          createMcpServer(s, p, token, (actor) =>
            check("record:" + actor.id, config.recordRate, 3600000),
          ),
        {
          legacy: "stateless",
          responseMode: "auto",
          keepAliveMs: 0,
          maxRequestBodySize: 256 * 1024,
          maxSubscriptions: 1,
        },
      );
      reply.hijack();
      for (const [key, value] of Object.entries(reply.getHeaders()))
        if (value !== undefined) reply.raw.setHeader(key, value);
      try {
        await toNodeHandler(handler, { maxRequestBodySize: 256 * 1024 })(
          req.raw,
          reply.raw,
          req.body,
        );
      } finally {
        await handler.close();
      }
    });
    mcp.route({
      method: ["GET", "DELETE"],
      url: "/mcp",
      schema: { hide: true },
      handler: async (_req, reply) =>
        reply
          .code(405)
          .header("Allow", "POST")
          .send({
            error: {
              code: "METHOD_NOT_ALLOWED",
              message: "无状态 MCP 仅接受 POST",
            },
          }),
    });
  });
  await app.register(async (oauth) => {
    oauth.addHook("onRequest", async (_req, reply) => {
      reply.header("Cache-Control", "no-store");
    });
    oauth.setErrorHandler((e, req, reply) => {
      const originalStatus =
        e instanceof OAuthError
          ? e.status
          : e instanceof AppError
            ? e.status
            : ((e as { statusCode?: number }).statusCode ?? 500);
      const status =
        originalStatus === 429
          ? 429
          : originalStatus >= 500
            ? originalStatus
            : 400;
      if (status >= 500)
        req.log.error({ requestId: req.id }, "OAuth request failed");
      if (status === 429 && !reply.hasHeader("Retry-After"))
        reply.header("Retry-After", "60");
      reply.code(status).send({
        error:
          status >= 500
            ? "server_error"
            : e instanceof OAuthError
              ? e.code
              : e instanceof AppError && e.code === "INVALID_CREDENTIALS"
                ? "access_denied"
                : "invalid_request",
        error_description:
          status >= 500
            ? "Service temporarily unavailable"
            : e instanceof OAuthError
              ? e.message
              : e instanceof AppError
                ? e.message
                : "Invalid request",
      });
    });
    for (const path of [
      "/.well-known/oauth-protected-resource",
      "/.well-known/oauth-protected-resource/mcp",
    ])
      oauth.get(path, { schema: { hide: true } }, async (_req, reply) => {
        reply.header("Access-Control-Allow-Origin", "*");
        return s.oauth.resourceMetadata();
      });
    oauth.get(
      "/.well-known/oauth-authorization-server",
      { schema: { hide: true } },
      async (_req, reply) => {
        reply.header("Access-Control-Allow-Origin", "*");
        return s.oauth.metadata();
      },
    );
    const csrfCookie = config.secureCookie ? "__Host-nbd_oauth" : "nbd_oauth";
    oauth.get(
      "/oauth/authorize",
      {
        schema: { hide: true },
        bodyLimit: 16 * 1024,
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      },
      async (req, reply) => {
        const begin = await s.oauth.begin(req.query as Row);
        // Not signed in, stale, or someone else: the app sorts that out with the
        // shared account and comes back here.
        const access = await s.owner.check(req.headers);
        if (!access.ok)
          return reply.redirect(
            `/login?next=${encodeURIComponent(req.url)}`,
            303,
          );
        const callback = new URL(begin.request.redirect_uri).origin;
        reply.header(
          "Content-Security-Policy",
          csp.replace("form-action 'self'", `form-action 'self' ${callback}`),
        );
        reply.setCookie(csrfCookie, begin.csrf, {
          path: "/",
          httpOnly: true,
          secure: config.secureCookie,
          sameSite: "lax",
          maxAge: 600,
        });
        return reply
          .type("text/html; charset=utf-8")
          .send(
            s.oauth.form(begin.request, begin.csrf, begin.client, req.url),
          );
      },
    );
    oauth.post(
      "/oauth/authorize",
      {
        schema: { hide: true },
        bodyLimit: 16 * 1024,
        config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      },
      async (req, reply) => {
        if (
          req.headers.origin !== undefined &&
          req.headers.origin !== config.publicOrigin
        )
          throw new OAuthError("invalid_request", "Invalid Origin", 403);
        const body = req.body as Row;
        // The Clerk token lives about a minute and nothing refreshes it on this
        // page, so a slow click comes back through the app and then here again.
        const access = await s.owner.check(req.headers);
        if (!access.ok) {
          const back =
            typeof body?.returnTo === "string" &&
            body.returnTo.startsWith("/oauth/authorize?")
              ? body.returnTo
              : "/";
          return reply.redirect(
            `/login?next=${encodeURIComponent(back)}`,
            303,
          );
        }
        const result = await s.oauth.approve(
          body,
          req.cookies[csrfCookie],
          access.user,
        );
        reply.clearCookie(csrfCookie, {
          path: "/",
          secure: config.secureCookie,
        });
        return reply.redirect(result.redirect);
      },
    );
    oauth.post(
      "/oauth/token",
      {
        schema: { hide: true },
        bodyLimit: 16 * 1024,
        config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      },
      async (req) => s.oauth.token(req.body as Row),
    );
    oauth.post(
      "/oauth/revoke",
      { schema: { hide: true }, bodyLimit: 16 * 1024 },
      async (req, reply) => {
        s.oauth.revoke(req.body as Row);
        return reply.send();
      },
    );
  });
  if (config.apiDocs) {
    app.get("/openapi.json", { schema: { hide: true } }, async () =>
      app.swagger(),
    );
    app.get("/docs", { schema: { hide: true } }, async (_req, reply) =>
      reply
        .type("text/html")
        .send('<h1>NBD API</h1><a href="/openapi.json">OpenAPI JSON</a>'),
    );
  }
  if (existsSync(config.publicDir))
    await app.register(staticPlugin, {
      root: config.publicDir,
      prefix: "/",
      // Frontend releases switch a directory symlink without restarting the API.
      // Resolve new hashed asset names on each request instead of at startup.
      wildcard: true,
      index: ["index.html"],
    });
  app.setNotFoundHandler((req, reply) => {
    if (
      config.spaFallback &&
      req.method === "GET" &&
      req.headers.accept?.includes("text/html") &&
      !/^\/(?:api(?:\/|$)|mcp(?:\/|$)|oauth(?:\/|$)|\.well-known(?:\/|$)|healthz|readyz|docs|openapi\.json|s(?:\/|$))/.test(
        req.url,
      ) &&
      existsSync(config.publicDir + "/index.html")
    )
      return reply.sendFile("index.html");
    return reply.code(404).send({
      error: { code: "NOT_FOUND", message: "接口不存在" },
      requestId: req.id,
    });
  });
  app.addHook("onClose", async () => {
    if (!deps.db) db.close();
  });
  await app.ready();
  return app;
}
