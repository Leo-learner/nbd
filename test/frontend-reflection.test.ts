import test from "node:test";
import assert from "node:assert/strict";
import {
  deleteStagedLessonIfPresent,
  reflectionStatusCopyKind,
} from "../frontend/src/reflection.js";
import { ApiError } from "../frontend/src/errors.js";

const base = {
  originalStatus: "cooling",
  resolution: "easing",
  latestResolution: null,
  changesLatestResolution: true,
  editableUntil: 100,
  now: 50,
};

test("归档状态优先保留，放下结论显示释怀", () => {
  assert.equal(
    reflectionStatusCopyKind({ ...base, originalStatus: "archived" }),
    "archived",
  );
  assert.equal(
    reflectionStatusCopyKind({ ...base, resolution: "let_go" }),
    "settled",
  );
});

test("未到可编辑截止时间仍显示刚记下，到期后显示已回看", () => {
  assert.equal(reflectionStatusCopyKind(base), "fresh");
  assert.equal(
    reflectionStatusCopyKind({ ...base, now: base.editableUntil }),
    "reflected",
  );
});

test("经验已删除但响应丢失时，重复清理可以完成，其他错误仍保留", async () => {
  const remaining = new Set(["staged-lesson"]);
  const remove = async (id: string) => {
    if (!remaining.delete(id))
      throw new ApiError(404, "LESSON_NOT_FOUND", "经验已不存在");
    throw new ApiError(0, "NETWORK_ERROR", "删除响应丢失");
  };
  await assert.rejects(deleteStagedLessonIfPresent("staged-lesson", remove));
  assert.equal(remaining.size, 0);
  await deleteStagedLessonIfPresent("staged-lesson", remove);
  await assert.rejects(
    deleteStagedLessonIfPresent("staged-lesson", async () => {
      throw new ApiError(403, "FORBIDDEN", "无权限");
    }),
  );
});

test("修改旧复盘时沿用最新结论，修改最新复盘才改变结论状态", () => {
  assert.equal(
    reflectionStatusCopyKind({
      ...base,
      originalStatus: "settled",
      latestResolution: "let_go",
      changesLatestResolution: false,
    }),
    "settled",
  );
  assert.equal(
    reflectionStatusCopyKind({
      ...base,
      originalStatus: "settled",
      latestResolution: "let_go",
      changesLatestResolution: true,
    }),
    "fresh",
  );
});
