import test from "node:test";
import assert from "node:assert/strict";
import {
  applyConflictChoice,
  buildPatch,
  changedSnapshotFields,
  rebaseDraft,
  versionProvenance,
  type EditDraft,
  type MomentSnapshot,
} from "../frontend/src/editing.js";

function draft(changes: Partial<EditDraft> = {}): EditDraft {
  return {
    title: "原始标题",
    narrative: "原始原话",
    agentSummary: "",
    precision: "day",
    happenedOn: "2026-10-01",
    happenedLocal: "2026-10-01T12:00",
    scene: "work",
    emotions: [{ key: "embarrassed", intensity: "" }],
    intensity: "8",
    severity: "",
    fearedOutcome: "",
    outcomeKnownBy: "",
    thoughts: "",
    bodySignals: "",
    immediateResponse: "",
    people: [],
    reason: "",
    ...changes,
  };
}

test("未改变的日期、精确时间和空情绪强度不生成补丁", () => {
  const date = draft();
  assert.equal(
    buildPatch(date, { ...date }, 1, () => {
      throw new Error("unchanged date should not be serialized");
    }),
    null,
  );

  const exact = draft({
    precision: "exact",
    happenedLocal: "2026-10-01T10:00",
    emotions: [{ key: "embarrassed", intensity: "" }],
  });
  assert.equal(
    buildPatch(exact, { ...exact }, 1, () => {
      throw new Error("unchanged exact time should not be serialized");
    }),
    null,
  );
});

test("只改标题时补丁只含标题和 revision", () => {
  const base = draft();
  assert.deepEqual(
    buildPatch(base, { ...base, title: "更正标题" }, 3, () => "unused"),
    { expectedRevision: 3, title: "更正标题" },
  );
});

test("冲突重载保留非重叠输入，重叠项默认采用当前版本并要求明确选择", () => {
  const base = draft();
  const mine = { ...base, title: "我的标题", narrative: "我的原话" };
  const latest = { ...base, title: "对方标题", scene: "social" };
  const result = rebaseDraft(base, mine, latest, ["title", "scene"]);
  assert.equal(result.draft.title, "对方标题");
  assert.equal(result.draft.narrative, "我的原话");
  assert.deepEqual(result.overlaps, ["title"]);
  assert.equal(
    applyConflictChoice(result.draft, latest, mine, "title", "mine").title,
    "我的标题",
  );
  assert.equal(
    applyConflictChoice(result.draft, latest, mine, "title", "current").title,
    "对方标题",
  );
});

test("版本来源、改动字段和原因来自捕获记录或前一版修订", () => {
  const capturedAt = "2026-10-01T04:00:00.000Z";
  const revisions = [
    {
      revision: 1,
      editedAt: "2026-10-02T04:00:00.000Z",
      editedBy: { label: "所有者" },
      changedFields: ["title"],
      reason: "纠正标题",
    },
    {
      revision: 2,
      editedAt: "2026-10-03T04:00:00.000Z",
      editedBy: { label: "管理员" },
      changedFields: ["narrative", "scene"],
      reason: "补全原话和场景",
    },
  ];
  assert.deepEqual(versionProvenance(1, capturedAt, "记录 Agent", revisions), {
    source: "记下",
    at: capturedAt,
    author: "记录 Agent",
    changedFields: [],
    reason: null,
  });
  assert.deepEqual(versionProvenance(2, capturedAt, "记录 Agent", revisions), {
    source: "第 1 次修订",
    at: revisions[0].editedAt,
    author: "所有者",
    changedFields: ["title"],
    reason: "纠正标题",
  });
  assert.deepEqual(versionProvenance(3, capturedAt, "记录 Agent", revisions), {
    source: "第 2 次修订",
    at: revisions[1].editedAt,
    author: "管理员",
    changedFields: ["narrative", "scene"],
    reason: "补全原话和场景",
  });
});

test("冲突字段差异比较基线和最新 snapshot 的每个字段", () => {
  const before: MomentSnapshot = {
    title: "旧标题",
    narrative: "原话",
    agentSummary: null,
    happenedAt: "2026-10-01T02:00:00.000Z",
    happenedOn: "2026-10-01",
    happenedAtPrecision: "exact",
    scene: "work",
    emotions: [{ key: "embarrassed", intensity: null }],
    intensity: 8,
    severity: null,
    fearedOutcome: null,
    outcomeKnownBy: null,
    thoughts: null,
    bodySignals: null,
    immediateResponse: null,
    people: [],
  };
  const after: MomentSnapshot = {
    ...before,
    title: "新标题",
    happenedAt: "2026-10-01T03:00:00.000Z",
    emotions: [{ key: "embarrassed", intensity: 4 }],
  };
  assert.deepEqual(changedSnapshotFields(before, after), [
    "title",
    "happenedAt",
    "emotions",
  ]);
});
