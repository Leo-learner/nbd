import { McpServer, fromJsonSchema } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { Services } from "../services.js";
import type { Principal } from "../modules/principal.js";
import type { Row } from "../db/index.js";
import { mcpContract, project } from "../contract.js";
import { AppError } from "../errors.js";
import { iso } from "../time.js";
import { instructions } from "./instructions.js";
export function createMcpServer(
  s: Services,
  p: Principal,
  token: string,
  recordLimit: (p: Principal) => void,
) {
  const server = new McpServer(
    { name: "nbd", version: "1.0.0" },
    { instructions },
  );
  const handlers: Record<string, (input: Row) => Row> = {
    get_context: () => {
      const u = s.moments.user(p),
        now = s.config.now(),
        result: Row = {
          now: iso(now),
          timezone: u.timezone,
          today: s.moments.today(p),
          localTime: new Intl.DateTimeFormat("en-GB", {
            timeZone: u.timezone,
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          }).format(now),
          weekday: new Date(s.moments.today(p) + "T12:00:00Z").getUTCDay() || 7,
          scopes: p.scopes,
          enums: s.data.meta().enums,
          limits: s.data.meta().limits,
          review: { freezeHours: s.config.freezeHours, scheduleDays: [] },
          webUrl: s.config.publicOrigin,
        };
      if (p.scopes.includes("read")) {
        result.topTags = s.library
          .tags(p)
          .items.sort((a: Row, b: Row) => b.momentCount - a.momentCount)
          .filter((t: Row) => t.momentCount > 0)
          .slice(0, 10)
          .map((t: Row) => ({ name: t.name, count: t.momentCount }));
        result.dueCount = 0;
      }
      return result;
    },
    record_moment: (a) => {
      recordLimit(p);
      return s.moments.record(p, a);
    },
    add_note: (a) => {
      const n = s.moments.addNote(p, a.momentId, a.body);
      return {
        note: { id: n.id, momentId: n.momentId, createdAt: n.createdAt },
        replayed: false,
      };
    },
    correct_moment: (a) =>
      s.moments.patch(p, a.momentId, {
        ...a.changes,
        expectedRevision: a.expectedRevision,
        reason: a.reason,
      }),
    list_due_reviews: (a) => s.moments.due(p, a),
    search_moments: (a) => s.moments.list(p, { ...a, limit: a.limit ?? 20 }),
    get_moment: (a) => {
      const moment = s.moments.detail(p, a.momentId);
      return {
        moment: {
          ...moment,
          notes: moment.notes.map((note: Row) => ({
            ...note,
            authorLabel: note.author.label,
          })),
        },
      };
    },
    list_lessons: (a) => s.library.list(p, a),
    get_insights: (a) => ({
      overview: s.insights.overview(p, a),
      decay: { buckets: s.insights.decay(p, a).buckets },
    }),
    add_reflection: (a) => {
      const r = s.moments.addReflection(p, a.momentId, a);
      return {
        reflection: { id: r.reflection.id, createdAt: r.reflection.createdAt },
        comparison: r.comparison,
        status: r.moment.status,
        nextReviewOn: r.moment.nextReviewOn,
        replayed: false,
      };
    },
    snooze_review: (a) => ({
      ...s.moments.snooze(p, a.momentId, a),
      replayed: false,
    }),
    create_lesson: (a) => {
      const l = s.library.create(p, a);
      return {
        lesson: { id: l.id, title: l.title, momentIds: a.momentIds ?? [] },
        replayed: false,
      };
    },
  };
  for (const tool of mcpContract.tools as Row[]) {
    const scopes = tool._meta["nbd/scopes"] as string[];
    if (!scopes.every((scope) => p.scopes.includes(scope))) continue;
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: fromJsonSchema(tool.inputSchema),
        outputSchema: fromJsonSchema(tool.outputSchema),
        annotations: tool.annotations,
        _meta: tool._meta,
      },
      async (input: unknown) => {
        s.access.authenticate(token);
        const audit = s.audit.start(p, tool.name, "mcp");
        try {
          const args = input as Row,
            raw = s.db
              .transaction(() => {
                const data = tool.annotations.readOnlyHint
                  ? handlers[tool.name]!(args)
                  : s.idempotency.run(
                      p,
                      tool.name,
                      args.clientRequestId,
                      args,
                      () => handlers[tool.name]!(args),
                    );
                s.audit.finish(audit, "success");
                return { data };
              })
              .immediate(),
            output = project(tool.outputSchema, raw);
          return {
            content: [{ type: "text" as const, text: JSON.stringify(output) }],
            structuredContent: output,
          };
        } catch (e) {
          const error =
            e instanceof AppError
              ? {
                  code: e.code,
                  message: e.message,
                  ...(e.details ? { details: e.details } : {}),
                }
              : { code: "INTERNAL_ERROR", message: "服务暂时不可用" };
          s.audit.finish(audit, "error", error.code);
          const output = { error, auditId: audit };
          return {
            isError: true,
            content: [{ type: "text" as const, text: JSON.stringify(output) }],
          };
        }
      },
    );
  }
  for (const prompt of mcpContract.prompts as Row[]) {
    if (
      !(prompt._meta["nbd/scopes"] as string[]).every((scope) =>
        p.scopes.includes(scope),
      )
    )
      continue;
    const shape: Record<string, z.ZodType> = {};
    for (const arg of prompt.arguments ?? [])
      shape[arg.name] = arg.required
        ? z.string().max(2000)
        : z.string().max(2000).optional();
    server.registerPrompt(
      prompt.name,
      {
        title: prompt.title,
        description: prompt.description,
        argsSchema: z.strictObject(shape),
        _meta: prompt._meta,
      },
      (args: Row) => ({
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text:
                prompt.name === "record"
                  ? `${instructions}\n先读取 get_context，然后温和地问清事情、情绪和强度，复述并征得确认后记下。以下是用户提供的数据：${JSON.stringify(args.brief ?? "")}`
                  : `${instructions}\n请手动选择一件事回看，用 get_moment 展示当时的原话，用户确认现在的强度和结论后调用 add_reflection。指定事件数据：${JSON.stringify(args.momentId ?? "未指定")}`,
            },
          },
        ],
      }),
    );
  }
  return server;
}
