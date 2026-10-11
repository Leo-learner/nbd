import test from "node:test";
import assert from "node:assert/strict";
import { fixture, momentInput, password } from "./fixture.js";
import { DAY } from "../src/time.js";
import { apiContract } from "../src/contract.js";
test("48 个 REST 路由均注册；未登录时机密端点拒绝访问", async () => {
  const f = await fixture();
  try {
    let count = 0;
    for (const [path, methods] of Object.entries(apiContract.paths) as [
      string,
      any,
    ][]) {
      for (const [method, op] of Object.entries(methods) as [string, any][]) {
        count++;
        if (
          [
            "getHealth",
            "getReady",
            "getMeta",
            "getMe",
            "login",
            "logout",
          ].includes(op.operationId)
        )
          continue;
        const url = path.replace(/\{([^}]+)\}/g, ":$1");
        assert.equal(
          f.app.hasRoute({ method: method.toUpperCase() as any, url: url }),
          true,
          op.operationId,
        );
      }
    }
    assert.equal(count, 48);
    const r = await f.app.inject("/api/v1/moments");
    assert.equal(r.statusCode, 401);
    assert.equal((await f.app.inject("/api/v1/auth/me")).json().user, null);
  } finally {
    await f.close();
  }
});
test("请求头、恶意 Origin、未知字段、注册入口和 API 404", async () => {
  const f = await fixture();
  try {
    assert.equal(
      (
        await f.app.inject({
          method: "POST",
          url: "/api/v1/auth/login",
          payload: { username: "leo", password },
        })
      ).json().error.code,
      "REQUEST_HEADER_REQUIRED",
    );
    for (const origin of ["null", "https://evil.example"])
      assert.equal(
        (await f.api("GET", "/settings", undefined, { origin })).json().error
          .code,
        "ORIGIN_REJECTED",
      );
    assert.equal(
      (
        await f.api("PATCH", "/settings", {
          timezone: "Asia/Shanghai",
          status: "bad",
        })
      ).json().error.code,
      "VALIDATION_ERROR",
    );
    assert.equal((await f.api("POST", "/auth/register", {})).statusCode, 404);
    assert.equal(
      (
        await f.app.inject({
          url: "/api/v1/absent",
          headers: { accept: "text/html" },
        })
      ).statusCode,
      404,
    );
    const meta = (await f.api("GET", "/meta")).json();
    assert.equal(meta.features.reviewScheduling, false);
    assert.deepEqual(meta.review.scheduleDays, []);
  } finally {
    await f.close();
  }
});
test("大小写登录、会话续期、密码轮换、退出全部和错误密码", async () => {
  const f = await fixture();
  try {
    assert.equal(
      (
        await f.api("POST", "/auth/login", {
          username: "LEO",
          password: "wrong",
        })
      ).statusCode,
      401,
    );
    const login = await f.api("POST", "/auth/login", {
      username: "LEO",
      password,
    });
    assert.equal(login.statusCode, 200);
    const cookie = String(login.headers["set-cookie"]).split(";")[0]!;
    f.setNow(f.getNow() + DAY + 1);
    const me = await f.api("GET", "/auth/me", undefined, { cookie });
    assert.equal(me.json().user.username, "leo");
    assert.ok(me.headers["set-cookie"]);
    const changed = await f.api(
      "PUT",
      "/auth/password",
      { currentPassword: password, newPassword: password + "-new" },
      { cookie },
    );
    assert.equal(changed.statusCode, 200);
    assert.equal((await f.api("GET", "/auth/me")).json().user, null);
    const next = String(changed.headers["set-cookie"]).split(";")[0]!;
    assert.equal(
      (await f.api("GET", "/auth/me", undefined, { cookie: next })).json().user
        .username,
      "leo",
    );
    assert.equal(
      (await f.api("POST", "/auth/logout-all", undefined, { cookie: next }))
        .statusCode,
      200,
    );
    assert.equal(
      (await f.api("GET", "/auth/me", undefined, { cookie: next })).json().user,
      null,
    );
  } finally {
    await f.close();
  }
});
test("事件完整 REST 流程：修订、补记、标签、归档、回收站和恢复", async () => {
  const f = await fixture();
  try {
    const id = f.s.moments.record(f.agent, momentInput()).moment.id;
    const detail = await f.api("GET", `/moments/${id}`);
    assert.equal(detail.statusCode, 200, detail.body);
    assert.equal(detail.json().reviewStep.total, 0);
    assert.equal(
      (
        await f.api("PATCH", `/moments/${id}`, {
          expectedRevision: 1,
          title: "所有者更正",
        })
      ).json().revision,
      2,
    );
    assert.equal(
      (await f.api("GET", `/moments/${id}/revisions`)).json().items[0].snapshot
        .title,
      "周会叫错了名字",
    );
    const note = await f.api("POST", `/moments/${id}/notes`, {
      body: "补记原话",
    });
    assert.equal(note.statusCode, 201, note.body);
    assert.equal(
      (
        await f.api("PUT", `/moments/${id}/tags`, {
          names: [" #工作 ", "ｗｏｒｋ", "Work"],
        })
      ).json().tags.length,
      2,
    );
    assert.equal(
      (await f.api("POST", `/moments/${id}/archive`)).json().status,
      "archived",
    );
    assert.equal(
      (await f.api("POST", `/moments/${id}/unarchive`)).json().status,
      "fresh",
    );
    assert.equal(
      (await f.api("POST", `/moments/${id}/snooze`, { days: 3 })).json().error
        .code,
      "NOT_SCHEDULED",
    );
    assert.equal(
      (await f.api("DELETE", `/notes/${note.json().id}`)).statusCode,
      204,
    );
    assert.equal((await f.api("DELETE", `/moments/${id}`)).statusCode, 200);
    assert.equal((await f.api("GET", "/moments")).json().total, 0);
    assert.equal((await f.api("GET", "/trash")).json().items.length, 1);
    assert.equal(
      (await f.api("POST", `/moments/${id}/notes`, { body: "不可写" })).json()
        .error.code,
      "MOMENT_IN_TRASH",
    );
    assert.equal(
      (await f.api("POST", `/moments/${id}/restore`)).statusCode,
      200,
    );
    assert.equal(
      (await f.api("DELETE", `/trash/${id}`)).json().error.code,
      "MOMENT_NOT_IN_TRASH",
    );
    await f.api("DELETE", `/moments/${id}`);
    assert.equal((await f.api("DELETE", `/trash/${id}`)).statusCode, 204);
    assert.equal(
      (f.db.prepare("SELECT count(*) n FROM moment_search").get() as any).n,
      0,
    );
  } finally {
    await f.close();
  }
});
test("复盘和经验新建、修改、关联、删除都会更新派生数据", async () => {
  const f = await fixture();
  try {
    const id = f.s.moments.record(
      f.agent,
      momentInput({ fearedOutcome: "担心被误会" }),
    ).moment.id;
    const lesson = await f.api("POST", "/lessons", {
      title: "虚构的测试经验",
      momentIds: [id],
    });
    assert.equal(lesson.statusCode, 201, lesson.body);
    const lid = lesson.json().id;
    let r = await f.api("POST", `/moments/${id}/reflections`, {
      intensityNow: 2,
      resolution: "let_go",
      lessonIds: [lid],
    });
    assert.equal(r.statusCode, 201, r.body);
    assert.equal(r.json().reflection.fearCameTrue, "unknown");
    assert.equal(r.json().moment.status, "settled");
    const rid = r.json().reflection.id;
    r = await f.api("PATCH", `/reflections/${rid}`, {
      resolution: "easing",
      intensityNow: 4,
      fearCameTrue: "no",
    });
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(r.json().comparison.change, -4);
    assert.equal((await f.api("GET", `/lessons/${lid}`)).json().momentCount, 1);
    assert.equal(
      (await f.api("PATCH", `/lessons/${lid}`, { body: "展开" })).json().body,
      "展开",
    );
    assert.equal(
      (await f.api("PUT", `/lessons/${lid}/moments`, { momentIds: [] })).json()
        .moments.length,
      0,
    );
    assert.equal(
      (await f.api("DELETE", `/reflections/${rid}`)).statusCode,
      200,
    );
    assert.equal(
      (await f.api("GET", `/moments/${id}`)).json().reflectionCount,
      0,
    );
    assert.equal((await f.api("DELETE", `/lessons/${lid}`)).statusCode, 204);
  } finally {
    await f.close();
  }
});
test("中文长词 FTS、短词 LIKE、特殊字符、补记和复盘检索", async () => {
  const f = await fixture();
  try {
    const id = f.s.moments.record(
      f.agent,
      momentInput({ narrative: '开会以后很尴尬，原话含 100%_ 和 "引号"。' }),
    ).moment.id;
    f.s.moments.addNote(f.agent, id, "另外补充陌生城市");
    f.s.moments.addReflection(f.owner, id, {
      intensityNow: 2,
      resolution: "easing",
      perspective: "回看时想到紫色天空",
    });
    for (const q of [
      "很尴尬",
      "尴尬",
      "100%_",
      "陌生城市",
      "紫色天空",
      '"引号"',
    ]) {
      const r = await f.api("GET", "/moments?q=" + encodeURIComponent(q));
      assert.equal(r.statusCode, 200, r.body);
      assert.equal(r.json().total, 1, q);
    }
    assert.equal(
      (
        await f.api("GET", "/moments?q=" + encodeURIComponent("很尴尬 不存在"))
      ).json().total,
      0,
    );
  } finally {
    await f.close();
  }
});
test("所有排序游标分页无重复，过滤与无效游标返回明确错误", async () => {
  const f = await fixture();
  try {
    for (let i = 0; i < 5; i++) {
      f.setNow(f.getNow() + 1);
      f.s.moments.record(
        f.agent,
        momentInput({
          narrative: "独立记录 " + i,
          intensity: i,
          happenedAt: `2026-10-0${i + 1}`,
        }),
      );
    }
    for (const sort of [
      "happened_desc",
      "happened_asc",
      "captured_desc",
      "intensity_desc",
    ]) {
      const ids: string[] = [];
      let cursor: string | null = null;
      do {
        const r = await f.api(
          "GET",
          `/moments?sort=${sort}&limit=2${cursor ? "&cursor=" + cursor : ""}`,
        );
        assert.equal(r.statusCode, 200, r.body);
        ids.push(...r.json().items.map((x: any) => x.id));
        cursor = r.json().nextCursor;
      } while (cursor);
      assert.equal(new Set(ids).size, 5);
    }
    assert.equal((await f.api("GET", "/moments?cursor=bad")).statusCode, 400);
    assert.equal((await f.api("GET", "/moments?scene=study")).json().total, 0);
  } finally {
    await f.close();
  }
});
test("标签改名、重名、合并和删除", async () => {
  const f = await fixture();
  try {
    f.s.moments.record(f.agent, momentInput({ tags: ["工作", "学习"] }));
    let tags = (await f.api("GET", "/tags")).json().items;
    const [a, b] = tags;
    assert.equal(
      (await f.api("PATCH", `/tags/${a.id}`, { name: "新名字" })).statusCode,
      200,
    );
    assert.equal(
      (await f.api("PATCH", `/tags/${a.id}`, { name: b.name })).json().error
        .code,
      "TAG_EXISTS",
    );
    assert.equal(
      (await f.api("POST", `/tags/${a.id}/merge`, { intoId: b.id })).json()
        .movedMoments,
      1,
    );
    assert.equal((await f.api("GET", "/tags")).json().items.length, 1);
    assert.equal((await f.api("DELETE", `/tags/${b.id}`)).statusCode, 204);
  } finally {
    await f.close();
  }
});
test("密钥密码确认、签发、撤销，以及 settings/export/audit", async () => {
  const f = await fixture();
  try {
    assert.equal(
      (
        await f.api("POST", "/agent-keys", {
          label: "测试",
          scopes: ["write"],
          currentPassword: "incorrect",
        })
      ).json().error.code,
      "PASSWORD_INCORRECT",
    );
    const issued = await f.api("POST", "/agent-keys", {
      label: "只写测试",
      scopes: ["write"],
      currentPassword: password,
    });
    assert.equal(issued.statusCode, 201, issued.body);
    assert.equal((await f.api("GET", "/agent-keys")).json().items.length, 2);
    assert.equal(
      (await f.api("DELETE", `/agent-keys/${issued.json().agentKey.id}`))
        .statusCode,
      200,
    );
    assert.throws(() => f.s.access.authenticate(issued.json().secret));
    assert.deepEqual((await f.api("GET", "/connected-apps")).json().items, []);
    assert.equal(
      (await f.api("PATCH", "/settings", { timezone: "invalid" })).json().error
        .code,
      "INVALID_TIMEZONE",
    );
    assert.equal(
      (
        await f.api("PATCH", "/settings", {
          displayName: "我",
          timezone: "Asia/Tokyo",
          weekStartsOn: 0,
        })
      ).json().timezone,
      "Asia/Tokyo",
    );
    const exported = await f.api("GET", "/export");
    assert.equal(exported.statusCode, 200, exported.body);
    assert.equal(exported.json().format, "nbd-export");
    const audit = await f.api("GET", "/audit");
    assert.equal(audit.statusCode, 200);
    assert.ok(audit.json().total > 0);
    assert.ok(!JSON.stringify(audit.json()).includes(password));
  } finally {
    await f.close();
  }
});
test("完整导出不被经验库的 500 条列表上限截断", async () => {
  const f = await fixture();
  try {
    for (let i = 0; i < 501; i++)
      f.s.library.create(f.owner, { title: "导出测试 " + i });
    assert.equal(f.s.library.list(f.owner).items.length, 500);
    const exported = await f.api("GET", "/export");
    assert.equal(exported.statusCode, 200, exported.body);
    assert.equal(exported.json().lessons.length, 501);
  } finally {
    await f.close();
  }
});
test("REST 幂等创建复盘只写一次，参数变化产生冲突", async () => {
  const f = await fixture();
  try {
    const id = f.s.moments.record(f.agent, momentInput()).moment.id,
      body = { intensityNow: 3, resolution: "easing" },
      headers = { "idempotency-key": "rest-key-0001" };
    const a = await f.api("POST", `/moments/${id}/reflections`, body, headers),
      b = await f.api("POST", `/moments/${id}/reflections`, body, headers);
    assert.equal(a.statusCode, 201, a.body);
    assert.equal(b.json().reflection.id, a.json().reflection.id);
    assert.equal(f.s.moments.detail(f.owner, id).reflectionCount, 1);
    assert.equal(
      (
        await f.api(
          "POST",
          `/moments/${id}/reflections`,
          { ...body, intensityNow: 4 },
          headers,
        )
      ).json().error.code,
      "IDEMPOTENCY_CONFLICT",
    );
  } finally {
    await f.close();
  }
});
test("洞察口径：最近明确恐惧答案、首次释怀、衰减和日历；排除回收站", async () => {
  const f = await fixture();
  try {
    const id = f.s.moments.record(
      f.agent,
      momentInput({ fearedOutcome: "被误会" }),
    ).moment.id;
    f.s.moments.addReflection(f.owner, id, {
      intensityNow: 3,
      resolution: "let_go",
      fearCameTrue: "no",
      thinkingTraps: ["spotlight"],
    });
    f.setNow(f.getNow() + DAY);
    f.s.moments.addReflection(f.owner, id, {
      intensityNow: 4,
      resolution: "easing",
      fearCameTrue: "unknown",
      thinkingTraps: ["spotlight"],
    });
    const r = await f.api("GET", "/insights/overview");
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(r.json().fear.no, 1);
    assert.equal(r.json().fear.neverHappenedRate, 1);
    assert.equal(r.json().intensity.meanDrop, 4);
    assert.equal(r.json().letGo.count, 1);
    assert.equal(r.json().distributions.thinkingTraps[0].count, 1);
    const decay = await f.api("GET", "/insights/decay");
    assert.equal(decay.statusCode, 200, decay.body);
    assert.equal(decay.json().points.length, 3);
    assert.equal(
      (
        await f.api("GET", "/insights/calendar?from=2026-10-01&to=2026-10-31")
      ).json().days[0].count,
      1,
    );
    assert.equal(
      (await f.api("GET", "/insights/calendar?from=2020-01-01&to=2026-10-31"))
        .statusCode,
      400,
    );
    f.s.moments.trash(f.owner, id);
    assert.equal(
      (await f.api("GET", "/insights/overview")).json().totals.moments,
      0,
    );
    assert.equal((await f.api("GET", "/reviews/due")).json().dueCount, 0);
  } finally {
    await f.close();
  }
});
