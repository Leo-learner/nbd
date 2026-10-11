import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ApiError,
  api,
  dayDiff,
  idempotency,
  instant,
  localDate,
  today,
  type MomentDetail,
  type MomentSummary,
  type ResponseOf,
} from "../api";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  FormError,
  Icon,
  IntensityTile,
  Loading,
  Modal,
  StatusBadge,
  ThenNow,
  useApi,
  useApp,
  label,
} from "../shared";
import type { operations } from "../../../sdk/generated";

type ListResponse = ResponseOf<"listMoments">;
type RevisionResponse = ResponseOf<"listMomentRevisions">;
type Revision = RevisionResponse["items"][number];
type Snapshot = Revision["snapshot"];
type Note = MomentDetail["notes"][number];
type Reflection = MomentDetail["reflections"][number];
type Lesson = MomentDetail["lessons"][number];
type TagResponse = ResponseOf<"listTags">;
type LessonResponse = ResponseOf<"listLessons">;
type CreateLessonResponse =
  operations["createLesson"]["responses"][201]["content"]["application/json"];
type RequestBody<K extends keyof operations> = operations[K] extends {
  requestBody: { content: { "application/json": infer Body } };
}
  ? Body
  : never;
type UpdateMomentBody = RequestBody<"updateMoment">;
type CreateReflectionBody = RequestBody<"createReflection">;
type UpdateReflectionBody = RequestBody<"updateReflection">;
type Scene = UpdateMomentBody["scene"];
type Precision = NonNullable<UpdateMomentBody["happenedAtPrecision"]>;
type EmotionDraft = { key: string; intensity: string };
type FilterStatus =
  "" | "fresh" | "cooling" | "reflected" | "settled" | "archived";

const FILTER_STATUS_KEYS: FilterStatus[] = [
  "",
  "fresh",
  "cooling",
  "reflected",
  "settled",
  "archived",
];

function queryPath(path: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function ownerDateTime(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const get = (name: string) =>
    parts.find((part) => part.type === name)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function localDateTimeToISO(value: string, timezone: string) {
  const [date, clock] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = clock.split(":").map(Number);
  const targetUTC = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = targetUTC;
  for (let i = 0; i < 3; i += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(candidate));
    const get = (name: string) =>
      Number(parts.find((part) => part.type === name)?.value ?? 0);
    const wallUTC = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
    );
    candidate += targetUTC - wallUTC;
  }
  if (ownerDateTime(new Date(candidate).toISOString(), timezone) !== value)
    throw new Error("这个时间在当前时区不存在，请重新选择发生时间。");
  const offsetText =
    new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      timeZoneName: "longOffset",
    })
      .formatToParts(new Date(candidate))
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT+00:00";
  const offset = offsetText.replace("GMT", "").replace("UTC", "") || "+00:00";
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date}T${pad(hour)}:${pad(minute)}:00${offset}`;
}

function dateLabel(
  value: string,
  precision: Precision,
  timezone: string,
  meta: ReturnType<typeof useApp>["meta"],
) {
  if (precision === "exact") return instant(value, timezone);
  const on = value.slice(0, 10);
  return `${label(meta, "precision", precision)} · ${localDate(on)}`;
}

function monthLabel(on: string) {
  const [year, month] = on.slice(0, 10).split("-");
  return `${year} 年 ${Number(month)} 月`;
}

function weekdayLabel(on: string) {
  const date = new Date(`${on.slice(0, 10)}T00:00:00Z`);
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
    date.getUTCDay()
  ];
}

function sceneText(meta: ReturnType<typeof useApp>["meta"], scene: string) {
  return label(meta, "scene", scene);
}
function emotionText(
  meta: ReturnType<typeof useApp>["meta"],
  emotions: { key: string; intensity: number | null }[],
) {
  return emotions
    .map(
      (item) =>
        `${label(meta, "emotion", item.key)}${item.intensity == null ? "" : ` ${item.intensity}`}`,
    )
    .join(" · ");
}

function MomentCard({
  moment,
  query,
}: {
  moment: MomentSummary;
  query: string;
}) {
  const { meta, user, navigate } = useApp();
  const statusHint =
    moment.status === "fresh"
      ? (() => {
          const hours = Math.floor(
            (new Date(moment.capturedAt).getTime() +
              meta.review.freezeHours * 3600000 -
              Date.now()) /
              3600000,
          );
          return hours > 0
            ? `Agent 还能更正 · 剩 ${hours} 小时`
            : "Agent 还能更正 · 剩不到 1 小时";
        })()
      : moment.status === "cooling"
        ? `记下 ${Math.max(0, dayDiff(today(user.timezone), ownerDateTime(moment.capturedAt, user.timezone).slice(0, 10)))} 天，还没回看`
        : moment.status === "reflected"
          ? `最近一次复盘：${label(meta, "resolution", moment.latestResolution)}`
          : moment.status === "settled"
            ? "放下了"
            : "";
  const search = new URLSearchParams();
  if (query) search.set("from", `/?${query}`);
  const path = `/moments/${moment.id}${search.size ? `?${search}` : ""}`;
  const pieces = moment.happenedOn.slice(0, 10).split("-");
  const exactTime =
    moment.happenedAtPrecision === "exact"
      ? new Intl.DateTimeFormat("zh-CN", {
          timeZone: user.timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date(moment.happenedAt))
      : null;
  const mobileWhen = exactTime
    ? `${Number(pieces[1])}月${Number(pieces[2])}日 ${weekdayLabel(moment.happenedOn)} ${exactTime}`
    : `${label(meta, "precision", moment.happenedAtPrecision)} ${Number(pieces[1])}月${Number(pieces[2])}日`;
  return (
    <article
      className={`moment-card ${moment.status === "archived" ? "moment-card-archived" : ""}`}
    >
      <div
        className="date-marker"
        aria-label={`${Number(pieces[2])} 日，${weekdayLabel(moment.happenedOn)}`}
      >
        <strong className="date-day">{Number(pieces[2])}</strong>
        <small className="date-week">{weekdayLabel(moment.happenedOn)}</small>
      </div>
      <div className="moment-copy">
        <a
          className="moment-card-link"
          href={path}
          onClick={(event) => {
            event.preventDefault();
            navigate(path);
          }}
        >
          <span className="moment-meta">
            {moment.status !== "due" && <StatusBadge status={moment.status} />}
            <span className="mobile-date-inline">{mobileWhen}</span>
            <span className="moment-time-label">
              {exactTime ??
                `${label(meta, "precision", moment.happenedAtPrecision)} · ${localDate(moment.happenedOn)}`}
            </span>
            {statusHint && <span className="status-hint">{statusHint}</span>}
          </span>
          <h2 className="card-title">{moment.title}</h2>
          <p className="excerpt">{moment.matchSnippet ?? moment.excerpt}</p>
        </a>
        <div className="moment-meta moment-card-meta">
          <span>{sceneText(meta, moment.scene)}</span>
          {moment.emotions.length > 0 && (
            <span>{emotionText(meta, moment.emotions)}</span>
          )}
          {moment.tags.length > 0 && (
            <span className="moment-tags">
              {moment.tags.map((tag) => (
                <span className="emotion-chip" key={tag}>
                  #{tag}
                </span>
              ))}
            </span>
          )}
          <span className="moment-source">来自 {moment.source.label}</span>
        </div>
      </div>
      <ThenNow
        then={moment.intensity}
        now={moment.latestIntensityNow}
        size="md"
      />
    </article>
  );
}

export function Timeline() {
  const { meta, navigate } = useApp();
  const [params, setParams] = useState(
    () => new URLSearchParams(window.location.search),
  );
  const [queryText, setQueryText] = useState(() => params.get("q") ?? "");
  const [moreError, setMoreError] = useState<unknown>();
  const [moreLoading, setMoreLoading] = useState(false);
  const [items, setItems] = useState<MomentSummary[]>([]);
  const [loadedPath, setLoadedPath] = useState("");
  const [tags, setTags] = useState<TagResponse["items"]>([]);
  const [cursorData, setCursorData] = useState<ListResponse | null>(null);
  const updateParams = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(window.location.search);
    const trimmed = value.trim();
    if (trimmed) next.set(key, trimmed);
    else next.delete(key);
    next.delete("cursor");
    const url = queryPath(window.location.pathname || "/", next);
    window.history.replaceState(null, "", url);
    setParams(next);
    window.dispatchEvent(new Event("nbd-route-changed"));
  }, []);
  const listLimit = Math.max(1, Math.min(40, meta.limits.pageMax));
  const firstParams = useMemo(() => {
    const next = new URLSearchParams(params);
    next.delete("cursor");
    next.set("limit", String(listLimit));
    return next;
  }, [listLimit, params]);
  const path = useMemo(() => queryPath("/moments", firstParams), [firstParams]);
  const [requestedPath, setRequestedPath] = useState(path);
  const activePath = useRef(path);
  activePath.current = path;
  const { data, error, loading, reload } = useApi<ListResponse>(path);
  const tagState = useApi<TagResponse>("/tags");

  useEffect(() => {
    const sync = () => {
      const next = new URLSearchParams(window.location.search);
      setParams(next);
      setQueryText(next.get("q") ?? "");
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("nbd-route-changed", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("nbd-route-changed", sync);
    };
  }, []);
  useEffect(() => {
    setRequestedPath(path);
  }, [path]);
  useEffect(() => {
    if (!tagState.loading && tagState.data) setTags(tagState.data.items);
  }, [tagState.data, tagState.loading]);
  useEffect(() => {
    if (loading || error || !data) return;
    setItems(data.items);
    setLoadedPath(path);
    setMoreError(undefined);
  }, [data, error, loading, path]);
  useEffect(() => {
    const timer = window.setTimeout(() => updateParams("q", queryText), 250);
    return () => window.clearTimeout(timer);
    // The query input deliberately commits after a short pause.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryText]);

  const selectedStatus = (params.get("status") ?? "") as FilterStatus;
  const filterKeys = [
    "scene",
    "emotion",
    "tag",
    "trap",
    "resolution",
    "fearCameTrue",
    "from",
    "to",
    "sort",
  ] as const;
  const activeFilters = filterKeys.filter(
    (key) => key !== "sort" && params.has(key) && params.get(key),
  );
  const clearFilters = () => {
    const next = new URLSearchParams();
    next.set("sort", "happened_desc");
    window.history.replaceState(
      null,
      "",
      queryPath(window.location.pathname || "/", next),
    );
    setParams(next);
    setQueryText("");
    window.dispatchEvent(new Event("nbd-route-changed"));
  };
  const loadMore = async () => {
    const cursor =
      cursorData && loadedPath === path
        ? cursorData.nextCursor
        : data?.nextCursor;
    if (!cursor || moreLoading) return;
    const requestedPath = path;
    setMoreLoading(true);
    setMoreError(undefined);
    const page = new URLSearchParams(firstParams);
    page.set("cursor", cursor);
    try {
      const result = await api<ListResponse>(
        "GET",
        queryPath("/moments", page),
      );
      if (activePath.current !== requestedPath) return;
      setItems((current) => [...current, ...result.items]);
      setLoadedPath(path);
      // Preserve the latest cursor and total for the next request without storing any browser data.
      setCursorData(result);
    } catch (caught) {
      if (activePath.current === requestedPath) setMoreError(caught);
    } finally {
      setMoreLoading(false);
    }
  };
  const currentCursor = cursorData && loadedPath === path ? cursorData : data;
  const groups = useMemo(() => {
    const result: { month: string; moments: MomentSummary[] }[] = [];
    for (const moment of items) {
      const month = moment.happenedOn.slice(0, 7);
      const group = result.at(-1);
      if (group?.month === month) group.moments.push(moment);
      else result.push({ month, moments: [moment] });
    }
    return result;
  }, [items]);
  useEffect(() => {
    setCursorData(null);
  }, [path]);
  const hasActiveParams = Boolean(
    params.get("q") || activeFilters.length || params.get("status"),
  );
  const currentError = requestedPath === path ? error : undefined;
  const waitingForPath =
    requestedPath !== path || (loading && loadedPath !== path);
  const emptyTitle = params.get("q")
    ? `没找到包含「${params.get("q")}」的事。`
    : hasActiveParams
      ? "这个筛选下还没有事。"
      : "这里还没有记录";
  const shown = loadedPath === path ? items : [];

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="heading-row">
          <div>
            <h1>时间线</h1>
            <p className="page-description">
              {loadedPath === path ? (data?.total ?? 0) : 0} 件事。新的事在
              Agent 里记：对 Claude 或 ChatGPT 说“帮我记一笔”。
            </p>
          </div>
          <label className="sort-control">
            排序
            <select
              value={params.get("sort") ?? "happened_desc"}
              onChange={(event) => updateParams("sort", event.target.value)}
              aria-label="排序"
            >
              <option value="happened_desc">按发生时间</option>
              <option value="captured_desc">按记下时间</option>
              <option value="intensity_desc">按当时强度</option>
              <option value="happened_asc">按发生时间从旧到新</option>
            </select>
          </label>
        </div>
      </header>
      <div className="toolbar">
        <label className="search-field">
          <Icon name="search" />
          <input
            type="search"
            maxLength={meta.limits.qMax}
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            placeholder="搜索标题和原话"
            aria-label="搜索标题和原话"
          />
        </label>
        <div className="filters">
          <label className="filter-select">
            <span>场景</span>
            <select
              value={params.get("scene") ?? ""}
              onChange={(event) => updateParams("scene", event.target.value)}
            >
              <option value="">全部场景</option>
              {meta.enums.scene.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            <span>情绪</span>
            <select
              value={params.get("emotion") ?? ""}
              onChange={(event) => updateParams("emotion", event.target.value)}
            >
              <option value="">全部情绪</option>
              {meta.enums.emotion.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            <span>标签</span>
            <select
              value={params.get("tag") ?? ""}
              onChange={(event) => updateParams("tag", event.target.value)}
            >
              <option value="">全部标签</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.name}>
                  #{tag.name}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            <span>思维陷阱</span>
            <select
              value={params.get("trap") ?? ""}
              onChange={(event) => updateParams("trap", event.target.value)}
            >
              <option value="">全部</option>
              {meta.enums.thinkingTrap.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="filters filter-statuses" aria-label="记录状态">
        {FILTER_STATUS_KEYS.map((key) => (
          <button
            key={key || "all"}
            type="button"
            className={`filter-chip ${selectedStatus === key ? "filter-chip-active" : ""}`}
            aria-pressed={selectedStatus === key}
            onClick={() => updateParams("status", key)}
          >
            {key
              ? `${label(meta, "status", key)}${key === "cooling" ? " · 还没回看" : ""}`
              : "全部"}
          </button>
        ))}
      </div>
      {(params.has("from") || params.has("to")) && (
        <div className="date-range-filters">
          <label>
            从{" "}
            <input
              type="date"
              value={params.get("from") ?? ""}
              onChange={(event) => updateParams("from", event.target.value)}
            />
          </label>
          <label>
            到{" "}
            <input
              type="date"
              value={params.get("to") ?? ""}
              onChange={(event) => updateParams("to", event.target.value)}
            />
          </label>
        </div>
      )}
      {hasActiveParams && (
        <div className="active-filter-row">
          <span>
            当前筛选：
            {[
              params.get("q") && `搜索“${params.get("q")}”`,
              params.get("scene") && sceneText(meta, params.get("scene")!),
              params.get("emotion") &&
                label(meta, "emotion", params.get("emotion")),
              params.get("tag") && `#${params.get("tag")}`,
              params.get("trap") &&
                label(meta, "thinkingTrap", params.get("trap")),
              params.get("resolution") &&
                label(meta, "resolution", params.get("resolution")),
              params.get("fearCameTrue") &&
                label(meta, "fearCameTrue", params.get("fearCameTrue")),
            ]
              .filter(Boolean)
              .join(" · ") || "按状态或日期"}
          </span>
          <Button onClick={clearFilters}>清除筛选</Button>
        </div>
      )}
      {currentError && loadedPath !== path ? (
        <ErrorState error={currentError} retry={reload} />
      ) : waitingForPath ? (
        <Loading />
      ) : shown.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          body={
            !hasActiveParams
              ? "事情刚发生的时候，在 Claude 或 ChatGPT 里说“帮我记一笔”，它会把你的原话记下来。"
              : undefined
          }
          action={
            !hasActiveParams ? (
              <Button
                tone="primary"
                onClick={() => navigate("/settings/access")}
              >
                去连上 Agent
              </Button>
            ) : (
              <Button onClick={clearFilters}>清除筛选</Button>
            )
          }
        />
      ) : (
        <>
          <div className="moment-list">
            {groups.map((group, index) => (
              <section className="month-group" key={`${group.month}-${index}`}>
                <h2>{monthLabel(`${group.month}-01`)}</h2>
                {group.moments.map((moment) => (
                  <MomentCard
                    key={moment.id}
                    moment={moment}
                    query={params.toString()}
                  />
                ))}
              </section>
            ))}
          </div>
          <div className="pagination-row">
            {currentCursor?.nextCursor && (
              <Button onClick={loadMore} disabled={moreLoading}>
                {moreLoading ? "正在加载…" : "加载更早的事"}
              </Button>
            )}
            <span>
              已显示 {shown.length} 件，共{" "}
              {currentCursor?.total ?? data?.total ?? 0} 件
            </span>
          </div>
          <FormError error={moreError} />
        </>
      )}
    </div>
  );
}

function IntensityChart({
  series,
  totalDays,
}: {
  series: MomentDetail["intensitySeries"];
  totalDays: number;
}) {
  const maxDay = Math.max(
    1,
    totalDays,
    ...series.map((point) => point.dayOffset),
  );
  const points = series.map((point) => ({
    ...point,
    x: 24 + (Math.max(0, point.dayOffset) / maxDay) * 312,
    y: 126 - point.intensity * 10.8,
  }));
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  return (
    <div className="intensity-chart-wrap">
      <svg
        className="intensity-chart"
        viewBox="0 0 360 150"
        role="img"
        aria-label={`强度变化：${series.map((point) => `${point.dayOffset === 0 ? "当天" : `第 ${point.dayOffset} 天`} ${point.intensity} 分`).join("，")}`}
      >
        {[18, 72, 126].map((y, index) => (
          <g key={y}>
            <line x1="24" x2="338" y1={y} y2={y} className="plot-grid" />
            <text x="4" y={y + 4} className="plot-axis-label">
              {10 - index * 5}
            </text>
          </g>
        ))}
        <line x1="336" x2="336" y1="12" y2="132" className="plot-today" />
        {points.length > 1 && (
          <polyline points={polyline} className="plot-line" />
        )}
        {points.map((point) => (
          <g
            key={`${point.kind}-${point.dayOffset}-${point.reflectionId ?? "capture"}`}
          >
            <circle
              cx={point.x}
              cy={point.y}
              r="5.5"
              className={
                point.kind === "capture"
                  ? "plot-point plot-point-capture"
                  : "plot-point plot-point-reflection"
              }
            />
            <text
              x={point.x}
              y="145"
              textAnchor="middle"
              className="plot-axis-label"
            >
              {point.dayOffset === 0 ? "当天" : `第${point.dayOffset}天`}
            </text>
          </g>
        ))}
      </svg>
      <div className="plot-legend">
        <span>
          <i className="plot-dot capture" />
          记下时
        </span>
        <span>
          <i className="plot-dot reflection" />
          复盘时
        </span>
        <span>今天 · 第 {totalDays} 天</span>
      </div>
    </div>
  );
}

type EditDraft = {
  title: string;
  narrative: string;
  agentSummary: string;
  precision: Precision;
  happenedOn: string;
  happenedLocal: string;
  scene: string;
  emotions: EmotionDraft[];
  intensity: string;
  severity: string;
  fearedOutcome: string;
  outcomeKnownBy: string;
  thoughts: string;
  bodySignals: string;
  immediateResponse: string;
  people: string[];
  reason: string;
};

function makeEditDraft(detail: MomentDetail, timezone: string): EditDraft {
  return {
    title: detail.title,
    narrative: detail.narrative,
    agentSummary: detail.agentSummary ?? "",
    precision: detail.happenedAtPrecision,
    happenedOn: detail.happenedOn,
    happenedLocal: ownerDateTime(detail.happenedAt, timezone),
    scene: detail.scene,
    emotions: detail.emotions.map((item) => ({
      key: item.key,
      intensity: item.intensity == null ? "" : String(item.intensity),
    })),
    intensity: String(detail.intensity),
    severity: detail.severity == null ? "" : String(detail.severity),
    fearedOutcome: detail.fearedOutcome ?? "",
    outcomeKnownBy: detail.outcomeKnownBy ?? "",
    thoughts: detail.thoughts ?? "",
    bodySignals: detail.bodySignals ?? "",
    immediateResponse: detail.immediateResponse ?? "",
    people: [...detail.people],
    reason: "",
  };
}

function MomentEditor({
  detail,
  onClose,
  onSaved,
}: {
  detail: MomentDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { meta, user, confirm, notify } = useApp();
  const [draft, setDraft] = useState(() =>
    makeEditDraft(detail, user.timezone),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [conflict, setConflict] = useState(false);
  const [expectedRevision, setExpectedRevision] = useState(detail.revision);
  const [serverVersion, setServerVersion] = useState<MomentDetail | null>(null);
  const update = <K extends keyof EditDraft>(key: K, value: EditDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const frozen = Date.now() >= new Date(detail.editableUntil).getTime();
  const toggleEmotion = (key: string) => {
    setDraft((current) =>
      current.emotions.some((item) => item.key === key)
        ? {
            ...current,
            emotions: current.emotions.filter((item) => item.key !== key),
          }
        : current.emotions.length >= meta.limits.emotionsMax
          ? current
          : {
              ...current,
              emotions: [...current.emotions, { key, intensity: "" }],
            },
    );
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setConflict(false);
    if (!draft.title.trim() || !draft.narrative.trim()) {
      setError(new Error("标题和原话不能为空。"));
      return;
    }
    if (draft.people.some((person) => person.length > meta.limits.personMax)) {
      setError(new Error(`每个角色最多 ${meta.limits.personMax} 个字。`));
      return;
    }
    if (
      frozen &&
      !(await confirm(
        "这条记录已过更正期",
        "保存会留下修订记录。确认你要修改当时的记录吗？",
      ))
    )
      return;
    setBusy(true);
    try {
      const body: UpdateMomentBody = {
        expectedRevision,
        reason: draft.reason.trim() || undefined,
        title: draft.title.trim(),
        narrative: draft.narrative,
        agentSummary: draft.agentSummary.trim() || null,
        happenedAt:
          draft.precision === "exact"
            ? localDateTimeToISO(draft.happenedLocal, user.timezone)
            : draft.happenedOn,
        happenedAtPrecision: draft.precision,
        scene: draft.scene as Scene,
        emotions: draft.emotions.map((item) => ({
          key: item.key as NonNullable<
            UpdateMomentBody["emotions"]
          >[number]["key"],
          ...(item.intensity.trim()
            ? { intensity: Number(item.intensity) }
            : {}),
        })),
        intensity: Number(draft.intensity),
        severity: draft.severity.trim() ? Number(draft.severity) : null,
        fearedOutcome: draft.fearedOutcome.trim() || null,
        outcomeKnownBy: draft.outcomeKnownBy || null,
        thoughts: draft.thoughts.trim() || null,
        bodySignals: draft.bodySignals.trim() || null,
        immediateResponse: draft.immediateResponse.trim() || null,
        people: draft.people.map((person) => person.trim()).filter(Boolean),
      };
      await api("PATCH", `/moments/${detail.id}`, body);
      notify("原始记录已更新");
      onSaved();
    } catch (caught) {
      setError(caught);
      if (caught instanceof ApiError && caught.code === "MOMENT_CONFLICT")
        setConflict(true);
    } finally {
      setBusy(false);
    }
  };
  const reloadConflict = async () => {
    try {
      const current = await api<MomentDetail>("GET", `/moments/${detail.id}`);
      // Keep the user's draft intact while rebasing the optimistic revision token.
      setExpectedRevision(current.revision);
      setServerVersion(current);
      setConflict(false);
      setError(undefined);
      notify(`已重新加载当前版本（第 ${current.revision} 版）；你的输入仍保留`);
    } catch (caught) {
      setError(caught);
    }
  };
  const sceneOptions = meta.enums.scene;
  return (
    <Modal title="编辑原始记录" onClose={onClose} locked={busy}>
      <form className="moment-edit-form" onSubmit={submit}>
        {frozen && (
          <p className="freeze-notice">
            这条记录的 Agent
            更正期已结束。保存前会再次请你确认，并留下修订历史。
          </p>
        )}
        <label className="form-field">
          <span>标题</span>
          <input
            maxLength={meta.limits.titleMax}
            value={draft.title}
            onChange={(event) => update("title", event.target.value)}
            required
          />
        </label>
        <label className="form-field">
          <span>原话</span>
          <textarea
            maxLength={meta.limits.narrativeMax}
            rows={7}
            value={draft.narrative}
            onChange={(event) => update("narrative", event.target.value)}
            required
          />
        </label>
        <div className="time-input-row">
          <label className="form-field">
            <span>时间精度</span>
            <select
              value={draft.precision}
              onChange={(event) =>
                update("precision", event.target.value as Precision)
              }
            >
              {meta.enums.precision.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {draft.precision === "exact" ? (
            <label className="form-field">
              <span>发生时间</span>
              <input
                type="datetime-local"
                value={draft.happenedLocal}
                onChange={(event) =>
                  update("happenedLocal", event.target.value)
                }
                required
              />
            </label>
          ) : (
            <label className="form-field">
              <span>发生日期</span>
              <input
                type="date"
                value={draft.happenedOn}
                onChange={(event) => update("happenedOn", event.target.value)}
                required
              />
            </label>
          )}
        </div>
        <label className="form-field">
          <span>场景</span>
          <select
            value={draft.scene}
            onChange={(event) => update("scene", event.target.value)}
          >
            {sceneOptions.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <section className="form-section">
          <div className="section-heading">
            <h3>当时的情绪</h3>
            <span>
              {draft.emotions.length}/{meta.limits.emotionsMax}
            </span>
          </div>
          <div className="choice-grid">
            {meta.enums.emotion.map((item) => {
              const active = draft.emotions.find(
                (emotion) => emotion.key === item.key,
              );
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`choice-card ${active ? "selected-choice" : ""}`}
                  aria-pressed={Boolean(active)}
                  disabled={
                    !active && draft.emotions.length >= meta.limits.emotionsMax
                  }
                  onClick={() => toggleEmotion(item.key)}
                >
                  {item.label}
                  {active && <span>✓</span>}
                </button>
              );
            })}
          </div>
          {draft.emotions.map((item) => (
            <label className="emotion-row" key={item.key}>
              <span>{label(meta, "emotion", item.key)}的强度</span>
              <input
                type="number"
                min="0"
                max="10"
                placeholder="可留空"
                value={item.intensity}
                onChange={(event) =>
                  update(
                    "emotions",
                    draft.emotions.map((emotion) =>
                      emotion.key === item.key
                        ? { ...emotion, intensity: event.target.value }
                        : emotion,
                    ),
                  )
                }
              />
            </label>
          ))}
        </section>
        <label className="form-field">
          <span>当时有多难受：{draft.intensity}/10</span>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={draft.intensity}
            onChange={(event) => update("intensity", event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>当时觉得多严重（可留空）</span>
          <input
            type="number"
            min="0"
            max="10"
            value={draft.severity}
            onChange={(event) => update("severity", event.target.value)}
            placeholder="0–10"
          />
        </label>
        <label className="form-field">
          <span>当时担心会发生什么</span>
          <textarea
            maxLength={meta.limits.fearedOutcomeMax}
            value={draft.fearedOutcome}
            onChange={(event) => update("fearedOutcome", event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>什么时候能知道结果</span>
          <input
            type="date"
            value={draft.outcomeKnownBy}
            onChange={(event) => update("outcomeKnownBy", event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>当时的想法</span>
          <textarea
            maxLength={meta.limits.thoughtsMax}
            value={draft.thoughts}
            onChange={(event) => update("thoughts", event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>身体反应</span>
          <textarea
            maxLength={meta.limits.bodySignalsMax}
            value={draft.bodySignals}
            onChange={(event) => update("bodySignals", event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>当下的应对</span>
          <textarea
            maxLength={meta.limits.immediateResponseMax}
            value={draft.immediateResponse}
            onChange={(event) =>
              update("immediateResponse", event.target.value)
            }
          />
        </label>
        <section className="form-section">
          <div className="section-heading">
            <h3>涉及的人</h3>
            <span>
              {draft.people.length}/{meta.limits.peopleMax}
            </span>
          </div>
          {draft.people.map((person, index) => (
            <div className="inline-row" key={index}>
              <input
                aria-label={`涉及的人 ${index + 1}`}
                maxLength={meta.limits.personMax}
                value={person}
                onChange={(event) =>
                  update(
                    "people",
                    draft.people.map((value, i) =>
                      i === index ? event.target.value : value,
                    ),
                  )
                }
              />
              <Button
                onClick={() =>
                  update(
                    "people",
                    draft.people.filter((_, i) => i !== index),
                  )
                }
              >
                移除
              </Button>
            </div>
          ))}
          {draft.people.length < meta.limits.peopleMax && (
            <Button onClick={() => update("people", [...draft.people, ""])}>
              添加角色
            </Button>
          )}
        </section>
        <label className="form-field">
          <span>Agent 的概括</span>
          <textarea
            maxLength={meta.limits.agentSummaryMax}
            value={draft.agentSummary}
            onChange={(event) => update("agentSummary", event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>修改原因（可选）</span>
          <input
            maxLength={meta.limits.reasonMax}
            value={draft.reason}
            onChange={(event) => update("reason", event.target.value)}
            placeholder="记录这次更正的原因"
          />
        </label>
        <FormError error={error} />
        {conflict && (
          <div className="conflict-panel">
            <p>
              这条记录已经被另一处修改。你的输入仍保留；重新加载当前版本后可以检查并再次保存。
            </p>
            <Button onClick={reloadConflict}>重新加载当前版本</Button>
          </div>
        )}
        {serverVersion && (
          <div className="conflict-panel">
            <strong>当前版本：第 {serverVersion.revision} 版</strong>
            <p>
              <b>标题：</b>
              {serverVersion.title}
            </p>
            <p className="narrative">
              <b>原话：</b>
              {serverVersion.narrative}
            </p>
            <small>你编辑中的字段仍保留在上方表单。确认合并后再保存。</small>
          </div>
        )}
        <div className="actions">
          <Button onClick={onClose}>取消</Button>
          <Button tone="primary" type="submit" disabled={busy}>
            {busy ? "正在保存…" : "保存修改"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function TimelineEvent({
  item,
  captureIntensity,
  hasFear,
  lessons,
  meta,
  timezone,
  navigate,
  onEditReflection,
  onDelete,
}: {
  item:
    { kind: "note"; value: Note } | { kind: "reflection"; value: Reflection };
  captureIntensity: number;
  hasFear: boolean;
  lessons: Lesson[];
  meta: ReturnType<typeof useApp>["meta"];
  timezone: string;
  navigate: (path: string) => void;
  onEditReflection: (id: string) => void;
  onDelete: (
    item:
      { kind: "note"; value: Note } | { kind: "reflection"; value: Reflection },
  ) => void;
}) {
  if (item.kind === "note")
    return (
      <div className="history-item">
        <span className="history-dot note-dot" />
        <div className="history-content">
          <div className="moment-meta">
            <strong>补记</strong>
            <span>{instant(item.value.createdAt, timezone)}</span>
            <span>· {item.value.author.label}</span>
          </div>
          <p className="narrative">{item.value.body}</p>
          <Button onClick={() => onDelete(item)}>删除补记</Button>
        </div>
      </div>
    );
  const reflection = item.value;
  return (
    <div className="history-item">
      <span className="history-dot reflection-dot" />
      <div className="history-content">
        <div className="moment-meta">
          <strong>复盘 · 第 {reflection.daysSinceHappened} 天</strong>
          <span>{instant(reflection.createdAt, timezone)}</span>
          <span>· {reflection.author.label}</span>
        </div>
        <div className="reflection-facts">
          <span>
            <IntensityTile
              value={reflection.intensityNow}
              size="sm"
              label="现在"
            />
            {reflection.intensityNow <= captureIntensity
              ? `比当时低 ${captureIntensity - reflection.intensityNow} 分`
              : `比当时高 ${reflection.intensityNow - captureIntensity} 分`}
          </span>
          <span className="emotion-chip">
            {label(meta, "resolution", reflection.resolution)}
          </span>
          {hasFear && reflection.fearCameTrue != null && (
            <span>
              担心的事：{label(meta, "fearCameTrue", reflection.fearCameTrue)}
            </span>
          )}
          {reflection.severityNow != null && (
            <span>现在觉得多严重：{reflection.severityNow}/10</span>
          )}
        </div>
        {reflection.whatHappened && (
          <section>
            <h3>后来发生了什么</h3>
            <p className="narrative">{reflection.whatHappened}</p>
          </section>
        )}
        {reflection.perspective && (
          <section>
            <h3>现在怎么看</h3>
            <p className="narrative">{reflection.perspective}</p>
          </section>
        )}
        {reflection.thinkingTraps.length > 0 && (
          <div className="emotion-chips">
            {reflection.thinkingTraps.map((trap) => (
              <span
                className="emotion-chip"
                title={
                  meta.enums.thinkingTrap.find((item) => item.key === trap)
                    ?.hint
                }
                key={trap}
              >
                {label(meta, "thinkingTrap", trap)}
              </span>
            ))}
          </div>
        )}
        {reflection.lessonIds.length > 0 && (
          <p className="lesson-links">
            关联经验：
            {reflection.lessonIds.map((id) => {
              const lesson = lessons.find((item) => item.id === id);
              return (
                <a
                  href={`/lessons/${encodeURIComponent(id)}`}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(`/lessons/${encodeURIComponent(id)}`);
                  }}
                  key={id}
                >
                  {lesson?.title ?? "经验"}
                </a>
              );
            })}
          </p>
        )}
        <div className="actions">
          <Button onClick={() => onEditReflection(reflection.id)}>编辑</Button>
          <Button className="danger-text" onClick={() => onDelete(item)}>
            删除复盘
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MomentPage({ id }: { id: string }) {
  return <MomentPageContent key={id} id={id} />;
}

function MomentPageContent({ id }: { id: string }) {
  const { meta, user, navigate, confirm, notify } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteError, setNoteError] = useState<unknown>();
  const [noteBusy, setNoteBusy] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState<unknown>();
  const [tagBusy, setTagBusy] = useState(false);
  const {
    data: detail,
    error,
    loading,
    reload,
  } = useApi<MomentDetail>(`/moments/${encodeURIComponent(id)}`);
  const tagState = useApi<TagResponse>("/tags");
  const { data: tagData } = tagState;
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [initializedId, setInitializedId] = useState("");
  useEffect(() => {
    if (detail && initializedId !== detail.id) {
      setTagNames([...detail.tags]);
      setInitializedId(detail.id);
    }
  }, [detail, initializedId]);
  const from = new URLSearchParams(window.location.search).get("from");
  const backPath = from?.startsWith("/?") || from === "/" ? from : "/";
  const saveTags = async (next: string[]) => {
    if (!detail || tagBusy) return false;
    setTagError(undefined);
    if (next.length > meta.limits.tagsMax) {
      setTagError(new Error(`最多关联 ${meta.limits.tagsMax} 个标签。`));
      return false;
    }
    setTagBusy(true);
    try {
      const result = await api<{ tags: string[] }>(
        "PUT",
        `/moments/${detail.id}/tags`,
        { names: next },
      );
      setTagNames(result.tags);
      reload();
      return true;
    } catch (caught) {
      setTagError(caught);
      return false;
    } finally {
      setTagBusy(false);
    }
  };
  const addTag = (event: FormEvent) => {
    event.preventDefault();
    const normalized = tagInput.trim().replace(/^#+/, "");
    if (!normalized) return;
    if (normalized.length > meta.limits.tagMax) {
      setTagError(new Error(`每个标签最多 ${meta.limits.tagMax} 个字。`));
      return;
    }
    const next = Array.from(new Set([...tagNames, normalized]));
    void saveTags(next).then((saved) => {
      if (saved) setTagInput("");
    });
  };
  const addNote = async (event: FormEvent) => {
    event.preventDefault();
    setNoteError(undefined);
    if (!noteDraft.trim()) {
      setNoteError(new Error("请写下补充内容。"));
      return;
    }
    setNoteBusy(true);
    try {
      await api(
        "POST",
        `/moments/${detail!.id}/notes`,
        { body: noteDraft },
        idempotency(),
      );
      setNoteDraft("");
      notify("补记已添加");
      reload();
    } catch (caught) {
      setNoteError(caught);
    } finally {
      setNoteBusy(false);
    }
  };
  const deleteHistory = async (
    item:
      { kind: "note"; value: Note } | { kind: "reflection"; value: Reflection },
  ) => {
    const title = item.kind === "note" ? "删除这条补记？" : "删除这次复盘？";
    if (!(await confirm(title, "删除后无法撤销。", true))) return;
    try {
      if (item.kind === "note") await api("DELETE", `/notes/${item.value.id}`);
      else await api("DELETE", `/reflections/${item.value.id}`);
      notify(item.kind === "note" ? "补记已删除" : "复盘已删除");
      reload();
    } catch (caught) {
      notify(caught instanceof Error ? caught.message : "删除失败");
    }
  };
  const archive = async () => {
    if (!detail) return;
    const isArchived = detail.status === "archived";
    try {
      await api(
        "POST",
        `/moments/${detail.id}/${isArchived ? "unarchive" : "archive"}`,
      );
      reload();
      notify(isArchived ? "已取消归档" : "已归档", {
        label: "撤销",
        run: async () => {
          await api(
            "POST",
            `/moments/${detail.id}/${isArchived ? "archive" : "unarchive"}`,
          );
          reload();
        },
      });
    } catch (caught) {
      notify(caught instanceof Error ? caught.message : "操作失败");
    }
  };
  const trash = async () => {
    if (!detail) return;
    try {
      await api("DELETE", `/moments/${detail.id}`);
      navigate("/");
      notify("已移到回收站", {
        label: "撤销",
        run: async () => {
          await api("POST", `/moments/${detail.id}/restore`);
          notify("记录已恢复");
        },
      });
    } catch (caught) {
      notify(caught instanceof Error ? caught.message : "操作失败");
    }
  };
  const restore = async () => {
    if (!detail) return;
    try {
      await api("POST", `/moments/${detail.id}/restore`);
      reload();
      notify("记录已恢复");
    } catch (caught) {
      notify(caught instanceof Error ? caught.message : "恢复失败");
    }
  };
  const timelineEvents = useMemo(
    () =>
      detail
        ? [
            ...detail.notes.map((value) => ({ kind: "note" as const, value })),
            ...detail.reflections.map((value) => ({
              kind: "reflection" as const,
              value,
            })),
          ].sort((a, b) => a.value.createdAt.localeCompare(b.value.createdAt))
        : [],
    [detail],
  );
  if (loading && !detail) return <Loading />;
  if (error && !detail) return <ErrorState error={error} retry={reload} />;
  if (!detail) return null;
  const latest = detail.reflections[detail.reflections.length - 1];
  const captureDay = dayDiff(today(user.timezone), detail.happenedOn);
  const dateText = dateLabel(
    detail.happenedAt,
    detail.happenedAtPrecision,
    user.timezone,
    meta,
  );
  const weekday = weekdayLabel(detail.happenedOn);
  return (
    <div className="page-shell detail-page">
      <a
        className="back-link"
        href={backPath}
        onClick={(event) => {
          event.preventDefault();
          navigate(backPath);
        }}
      >
        <Icon name="back" />
        时间线
      </a>
      <header className="detail-heading">
        <div className="moment-meta">
          {detail.status !== "due" && <StatusBadge status={detail.status} />}
          <span>
            {dateText} · {weekday}
          </span>
          <span>{label(meta, "scene", detail.scene)}</span>
          <span>来自 {detail.source.label}</span>
        </div>
        <h1>{detail.title}</h1>
        <div className="moment-actions">
          <Button
            tone="primary"
            onClick={() => navigate(`/moments/${detail.id}/reflect`)}
          >
            {detail.reflectionCount > 0 ? "再写一次复盘" : "写复盘"}
          </Button>
          <Button onClick={() => setEditorOpen(true)}>编辑原始记录</Button>
        </div>
      </header>
      <section className="comparison-card card">
        <div className="comparison-heading">
          <h2>时间过去，感觉也会变</h2>
          {latest && (
            <span>最近一次复盘 · 第 {latest.daysSinceHappened} 天</span>
          )}
        </div>
        <div className="comparison-row">
          <ThenNow then={detail.intensity} now={detail.latestIntensityNow} />
          <p>
            当时 {detail.intensity} 分
            {detail.latestIntensityNow == null
              ? ` · 事情过去 ${Math.max(0, captureDay)} 天了，还没回看`
              : ` → 现在 ${detail.latestIntensityNow} 分，过了 ${latest?.daysSinceHappened ?? 0} 天`}
          </p>
        </div>
        {latest && (
          <p className="comparison-caption">
            最近一次复盘在 {localDate(latest.reflectedOn)}，结论是「
            {label(meta, "resolution", latest.resolution)}」。
            {detail.hasFear &&
              `当时担心的事：${label(meta, "fearCameTrue", latest.fearCameTrue)}。`}
          </p>
        )}
        <IntensityChart
          series={detail.intensitySeries}
          totalDays={Math.max(0, captureDay)}
        />
      </section>
      <div className="detail-grid">
        <main className="detail-main">
          <section className="detail-section">
            <div className="section-heading">
              <h2>当时的我</h2>
              <div className="moment-meta">
                <span>
                  {instant(detail.capturedAt, user.timezone)} 由{" "}
                  {detail.source.label} 记下
                </span>
                {detail.revisionCount > 0 && (
                  <>
                    <span>· 已修改 {detail.revisionCount} 次</span>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() =>
                        navigate(`/moments/${detail.id}/revisions`)
                      }
                    >
                      查看修订历史
                    </button>
                  </>
                )}
              </div>
            </div>
            <Card className="original-paper">
              <p className="narrative">{detail.narrative}</p>
            </Card>
            {detail.emotions.length > 0 && (
              <div className="emotion-chips" aria-label="当时的情绪">
                {detail.emotions.map((emotion) => (
                  <span className="emotion-chip" key={emotion.key}>
                    {label(meta, "emotion", emotion.key)}
                    {emotion.intensity == null ? "" : ` ${emotion.intensity}`}
                  </span>
                ))}
              </div>
            )}
            <div className="field-grid">
              {detail.fearedOutcome && (
                <FieldBlock title="当时担心会发生什么">
                  {detail.fearedOutcome}
                </FieldBlock>
              )}
              {detail.severity != null && (
                <FieldBlock title="当时觉得多严重">
                  <strong>{detail.severity}/10</strong>
                  <progress max="10" value={detail.severity} />
                </FieldBlock>
              )}
              {detail.outcomeKnownBy && (
                <FieldBlock title="什么时候能知道结果">
                  {localDate(detail.outcomeKnownBy)}
                </FieldBlock>
              )}
              {detail.thoughts && (
                <FieldBlock title="当时的想法">{detail.thoughts}</FieldBlock>
              )}
              {detail.bodySignals && (
                <FieldBlock title="身体反应">{detail.bodySignals}</FieldBlock>
              )}
              {detail.immediateResponse && (
                <FieldBlock title="当下的应对">
                  {detail.immediateResponse}
                </FieldBlock>
              )}
              {detail.people.length > 0 && (
                <FieldBlock title="涉及的人">
                  {detail.people.join("、")}
                </FieldBlock>
              )}
            </div>
            {detail.agentSummary && (
              <div className="summary-box">
                <strong>{detail.source.label} 的概括</strong>
                <p className="narrative">{detail.agentSummary}</p>
              </div>
            )}
          </section>
          <section className="detail-section">
            <div className="section-heading">
              <h2>后来的我</h2>
              <span>
                {detail.noteCount} 条补记 · {detail.reflectionCount} 次复盘
              </span>
            </div>
            {timelineEvents.length === 0 ? (
              <p className="muted-copy">以后补充的话和复盘会出现在这里。</p>
            ) : (
              <div className="history-rail">
                {timelineEvents.map((item) => (
                  <TimelineEvent
                    key={`${item.kind}-${item.value.id}`}
                    item={item}
                    captureIntensity={detail.intensity}
                    hasFear={detail.hasFear}
                    lessons={detail.lessons}
                    meta={meta}
                    timezone={user.timezone}
                    navigate={navigate}
                    onEditReflection={(reflectionId) =>
                      navigate(
                        `/moments/${detail.id}/reflect?edit=${encodeURIComponent(reflectionId)}`,
                      )
                    }
                    onDelete={deleteHistory}
                  />
                ))}
              </div>
            )}
            <form className="add-note-form" onSubmit={addNote}>
              <label className="form-field">
                <span>补一段后来想到的话</span>
                <textarea
                  value={noteDraft}
                  maxLength={meta.limits.noteMax}
                  rows={4}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder="写下后来补充的细节…"
                />
              </label>
              <small>
                补记只会追加在这里，不会改动当时的记录。最多{" "}
                {meta.limits.noteMax} 个字。
              </small>
              <FormError error={noteError} />
              <div className="actions">
                <Button
                  tone="primary"
                  type="submit"
                  disabled={noteBusy || !noteDraft.trim()}
                >
                  {noteBusy ? "正在添加…" : "添加补记"}
                </Button>
              </div>
            </form>
          </section>
        </main>
        <aside className="detail-aside">
          <Card className="tag-editor">
            <div className="section-heading">
              <h2>标签</h2>
              <span>
                {tagNames.length}/{meta.limits.tagsMax}
              </span>
            </div>
            <div className="emotion-chips">
              {tagNames.map((tag) => (
                <span className="tag-pill" key={tag}>
                  #{tag}
                  <button
                    type="button"
                    aria-label={`移除标签 ${tag}`}
                    disabled={tagBusy}
                    onClick={() =>
                      void saveTags(tagNames.filter((value) => value !== tag))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={addTag}>
              <label className="form-field">
                <span className="sr-only">添加标签</span>
                <input
                  list="moment-tags"
                  value={tagInput}
                  maxLength={meta.limits.tagMax}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="输入标签后回车"
                  disabled={tagBusy || tagNames.length >= meta.limits.tagsMax}
                />
                <datalist id="moment-tags">
                  {tagData?.items.map((tag) => (
                    <option value={tag.name} key={tag.id} />
                  ))}
                </datalist>
              </label>
            </form>
            <FormError error={tagError} />
          </Card>
          {detail.lessons.length > 0 && (
            <Card>
              <div className="section-heading">
                <h2>关联的经验</h2>
              </div>
              <ul className="lesson-list">
                {detail.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <a
                      href={`/lessons/${encodeURIComponent(lesson.id)}`}
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(`/lessons/${encodeURIComponent(lesson.id)}`);
                      }}
                    >
                      {lesson.title}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card className="record-facts">
            <div className="section-heading">
              <h2>这条记录</h2>
            </div>
            <dl>
              <dt>发生</dt>
              <dd>{dateText}</dd>
              <dt>记下</dt>
              <dd>{instant(detail.capturedAt, user.timezone)}</dd>
              <dt>最后修改</dt>
              <dd>
                {detail.lastEditedAt
                  ? `${instant(detail.lastEditedAt, user.timezone)} · ${detail.lastEditedBy?.label ?? ""}`
                  : "还没有修改"}
              </dd>
              <dt>Agent 更正期</dt>
              <dd>
                {new Date(detail.editableUntil).getTime() > Date.now()
                  ? `到 ${instant(detail.editableUntil, user.timezone)} 前`
                  : `${instant(detail.editableUntil, user.timezone)} 已结束`}
              </dd>
            </dl>
          </Card>
          <Card className="organize-card">
            <div className="section-heading">
              <h2>整理</h2>
            </div>
            {detail.deletedAt ? (
              <Button onClick={restore}>从回收站恢复</Button>
            ) : (
              <>
                <Button onClick={archive}>
                  {detail.status === "archived" ? "取消归档" : "归档"}
                </Button>
                <Button className="danger-text" onClick={trash}>
                  移到回收站
                </Button>
                <small>
                  回收站保留 {meta.review.trashDays} 天，期间可以恢复。
                </small>
              </>
            )}
          </Card>
        </aside>
      </div>
      {editorOpen && (
        <MomentEditor
          detail={detail}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            setEditorOpen(false);
            reload();
          }}
        />
      )}
      <FormError error={error && detail ? error : undefined} />
    </div>
  );
}

function FieldBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="field-block">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

type ReflectDraft = {
  intensityNow: number;
  resolution: string;
  fearCameTrue: string;
  severityNow: string;
  whatHappened: string;
  perspective: string;
  thinkingTraps: string[];
  lessonIds: string[];
};

function reflectDraft(
  moment: MomentDetail,
  reflection?: Reflection,
): ReflectDraft {
  return reflection
    ? {
        intensityNow: reflection.intensityNow,
        resolution: reflection.resolution,
        fearCameTrue: reflection.fearCameTrue ?? "",
        severityNow:
          reflection.severityNow == null ? "" : String(reflection.severityNow),
        whatHappened: reflection.whatHappened ?? "",
        perspective: reflection.perspective ?? "",
        thinkingTraps: [...reflection.thinkingTraps],
        lessonIds: [...reflection.lessonIds],
      }
    : {
        intensityNow: moment.intensity,
        resolution: "",
        fearCameTrue: "",
        severityNow: "",
        whatHappened: "",
        perspective: "",
        thinkingTraps: [],
        lessonIds: [],
      };
}

function scoreText(value: number) {
  return `${value}/10`;
}

export function ReflectPage({ id }: { id: string }) {
  const editId = new URLSearchParams(window.location.search).get("edit");
  return <ReflectPageContent key={`${id}:${editId ?? "new"}`} id={id} />;
}

function ReflectPageContent({ id }: { id: string }) {
  const { meta, user, navigate, confirm, notify } = useApp();
  const editId = new URLSearchParams(window.location.search).get("edit");
  const {
    data: moment,
    error,
    loading,
    reload,
  } = useApi<MomentDetail>(`/moments/${encodeURIComponent(id)}`);
  const [draft, setDraft] = useState<ReflectDraft | null>(null);
  const [initial, setInitial] = useState("");
  const [errorForm, setErrorForm] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [lessonSearch, setLessonSearch] = useState("");
  const [lessonQuery, setLessonQuery] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [lessonError, setLessonError] = useState<unknown>();
  const [knownLessons, setKnownLessons] = useState<Record<string, string>>({});
  const [guardPending, setGuardPending] = useState(false);
  const dirty = Boolean(draft && JSON.stringify(draft) !== initial);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const editing = editId
    ? moment?.reflections.find((reflection) => reflection.id === editId)
    : undefined;
  const lessonPath = lessonQuery.trim()
    ? `/lessons?q=${encodeURIComponent(lessonQuery.trim())}`
    : "/lessons";
  const lessonState = useApi<LessonResponse>(lessonPath);
  const lessons = lessonState.data?.items ?? [];

  useEffect(() => {
    if (!moment) return;
    const chosen = editId
      ? moment.reflections.find((reflection) => reflection.id === editId)
      : undefined;
    if (editId && !chosen) return;
    const next = reflectDraft(moment, chosen);
    setDraft(next);
    setInitial(JSON.stringify(next));
    setKnownLessons(
      Object.fromEntries(
        moment.lessons.map((lesson) => [lesson.id, lesson.title]),
      ),
    );
  }, [moment, editId]);
  useEffect(() => {
    const timer = window.setTimeout(() => setLessonQuery(lessonSearch), 250);
    return () => window.clearTimeout(timer);
  }, [lessonSearch]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    const beforeNavigate = (event: Event) => {
      if (!dirtyRef.current || guardPending) return;
      const detail = (
        event as CustomEvent<{
          path: string;
          cancel: () => void;
          resume: () => void;
        }>
      ).detail;
      if (!detail?.cancel || !detail?.resume) return;
      detail.cancel();
      setGuardPending(true);
      void confirm("离开这页？", "复盘还没有保存。离开后这次填写的内容会丢失。")
        .then(async (accepted) => {
          if (accepted) await detail.resume();
        })
        .finally(() => setGuardPending(false));
    };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("nbd-before-navigate", beforeNavigate);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("nbd-before-navigate", beforeNavigate);
    };
  }, [confirm, guardPending]);

  const updateDraft = <K extends keyof ReflectDraft>(
    key: K,
    value: ReflectDraft[K],
  ) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  const toggleTrap = (key: string) => {
    if (!draft) return;
    const has = draft.thinkingTraps.includes(key);
    if (!has && draft.thinkingTraps.length >= meta.limits.trapsMax) return;
    updateDraft(
      "thinkingTraps",
      has
        ? draft.thinkingTraps.filter((value) => value !== key)
        : [...draft.thinkingTraps, key],
    );
  };
  const toggleLesson = (lesson: { id: string; title: string }) => {
    if (!draft) return;
    const has = draft.lessonIds.includes(lesson.id);
    if (!has && draft.lessonIds.length >= meta.limits.lessonIdsMax) return;
    updateDraft(
      "lessonIds",
      has
        ? draft.lessonIds.filter((value) => value !== lesson.id)
        : [...draft.lessonIds, lesson.id],
    );
    setKnownLessons((current) => ({ ...current, [lesson.id]: lesson.title }));
  };
  const createLesson = async () => {
    if (!moment || !newLessonTitle.trim() || !draft) return;
    if (draft.lessonIds.length >= meta.limits.lessonIdsMax) {
      setLessonError(
        new Error(`最多关联 ${meta.limits.lessonIdsMax} 条经验。`),
      );
      return;
    }
    setCreatingLesson(true);
    setLessonError(undefined);
    try {
      const created = await api<CreateLessonResponse>(
        "POST",
        "/lessons",
        { title: newLessonTitle.trim() },
        idempotency(),
      );
      setKnownLessons((current) => ({
        ...current,
        [created.id]: created.title,
      }));
      updateDraft("lessonIds", [...draft.lessonIds, created.id]);
      setNewLessonTitle("");
      notify("经验已创建并关联");
    } catch (caught) {
      setLessonError(caught);
    } finally {
      setCreatingLesson(false);
    }
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!moment || !draft) return;
    setErrorForm(undefined);
    if (!draft.resolution) {
      setErrorForm(new Error("请选择一个结论。"));
      return;
    }
    if (
      draft.thinkingTraps.length > meta.limits.trapsMax ||
      draft.lessonIds.length > meta.limits.lessonIdsMax
    ) {
      setErrorForm(new Error("选择数量超过限制。"));
      return;
    }
    const body: CreateReflectionBody | UpdateReflectionBody = {
      intensityNow: draft.intensityNow,
      resolution: draft.resolution as NonNullable<
        CreateReflectionBody["resolution"]
      >,
      ...(moment.hasFear
        ? {
            fearCameTrue: (draft.fearCameTrue || "unknown") as NonNullable<
              CreateReflectionBody["fearCameTrue"]
            >,
          }
        : editing
          ? { fearCameTrue: null }
          : {}),
      ...(draft.severityNow.trim()
        ? { severityNow: Number(draft.severityNow) }
        : editing
          ? { severityNow: null }
          : {}),
      ...(draft.whatHappened.trim()
        ? { whatHappened: draft.whatHappened }
        : editing
          ? { whatHappened: null }
          : {}),
      ...(draft.perspective.trim()
        ? { perspective: draft.perspective }
        : editing
          ? { perspective: null }
          : {}),
      thinkingTraps:
        draft.thinkingTraps as CreateReflectionBody["thinkingTraps"],
      lessonIds: draft.lessonIds,
    };
    setBusy(true);
    try {
      if (editing) await api("PATCH", `/reflections/${editing.id}`, body);
      else
        await api(
          "POST",
          `/moments/${moment.id}/reflections`,
          body,
          idempotency(),
        );
      dirtyRef.current = false;
      setDraft({ ...draft });
      setInitial(JSON.stringify(draft));
      notify(editing ? "复盘修改已保存" : "复盘已保存");
      navigate(`/moments/${moment.id}`);
    } catch (caught) {
      setErrorForm(caught);
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => {
    if (
      dirty &&
      !(await confirm(
        "离开这页？",
        "复盘还没有保存。离开后这次填写的内容会丢失。",
      ))
    )
      return;
    dirtyRef.current = false;
    if (draft) setInitial(JSON.stringify(draft));
    if (moment) navigate(`/moments/${moment.id}`);
  };

  if (loading && !moment) return <Loading />;
  if (error && !moment) return <ErrorState error={error} retry={reload} />;
  if (!moment) return null;
  if (editId && !editing)
    return <ErrorState error={new Error("找不到这次复盘。")} retry={reload} />;
  if (!draft) return <Loading />;
  const captureDate = dateLabel(
    moment.happenedAt,
    moment.happenedAtPrecision,
    user.timezone,
    meta,
  );
  const difference = moment.intensity - draft.intensityNow;
  return (
    <div className="page-shell reflect-page">
      <div className="reflect-topbar">
        <a
          className="back-link"
          href={`/moments/${moment.id}`}
          onClick={(event) => {
            event.preventDefault();
            void cancel();
          }}
        >
          <Icon name="back" />
          返回记录
        </a>
        <small className="muted">草稿只保留在这个页面里，关掉就没了。</small>
      </div>
      <header className="page-header">
        <h1>{editing ? "修改这次复盘" : "写复盘"}</h1>
        <p className="page-description">
          过一段时间回头看，让当时的担心和后来的事实都有位置。
        </p>
      </header>
      <div className="reflect-layout">
        <aside className="then-panel">
          <span className="eyebrow">当时的你</span>
          <time>{captureDate}</time>
          <h2>{moment.title}</h2>
          <p className="narrative">{moment.narrative}</p>
          <div className="then-panel-facts">
            <IntensityTile value={moment.intensity} label="当时多难受" />
            {moment.severity != null && (
              <span>当时觉得多严重：{moment.severity}/10</span>
            )}
            {moment.emotions.map((emotion) => (
              <span className="emotion-chip" key={emotion.key}>
                {label(meta, "emotion", emotion.key)}
                {emotion.intensity == null ? "" : ` ${emotion.intensity}`}
              </span>
            ))}
          </div>
          {moment.hasFear && moment.fearedOutcome && (
            <blockquote>当时担心：{moment.fearedOutcome}</blockquote>
          )}
        </aside>
        <form className="reflect-form" onSubmit={save}>
          <section className="form-section">
            <div className="section-heading">
              <h2>现在想起来有多难受？</h2>
              <strong>{draft.intensityNow}/10</strong>
            </div>
            <div className="reflect-score-row">
              <ThenNow then={moment.intensity} now={draft.intensityNow} />
              <p>
                当时 {moment.intensity} 分 → 现在 {draft.intensityNow} 分，
                {difference > 0
                  ? `减轻了 ${difference} 分`
                  : difference < 0
                    ? `比当时高 ${Math.abs(difference)} 分`
                    : "和当时差不多"}
              </p>
            </div>
            <input
              className="reflect-range"
              type="range"
              min="0"
              max="10"
              step="1"
              value={draft.intensityNow}
              aria-label="现在想起来有多难受"
              onChange={(event) =>
                updateDraft("intensityNow", Number(event.target.value))
              }
            />
            <div className="range-scale">
              {Array.from({ length: 11 }, (_, value) => (
                <button
                  key={value}
                  type="button"
                  className={draft.intensityNow === value ? "scale-active" : ""}
                  aria-pressed={draft.intensityNow === value}
                  onClick={() => updateDraft("intensityNow", value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </section>
          <section className="form-section">
            <div className="section-heading">
              <h2>你现在怎么看这件事？</h2>
              <span className="required-mark">必选</span>
            </div>
            <div className="choice-grid resolution-choices">
              {meta.enums.resolution.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  className={`choice-card ${draft.resolution === item.key ? "selected-choice" : ""}`}
                  aria-pressed={draft.resolution === item.key}
                  onClick={() => updateDraft("resolution", item.key)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              ))}
            </div>
          </section>
          {moment.hasFear && (
            <section className="form-section">
              <h2>当时担心的事发生了吗？</h2>
              <blockquote className="fear-quote">
                {moment.fearedOutcome}
              </blockquote>
              <div className="choice-grid fear-choices">
                {meta.enums.fearCameTrue.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={`choice-card ${draft.fearCameTrue === item.key ? "selected-choice" : ""}`}
                    aria-pressed={draft.fearCameTrue === item.key}
                    onClick={() => updateDraft("fearCameTrue", item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <small>不选择会按“还不知道”保存。</small>
            </section>
          )}
          <section className="form-section">
            <div className="section-heading">
              <h2>现在觉得这件事有多严重？</h2>
              <span>
                {draft.severityNow ? `${draft.severityNow}/10` : "可留空"}
              </span>
            </div>
            <p className="field-hint">
              当时觉得{" "}
              {moment.severity == null ? "没有评分" : `${moment.severity}/10`}。
            </p>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={draft.severityNow || "0"}
              onChange={(event) =>
                updateDraft("severityNow", event.target.value)
              }
              aria-label="现在觉得这件事有多严重"
            />
            <div className="range-scale">
              <button
                type="button"
                onClick={() => updateDraft("severityNow", "")}
              >
                留空
              </button>
              {Array.from({ length: 11 }, (_, value) => (
                <button
                  type="button"
                  key={value}
                  className={
                    draft.severityNow === String(value) ? "scale-active" : ""
                  }
                  onClick={() => updateDraft("severityNow", String(value))}
                >
                  {value}
                </button>
              ))}
            </div>
          </section>
          <section className="form-section">
            <label className="form-field">
              <span>后来实际发生了什么？</span>
              <textarea
                rows={4}
                maxLength={meta.limits.whatHappenedMax}
                value={draft.whatHappened}
                onChange={(event) =>
                  updateDraft("whatHappened", event.target.value)
                }
                placeholder="后来事情是怎么发展的？"
              />
            </label>
            <label className="form-field">
              <span>现在怎么看这件事？</span>
              <textarea
                className="reflect-perspective"
                rows={5}
                maxLength={meta.limits.perspectiveMax}
                value={draft.perspective}
                onChange={(event) =>
                  updateDraft("perspective", event.target.value)
                }
                placeholder="如果朋友遇到同样的事，你会怎么安慰他？"
              />
            </label>
          </section>
          <section className="form-section">
            <div className="section-heading">
              <h2>思维陷阱</h2>
              <span>
                已选 {draft.thinkingTraps.length} 个，最多{" "}
                {meta.limits.trapsMax} 个
              </span>
            </div>
            <div className="choice-grid trap-choices">
              {meta.enums.thinkingTrap.map((item) => {
                const selected = draft.thinkingTraps.includes(item.key);
                return (
                  <button
                    type="button"
                    className={`choice-card ${selected ? "selected-choice" : ""} ${!selected && draft.thinkingTraps.length >= meta.limits.trapsMax ? "choice-disabled" : ""}`}
                    disabled={
                      !selected &&
                      draft.thinkingTraps.length >= meta.limits.trapsMax
                    }
                    aria-pressed={selected}
                    key={item.key}
                    onClick={() => toggleTrap(item.key)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.hint}</span>
                  </button>
                );
              })}
            </div>
          </section>
          <section className="form-section">
            <div className="section-heading">
              <h2>关联经验</h2>
              <span>
                已关联 {draft.lessonIds.length}/{meta.limits.lessonIdsMax}
              </span>
            </div>
            <label className="form-field">
              <span>搜索经验</span>
              <input
                type="search"
                value={lessonSearch}
                onChange={(event) => setLessonSearch(event.target.value)}
                placeholder="输入关键词查找经验"
              />
            </label>
            <div className="lesson-choice-list">
              {draft.lessonIds.map((lessonId) => (
                <button
                  key={lessonId}
                  type="button"
                  className="lesson-choice selected-choice"
                  onClick={() =>
                    updateDraft(
                      "lessonIds",
                      draft.lessonIds.filter((idValue) => idValue !== lessonId),
                    )
                  }
                >
                  <span>{knownLessons[lessonId] ?? "已关联经验"}</span>
                  <span>已关联 · 移除</span>
                </button>
              ))}
              {lessonState.loading ? (
                <small>正在搜索经验…</small>
              ) : lessonState.error ? (
                <FormError error={lessonState.error} />
              ) : (
                lessons
                  .filter((lesson) => !draft.lessonIds.includes(lesson.id))
                  .map((lesson) => (
                    <button
                      key={lesson.id}
                      type="button"
                      className="lesson-choice"
                      disabled={
                        draft.lessonIds.length >= meta.limits.lessonIdsMax
                      }
                      onClick={() => toggleLesson(lesson)}
                    >
                      <span>{lesson.title}</span>
                      <span>关联</span>
                    </button>
                  ))
              )}
              {!lessonState.loading && lessons.length === 0 && (
                <small>没有找到经验。</small>
              )}
            </div>
            <div className="inline-create">
              <label className="form-field">
                <span>新建一条经验</span>
                <input
                  value={newLessonTitle}
                  maxLength={meta.limits.lessonTitleMax}
                  onChange={(event) => setNewLessonTitle(event.target.value)}
                  placeholder="给这条经验起个标题"
                />
              </label>
              <Button
                onClick={createLesson}
                disabled={
                  creatingLesson ||
                  !newLessonTitle.trim() ||
                  draft.lessonIds.length >= meta.limits.lessonIdsMax
                }
              >
                {creatingLesson ? "正在创建…" : "创建并关联"}
              </Button>
              <FormError error={lessonError} />
            </div>
          </section>
          <FormError error={errorForm} />
          <div className="dirty-bar">
            <p>
              {draft.resolution === "let_go"
                ? "保存后，这件事会标为「已释怀」。"
                : "保存后，这件事会标为「已回看」。以后想起来可以再写一次。"}
            </p>
            <div className="actions">
              <Button onClick={cancel}>取消</Button>
              <Button tone="primary" type="submit" disabled={busy}>
                {busy ? "正在保存…" : editing ? "保存修改" : "保存复盘"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const SNAPSHOT_FIELDS: { key: keyof Snapshot; title: string }[] = [
  { key: "title", title: "标题" },
  { key: "narrative", title: "原话" },
  { key: "agentSummary", title: "Agent 的概括" },
  { key: "happenedAt", title: "发生时间" },
  { key: "happenedOn", title: "发生日期" },
  { key: "happenedAtPrecision", title: "时间精度" },
  { key: "scene", title: "场景" },
  { key: "emotions", title: "当时的情绪" },
  { key: "intensity", title: "当时多难受" },
  { key: "severity", title: "当时觉得多严重" },
  { key: "fearedOutcome", title: "担心会发生什么" },
  { key: "outcomeKnownBy", title: "什么时候能知道结果" },
  { key: "thoughts", title: "当时的想法" },
  { key: "bodySignals", title: "身体反应" },
  { key: "immediateResponse", title: "当下的应对" },
  { key: "people", title: "涉及的人" },
];

function currentSnapshot(moment: MomentDetail): Snapshot {
  return {
    title: moment.title,
    narrative: moment.narrative,
    agentSummary: moment.agentSummary,
    happenedAt: moment.happenedAt,
    happenedOn: moment.happenedOn,
    happenedAtPrecision: moment.happenedAtPrecision,
    scene: moment.scene,
    emotions: moment.emotions,
    intensity: moment.intensity,
    severity: moment.severity,
    fearedOutcome: moment.fearedOutcome,
    outcomeKnownBy: moment.outcomeKnownBy,
    thoughts: moment.thoughts,
    bodySignals: moment.bodySignals,
    immediateResponse: moment.immediateResponse,
    people: moment.people,
  };
}

function normalizeSnapshotValue(
  key: keyof Snapshot,
  value: Snapshot[keyof Snapshot],
  meta: ReturnType<typeof useApp>["meta"],
  timezone: string,
): string {
  if (value == null || value === "") return "—";
  if (key === "happenedAt") return instant(String(value), timezone);
  if (key === "happenedOn" || key === "outcomeKnownBy")
    return localDate(String(value));
  if (key === "happenedAtPrecision")
    return label(meta, "precision", String(value));
  if (key === "scene") return label(meta, "scene", String(value));
  if (key === "emotions")
    return (
      (value as Snapshot["emotions"])
        .map(
          (item) =>
            `${label(meta, "emotion", item.key)}${item.intensity == null ? "" : ` ${item.intensity}`}`,
        )
        .join(" · ") || "—"
    );
  if (key === "severity") return `${value}/10`;
  if (key === "intensity") return `${value}/10`;
  if (key === "people") return (value as string[]).join("、") || "—";
  return String(value);
}

export function RevisionsPage({ id }: { id: string }) {
  return <RevisionsPageContent key={id} id={id} />;
}

function RevisionsPageContent({ id }: { id: string }) {
  const { meta, user, navigate } = useApp();
  const momentState = useApi<MomentDetail>(
    `/moments/${encodeURIComponent(id)}`,
  );
  const revisionsState = useApi<RevisionResponse>(
    `/moments/${encodeURIComponent(id)}/revisions`,
  );
  const moment = momentState.data;
  const history = revisionsState.data;
  const current = useMemo(
    () => (moment ? currentSnapshot(moment) : null),
    [moment],
  );
  const oldVersions = useMemo(
    () => [...(history?.items ?? [])].sort((a, b) => b.revision - a.revision),
    [history],
  );
  const [selectedRevision, setSelectedRevision] = useState<number | null>(null);
  useEffect(() => {
    if (history && moment)
      setSelectedRevision(
        (previous) =>
          previous ??
          oldVersions.find((item) => item.revision === 1)?.revision ??
          moment.revision,
      );
  }, [history, moment, oldVersions]);
  const selectedOld = oldVersions.find(
    (item) => item.revision === selectedRevision,
  );
  const snapshot =
    selectedRevision === moment?.revision
      ? current
      : (selectedOld?.snapshot ?? current);
  const currentAuthor =
    moment?.lastEditedBy?.label ?? moment?.source.label ?? "我";
  if ((momentState.loading && !moment) || (revisionsState.loading && !history))
    return <Loading />;
  if (momentState.error && !moment)
    return <ErrorState error={momentState.error} retry={momentState.reload} />;
  if (revisionsState.error && !history)
    return (
      <ErrorState error={revisionsState.error} retry={revisionsState.reload} />
    );
  if (!moment || !history || !snapshot || !current) return null;
  const selectedIsCurrent = selectedRevision === moment.revision;
  const author = selectedIsCurrent
    ? currentAuthor
    : (selectedOld?.editedBy.label ?? "我");
  const editedAt = selectedIsCurrent
    ? (moment.lastEditedAt ?? moment.capturedAt)
    : (selectedOld?.editedAt ?? moment.capturedAt);
  const reason = selectedIsCurrent ? null : selectedOld?.reason;
  const changed = new Set(
    SNAPSHOT_FIELDS.filter(
      (field) =>
        JSON.stringify(snapshot[field.key]) !==
        JSON.stringify(current[field.key]),
    ).map((field) => field.key),
  );
  const changeNames =
    selectedOld?.changedFields.map(
      (key) => SNAPSHOT_FIELDS.find((field) => field.key === key)?.title ?? key,
    ) ?? [];
  return (
    <div className="page-shell revisions-page">
      <a
        className="back-link"
        href={`/moments/${moment.id}`}
        onClick={(event) => {
          event.preventDefault();
          navigate(`/moments/${moment.id}`);
        }}
      >
        <Icon name="back" />
        返回记录
      </a>
      <header className="page-header">
        <h1>修订历史</h1>
        <p className="page-description">{moment.title}</p>
      </header>
      <div className="version-layout">
        <aside className="version-list" aria-label="版本列表">
          <button
            type="button"
            aria-pressed={selectedIsCurrent}
            className={`version-button ${selectedIsCurrent ? "selected-version" : ""}`}
            onClick={() => setSelectedRevision(moment.revision)}
          >
            <strong>
              第 {moment.revision} 版{" "}
              <span className="current-version-label">当前版本</span>
            </strong>
            <span>
              {instant(moment.lastEditedAt ?? moment.capturedAt, user.timezone)}{" "}
              · {currentAuthor} 修改
            </span>
            {moment.revisionCount === 0 && <small>最初的记录</small>}
          </button>
          {oldVersions.map((version) => (
            <button
              type="button"
              key={version.revision}
              aria-pressed={selectedRevision === version.revision}
              className={`version-button ${selectedRevision === version.revision ? "selected-version" : ""}`}
              onClick={() => setSelectedRevision(version.revision)}
            >
              <strong>
                第 {version.revision} 版{" "}
                {version.revision === 1 && (
                  <span className="original-version-label">最初的记录</span>
                )}
              </strong>
              <span>
                {instant(version.editedAt, user.timezone)} ·{" "}
                {version.editedBy.label} 更正
              </span>
              {version.changedFields.length > 0 && (
                <small>
                  改了：
                  {version.changedFields
                    .map(
                      (key) =>
                        SNAPSHOT_FIELDS.find((field) => field.key === key)
                          ?.title ?? key,
                    )
                    .join("、")}
                </small>
              )}
              {version.reason && <small>原因：{version.reason}</small>}
            </button>
          ))}
        </aside>
        <main className="revision-snapshot">
          <div className="section-heading">
            <div>
              <h2>第 {selectedRevision} 版</h2>
              <p>
                {instant(editedAt, user.timezone)} · {author}
              </p>
            </div>
            <div className="snapshot-legend">
              <span>
                <i className="changed-swatch" />
                与当前版本不同
              </span>
            </div>
          </div>
          {reason && <p className="revision-reason">原因：{reason}</p>}
          <div className="snapshot-fields">
            {SNAPSHOT_FIELDS.map((field) => {
              const value = normalizeSnapshotValue(
                field.key,
                snapshot[field.key],
                meta,
                user.timezone,
              );
              const currentValue = normalizeSnapshotValue(
                field.key,
                current[field.key],
                meta,
                user.timezone,
              );
              const diff = changed.has(field.key);
              return (
                <section
                  className={`snapshot-field ${diff ? "changed-value" : ""}`}
                  key={field.key}
                >
                  <h3>{field.title}</h3>
                  <p className="narrative">{value}</p>
                  {diff && <small>当前版本：{currentValue}</small>}
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
