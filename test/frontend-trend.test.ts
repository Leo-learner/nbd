import test from "node:test";
import assert from "node:assert/strict";
import { firstPointPerTrendDay } from "../frontend/src/trend.js";

test("趋势图每天只保留首次出现的标签锚点", () => {
  const points = [
    { dayOffset: 0, intensity: 8 },
    { dayOffset: 1, intensity: 6 },
    { dayOffset: 1, intensity: 5 },
    { dayOffset: 3, intensity: 4 },
    { dayOffset: 3, intensity: 2 },
  ];

  const labels = firstPointPerTrendDay(points);

  assert.deepEqual(
    labels.map((point) => point.dayOffset),
    [0, 1, 3],
  );
  assert.equal(labels[1], points[1]);
});

test("没有趋势点时不生成日期标签", () => {
  assert.deepEqual(firstPointPerTrendDay([]), []);
});
