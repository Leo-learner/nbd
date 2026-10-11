import { useState, type CSSProperties } from "react";
import { dateOffset, dayDiff, localDate, today, type ResponseOf } from "../api";
import {
  Button,
  Card,
  ThenNow,
  useApi,
  useApp,
  Loading,
  ErrorState,
  label,
} from "../shared";
type Overview = ResponseOf<"getInsightsOverview">;
type Decay = ResponseOf<"getInsightsDecay">;
type Calendar = ResponseOf<"getInsightsCalendar">;
const insufficient = (n: number, min: number) => `样本不足（${n}/${min}）`;
const hint = "再多记几件、回看几次，这里才看得出规律。";
function DecayChart({ data }: { data: Decay }) {
  const index = (days: number) =>
    days <= 1 ? 0 : days <= 7 ? 1 : days <= 30 ? 2 : days <= 90 ? 3 : 4;
  const hash = (id: string) =>
    [...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);
  return (
    <svg
      className="chart decay-chart"
      viewBox="0 0 900 280"
      role="img"
      aria-label={`强度随时间变化。${data.buckets.map((b) => `${b.label}：${b.n < data.minSample ? insufficient(b.n, data.minSample) : `平均 ${b.meanIntensity?.toFixed(1)} 分，${b.n} 次`}`).join("；")}`}
    >
      {[0, 5, 10].map((n) => (
        <g key={n}>
          <line
            x1="40"
            x2="875"
            y1={220 - n * 18}
            y2={220 - n * 18}
            className="chart-grid"
          />
          <text x="15" y={225 - n * 18}>
            {n}
          </text>
        </g>
      ))}
      {data.buckets.map((b, i) => {
        const x = 90 + i * 165,
          h = (b.meanIntensity ?? 0) * 18,
          ok = b.n >= data.minSample;
        return (
          <g key={b.key}>
            {ok ? (
              <>
                <rect
                  x={x}
                  y={220 - h}
                  width="95"
                  height={h}
                  className="chart-water"
                />
                <line
                  x1={x}
                  x2={x + 95}
                  y1={220 - h}
                  y2={220 - h}
                  className="chart-waterline"
                />
                <text x={x + 47} y={210 - h} textAnchor="middle">
                  平均 {b.meanIntensity?.toFixed(1)}
                </text>
              </>
            ) : (
              <>
                <rect
                  x={x}
                  y="95"
                  width="110"
                  height="125"
                  className="chart-empty"
                />
                <text x={x + 55} y="160" textAnchor="middle">
                  {insufficient(b.n, data.minSample)}
                </text>
              </>
            )}
            <text x={x + 47} y="248" textAnchor="middle">
              {b.label}
            </text>
            <text x={x + 47} y="270" textAnchor="middle">
              {b.n} 次
            </text>
          </g>
        );
      })}
      {data.points.map((p, i) => (
        <circle
          key={`${p.momentId}-${i}`}
          cx={137 + index(p.dayOffset) * 165 + ((hash(p.momentId) % 81) - 40)}
          cy={220 - p.intensity * 18}
          r="3.6"
          className="chart-point"
        />
      ))}
    </svg>
  );
}
function RecordCalendar({ data }: { data: Calendar }) {
  const count = dayDiff(data.to, data.from) + 1,
    records = new Map(data.days.map((d) => [d.date, d]));
  const [y, m, d] = data.from.split("-").map(Number),
    weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(),
    padding = (weekday - data.weekStartsOn + 7) % 7;
  const cells = Array.from(
    { length: Math.ceil((count + padding) / 7) * 7 },
    (_, i) =>
      i < padding || i >= count + padding
        ? null
        : dateOffset(data.from, i - padding),
  );
  const most = data.days.reduce<Calendar["days"][number] | undefined>(
    (best, next) =>
      !best || next.maxIntensity > best.maxIntensity ? next : best,
    undefined,
  );
  return (
    <>
      <p className="sr-only">
        这段时间有 {data.days.length} 天有记录。
        {most && `最重的是 ${localDate(most.date)}，${most.maxIntensity} 分。`}
      </p>
      <div className="calendar-scroll">
        <div className="calendar-grid" aria-hidden="true">
          {cells.map((date, i) => {
            const record = date ? records.get(date) : undefined;
            return (
              <span
                key={i}
                className={`calendar-cell ${date === today(data.timezone) ? "calendar-today" : ""} ${date ? "" : "calendar-padding"}`}
                style={
                  {
                    background: record
                      ? `var(--intensity-${record.maxIntensity})`
                      : undefined,
                  } as CSSProperties
                }
                title={
                  date
                    ? `${localDate(date)} · ${record?.count ?? 0} 件 · 最难受 ${record?.maxIntensity ?? 0} 分`
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>
      <div className="calendar-legend">
        <span>
          {localDate(data.from)} — {localDate(data.to)}
        </span>
        <span>浅 → 深　当时多难受</span>
      </div>
    </>
  );
}
export function InsightsPage() {
  const { user, meta } = useApp(),
    end = today(user.timezone);
  const [range, setRange] = useState("all"),
    [customFrom, setCustomFrom] = useState(dateOffset(end, -29)),
    [customTo, setCustomTo] = useState(end);
  const from =
    range === "30"
      ? dateOffset(end, -29)
      : range === "90"
        ? dateOffset(end, -89)
        : range === "year"
          ? `${end.slice(0, 4)}-01-01`
          : range === "custom"
            ? customFrom
            : undefined;
  const to = range === "custom" ? customTo : range === "all" ? undefined : end,
    invalid = !!from && !!to && from > to;
  const query = new URLSearchParams({
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }).toString();
  const overview = useApi<Overview>(
      invalid ? null : `/insights/overview?${query}`,
    ),
    decay = useApi<Decay>(invalid ? null : `/insights/decay?${query}`);
  const calendarFrom =
    from && dayDiff(to ?? end, from) <= 399
      ? from
      : dateOffset(to ?? end, -160);
  const calendar = useApi<Calendar>(
    invalid ? null : `/insights/calendar?from=${calendarFrom}&to=${to ?? end}`,
  );
  const v = overview.data;
  const distributions: [
    keyof Overview["distributions"],
    keyof typeof meta.enums,
    string,
    string,
  ][] = [
    ["emotions", "emotion", "emotion", "当时的情绪"],
    ["scenes", "scene", "scene", "事情发生在哪里"],
    ["thinkingTraps", "thinkingTrap", "trap", "回头看，掉进过的思维陷阱"],
    ["resolutions", "resolution", "resolution", "复盘之后"],
  ];
  return (
    <>
      <header className="page-header">
        <h1>洞察</h1>
        <p className="page-description">
          {v
            ? `${v.totals.moments} 件事，${v.totals.reflected} 件回看过，${v.totals.settled} 件已释怀。`
            : "把当时和后来放在一起，看看时间带来的变化。"}
        </p>
      </header>
      <div className="segmented" role="group" aria-label="统计时间范围">
        {[
          ["all", "全部"],
          ["30", "近 30 天"],
          ["90", "近 90 天"],
          ["year", "今年"],
          ["custom", "自选日期"],
        ].map(([key, text]) => (
          <Button
            key={key}
            aria-pressed={range === key}
            onClick={() => setRange(key)}
          >
            {text}
          </Button>
        ))}
      </div>
      {range === "custom" && (
        <div className="toolbar">
          <label className="form-field">
            开始日期
            <input
              type="date"
              value={customFrom}
              max={customTo}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
          </label>
          <label className="form-field">
            结束日期
            <input
              type="date"
              value={customTo}
              min={customFrom}
              max={end}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </label>
        </div>
      )}
      {invalid && <p role="alert">开始日期不能晚于结束日期。</p>}
      {overview.error ? (
        <ErrorState error={overview.error} retry={overview.reload} />
      ) : !v ? (
        <Loading />
      ) : (
        <>
          <div className="insights-grid">
            <Card tone="deep" className="metric-card">
              <h2>你担心的事</h2>
              {v.fear.judged < v.minSample ? (
                <p className="sample-message">
                  {insufficient(v.fear.judged, v.minSample)}
                </p>
              ) : (
                <p className="metric-number">
                  {Math.round((v.fear.neverHappenedRate ?? 0) * 100)}
                  <small>%</small>
                  <span>没有发生</span>
                </p>
              )}
              {v.fear.judged < v.minSample ? (
                <p>{hint}</p>
              ) : (
                <>
                  <div className="fear-bar">
                    {[v.fear.no, v.fear.partly, v.fear.yes].map((n, i) => (
                      <span
                        key={i}
                        className={`fear-segment fear-${i}`}
                        style={{ width: `${(n / v.fear.judged) * 100}%` }}
                      />
                    ))}
                  </div>
                  <p>
                    {v.fear.judged} 件已判断的事里，{v.fear.no} 件没发生，
                    {v.fear.partly} 件部分发生，{v.fear.yes} 件发生了。
                  </p>
                </>
              )}
            </Card>
            <Card className="metric-card">
              <h2>当时的难受，后来轻了多少</h2>
              {v.intensity.pairs < v.minSample ? (
                <>
                  <p className="sample-message">
                    {insufficient(v.intensity.pairs, v.minSample)}
                  </p>
                  <p>{hint}</p>
                </>
              ) : (
                <>
                  <ThenNow
                    then={v.intensity.meanThen ?? 0}
                    now={v.intensity.meanNow}
                    size="lg"
                  />
                  <p>
                    {v.intensity.pairs} 件复盘过的事，平均
                    {(v.intensity.meanDrop ?? 0) >= 0 ? "减轻" : "增加"}{" "}
                    {Math.abs(v.intensity.meanDrop ?? 0).toFixed(1)} 分。
                  </p>
                </>
              )}
            </Card>
            <Card className="metric-card">
              <h2>通常多久，就放下了</h2>
              {v.letGo.count < v.minSample ? (
                <>
                  <p className="sample-message">
                    {insufficient(v.letGo.count, v.minSample)}
                  </p>
                  <p>{hint}</p>
                </>
              ) : (
                <>
                  <p className="metric-number">
                    {v.letGo.medianDays}
                    <small>天</small>
                  </p>
                  <p>
                    {v.letGo.count} 件放下的事，从发生到第一次释怀的时间中位数。
                  </p>
                </>
              )}
            </Card>
          </div>
          <Card>
            <h2>过了多久，还有多难受</h2>
            <p className="page-description">
              每一个点是一次记录或复盘，水位线是这段时间的平均强度。
            </p>
            {decay.error ? (
              <ErrorState error={decay.error} retry={decay.reload} />
            ) : decay.data ? (
              <DecayChart data={decay.data} />
            ) : (
              <Loading />
            )}
          </Card>
          <Card>
            <h2>记录日历</h2>
            <p className="page-description">
              按你的时区与每周起始日排列。每格是一天，深浅表示当时的强度。
            </p>
            {calendar.error ? (
              <ErrorState error={calendar.error} retry={calendar.reload} />
            ) : calendar.data ? (
              <RecordCalendar data={calendar.data} />
            ) : (
              <Loading />
            )}
          </Card>
          <div className="distribution-grid">
            {distributions.map(([key, group, param, title]) => {
              const rows = v.distributions[key],
                max = Math.max(1, ...rows.map((r) => r.count));
              return (
                <Card key={key}>
                  <div className="section-heading">
                    <h2>{title}</h2>
                    <small>
                      {rows.reduce((n, r) => n + r.count, 0)} 次标记
                    </small>
                  </div>
                  {rows.length === 0 ? (
                    <p className="page-description">还没有足够的记录。</p>
                  ) : (
                    rows.map((r) => (
                      <a
                        className="distribution-row"
                        key={r.key}
                        href={`/?${param}=${encodeURIComponent(r.key)}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`}
                      >
                        <span>{label(meta, group, r.key)}</span>
                        <span className="distribution-track">
                          <span
                            style={{ width: `${(r.count / max) * 100}%` }}
                          />
                        </span>
                        <strong>{r.count}</strong>
                      </a>
                    ))
                  )}
                </Card>
              );
            })}
          </div>
          <p className="page-description">
            点任意一行，会回到时间线并按它筛选。统计不含回收站里的事；归档的也算在内。
          </p>
        </>
      )}
    </>
  );
}
