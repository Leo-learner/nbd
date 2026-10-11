import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import type { Services } from "../services.js";
import type { Row } from "../db/index.js";
import { apiContract, dereference, project } from "../contract.js";
import { ownerPrincipal, type Principal } from "../modules/principal.js";
import { publicUser } from "../modules/auth.js";
import { fail } from "../errors.js";
export function cookieName(s: Services) {
  return s.config.secureCookie ? "__Host-nbd_sid" : "nbd_sid";
}
export function setSession(reply: FastifyReply, s: Services, token: string) {
  reply.setCookie(cookieName(s), token, {
    path: "/",
    httpOnly: true,
    secure: s.config.secureCookie,
    sameSite: "lax",
    maxAge: s.config.sessionDays * 86400,
  });
}
export async function registerApi(app: FastifyInstance, s: Services) {
  await app.register(async (api) => {
    api.addHook("onRequest", async (req, reply) => {
      reply.header("Cache-Control", "no-store");
      if (
        req.headers.origin !== undefined &&
        ![s.config.publicOrigin, ...s.config.allowedOrigins].includes(
          req.headers.origin,
        )
      )
        fail(403, "ORIGIN_REJECTED", "请求来源不被允许");
      if (
        !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
        req.headers["x-nbd-request"] !== "1"
      )
        fail(403, "REQUEST_HEADER_REQUIRED", "请提供 X-NBD-Request: 1");
      const session = s.auth.lookup(req.cookies[cookieName(s)]);
      if (session) {
        (req as any).owner = session.user;
        if (session.renew) {
          s.auth.touch(req.cookies[cookieName(s)]!);
          setSession(reply, s, req.cookies[cookieName(s)]!);
        }
      }
    });
    const handlers: Record<
      string,
      (
        p: Principal,
        a: Row,
        params: Row,
        req: FastifyRequest,
        reply: FastifyReply,
      ) => unknown
    > = {
      getMeta: () => s.data.meta(),
      getMe: (_p, _a, _v, req) => ({
        user: (req as any).owner ? publicUser((req as any).owner) : null,
      }),
      login: async (_p, a, _v, req, reply) => {
        const audit = s.audit.start(null, "auth.login", "web", req.id, req.ip);
        try {
          const user = await s.auth.login(a.username, a.password);
          const token = s.auth.issue(user.id, req.cookies[cookieName(s)]);
          setSession(reply, s, token);
          s.audit.attachUser(audit, user.id);
          s.audit.finish(audit, "success");
          return { user: publicUser(user) };
        } catch (e) {
          s.audit.finish(audit, "error", "INVALID_CREDENTIALS");
          throw e;
        }
      },
      logout: (_p, _a, _v, req, reply) => {
        s.auth.logout(req.cookies[cookieName(s)]);
        reply.clearCookie(cookieName(s), {
          path: "/",
          secure: s.config.secureCookie,
        });
        return { ok: true };
      },
      logoutAll: (p, _a, _v, _req, reply) => {
        s.auth.logoutAll(p.userId);
        reply.clearCookie(cookieName(s), {
          path: "/",
          secure: s.config.secureCookie,
        });
        return { ok: true };
      },
      changePassword: async (p, a, _v, _req, reply) => {
        await s.auth.changePassword(
          s.auth.user(p.userId),
          a.currentPassword,
          a.newPassword,
        );
        setSession(reply, s, s.auth.issue(p.userId));
        return { ok: true };
      },
      listMoments: (p, a) => s.moments.list(p, a),
      getMoment: (p, _a, v) => s.moments.detail(p, v.momentId),
      updateMoment: (p, a, v) => {
        s.moments.patch(p, v.momentId, a);
        return s.moments.detail(p, v.momentId);
      },
      listMomentRevisions: (p, _a, v) => s.moments.revisions(p, v.momentId),
      setMomentTags: (p, a, v) => s.moments.setTags(p, v.momentId, a.names),
      createNote: (p, a, v) => s.moments.addNote(p, v.momentId, a.body),
      deleteNote: (p, _a, v) => s.moments.deleteNote(p, v.noteId),
      snoozeMoment: (p, a, v) => s.moments.snooze(p, v.momentId, a),
      archiveMoment: (p, _a, v) => s.moments.archive(p, v.momentId, true),
      unarchiveMoment: (p, _a, v) => s.moments.archive(p, v.momentId, false),
      trashMoment: (p, _a, v) => s.moments.trash(p, v.momentId),
      restoreMoment: (p, _a, v) => s.moments.restore(p, v.momentId),
      listTrash: (p) => s.moments.listTrash(p),
      purgeMoment: (p, _a, v) => s.moments.purge(p, v.momentId),
      listDueReviews: (p, a) => s.moments.due(p, a),
      createReflection: (p, a, v) => s.moments.addReflection(p, v.momentId, a),
      updateReflection: (p, a, v) =>
        s.moments.modifyReflection(p, v.reflectionId, a),
      deleteReflection: (p, _a, v) =>
        s.moments.modifyReflection(p, v.reflectionId, null),
      listLessons: (p, a) => s.library.list(p, a),
      createLesson: (p, a) => s.library.create(p, a),
      getLesson: (p, _a, v) => s.library.detail(p, v.lessonId),
      updateLesson: (p, a, v) => s.library.modify(p, v.lessonId, a),
      deleteLesson: (p, _a, v) => s.library.delete(p, v.lessonId),
      setLessonMoments: (p, a, v) => s.library.link(p, v.lessonId, a.momentIds),
      listTags: (p) => s.library.tags(p),
      renameTag: (p, a, v) => s.library.rename(p, v.tagId, a.name),
      mergeTag: (p, a, v) => s.library.merge(p, v.tagId, a.intoId),
      deleteTag: (p, _a, v) => s.library.deleteTag(p, v.tagId),
      getInsightsOverview: (p, a) => s.insights.overview(p, a),
      getInsightsDecay: (p, a) => s.insights.decay(p, a),
      getInsightsCalendar: (p, a) => s.insights.calendar(p, a),
      listAgentKeys: (p) => s.access.list(p),
      createAgentKey: async (p, a) => {
        const u = s.auth.user(p.userId);
        if (!(await s.auth.verify(a.currentPassword, u.password_hash)))
          fail(403, "PASSWORD_INCORRECT", "当前密码错误");
        if (s.auth.user(p.userId).password_hash !== u.password_hash)
          fail(409, "ACCOUNT_CHANGED", "账号凭证已变化");
        return s.access.create(p, a);
      },
      revokeAgentKey: (p, _a, v) => s.access.revoke(p, v.keyId),
      listConnectedApps: (p) => s.access.apps(p),
      revokeConnectedApp: (p, _a, v) => s.access.revokeApp(p, v.appId),
      getSettings: (p) => s.data.settings(p),
      updateSettings: (p, a) => s.data.updateSettings(p, a),
      exportData: (p, _a, _v, _req, reply) => {
        reply.header(
          "Content-Disposition",
          'attachment; filename="nbd-export.json"',
        );
        return s.data.export(p);
      },
      listAudit: (p, a) => s.data.audit(p, a),
    };
    const publicOperations = new Set(["getMeta", "getMe", "login", "logout"]);
    for (const [path, operations] of Object.entries(apiContract.paths) as [
      string,
      Row,
    ][]) {
      if (!path.startsWith("/api/v1")) continue;
      for (const [method, operation] of Object.entries(operations) as [
        string,
        Row,
      ][]) {
        if (!handlers[operation.operationId])
          throw Error(`Missing handler ${operation.operationId}`);
        const parameters = (operation.parameters ?? []).map(dereference),
          query: Row = {
            type: "object",
            additionalProperties: false,
            properties: {},
            required: [],
          },
          params: Row = {
            type: "object",
            additionalProperties: false,
            properties: {},
            required: [],
          };
        for (const param of parameters) {
          const target =
            param.in === "query" ? query : param.in === "path" ? params : null;
          if (target) {
            target.properties[param.name] = param.schema;
            if (param.required) target.required.push(param.name);
          }
        }
        const body =
            operation.requestBody?.content?.["application/json"]?.schema,
          response: Row = {};
        for (const [status, r] of Object.entries(operation.responses) as [
          string,
          Row,
        ][]) {
          const schema = dereference(r).content?.["application/json"]?.schema;
          response[status] = schema
            ? Type.Unsafe(dereference(schema))
            : { type: "null", description: "No content" };
        }
        const write = !["get", "head", "options"].includes(method),
          id = operation.operationId;
        const routeSchema: Row = {
          operationId: id,
          tags: operation.tags,
          summary: operation.summary,
          security: operation.security ?? [{ cookieAuth: [] }],
          querystring: Type.Unsafe(query),
          params: Type.Unsafe(params),
          response,
          "x-nbd-error-codes": operation["x-nbd-error-codes"],
        };
        if (body) routeSchema.body = Type.Unsafe(dereference(body));
        const headers = parameters.filter((p: Row) => p.in === "header");
        if (headers.length)
          routeSchema.headers = {
            type: "object",
            properties: Object.fromEntries(
              headers.map((p: Row) => [p.name, p.schema]),
            ),
          };
        api.route({
          method: method.toUpperCase() as any,
          url: path.replace(/\{([^}]+)\}/g, ":$1"),
          schema: routeSchema,
          bodyLimit: 128 * 1024,
          config: {
            rateLimit: {
              max:
                id === "login"
                  ? 10
                  : ["changePassword", "createAgentKey"].includes(id)
                    ? 5
                    : 300,
              timeWindow: "1 minute",
            },
          },
          handler: async (req, reply) => {
            const user = (req as any).owner as Row | undefined;
            if (!user && !publicOperations.has(id))
              fail(401, "UNAUTHENTICATED", "请先登录");
            const p = user
                ? ownerPrincipal(user as { id: string; display_name: string })
                : null,
              a = ((write ? req.body : req.query) as Row) ?? {},
              v = req.params as Row;
            const audit =
              p && write ? s.audit.start(p, id, "web", req.id, req.ip) : null;
            try {
              let result: unknown;
              // Async password operations own their transaction; synchronous domain writes share audit/idempotency commit.
              if (
                p &&
                write &&
                !["login", "changePassword", "createAgentKey"].includes(id)
              )
                result = s.db
                  .transaction(() => {
                    const output = s.idempotency.run(
                      p,
                      id,
                      req.headers["idempotency-key"] as string | undefined,
                      { body: a, params: v },
                      () => {
                        const data = handlers[id]!(p, a, v, req, reply);
                        return data === undefined
                          ? { noContent: true }
                          : (data as Row);
                      },
                    );
                    if (audit) s.audit.finish(audit, "success");
                    return output;
                  })
                  .immediate();
              else {
                result = await handlers[id]!(p!, a, v, req, reply);
                if (audit) s.audit.finish(audit, "success");
              }
              const success = Object.keys(operation.responses).find((x) =>
                /^2\d\d$/.test(x),
              )!;
              reply.code(Number(success));
              return Number(success) === 204
                ? reply.send()
                : project(response[success] ?? {}, result);
            } catch (e) {
              if (audit)
                s.audit.finish(
                  audit,
                  "error",
                  (e as { code?: string }).code ?? "INTERNAL_ERROR",
                );
              throw e;
            }
          },
        });
      }
    }
  });
}
