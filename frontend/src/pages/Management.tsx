import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  api,
  ApiError,
  dayDiff,
  idempotency,
  instant,
  localDate,
  today,
  type Lesson,
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
  Loading,
  Modal,
  StatusBadge,
  ThenNow,
  label,
  useApi,
  useApp,
} from "../shared";

type LessonList = ResponseOf<"listLessons">;
type TagList = ResponseOf<"listTags">;
type TrashList = ResponseOf<"listTrash">;
type AgentKeyList = ResponseOf<"listAgentKeys">;
type ConnectedApps = ResponseOf<"listConnectedApps">;
type Settings = ResponseOf<"getSettings">;
type AuditPage = ResponseOf<"listAudit">;
type CreatedAgentKey = operationsResponse<"createAgentKey", 201>;
const MAX_LESSON_MOMENTS = 200;

// createAgentKey is the one operation whose success response is 201 and whose
// response contains the one-time secret. Keep the shape derived from the SDK.
type Operations = import("../../../sdk/generated").operations;
type operationsResponse<
  K extends keyof Operations,
  C extends keyof Operations[K]["responses"],
> = Operations[K]["responses"][C] extends {
  content: { "application/json": infer R };
}
  ? R
  : never;

function pageHeader(title: string, description: ReactNode, action?: ReactNode) {
  return (
    <header className="page-header">
      <div className="heading-row">
        <div>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>
        {action}
      </div>
    </header>
  );
}

function useMutation() {
  const { notify, report } = useApp();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>();
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!retryAt) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= retryAt) setRetryAt(0);
    }, 250);
    return () => window.clearInterval(timer);
  }, [retryAt]);
  const retrySeconds = Math.max(0, Math.ceil((retryAt - now) / 1000));
  async function run(
    task: () => Promise<unknown>,
    onError?: (value: unknown) => void,
  ) {
    if (pending || retrySeconds > 0) return false;
    setPending(true);
    setError(undefined);
    try {
      await task();
      return true;
    } catch (value) {
      if (
        value instanceof ApiError &&
        ["RATE_LIMITED", "AUTH_BUSY"].includes(value.code)
      ) {
        const seconds = Math.max(1, value.retryAfter || 1);
        setRetryAt(Date.now() + seconds * 1000);
        notify(`太频繁了，稍等一下，${seconds} 秒后可以再试`);
      } else {
        setError(value);
        report(value);
      }
      onError?.(value);
      return false;
    } finally {
      setPending(false);
    }
  }
  return {
    run,
    pending,
    error,
    retrySeconds,
    clearError: () => setError(undefined),
  };
}

function actionText(action: string) {
  const names: Record<string, string> = {
    "auth.login": "登录",
    "auth.logout": "退出登录",
    "auth.logout_all": "退出所有设备",
    login: "登录",
    logout: "退出登录",
    logoutAll: "退出所有设备",
    changePassword: "修改密码",
    updateSettings: "修改设置",
    exportData: "导出数据",
    "moment.record": "记一笔",
    "moment.edit": "更正记录",
    "moment.archive": "归档",
    "moment.unarchive": "取消归档",
    "moment.trash": "移进回收站",
    "moment.restore": "恢复记录",
    "moment.purge": "彻底删除",
    getMeta: "读取界面配置",
    getMe: "读取账号",
    listMoments: "浏览事件列表",
    createMoment: "新建事件",
    getMoment: "查看事件",
    updateMoment: "更正事件",
    setMomentTags: "整理事件标签",
    createNote: "添加补记",
    deleteNote: "删除补记",
    archiveMoment: "归档事件",
    unarchiveMoment: "取消归档",
    trashMoment: "移进回收站",
    restoreMoment: "恢复事件",
    purgeMoment: "彻底删除事件",
    snoozeMoment: "推迟回看",
    listDueReviews: "查看待回看",
    getInsightsOverview: "查看洞察总览",
    getInsightsDecay: "查看情绪变化",
    getInsightsCalendar: "查看日历洞察",
    "note.create": "添加补记",
    "note.delete": "删除补记",
    "reflection.create": "写复盘",
    "reflection.update": "修改复盘",
    "reflection.delete": "删除复盘",
    createReflection: "写复盘",
    updateReflection: "修改复盘",
    deleteReflection: "删除复盘",
    "lesson.create": "新建经验",
    "lesson.update": "修改经验",
    "lesson.delete": "删除经验",
    "lesson.moments.set": "调整经验关联",
    "tag.rename": "重命名标签",
    "tag.merge": "合并标签",
    "tag.delete": "删除标签",
    listLessons: "浏览经验库",
    getLesson: "查看经验",
    createLesson: "新建经验",
    updateLesson: "修改经验",
    deleteLesson: "删除经验",
    setLessonMoments: "调整经验关联",
    listTags: "浏览标签",
    renameTag: "重命名标签",
    mergeTag: "合并标签",
    deleteTag: "删除标签",
    "agent_key.create": "新建 Agent 密钥",
    "agent_key.revoke": "撤销 Agent 密钥",
    "oauth.authorize": "连接应用",
    "oauth.revoke": "断开应用",
    "oauth.refresh": "刷新令牌",
    listAgentKeys: "查看 Agent 密钥",
    createAgentKey: "新建 Agent 密钥",
    revokeAgentKey: "撤销 Agent 密钥",
    listConnectedApps: "查看已连接应用",
    revokeConnectedApp: "断开应用",
    "auth.password.change": "修改密码",
    "settings.update": "修改设置",
    "export.create": "导出数据",
    get_context: "读取上下文",
    record_moment: "记一笔",
    add_note: "添加补记",
    correct_moment: "更正事件",
    list_due_reviews: "查看待回看",
    search_moments: "搜索事件",
    get_moment: "查看事件",
    list_lessons: "浏览经验库",
    get_insights: "查看洞察",
    add_reflection: "写复盘",
    snooze_review: "推迟回看",
    create_lesson: "新建经验",
  };
  return names[action] ?? action;
}

function Field({
  label: caption,
  children,
  hint,
  className = "",
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  const hintId = useId();
  let hasLabelledControl = false;
  const fieldChildren = Children.map(children, (child) => {
    if (
      hasLabelledControl ||
      !isValidElement(child) ||
      typeof child.type !== "string" ||
      !["input", "select", "textarea"].includes(child.type)
    )
      return child;
    hasLabelledControl = true;
    const props = child.props as { "aria-describedby"?: string };
    const describedBy =
      [props["aria-describedby"], hint ? hintId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
    const control = child as ReactElement<{
      "aria-label"?: string;
      "aria-describedby"?: string;
    }>;
    return cloneElement(control, {
      "aria-label": caption,
      ...(describedBy ? { "aria-describedby": describedBy } : {}),
    });
  });
  return (
    <label className={`form-field ${className}`}>
      <span>{caption}</span>
      {fieldChildren}
      {hint && <small id={hintId}>{hint}</small>}
    </label>
  );
}

function formatMomentDate(
  moment: Pick<
    MomentSummary,
    "happenedOn" | "happenedAt" | "happenedAtPrecision"
  >,
  timezone: string,
) {
  const date = localDate(
    moment.happenedOn,
    moment.happenedAtPrecision === "approx",
  );
  if (moment.happenedAtPrecision !== "exact") return date;
  const time = new Intl.DateTimeFormat("zh-CN", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(moment.happenedAt));
  return `${date} ${time}`;
}

function localDateOfInstant(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (kind: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === kind)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

type PickableMoment = Pick<
  MomentSummary,
  | "id"
  | "title"
  | "happenedAt"
  | "happenedOn"
  | "happenedAtPrecision"
  | "intensity"
  | "latestIntensityNow"
  | "status"
>;

function MomentsPicker({
  selected,
  onChange,
  onClose,
}: {
  selected: PickableMoment[];
  onChange: (items: PickableMoment[]) => void;
  onClose: () => void;
}) {
  const { user, meta } = useApp();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [items, setItems] = useState<MomentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    const params = new URLSearchParams({ limit: "50", sort: "happened_desc" });
    if (query.trim()) params.set("q", query.trim());
    if (cursor) params.set("cursor", cursor);
    api<ResponseOf<"listMoments">>("GET", `/moments?${params.toString()}`)
      .then(
        (result) => {
          if (!active) return;
          setItems((previous) =>
            cursor ? [...previous, ...result.items] : result.items,
          );
          setNextCursor(result.nextCursor);
        },
        (reason) => {
          if (active) setError(reason);
        },
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, cursor, reloadKey]);
  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.id)),
    [selected],
  );
  function toggle(item: MomentSummary, checked: boolean) {
    const pick: PickableMoment = item;
    if (checked)
      onChange(selectedIds.has(item.id) ? selected : [...selected, pick]);
    else onChange(selected.filter((value) => value.id !== item.id));
  }
  return (
    <Modal title="选择关联的事" onClose={onClose}>
      <div className="management-stack">
        <label className="management-search">
          <Icon name="search" />
          <span className="sr-only">搜索事件</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(null);
              setNextCursor(null);
              setItems([]);
            }}
            placeholder="搜事件标题或原话"
          />
        </label>
        <div className="management-note" aria-live="polite">
          已选 {selected.length}/{MAX_LESSON_MOMENTS}{" "}
          件事。搜索结果按发生时间从新到旧排列，向下加载可继续选。
        </div>
        {selected.length > 0 && (
          <div className="selected-moments" aria-label="已选择的事">
            {selected.map((item) => (
              <span className="chip" key={item.id}>
                {item.title}
                <button
                  type="button"
                  aria-label={`移除 ${item.title}`}
                  onClick={() =>
                    onChange(selected.filter((value) => value.id !== item.id))
                  }
                >
                  <Icon name="close" />
                </button>
              </span>
            ))}
          </div>
        )}
        {error ? (
          <ErrorState
            error={error}
            retry={() => {
              setItems([]);
              setReloadKey((value) => value + 1);
            }}
          />
        ) : (
          <ul className="moment-picker-list" aria-label="所有记录">
            {items.map((item) => (
              <li key={item.id}>
                <label className="choice-card moment-choice">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    disabled={
                      !selectedIds.has(item.id) &&
                      selected.length >= MAX_LESSON_MOMENTS
                    }
                    onChange={(event) => toggle(item, event.target.checked)}
                  />
                  <span className="moment-choice-copy">
                    <strong>{item.title}</strong>
                    <small>
                      {formatMomentDate(item, user.timezone)} ·{" "}
                      {label(meta, "scene", item.scene)}
                    </small>
                  </span>
                  <ThenNow
                    then={item.intensity}
                    now={item.latestIntensityNow}
                  />
                  <StatusBadge status={item.status} />
                </label>
              </li>
            ))}
          </ul>
        )}
        {!loading && !error && items.length === 0 && (
          <p className="empty-inline">没有找到记录。</p>
        )}
        <div className="actions">
          <span>{loading ? "正在加载…" : `${items.length} 条记录`}</span>
          {nextCursor && (
            <Button disabled={loading} onClick={() => setCursor(nextCursor)}>
              {loading ? "加载中…" : "加载更多"}
            </Button>
          )}
          <Button tone="primary" onClick={onClose}>
            完成选择
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function LessonEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Lesson;
  onClose: () => void;
  onSaved: (lesson: Lesson) => void;
}) {
  const { notify, meta } = useApp();
  const mutation = useMutation();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [selected, setSelected] = useState<PickableMoment[]>(
    initial?.moments ?? [],
  );
  const [picking, setPicking] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    void mutation.run(async () => {
      let saved: Lesson;
      if (initial) {
        saved = await api<Lesson>(
          "PATCH",
          `/lessons/${encodeURIComponent(initial.id)}`,
          { title: cleanTitle, body },
        );
        const oldIds = initial.moments.map((moment) => moment.id).sort();
        const newIds = selected.map((moment) => moment.id).sort();
        if (oldIds.join(",") !== newIds.join(","))
          saved = await api<Lesson>(
            "PUT",
            `/lessons/${encodeURIComponent(initial.id)}/moments`,
            { momentIds: selected.map((moment) => moment.id) },
          );
      } else {
        saved = await api<Lesson>(
          "POST",
          "/lessons",
          {
            title: cleanTitle,
            body,
            momentIds: selected.map((moment) => moment.id),
          },
          idempotency(),
        );
      }
      onSaved(saved);
      notify(initial ? "经验已保存" : "经验已创建");
    });
  }
  return (
    <>
      <Modal title={initial ? "编辑经验" : "新建经验"} onClose={onClose}>
        <form className="management-stack" onSubmit={submit}>
          <Field label="标题">
            <input
              autoFocus
              maxLength={meta.limits.lessonTitleMax}
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field
            label="经验正文"
            hint={`纯文本保存，换行会保留；最多 ${meta.limits.lessonBodyMax} 字。`}
          >
            <textarea
              rows={8}
              maxLength={meta.limits.lessonBodyMax}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </Field>
          <section className="form-section">
            <div className="section-heading">
              <h3>关联的事</h3>
              <Button onClick={() => setPicking(true)}>
                选择记录 · {selected.length}
              </Button>
            </div>
            {selected.length ? (
              <ul className="lesson-items">
                {selected.map((moment) => (
                  <li className="lesson-item" key={moment.id}>
                    <span>{moment.title}</span>
                    <Button
                      tone="quiet"
                      aria-label={`移除关联 ${moment.title}`}
                      onClick={() =>
                        setSelected((values) =>
                          values.filter((value) => value.id !== moment.id),
                        )
                      }
                    >
                      <Icon name="close" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="management-note">可以暂时不关联，之后再添加。</p>
            )}
          </section>
          <FormError error={mutation.error} />
          {mutation.retrySeconds > 0 && (
            <p className="management-note" role="status">
              太频繁了，请等 {mutation.retrySeconds} 秒后再试。
            </p>
          )}
          <div className="actions">
            <Button onClick={onClose}>取消</Button>
            <Button
              type="submit"
              tone="primary"
              disabled={
                mutation.pending || mutation.retrySeconds > 0 || !title.trim()
              }
            >
              {mutation.pending ? "保存中…" : initial ? "保存经验" : "创建经验"}
            </Button>
          </div>
        </form>
      </Modal>
      {picking && (
        <MomentsPicker
          selected={selected}
          onChange={setSelected}
          onClose={() => setPicking(false)}
        />
      )}
    </>
  );
}

export function LessonsPage({ id }: { id?: string }) {
  const { user, meta, notify, confirm, navigate } = useApp();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(id ?? "");
  const [editorMode, setEditorMode] = useState<"new" | "edit" | null>(null);
  const [relatedOpen, setRelatedOpen] = useState(false);
  const [related, setRelated] = useState<PickableMoment[]>([]);
  const path = `/lessons${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`;
  const list = useApi<LessonList>(path);
  const detail = useApi<Lesson>(
    selectedId ? `/lessons/${encodeURIComponent(selectedId)}` : null,
  );
  const mutation = useMutation();
  const active = detail.data?.id === selectedId ? detail.data : undefined;
  useEffect(() => {
    if (!id) setSelectedId("");
    else setSelectedId(id);
  }, [id]);
  useEffect(() => {
    if (!selectedId && list.data?.items[0])
      setSelectedId(list.data.items[0].id);
  }, [list.data, selectedId]);
  function savedLesson(lesson: Lesson) {
    setEditorMode(null);
    setSelectedId(lesson.id);
    navigate(`/lessons/${encodeURIComponent(lesson.id)}`);
    void list.reload();
  }
  async function removeLesson() {
    if (
      !active ||
      !(await confirm(
        "删除这条经验？",
        "删除后，已经发生的事仍会保留，但不会再关联这条经验。",
        true,
      ))
    )
      return;
    const ok = await mutation.run(() =>
      api<void>("DELETE", `/lessons/${encodeURIComponent(active.id)}`),
    );
    if (ok) {
      setSelectedId("");
      navigate("/lessons");
      void list.reload();
      notify("经验已删除");
    }
  }
  const selectedInList =
    list.data?.items.some((item) => item.id === selectedId) ?? false;
  return (
    <div className="management-stack">
      {pageHeader(
        "经验库",
        "从回看里攒下来的话。一条经验可以关联好几件事。",
        <Button tone="primary" onClick={() => setEditorMode("new")}>
          <Icon name="plus" />
          新建经验
        </Button>,
      )}
      {list.error ? (
        <ErrorState error={list.error} retry={list.reload} />
      ) : list.loading ? (
        <Loading />
      ) : (
        <div
          className={`lesson-layout ${id ? "lesson-detail-route" : "lesson-list-route"}`}
        >
          <aside className="lesson-list" aria-label="经验列表">
            <label className="management-search">
              <Icon name="search" />
              <span className="sr-only">搜索经验</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜经验"
              />
            </label>
            {list.data?.items.length ? (
              <ul>
                {list.data.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="lesson-item"
                      aria-pressed={selectedId === item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        navigate(`/lessons/${encodeURIComponent(item.id)}`);
                      }}
                    >
                      <strong>{item.title}</strong>
                      <span>
                        关联 {item.momentCount} 件事 · {item.author.label} ·{" "}
                        {instant(item.updatedAt, user.timezone)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="还没有经验"
                body="复盘的时候可以顺手写下一条。"
                action={
                  <Button tone="primary" onClick={() => setEditorMode("new")}>
                    新建经验
                  </Button>
                }
              />
            )}
            <span className="management-note">
              共 {list.data?.total ?? 0} 条
            </span>
          </aside>
          {active && (!id || active.id === id) ? (
            <Card className="lesson-detail">
              <div className="heading-row">
                <div>
                  {id && (
                    <Button
                      className="lesson-back"
                      onClick={() => navigate("/lessons")}
                    >
                      <Icon name="back" />
                      返回经验列表
                    </Button>
                  )}
                  <h2>{active.title}</h2>
                  <p className="management-note">
                    {active.author.label} · 更新于{" "}
                    {instant(active.updatedAt, user.timezone)}
                  </p>
                </div>
                <div className="actions">
                  <Button onClick={() => setEditorMode("edit")}>编辑</Button>
                  <Button
                    tone="danger"
                    onClick={() => void removeLesson()}
                    disabled={mutation.pending || mutation.retrySeconds > 0}
                  >
                    删除
                  </Button>
                </div>
              </div>
              {active.author.kind !== "owner" && (
                <p className="management-callout">
                  这条经验由 {active.author.label} 写下。你可以在这里编辑正文。
                </p>
              )}
              <p className="lesson-body">{active.body || "还没有写正文。"}</p>
              <section className="form-section">
                <div className="section-heading">
                  <h3>关联的事 · {active.momentCount}</h3>
                  <Button
                    onClick={() => {
                      setRelated(active.moments);
                      setRelatedOpen(true);
                    }}
                  >
                    管理关联
                  </Button>
                </div>
                {active.moments.length ? (
                  <ul className="lesson-items">
                    {active.moments.map((moment) => (
                      <li className="lesson-item" key={moment.id}>
                        <a
                          className="lesson-moment-link"
                          href={`/moments/${encodeURIComponent(moment.id)}`}
                        >
                          <div className="moment-summary">
                            <span className="mono">
                              {localDate(
                                moment.happenedOn,
                                moment.happenedAtPrecision === "approx",
                              )}
                            </span>
                            <strong>{moment.title}</strong>
                            <ThenNow
                              then={moment.intensity}
                              now={moment.latestIntensityNow}
                            />
                            <StatusBadge status={moment.status} />
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="management-note">这条经验还没有关联事件。</p>
                )}
              </section>
              {mutation.error != null ? (
                <FormError error={mutation.error} />
              ) : null}
              {mutation.retrySeconds > 0 && (
                <p role="status" className="management-note">
                  请等 {mutation.retrySeconds} 秒后再试。
                </p>
              )}
            </Card>
          ) : selectedId && detail.error ? (
            <ErrorState error={detail.error} retry={detail.reload} />
          ) : selectedId && detail.loading ? (
            <Loading />
          ) : !selectedInList && list.data?.items.length ? (
            <Card className="lesson-detail">
              <EmptyState
                title="选择一条经验"
                body="从左侧列表打开它，查看正文和关联的事。"
              />
            </Card>
          ) : null}
        </div>
      )}
      {editorMode && (
        <LessonEditor
          initial={editorMode === "edit" ? active : undefined}
          onClose={() => setEditorMode(null)}
          onSaved={savedLesson}
        />
      )}
      {relatedOpen && active && (
        <MomentsPicker
          selected={related}
          onChange={setRelated}
          onClose={() => {
            setRelatedOpen(false);
            const oldIds = active.moments.map((moment) => moment.id).sort();
            const newIds = related.map((moment) => moment.id).sort();
            if (oldIds.join(",") !== newIds.join(","))
              void mutation.run(async () => {
                await api<Lesson>(
                  "PUT",
                  `/lessons/${encodeURIComponent(active.id)}/moments`,
                  { momentIds: related.map((moment) => moment.id) },
                );
                await detail.reload();
                await list.reload();
                notify("关联已更新");
              });
          }}
        />
      )}
    </div>
  );
}

export function TagsPage() {
  const { confirm, notify, meta } = useApp();
  const tags = useApi<TagList>("/tags");
  const mutation = useMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manualMergeId, setManualMergeId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [conflict, setConflict] = useState<{
    sourceId: string;
    targetId: string;
  } | null>(null);
  const tagRows = tags.data?.items ?? [];
  const targetTag = conflict
    ? tagRows.find((tag) => tag.id === conflict.targetId)
    : undefined;
  async function rename(event: FormEvent, id: string) {
    event.preventDefault();
    const clean = draft.trim().replace(/^#+/, "").trim();
    if (!clean) return;
    const ok = await mutation.run(
      () => api("PATCH", `/tags/${encodeURIComponent(id)}`, { name: clean }),
      (reason) => {
        if (
          reason instanceof ApiError &&
          reason.code === "TAG_EXISTS" &&
          typeof reason.details?.existingTagId === "string"
        )
          setConflict({ sourceId: id, targetId: reason.details.existingTagId });
      },
    );
    if (ok) {
      setEditingId(null);
      setConflict(null);
      setManualMergeId(null);
      await tags.reload();
      notify("标签已重命名");
    }
  }
  async function merge(sourceId: string, intoId: string) {
    const source = tagRows.find((tag) => tag.id === sourceId);
    const target = tagRows.find((tag) => tag.id === intoId);
    if (!source || !target || source.id === target.id) return;
    if (
      !(await confirm(
        `把「${source.name}」合并到「${target.name}」？`,
        `相关事件会改用「${target.name}」标签；原标签会被删除。`,
        true,
      ))
    )
      return;
    const ok = await mutation.run(() =>
      api("POST", `/tags/${encodeURIComponent(sourceId)}/merge`, { intoId }),
    );
    if (ok) {
      setEditingId(null);
      setConflict(null);
      setManualMergeId(null);
      await tags.reload();
      notify("标签已合并");
    }
  }
  async function deleteTag(tag: TagList["items"][number]) {
    if (
      !(await confirm(
        `删除「${tag.name}」标签？`,
        `这会从 ${tag.momentCount} 件事上摘掉这个标签，事件本身不会删除。`,
        true,
      ))
    )
      return;
    const ok = await mutation.run(() =>
      api<void>("DELETE", `/tags/${encodeURIComponent(tag.id)}`),
    );
    if (ok) {
      await tags.reload();
      notify("标签已删除");
    }
  }
  return (
    <div className="management-stack">
      {pageHeader(
        "标签",
        "标签名会自动整理：去掉开头的 #、去掉首尾空格，英文不分大小写。删除标签只会从事件上摘掉它。",
      )}
      {tags.error ? (
        <ErrorState error={tags.error} retry={tags.reload} />
      ) : tags.loading && !tags.data ? (
        <Loading />
      ) : (
        <>
          <Card className="management-stack">
            <ul className="management-list">
              {tagRows.map((tag) => (
                <li className="list-row tag-row" key={tag.id}>
                  {editingId === tag.id ? (
                    <form
                      className="inline-editor"
                      onSubmit={(event) => void rename(event, tag.id)}
                    >
                      <Field label="新标签名">
                        <input
                          autoFocus
                          maxLength={meta.limits.tagMax}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                        />
                      </Field>
                      <Button
                        type="submit"
                        tone="primary"
                        disabled={
                          mutation.pending ||
                          mutation.retrySeconds > 0 ||
                          !draft.trim()
                        }
                      >
                        {mutation.pending ? "保存中…" : "保存"}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          setConflict(null);
                          setManualMergeId(null);
                        }}
                      >
                        取消
                      </Button>
                      {conflict?.sourceId === tag.id && targetTag && (
                        <div className="tag-conflict">
                          <p>
                            已经有叫「{targetTag.name}」的标签（
                            {targetTag.momentCount}{" "}
                            件事）。可以将当前标签合并进去。
                          </p>
                          <Button
                            tone="primary"
                            disabled={
                              mutation.pending || mutation.retrySeconds > 0
                            }
                            onClick={() => void merge(tag.id, targetTag.id)}
                          >
                            合并到「{targetTag.name}」
                          </Button>
                        </div>
                      )}
                    </form>
                  ) : (
                    <>
                      <span className="tag-name">
                        <a
                          className="tag-label-link"
                          href={`/?tag=${encodeURIComponent(tag.name)}`}
                        >
                          {tag.name}
                        </a>
                        <small>{tag.momentCount} 件事</small>
                      </span>
                      <div className="management-row-actions">
                        <Button
                          tone="quiet"
                          onClick={() => {
                            setEditingId(tag.id);
                            setDraft(tag.name);
                            setManualMergeId(null);
                            setConflict(null);
                          }}
                        >
                          重命名
                        </Button>
                        <Button
                          tone="quiet"
                          onClick={() => {
                            setEditingId(null);
                            setManualMergeId(tag.id);
                            setMergeTargetId(
                              tagRows.find((other) => other.id !== tag.id)
                                ?.id ?? "",
                            );
                            setConflict(null);
                          }}
                        >
                          合并到…
                        </Button>
                        <Button
                          tone="danger"
                          onClick={() => void deleteTag(tag)}
                          disabled={
                            mutation.pending || mutation.retrySeconds > 0
                          }
                        >
                          删除
                        </Button>
                      </div>
                    </>
                  )}
                  {manualMergeId === tag.id && (
                    <div className="manual-merge">
                      <Field label="合并到">
                        <select
                          value={mergeTargetId}
                          onChange={(event) =>
                            setMergeTargetId(event.target.value)
                          }
                        >
                          {tagRows
                            .filter((other) => other.id !== tag.id)
                            .map((other) => (
                              <option value={other.id} key={other.id}>
                                {other.name} · {other.momentCount} 件事
                              </option>
                            ))}
                        </select>
                      </Field>
                      <Button
                        tone="primary"
                        disabled={
                          mutation.pending ||
                          mutation.retrySeconds > 0 ||
                          !mergeTargetId
                        }
                        onClick={() => void merge(tag.id, mergeTargetId)}
                      >
                        合并标签
                      </Button>
                      <Button onClick={() => setManualMergeId(null)}>
                        取消
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <p className="management-note">
              共 {tagRows.length} 个标签。一件事最多 {meta.limits.tagsMax}{" "}
              个标签，每个最多 {meta.limits.tagMax} 个字。
            </p>
            {mutation.error != null &&
            !(
              mutation.error instanceof ApiError &&
              mutation.error.code === "TAG_EXISTS"
            ) ? (
              <FormError error={mutation.error} />
            ) : null}
            {mutation.retrySeconds > 0 && (
              <p role="status" className="management-note">
                请等 {mutation.retrySeconds} 秒后再试。
              </p>
            )}
          </Card>
          {tagRows.length === 0 && (
            <EmptyState
              title="还没有标签"
              body="给事件加上标签后，可以在这里统一整理。"
            />
          )}
        </>
      )}
    </div>
  );
}

export function TrashPage() {
  const { user, meta, confirm, notify } = useApp();
  const trash = useApi<TrashList>("/trash");
  const mutation = useMutation();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const rows = trash.data?.items ?? [];
  const selectedRows = rows.filter((row) => selected.has(row.moment.id));
  async function restore(id: string) {
    const ok = await mutation.run(() =>
      api(
        "POST",
        `/moments/${encodeURIComponent(id)}/restore`,
        undefined,
        idempotency(),
      ),
    );
    if (ok) {
      setSelected((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      await trash.reload();
      notify("这件事已恢复");
    }
  }
  async function purgeSelected() {
    if (!selectedRows.length) return;
    if (
      !(await confirm(
        `彻底删除选中的 ${selectedRows.length} 件事？`,
        "删除后，网页和 Agent 都无法再找回。服务器每日备份最多还会保留 14 天。",
        true,
        "彻底删除",
      ))
    )
      return;
    const purgedIds: string[] = [];
    const ok = await mutation.run(async () => {
      for (const row of selectedRows) {
        await api<void>(
          "DELETE",
          `/trash/${encodeURIComponent(row.moment.id)}`,
        );
        purgedIds.push(row.moment.id);
      }
    });
    if (purgedIds.length) {
      setSelected(
        (current) =>
          new Set([...current].filter((id) => !purgedIds.includes(id))),
      );
      await trash.reload();
    }
    if (ok) notify(`已彻底删除 ${selectedRows.length} 件事`);
  }
  function toggleAll(checked: boolean) {
    setSelected(
      checked ? new Set(rows.map((row) => row.moment.id)) : new Set(),
    );
  }
  return (
    <div className="management-stack">
      {pageHeader(
        "回收站",
        `移进来的事会保留 ${meta.review.trashDays} 天，到期自动彻底删除。在那之前可以恢复，补记、复盘和修订记录都会一起回来。`,
        <Button
          tone="danger-solid"
          disabled={
            !selectedRows.length ||
            mutation.pending ||
            mutation.retrySeconds > 0
          }
          onClick={() => void purgeSelected()}
        >
          彻底删除所选 {selectedRows.length ? `（${selectedRows.length}）` : ""}
        </Button>,
      )}
      {trash.error ? (
        <ErrorState error={trash.error} retry={trash.reload} />
      ) : trash.loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="回收站是空的。" />
      ) : (
        <>
          <div className="management-note">
            <label className="select-all">
              <input
                type="checkbox"
                checked={rows.length > 0 && selected.size === rows.length}
                onChange={(event) => toggleAll(event.target.checked)}
              />{" "}
              全选
            </label>
            <span>已选 {selectedRows.length} 件事</span>
          </div>
          <ul className="management-list">
            {rows.map(({ moment, deletedAt, purgeAt }) => {
              const days = dayDiff(
                localDateOfInstant(purgeAt, user.timezone),
                today(user.timezone),
              );
              return (
                <li className="list-row trash-row" key={moment.id}>
                  <input
                    type="checkbox"
                    aria-label={`选择 ${moment.title}`}
                    checked={selected.has(moment.id)}
                    onChange={(event) =>
                      setSelected((current) => {
                        const next = new Set(current);
                        event.target.checked
                          ? next.add(moment.id)
                          : next.delete(moment.id);
                        return next;
                      })
                    }
                  />
                  <div className="trash-copy">
                    <h2>{moment.title}</h2>
                    <p>
                      发生于{" "}
                      {localDate(
                        moment.happenedOn,
                        moment.happenedAtPrecision === "approx",
                      )}{" "}
                      · {instant(deletedAt, user.timezone)} 移进回收站
                    </p>
                  </div>
                  <span
                    className={`trash-deadline ${days <= 7 ? "danger-text" : ""}`}
                  >
                    {days <= 0 ? "即将到期" : `还剩 ${days} 天`}
                  </span>
                  <div className="management-row-actions">
                    <Button
                      disabled={mutation.pending || mutation.retrySeconds > 0}
                      onClick={() => void restore(moment.id)}
                    >
                      {mutation.pending ? "处理中…" : "恢复"}
                    </Button>
                    <Button
                      tone="danger"
                      disabled={mutation.pending || mutation.retrySeconds > 0}
                      onClick={() => {
                        void (async () => {
                          if (
                            await confirm(
                              `彻底删除「${moment.title}」？`,
                              "删除后网页和 Agent 都无法再找回。服务器每日备份最多还会保留 14 天。",
                              true,
                              "彻底删除",
                            )
                          ) {
                            const ok = await mutation.run(() =>
                              api<void>(
                                "DELETE",
                                `/trash/${encodeURIComponent(moment.id)}`,
                              ),
                            );
                            if (ok) {
                              setSelected((current) => {
                                const next = new Set(current);
                                next.delete(moment.id);
                                return next;
                              });
                              await trash.reload();
                              notify("这件事已彻底删除");
                            }
                          }
                        })();
                      }}
                    >
                      彻底删除
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          <Card className="management-callout">
            彻底删除后，网页和 Agent
            都再也找不到这件事。服务器每天的备份里，它最多还会留 14
            天，之后才完全消失。
          </Card>
          {mutation.error != null ? <FormError error={mutation.error} /> : null}
          {mutation.retrySeconds > 0 && (
            <p role="status" className="management-note">
              太频繁了，请等 {mutation.retrySeconds} 秒后再试。
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function AccessPage() {
  const { user, meta, confirm, notify } = useApp();
  const keys = useApi<AgentKeyList>("/agent-keys");
  const apps = useApi<ConnectedApps>("/connected-apps");
  const mutation = useMutation();
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(365);
  const [read, setRead] = useState(true);
  const [write, setWrite] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [secretResult, setSecretResult] = useState<CreatedAgentKey | null>(
    null,
  );
  const activeKeys = (keys.data?.items ?? []).filter(
    (key) => !key.revokedAt && Date.parse(key.expiresAt) > Date.now(),
  );
  const mcpUrl = `${window.location.origin}/mcp`;
  async function createKey(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || (!read && !write)) return;
    setPasswordError(false);
    const ok = await mutation.run(
      async () => {
        const created = await api<CreatedAgentKey>("POST", "/agent-keys", {
          label: name.trim(),
          scopes: [...(read ? ["read"] : []), ...(write ? ["write"] : [])],
          expiresInDays,
          currentPassword,
        });
        setSecretResult(created);
        setCurrentPassword("");
        setName("");
        setFormOpen(false);
        await keys.reload();
        return created;
      },
      (reason) => {
        if (reason instanceof ApiError && reason.code === "PASSWORD_INCORRECT")
          setPasswordError(true);
      },
    );
    if (ok) notify("Agent 密钥已生成，请现在复制保存");
  }
  async function revokeKey(key: AgentKeyList["items"][number]) {
    if (
      !(await confirm(
        `撤销「${key.label}」？`,
        "撤销会立即停止这把密钥的访问，之后无法恢复。",
        true,
      ))
    )
      return;
    const ok = await mutation.run(() =>
      api("DELETE", `/agent-keys/${encodeURIComponent(key.id)}`),
    );
    if (ok) {
      await keys.reload();
      notify("Agent 密钥已撤销");
    }
  }
  async function revokeApp(app: ConnectedApps["items"][number]) {
    if (
      !(await confirm(
        `断开 ${app.clientName}？`,
        `将撤销 ${app.clientHost} 的授权及其令牌。之后需要在客户端重新连接。`,
        true,
      ))
    )
      return;
    const ok = await mutation.run(() =>
      api<void>("DELETE", `/connected-apps/${encodeURIComponent(app.id)}`),
    );
    if (ok) {
      await apps.reload();
      notify("应用已断开");
    }
  }
  async function copy(value: string, labelText: string) {
    try {
      await navigator.clipboard.writeText(value);
      notify(`${labelText}已复制`);
    } catch {
      notify(`复制失败，请手动选择并复制${labelText}`);
    }
  }
  return (
    <div className="management-stack">
      {pageHeader(
        "接入管理",
        "新的事只能由 Agent 记下来。这里管理哪些 Agent 能连上你的 NBD，以及它们能做什么。",
      )}
      <Card tone="deep" className="management-stack deep">
        <h2 className="access-eyebrow">MCP 地址</h2>
        <div className="management-secret">
          <code className="mono">{mcpUrl}</code>
          <Button onClick={() => void copy(mcpUrl, "MCP 地址")}>
            复制地址
          </Button>
        </div>
        <p>
          在客户端添加自定义连接器，填上面的地址，然后按提示完成授权。授权时可以取消「读取历史」，只让它帮你记。
        </p>
        <p>
          也可以在下面新建一把 Agent 密钥，作为 Authorization
          请求头写进客户端配置。
        </p>
      </Card>
      <section
        className="management-stack"
        aria-labelledby="connected-apps-heading"
      >
        <div className="section-heading">
          <h2 id="connected-apps-heading">已连接的应用</h2>
        </div>
        {apps.error ? (
          <ErrorState error={apps.error} retry={apps.reload} />
        ) : apps.loading && !apps.data ? (
          <Loading />
        ) : apps.data?.items.length ? (
          <ul className="management-list">
            {apps.data.items.map((app) => (
              <li className="list-row" key={app.id}>
                <div className="access-main">
                  <strong title={app.clientName}>
                    {app.clientName.length > 40
                      ? `${app.clientName.slice(0, 40)}…`
                      : app.clientName}{" "}
                    <span>（{app.clientHost}）</span>
                  </strong>
                  <small>
                    连接于 {instant(app.createdAt, user.timezone)} · 最近使用{" "}
                    {instant(app.lastUsedAt, user.timezone)} · 权限{" "}
                    {app.scopes
                      .map((scope) => label(meta, "scope", scope))
                      .join("、")}
                  </small>
                  <small>
                    {app.refreshExpiresAt
                      ? `授权有效到 ${instant(app.refreshExpiresAt, user.timezone)}，到期后需重新连接`
                      : "授权已到期"}
                  </small>
                </div>
                <Button
                  tone="danger"
                  disabled={mutation.pending || mutation.retrySeconds > 0}
                  onClick={() => void revokeApp(app)}
                >
                  断开
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="还没有连接任何应用。" />
        )}
      </section>
      <section
        className="management-stack"
        aria-labelledby="agent-keys-heading"
      >
        <div className="section-heading">
          <div>
            <h2 id="agent-keys-heading">Agent 密钥</h2>
            <p className="management-note">
              有效 {activeKeys.length} 把，最多 20 把
            </p>
          </div>
          <Button
            tone="primary"
            disabled={activeKeys.length >= 20}
            aria-expanded={formOpen}
            onClick={() => setFormOpen((value) => !value)}
          >
            <Icon name="plus" />
            新建密钥
          </Button>
        </div>
        {activeKeys.length >= 20 && (
          <p className="management-callout" role="status">
            已经有 20 把有效密钥。先撤销不再使用的密钥，再新建。
          </p>
        )}
        {formOpen && (
          <Card className="form-section">
            <form className="management-stack" onSubmit={createKey}>
              <div className="choice-grid">
                <Field label="名称" hint="写清楚设备和客户端，以后撤销时好认。">
                  <input
                    maxLength={40}
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="比如：Claude Code（MacBook）"
                  />
                </Field>
                <Field label="有效期">
                  <select
                    value={expiresInDays}
                    onChange={(event) =>
                      setExpiresInDays(Number(event.target.value))
                    }
                  >
                    <option value={30}>30 天</option>
                    <option value={90}>90 天</option>
                    <option value={180}>180 天</option>
                    <option value={365}>365 天</option>
                  </select>
                </Field>
              </div>
              <fieldset className="form-section">
                <legend>它能做什么</legend>
                <div className="choice-grid">
                  <label className="choice-card">
                    <input
                      type="checkbox"
                      checked={write}
                      onChange={(event) => setWrite(event.target.checked)}
                    />
                    <span>
                      <strong>记录与补记</strong>
                      <small>帮你记一笔、在 24 小时内更正、补记</small>
                    </span>
                  </label>
                  <label className="choice-card">
                    <input
                      type="checkbox"
                      checked={read}
                      onChange={(event) => setRead(event.target.checked)}
                    />
                    <span>
                      <strong>读取历史</strong>
                      <small>翻看和搜索以前的记录，陪你回看</small>
                    </span>
                  </label>
                </div>
                <p className="management-callout" aria-live="polite">
                  {!read && write
                    ? "只写：Agent 能帮你记、能补记，但读不到以前的任何记录。"
                    : !read && !write
                      ? "至少选一项权限。"
                      : "可单独选择读取历史和记录与补记权限。"}
                </p>
              </fieldset>
              <Field
                label="再输一次当前密码"
                hint="防止有人拿到你的登录状态后，悄悄换出一把长期密钥。"
              >
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={passwordError || undefined}
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setPasswordError(false);
                  }}
                />
                {passwordError && <span className="field-error">密码不对</span>}
              </Field>
              {mutation.error != null &&
              !(
                mutation.error instanceof ApiError &&
                mutation.error.code === "PASSWORD_INCORRECT"
              ) ? (
                <FormError error={mutation.error} />
              ) : null}
              {mutation.retrySeconds > 0 && (
                <p role="status" className="management-note">
                  太频繁了，请等 {mutation.retrySeconds} 秒后再试。
                </p>
              )}
              <div className="actions">
                <Button onClick={() => setFormOpen(false)}>取消</Button>
                <Button
                  type="submit"
                  tone="primary"
                  disabled={
                    mutation.pending ||
                    mutation.retrySeconds > 0 ||
                    (!read && !write) ||
                    activeKeys.length >= 20
                  }
                >
                  {mutation.pending ? "生成中…" : "生成密钥"}
                </Button>
              </div>
            </form>
          </Card>
        )}
        {keys.error ? (
          <ErrorState error={keys.error} retry={keys.reload} />
        ) : keys.loading && !keys.data ? (
          <Loading />
        ) : keys.data?.items.length ? (
          <ul className="management-list key-list">
            {keys.data.items.map((key) => {
              const active =
                !key.revokedAt && Date.parse(key.expiresAt) > Date.now();
              return (
                <li
                  className={`list-row ${active ? "" : "inactive-row"}`}
                  key={key.id}
                >
                  <div className="access-main">
                    <strong>{key.label}</strong>
                    <code className="mono">{key.prefix}…</code>
                  </div>
                  <span>
                    {key.scopes
                      .map((scope) => label(meta, "scope", scope))
                      .join("、")}
                  </span>
                  <small>
                    创建于 {instant(key.createdAt, user.timezone)} ·{" "}
                    {key.lastUsedAt
                      ? `最近使用 ${instant(key.lastUsedAt, user.timezone)}`
                      : "尚未使用"}{" "}
                    · 有效至 {instant(key.expiresAt, user.timezone)}
                  </small>
                  {active ? (
                    <Button
                      tone="danger"
                      disabled={mutation.pending || mutation.retrySeconds > 0}
                      onClick={() => void revokeKey(key)}
                    >
                      撤销
                    </Button>
                  ) : (
                    <span className="management-note">
                      {key.revokedAt ? "已撤销" : "已过期"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="还没有 Agent 密钥。" />
        )}
      </section>
      {mutation.error != null && !formOpen ? (
        <FormError error={mutation.error} />
      ) : null}
      {mutation.retrySeconds > 0 && (
        <p role="status" className="management-note">
          太频繁了，请等 {mutation.retrySeconds} 秒后再试。
        </p>
      )}
      {secretResult && (
        <Modal
          title="密钥已生成"
          locked
          onClose={() => {
            setSecretResult(null);
          }}
        >
          <div className="management-stack">
            <p className="management-callout">
              这把密钥只显示这一次。请现在复制并妥善保存；关闭后就再也看不到完整值。
            </p>
            <Field label="完整密钥">
              <textarea
                className="secret-value mono"
                readOnly
                rows={3}
                value={secretResult.secret}
              />
            </Field>
            <Field label="MCP 地址">
              <input className="mono" readOnly value={secretResult.mcpUrl} />
            </Field>
            <div className="actions">
              <Button
                onClick={() => void copy(secretResult.mcpUrl, "MCP 地址")}
              >
                复制地址
              </Button>
              <Button
                tone="primary"
                onClick={() => void copy(secretResult.secret, "密钥")}
              >
                复制密钥
              </Button>
              <Button onClick={() => setSecretResult(null)}>
                我已保存，关闭
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function SettingsPage() {
  const app = useApp();
  const settings = useApi<Settings>("/settings");
  const mutation = useMutation();
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [weekStartsOn, setWeekStartsOn] = useState(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const zones = useMemo(() => {
    const supported =
      typeof Intl.supportedValuesOf === "function"
        ? Intl.supportedValuesOf("timeZone")
        : [];
    if (timezone && !supported.includes(timezone))
      return [timezone, ...supported];
    return supported;
  }, [timezone]);
  useEffect(() => {
    if (!settings.data) return;
    setDisplayName(settings.data.displayName);
    setTimezone(settings.data.timezone);
    setWeekStartsOn(settings.data.weekStartsOn);
  }, [settings.data]);
  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    const ok = await mutation.run(async () => {
      const saved = await api<Settings>("PATCH", "/settings", {
        displayName: displayName.trim(),
        timezone,
        weekStartsOn,
      });
      setDisplayName(saved.displayName);
      setTimezone(saved.timezone);
      setWeekStartsOn(saved.weekStartsOn);
      await app.refreshUser();
      await settings.reload();
    });
    if (ok) app.notify("设置已保存");
  }
  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(false);
    if (
      newPassword.length < Math.max(12, app.meta.limits.passwordMin) ||
      newPassword !== confirmPassword
    )
      return;
    const ok = await mutation.run(
      () => api("PUT", "/auth/password", { currentPassword, newPassword }),
      (reason) => {
        if (reason instanceof ApiError && reason.code === "PASSWORD_INCORRECT")
          setPasswordError(true);
      },
    );
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      app.notify("密码已修改，其他设备已退出");
      await app.refreshUser();
    }
  }
  async function logout(all: boolean) {
    const accepted = await app.confirm(
      all ? "退出所有设备？" : "退出登录？",
      all ? "所有设备的登录都会退出。" : "你将离开这个账号。",
      all,
    );
    if (!accepted) return;
    const ok = await mutation.run(() =>
      api("POST", all ? "/auth/logout-all" : "/auth/logout"),
    );
    if (ok) {
      app.notify(all ? "已退出所有设备" : "已退出登录");
      window.dispatchEvent(new Event("nbd-auth-required"));
      app.navigate("/login");
      void app.refreshUser().catch(() => undefined);
    }
  }
  async function downloadExport() {
    await mutation.run(async () => {
      const data = await api<ResponseOf<"exportData">>("GET", "/export");
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2) + "\n"], {
          type: "application/json",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `nbd-export-${today(app.user.timezone)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      app.notify("导出文件已下载");
    });
  }
  return (
    <div className="management-stack">
      {pageHeader("设置", "管理显示名称、时区、账号安全与数据导出。")}
      {settings.error ? (
        <ErrorState error={settings.error} retry={settings.reload} />
      ) : settings.loading && !settings.data ? (
        <Loading />
      ) : (
        <>
          <Card className="settings-card">
            <div>
              <h2>个人</h2>
              <p>
                改时区只影响「今天」怎么算，比如日历和「几天前」。已经记下的日期不会被重算。
              </p>
            </div>
            <form
              className="management-stack"
              onSubmit={(event) => void saveSettings(event)}
            >
              <Field label="显示名称">
                <input
                  maxLength={24}
                  required
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </Field>
              <Field label="时区" hint="只提供浏览器支持的 IANA 时区。">
                <select
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                >
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </Field>
              <fieldset className="week-choice">
                <legend>日历每周从哪天开始</legend>
                <div className="choice-grid">
                  {[
                    [1, "周一"],
                    [0, "周日"],
                  ].map(([value, text]) => (
                    <label className="choice-card" key={String(value)}>
                      <input
                        type="radio"
                        name="weekStartsOn"
                        checked={weekStartsOn === value}
                        onChange={() => setWeekStartsOn(Number(value))}
                      />
                      {text}
                    </label>
                  ))}
                </div>
              </fieldset>
              <FormError error={mutation.error} />
              <div className="actions">
                <Button
                  type="submit"
                  tone="primary"
                  disabled={mutation.pending || mutation.retrySeconds > 0}
                >
                  {mutation.pending ? "保存中…" : "保存设置"}
                </Button>
              </div>
            </form>
          </Card>
          <Card className="settings-card">
            <div>
              <h2>修改密码</h2>
              <p>改完以后，其他设备上的登录会全部退出。</p>
            </div>
            <form
              className="management-stack"
              onSubmit={(event) => void savePassword(event)}
            >
              <Field label="当前密码">
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={passwordError || undefined}
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setPasswordError(false);
                  }}
                />
                {passwordError && <span className="field-error">密码不对</span>}
              </Field>
              <Field
                label="新密码"
                hint={`至少 ${Math.max(12, app.meta.limits.passwordMin)} 位。`}
              >
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={Math.max(12, app.meta.limits.passwordMin)}
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </Field>
              <Field label="再输一次新密码">
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-invalid={
                    Boolean(
                      confirmPassword && newPassword !== confirmPassword,
                    ) || undefined
                  }
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="field-error">两次输入的新密码不一致</span>
                )}
              </Field>
              {mutation.error != null &&
              !(
                mutation.error instanceof ApiError &&
                mutation.error.code === "PASSWORD_INCORRECT"
              ) ? (
                <FormError error={mutation.error} />
              ) : null}
              <div className="actions">
                <Button
                  type="submit"
                  tone="primary"
                  disabled={
                    mutation.pending ||
                    mutation.retrySeconds > 0 ||
                    newPassword.length < 12 ||
                    newPassword !== confirmPassword
                  }
                >
                  {mutation.pending ? "保存中…" : "修改密码"}
                </Button>
              </div>
            </form>
          </Card>
          <Card className="settings-card">
            <div>
              <h2>导出数据</h2>
              <p>
                下载完整 JSON
                文件，包含全部事件（包括回收站里的）、修订记录、补记、复盘、经验和标签，适合自己备份。
              </p>
            </div>
            <div className="management-stack">
              <Button
                disabled={mutation.pending || mutation.retrySeconds > 0}
                onClick={() => void downloadExport()}
              >
                下载导出文件
              </Button>
              <small>文件里是你最私密的记录，保存好，不要随手转发。</small>
            </div>
          </Card>
          <Card className="settings-card">
            <div>
              <h2>登录</h2>
              <p>一台设备 30 天没打开，会自动退出。</p>
            </div>
            <div className="management-row-actions">
              <Button
                onClick={() => void logout(false)}
                disabled={mutation.pending || mutation.retrySeconds > 0}
              >
                退出登录
              </Button>
              <Button
                tone="danger"
                onClick={() => void logout(true)}
                disabled={mutation.pending || mutation.retrySeconds > 0}
              >
                退出所有设备
              </Button>
            </div>
          </Card>
          <p className="management-note">
            NBD {app.meta.version} · API {app.meta.apiVersion} ·{" "}
            {app.meta.features.reviewScheduling
              ? "回看提醒已开启"
              : "回看提醒未开启，想起来时可以随时手动复盘"}
          </p>
          {mutation.retrySeconds > 0 && (
            <p role="status" className="management-note">
              太频繁了，请等 {mutation.retrySeconds} 秒后再试。
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function ActivityPage() {
  const { user } = useApp();
  const [channel, setChannel] = useState<
    "all" | "web" | "mcp" | "oauth" | "cli" | "system"
  >("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [page, setPage] = useState<AuditPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    const params = new URLSearchParams({ limit: "50" });
    if (channel !== "all") params.set("channel", channel);
    if (cursor) params.set("cursor", cursor);
    api<AuditPage>("GET", `/audit?${params.toString()}`)
      .then(
        (result) => {
          if (!active) return;
          setPage((previous) =>
            cursor && previous
              ? { ...result, items: [...previous.items, ...result.items] }
              : result,
          );
          setNextCursor(result.nextCursor);
        },
        (reason) => {
          if (active) setError(reason);
        },
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [channel, cursor, reloadKey]);
  function chooseChannel(value: typeof channel) {
    setChannel(value);
    setCursor(null);
    setNextCursor(null);
    setPage(null);
  }
  const channels: [typeof channel, string][] = [
    ["all", "全部"],
    ["web", "网页"],
    ["mcp", "MCP"],
    ["oauth", "OAuth"],
    ["cli", "命令行"],
    ["system", "系统"],
  ];
  const channelNames: Record<string, string> = {
    web: "网页",
    mcp: "MCP",
    oauth: "OAuth",
    cli: "命令行",
    system: "系统",
  };
  return (
    <div className="management-stack">
      {pageHeader(
        "操作记录",
        "只记谁、从哪、做了什么、结果怎样，不含任何正文。用来确认有没有陌生的访问。",
      )}
      <div className="management-filters" role="group" aria-label="按渠道筛选">
        {channels.map(([value, text]) => (
          <button
            key={value}
            type="button"
            className={`chip ${channel === value ? "chip-selected" : ""}`}
            aria-pressed={channel === value}
            onClick={() => chooseChannel(value)}
          >
            {text}
          </button>
        ))}
      </div>
      {error ? (
        <ErrorState
          error={error}
          retry={() => setReloadKey((value) => value + 1)}
        />
      ) : (
        <section className="management-table" aria-label="操作记录">
          <div className="list-head" aria-hidden="true">
            <span>时间</span>
            <span>谁</span>
            <span>渠道</span>
            <span>做了什么</span>
            <span>结果</span>
          </div>
          {page?.items.length ? (
            <ul className="management-list">
              {page.items.map((row) => (
                <li
                  className={`list-row audit-row ${row.status === "error" ? "audit-error" : ""}`}
                  key={row.id}
                >
                  <time>{instant(row.at, user.timezone)}</time>
                  <span>{row.actor.label}</span>
                  <span>
                    <span className="chip">
                      {channelNames[row.channel] ?? row.channel}
                    </span>
                  </span>
                  <span className="audit-action">
                    <span>{actionText(row.action)}</span>
                    <code className="mono">{row.action}</code>
                  </span>
                  <span className={`audit-status audit-${row.status}`}>
                    {row.status === "error"
                      ? "失败"
                      : row.status === "running"
                        ? "进行中"
                        : "成功"}
                    {row.errorCode && (
                      <code className="mono">{row.errorCode}</code>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            !loading && <p className="empty-inline">这个渠道下还没有记录。</p>
          )}
          {loading && !page && <Loading />}
        </section>
      )}
      {page && (
        <div className="pager">
          <span>共 {page.total} 条</span>
          {nextCursor && (
            <Button disabled={loading} onClick={() => setCursor(nextCursor)}>
              {loading ? "加载中…" : "加载更早的记录"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
