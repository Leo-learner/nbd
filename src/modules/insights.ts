import type { Db, Row } from "../db/index.js";
import type { Principal } from "./principal.js";
import { MomentService } from "./moments.js";
import { daysBetween } from "../time.js";
import { fail } from "../errors.js";
const mean = (values: number[]) =>
  values.length
    ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10000) /
      10000
    : null;
const median = (values: number[]) => {
  const a = [...values].sort((x, y) => x - y),
    n = a.length;
  return n ? (n % 2 ? a[(n - 1) / 2]! : (a[n / 2 - 1]! + a[n / 2]!) / 2) : null;
};
const distribution = (values: string[]) => {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
};
export class InsightService {
  constructor(
    public db: Db,
    public moments: MomentService,
  ) {}
  rows(p: Principal, q: Row): Row[] {
    this.moments.read(p);
    if (q.from && q.to && q.from > q.to)
      fail(400, "INVALID_INPUT", "开始日期不能晚于结束日期");
    return this.db
      .prepare(
        "SELECT * FROM moments WHERE user_id=@user AND deleted_at IS NULL AND (@from IS NULL OR happened_on>=@from) AND (@to IS NULL OR happened_on<=@to) ORDER BY happened_at,id",
      )
      .all({ user: p.userId, from: q.from ?? null, to: q.to ?? null }) as Row[];
  }
  refs(p: Principal, m: Row): Row[] {
    return this.db
      .prepare(
        "SELECT * FROM reflections WHERE moment_id=? AND user_id=? ORDER BY created_at,id",
      )
      .all(m.id, p.userId) as Row[];
  }
  overview(p: Principal, q: Row = {}): Row {
    const rows = this.rows(p, q),
      withFear = rows.filter((m) => !!m.feared_outcome),
      judgments = withFear.map((m) => {
        const refs = this.refs(p, m);
        return (
          [...refs]
            .reverse()
            .find((r) => r.fear_came_true && r.fear_came_true !== "unknown")
            ?.fear_came_true ?? (refs.length ? "unknown" : "pending")
        );
      }),
      n = (x: string) => judgments.filter((v) => v === x).length,
      judged = n("no") + n("partly") + n("yes"),
      pairs = rows.filter((m) => m.reflection_count > 0),
      meanThen = mean(pairs.map((m) => m.intensity)),
      meanNow = mean(pairs.map((m) => m.latest_intensity_now)),
      letGo = rows
        .map((m) => {
          const first = this.refs(p, m).find((r) => r.resolution === "let_go");
          return first
            ? Math.max(0, daysBetween(m.happened_on, first.reflected_on))
            : null;
        })
        .filter((x): x is number => x !== null);
    return {
      range: { from: q.from ?? null, to: q.to ?? null },
      minSample: 5,
      totals: {
        moments: rows.length,
        reflected: pairs.length,
        settled: rows.filter((m) => m.latest_resolution === "let_go").length,
        archived: rows.filter((m) => m.archived_at !== null).length,
      },
      fear: {
        withFear: withFear.length,
        judged,
        no: n("no"),
        partly: n("partly"),
        yes: n("yes"),
        unknown: n("unknown"),
        pending: n("pending"),
        neverHappenedRate: judged
          ? Math.round((n("no") / judged) * 10000) / 10000
          : null,
      },
      intensity: {
        pairs: pairs.length,
        meanThen,
        meanNow,
        meanDrop:
          meanThen === null || meanNow === null
            ? null
            : Math.round((meanThen - meanNow) * 10000) / 10000,
      },
      letGo: { count: letGo.length, medianDays: median(letGo) },
      distributions: {
        emotions: distribution(
          rows.flatMap((m) => [
            ...new Set<string>(
              JSON.parse(m.emotions_json).map((e: Row) => e.key),
            ),
          ]),
        ),
        scenes: distribution(rows.map((m) => m.scene)),
        thinkingTraps: distribution(
          rows.flatMap((m) => [
            ...new Set<string>(
              this.refs(p, m).flatMap((r) => JSON.parse(r.thinking_traps_json)),
            ),
          ]),
        ),
        resolutions: distribution(pairs.map((m) => m.latest_resolution)),
      },
    };
  }
  decay(p: Principal, q: Row = {}): Row {
    const points = this.rows(p, q).flatMap((m) => [
      {
        momentId: m.id,
        dayOffset: Math.max(0, daysBetween(m.happened_on, m.captured_on)),
        intensity: m.intensity,
        kind: "capture",
      },
      ...this.refs(p, m).map((r) => ({
        momentId: m.id,
        dayOffset: Math.max(0, daysBetween(m.happened_on, r.reflected_on)),
        intensity: r.intensity_now,
        kind: "reflection",
      })),
    ]);
    const groups = [
      { key: "d0_1", label: "0–1 天", min: 0, max: 1 },
      { key: "d2_7", label: "2–7 天", min: 2, max: 7 },
      { key: "d8_30", label: "8–30 天", min: 8, max: 30 },
      { key: "d31_90", label: "31–90 天", min: 31, max: 90 },
      { key: "d91p", label: "91 天以上", min: 91, max: Infinity },
    ];
    return {
      range: { from: q.from ?? null, to: q.to ?? null },
      minSample: 5,
      buckets: groups.map((g) => {
        const v = points
          .filter((p) => p.dayOffset >= g.min && p.dayOffset <= g.max)
          .map((p) => p.intensity);
        return {
          key: g.key,
          label: g.label,
          n: v.length,
          meanIntensity: mean(v),
          medianIntensity: median(v),
        };
      }),
      points: points.slice(0, 2000),
    };
  }
  calendar(p: Principal, q: Row): Row {
    if (daysBetween(q.from, q.to) > 400)
      fail(400, "RANGE_TOO_LARGE", "日历范围不能超过 400 天");
    const days = new Map<string, Row>();
    for (const m of this.rows(p, q)) {
      const d = days.get(m.happened_on) ?? {
        date: m.happened_on,
        count: 0,
        maxIntensity: 0,
      };
      d.count++;
      d.maxIntensity = Math.max(d.maxIntensity, m.intensity);
      days.set(m.happened_on, d);
    }
    const u = this.moments.user(p);
    return {
      timezone: u.timezone,
      weekStartsOn: u.week_starts_on,
      from: q.from,
      to: q.to,
      days: [...days.values()].sort((a, b) => a.date.localeCompare(b.date)),
    };
  }
}
