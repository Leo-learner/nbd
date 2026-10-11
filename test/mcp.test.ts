import test from "node:test";
import assert from "node:assert/strict";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { fixture, momentInput } from "./fixture.js";
import { mcpContract } from "../src/contract.js";
import { DAY } from "../src/time.js";
async function client(origin: string, token: string, version?: string) {
  const c = new Client(
    { name: "nbd-test", version: "1.0.0" },
    {
      supportedProtocolVersions: version ? [version] : undefined,
      versionNegotiation:
        version === "2026-07-28" ? { mode: { pin: version } } : undefined,
    },
  );
  await c.connect(
    new StreamableHTTPClientTransport(new URL(origin + "/mcp"), {
      requestInit: { headers: { authorization: "Bearer " + token } },
    }),
  );
  return c;
}
for (const version of ["2026-07-28", "2025-11-25"])
  test(`官方 MCP client 真实 HTTP ${version}：契约、记录、读取、复盘和审计`, async () => {
    const f = await fixture({ listen: true });
    let c: Client | undefined;
    try {
      c = await client(f.config.publicOrigin, f.token, version);
      const tools = await c.listTools();
      assert.deepEqual(
        tools.tools.map((t) => t.name).sort(),
        mcpContract.tools.map((t: any) => t.name).sort(),
      );
      for (const t of tools.tools) {
        const contract = mcpContract.tools.find((x: any) => x.name === t.name);
        assert.deepEqual(t.annotations, contract.annotations);
        assert.deepEqual(t.inputSchema, contract.inputSchema);
        assert.deepEqual(t.outputSchema, contract.outputSchema);
      }
      assert.equal((await c.listPrompts()).prompts.length, 2);
      const context = await c.callTool({ name: "get_context", arguments: {} });
      assert.ok(!context.isError, JSON.stringify(context));
      const input = momentInput();
      const recorded = await c.callTool({
        name: "record_moment",
        arguments: input,
      });
      assert.ok(!recorded.isError, JSON.stringify(recorded));
      const id = (recorded.structuredContent as any).data.moment.id;
      const replay = await c.callTool({
        name: "record_moment",
        arguments: input,
      });
      assert.equal((replay.structuredContent as any).data.replayed, true);
      const conflict = await c.callTool({
        name: "record_moment",
        arguments: { ...input, title: "别的标题" },
      });
      assert.equal(
        JSON.parse((conflict.content[0] as any).text).error.code,
        "IDEMPOTENCY_CONFLICT",
      );
      assert.ok(
        !(await c.callTool({ name: "get_moment", arguments: { momentId: id } }))
          .isError,
      );
      assert.ok(
        !(
          await c.callTool({
            name: "search_moments",
            arguments: { q: "叫错名字" },
          })
        ).isError,
      );
      assert.ok(
        !(await c.callTool({ name: "list_due_reviews", arguments: {} }))
          .isError,
      );
      const lesson = await c.callTool({
        name: "create_lesson",
        arguments: {
          clientRequestId: "lesson-test-01",
          title: "测试经验",
          momentIds: [id],
        },
      });
      assert.ok(!lesson.isError, JSON.stringify(lesson));
      const lid = (lesson.structuredContent as any).data.lesson.id;
      const r = await c.callTool({
        name: "add_reflection",
        arguments: {
          clientRequestId: "reflect-test-01",
          momentId: id,
          intensityNow: 2,
          resolution: "easing",
          lessonIds: [lid],
        },
      });
      assert.ok(!r.isError, JSON.stringify(r));
      const note = await c.callTool({
        name: "add_note",
        arguments: {
          clientRequestId: "read-after-note-01",
          momentId: id,
          body: "详情读取用的虚构补记",
        },
      });
      assert.ok(!note.isError, JSON.stringify(note));
      const afterReflection = await c.callTool({
        name: "get_moment",
        arguments: { momentId: id },
      });
      assert.ok(!afterReflection.isError, JSON.stringify(afterReflection));
      assert.equal(
        (afterReflection.structuredContent as any).data.moment.notes[0]
          .authorLabel,
        "测试 Agent",
      );
      assert.equal(
        (afterReflection.structuredContent as any).data.moment.reflections
          .length,
        1,
      );
      assert.ok(
        !(await c.callTool({ name: "list_lessons", arguments: {} })).isError,
      );
      assert.ok(
        !(await c.callTool({ name: "get_insights", arguments: {} })).isError,
      );
      const audit = f.db
        .prepare("SELECT * FROM audit_events WHERE channel='mcp'")
        .all();
      assert.ok(audit.length >= 10);
      assert.ok(!JSON.stringify(audit).includes(input.narrative));
      assert.ok(!JSON.stringify(audit).includes(f.token));
    } finally {
      await c?.close();
      await f.close();
    }
  });
test("MCP correct_moment uses normalized snapshots and reports title-only changes", async () => {
  const f = await fixture({ listen: true });
  let c: Client | undefined;
  try {
    c = await client(f.config.publicOrigin, f.token);
    const recorded = await c.callTool({
      name: "record_moment",
      arguments: momentInput({
        happenedAt: "2026-10-01T10:00:45+08:00",
        emotions: [{ key: "embarrassed" }],
      }),
    });
    assert.ok(!recorded.isError, JSON.stringify(recorded));
    const id = (recorded.structuredContent as any).data.moment.id;
    const unchanged = await c.callTool({
      name: "correct_moment",
      arguments: {
        clientRequestId: "correct-noop-01",
        momentId: id,
        expectedRevision: 1,
        changes: {
          happenedAt: "2026-10-01T02:00:45.000Z",
          happenedAtPrecision: "exact",
          emotions: [{ key: "embarrassed" }],
        },
      },
    });
    assert.ok(!unchanged.isError, JSON.stringify(unchanged));
    assert.equal((unchanged.structuredContent as any).data.revision, 1);
    assert.deepEqual(
      (unchanged.structuredContent as any).data.changedFields,
      [],
    );
    const title = await c.callTool({
      name: "correct_moment",
      arguments: {
        clientRequestId: "correct-title-01",
        momentId: id,
        expectedRevision: 1,
        changes: { title: "更正标题" },
      },
    });
    assert.ok(!title.isError, JSON.stringify(title));
    assert.equal((title.structuredContent as any).data.revision, 2);
    assert.deepEqual((title.structuredContent as any).data.changedFields, ["title"]);
    const dateRecorded = await c.callTool({
      name: "record_moment",
      arguments: momentInput({
        narrative: "日期精度测试原话",
        happenedAt: "2026-10-01",
        emotions: [{ key: "embarrassed" }],
      }),
    });
    assert.ok(!dateRecorded.isError, JSON.stringify(dateRecorded));
    const dateId = (dateRecorded.structuredContent as any).data.moment.id;
    const sameDate = await c.callTool({
      name: "correct_moment",
      arguments: {
        clientRequestId: "correct-date-noop-01",
        momentId: dateId,
        expectedRevision: 1,
        changes: {
          happenedAt: "2026-10-01",
          happenedAtPrecision: "day",
          emotions: [{ key: "embarrassed" }],
        },
      },
    });
    assert.ok(!sameDate.isError, JSON.stringify(sameDate));
    assert.equal((sameDate.structuredContent as any).data.revision, 1);
    assert.deepEqual((sameDate.structuredContent as any).data.changedFields, []);
  } finally {
    await c?.close();
    await f.close();
  }
});
test("作用域工具可见性、只写归属隔离和正文裁剪", async () => {
  const f = await fixture({ listen: true });
  const clients: Client[] = [];
  try {
    const id = f.s.moments.record(f.agent, momentInput()).moment.id;
    for (const scopes of [["write"], ["read"]]) {
      const issued = f.s.access.create(f.owner, { label: scopes[0], scopes }),
        c = await client(f.config.publicOrigin, issued.secret);
      clients.push(c);
      const names = (await c.listTools()).tools.map((t) => t.name);
      assert.deepEqual(
        names.sort(),
        mcpContract.tools
          .filter((t: any) =>
            t._meta["nbd/scopes"].every((x: string) => scopes.includes(x)),
          )
          .map((t: any) => t.name)
          .sort(),
      );
      if (scopes[0] === "write") {
        const ctx = await c.callTool({ name: "get_context", arguments: {} });
        assert.ok(!("topTags" in (ctx.structuredContent as any).data));
        const denied = await c.callTool({
          name: "add_note",
          arguments: {
            clientRequestId: "denied-0001",
            momentId: id,
            body: "试图补记",
          },
        });
        assert.equal(
          JSON.parse((denied.content[0] as any).text).error.code,
          "MOMENT_NOT_FOUND",
        );
        const own = await c.callTool({
          name: "record_moment",
          arguments: momentInput({
            clientRequestId: "write-record-01",
            narrative: "只写用户自己的私密正文",
          }),
        });
        assert.ok(!own.isError, JSON.stringify(own));
        assert.ok(!JSON.stringify(own).includes("只写用户自己的私密正文"));
        const ownId = (own.structuredContent as any).data.moment.id;
        const note = await c.callTool({
          name: "add_note",
          arguments: {
            clientRequestId: "write-note-01",
            momentId: ownId,
            body: "不应回显的补记",
          },
        });
        assert.ok(!note.isError);
        assert.ok(!JSON.stringify(note).includes("不应回显的补记"));
      }
    }
  } finally {
    for (const c of clients) await c.close();
    await f.close();
  }
});
test("MCP 401/405/Host/Origin、撤销和冻结", async () => {
  const f = await fixture({ listen: true });
  let c: Client | undefined;
  try {
    const url = f.config.publicOrigin + "/mcp";
    assert.equal((await fetch(url, { method: "POST" })).status, 401);
    const headers = { authorization: "Bearer " + f.token };
    assert.equal((await fetch(url, { headers })).status, 405);
    assert.equal(
      (
        await f.app.inject({
          url: "/mcp",
          headers: { ...headers, host: "evil.example" },
        })
      ).statusCode,
      403,
    );
    assert.equal(
      (await fetch(url, { headers: { ...headers, origin: "null" } })).status,
      403,
    );
    c = await client(f.config.publicOrigin, f.token);
    const input = momentInput(),
      r = await c.callTool({ name: "record_moment", arguments: input }),
      id = (r.structuredContent as any).data.moment.id;
    f.setNow(f.getNow() + DAY);
    const frozen = await c.callTool({
      name: "correct_moment",
      arguments: {
        clientRequestId: "frozen-correct-01",
        momentId: id,
        expectedRevision: 1,
        changes: { title: "改写" },
      },
    });
    assert.equal(
      JSON.parse((frozen.content[0] as any).text).error.code,
      "MOMENT_FROZEN",
    );
    f.s.access.revoke(f.owner, f.agent.id!);
    assert.equal((await fetch(url, { method: "POST", headers })).status, 401);
  } finally {
    await c?.close();
    await f.close();
  }
});
