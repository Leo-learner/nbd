export type TrendDayPoint = { dayOffset: number };

export function firstPointPerTrendDay<T extends TrendDayPoint>(
  points: readonly T[],
): T[] {
  const seen = new Set<number>();
  return points.filter((point) => {
    if (seen.has(point.dayOffset)) return false;
    seen.add(point.dayOffset);
    return true;
  });
}
