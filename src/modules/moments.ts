import { randomUUID } from "node:crypto";
import { insert, update, type Db, type Row } from "../db/index.js";
import type { Config } from "../config.js";
import type { Principal } from "./principal.js";
import { fail } from "../errors.js";
import { DAY, iso, todayIn, parseHappened, daysBetween } from "../time.js";
import { contentFingerprint } from "../domain/fingerprint.js";
import { momentStatus, statusSql } from "../domain/status.js";
import { normalizeTag } from "../domain/tags.js";
import { computeNextReviewOn } from "../domain/schedule.js";

const captureColumns: Record<string, string> = {
  title: "title",
  narrative: "narrative",
  agentSummary: "agent_summary",
  scene: "scene",
  intensity: "intensity",
  severity: "severity",
  fearedOutcome: "feared_outcome",
  outcomeKnownBy: "outcome_known_by",
  thoughts: "thoughts",
  bodySignals: "body_signals",
  immediateResponse: "immediate_response",
};
export const actor = (row: Row, prefix = "author") => ({
  kind: row[prefix + "_kind"],
  id: row[prefix + "_id"] ?? null,
  label: row[prefix + "_label"],
});
export class MomentService {
  constructor(
    public db: Db,
    public config: Config,
  ) {}
  user(p: Principal): Row {
    return this.db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(p.userId) as Row;
  }
  today(p: Principal) {
    return todayIn(this.user(p).timezone, this.config.now());
  }
  owner(p: Principal) {
    if (!["owner", "system"].includes(p.kind))
      fail(403, "FORBIDDEN", "此操作只能由所有者执行");
  }
  read(p: Principal) {
    if (!p.scopes.includes("read"))
      fail(403, "INSUFFICIENT_SCOPE", "需要读取历史权限");
  }
  write(p: Principal) {
    if (!p.scopes.includes("write"))
      fail(403, "INSUFFICIENT_SCOPE", "需要写入权限");
  }
  row(p: Principal, id: string, mutable = false): Row {
    const row = this.db
      .prepare("SELECT * FROM moments WHERE id=? AND user_id=?")
      .get(id, p.userId) as Row | undefined;
    if (
      !row ||
      (!p.scopes.includes("read") &&
        (row.source_id !== p.id || row.source_kind !== p.kind))
    )
      fail(404, "MOMENT_NOT_FOUND", "找不到这件事");
    if (mutable && row.deleted_at !== null)
      fail(409, "MOMENT_IN_TRASH", "这件事在回收站中，请先在网页恢复");
    return row;
  }
  status(p: Principal, m: Row) {
    return momentStatus(
      m as Parameters<typeof momentStatus>[0],
      this.config.now(),
      this.today(p),
    );
  }
  snapshot(m: Row): Row {
    const result: Row = {};
    for (const [k, col] of Object.entries(captureColumns)) result[k] = m[col];
    return {
      ...result,
      happenedAt: iso(m.happened_at),
      happenedOn: m.happened_on,
      happenedAtPrecision: m.happened_precision,
      emotions: JSON.parse(m.emotions_json),
      people: JSON.parse(m.people_json),
    };
  }
  tags(p: Principal, id: string): string[] {
    return (
      this.db
        .prepare(
          "SELECT t.name FROM tags t JOIN moment_tags mt ON mt.tag_id=t.id WHERE mt.moment_id=? AND t.user_id=? ORDER BY t.name",
        )
        .all(id, p.userId) as Row[]
    ).map((x) => x.name);
  }
  summary(p: Principal, m: Row): Row {
    const count = (table: string) =>
      (
        this.db
          .prepare(`SELECT count(*) AS n FROM ${table} WHERE moment_id=?`)
          .get(m.id) as Row
      ).n;
    return {
      id: m.id,
      title: m.title,
      happenedAt: iso(m.happened_at),
      happenedOn: m.happened_on,
      happenedAtPrecision: m.happened_precision,
      capturedAt: iso(m.captured_at),
      scene: m.scene,
      emotions: JSON.parse(m.emotions_json),
      intensity: m.intensity,
      severity: m.severity,
      latestIntensityNow: m.latest_intensity_now,
      latestResolution: m.latest_resolution,
      status: this.status(p, m),
      nextReviewOn: m.next_review_on,
      tags: this.tags(p, m.id),
      noteCount: count("moment_notes"),
      reflectionCount: m.reflection_count,
      lessonCount: count("lesson_moments"),
      hasFear: !!m.feared_outcome,
      source: actor(m, "source"),
      excerpt: [...m.narrative].slice(0, 120).join(""),
    };
  }
  noteDto(n: Row) {
    return {
      id: n.id,
      momentId: n.moment_id,
      body: n.body,
      author: actor(n),
      createdAt: iso(n.created_at),
    };
  }
  reflectionDto(r: Row, m: Row): Row {
    return {
      id: r.id,
      momentId: r.moment_id,
      intensityNow: r.intensity_now,
      severityNow: r.severity_now,
      fearCameTrue: r.fear_came_true,
      whatHappened: r.what_happened,
      perspective: r.perspective,
      thinkingTraps: JSON.parse(r.thinking_traps_json),
      resolution: r.resolution,
      reflectedOn: r.reflected_on,
      daysSinceHappened: Math.max(
        0,
        daysBetween(m.happened_on, r.reflected_on),
      ),
      lessonIds: (
        this.db
          .prepare(
            "SELECT lesson_id FROM reflection_lessons WHERE reflection_id=?",
          )
          .all(r.id) as Row[]
      ).map((x) => x.lesson_id),
      author: actor(r),
      createdAt: iso(r.created_at),
      updatedAt: iso(r.updated_at),
    };
  }
  detail(p: Principal, id: string): Row {
    this.read(p);
    const m = this.row(p, id),
      refs = this.db
        .prepare(
          "SELECT * FROM reflections WHERE moment_id=? AND user_id=? ORDER BY created_at,id",
        )
        .all(id, p.userId) as Row[];
    return {
      ...this.summary(p, m),
      ...this.snapshot(m),
      revision: m.revision,
      revisionCount: m.revision - 1,
      editableUntil: iso(m.editable_until),
      lastEditedAt: iso(m.last_edited_at),
      lastEditedBy:
        m.last_edited_at === null ? null : actor(m, "last_edited_by"),
      snoozedUntil: m.snoozed_until,
      reviewStep: { done: 0, total: 0 },
      archivedAt: iso(m.archived_at),
      deletedAt: iso(m.deleted_at),
      purgeAt: iso(
        m.deleted_at === null
          ? null
          : m.deleted_at + this.config.trashDays * DAY,
      ),
      notes: (
        this.db
          .prepare(
            "SELECT * FROM moment_notes WHERE moment_id=? AND user_id=? ORDER BY created_at,id",
          )
          .all(id, p.userId) as Row[]
      ).map((n) => this.noteDto(n)),
      reflections: refs.map((r) => this.reflectionDto(r, m)),
      lessons: this.db
        .prepare(
          "SELECT l.id,l.title FROM lessons l JOIN lesson_moments lm ON lm.lesson_id=l.id WHERE lm.moment_id=? AND l.user_id=? ORDER BY l.title",
        )
        .all(id, p.userId),
      intensitySeries: [
        {
          on: m.captured_on,
          dayOffset: Math.max(0, daysBetween(m.happened_on, m.captured_on)),
          intensity: m.intensity,
          kind: "capture",
          reflectionId: null,
        },
        ...refs.map((r) => ({
          on: r.reflected_on,
          dayOffset: Math.max(0, daysBetween(m.happened_on, r.reflected_on)),
          intensity: r.intensity_now,
          kind: "reflection",
          reflectionId: r.id,
        })),
      ],
      webUrl: `${this.config.publicOrigin}/moments/${id}`,
    };
  }
  validateEmotions(emotions: Row[]) {
    if (new Set(emotions.map((x) => x.key)).size !== emotions.length)
      fail(400, "INVALID_INPUT", "同一种情绪不能重复");
  }
  record(p: Principal, input: Row): Row {
    this.write(p);
    if (p.kind === "owner") fail(403, "FORBIDDEN", "新记录只能通过 Agent 创建");
    this.validateEmotions(input.emotions);
    const now = this.config.now(),
      u = this.user(p),
      time = parseHappened(
        input.happenedAt,
        u.timezone,
        now,
        input.happenedAtPrecision,
      ),
      fp = contentFingerprint(input.narrative, time.on);
    return this.db
      .transaction(() => {
        const found = this.db
          .prepare(
            "SELECT * FROM moments WHERE user_id=? AND source_id IS ? AND source_kind=? AND dedupe_fingerprint=? AND captured_at>? AND deleted_at IS NULL ORDER BY captured_at DESC LIMIT 1",
          )
          .get(p.userId, p.id, p.kind, fp, now - DAY) as Row | undefined;
        if (found) return this.recordResult(p, found, true);
        const row: Row = {
          id: randomUUID(),
          user_id: p.userId,
          happened_at: time.at,
          happened_on: time.on,
          happened_precision: time.precision,
          emotions_json: JSON.stringify(
            input.emotions.map((x: Row) => ({
              key: x.key,
              intensity: x.intensity ?? null,
            })),
          ),
          people_json: JSON.stringify(input.people ?? []),
          captured_at: now,
          captured_on: todayIn(u.timezone, now),
          editable_until: now + this.config.freezeHours * 3600000,
          source_kind: p.kind,
          source_id: p.id,
          source_label: p.label,
          dedupe_fingerprint: fp,
          created_at: now,
          updated_at: now,
        };
        for (const [key, column] of Object.entries(captureColumns))
          row[column] = input[key] ?? null;
        row.next_review_on = computeNextReviewOn({
          capturedOn: row.captured_on,
          scheduleDays: this.config.scheduleDays,
          intensity: row.intensity,
          reflections: [],
          snoozedUntil: null,
          outcomeKnownBy: row.outcome_known_by,
        });
        insert(this.db, "moments", row);
        this.setTags(p, row.id, input.tags ?? [], true);
        this.reindex(p, row.id);
        return this.recordResult(p, this.row(p, row.id), false);
      })
      .immediate();
  }
  recordResult(p: Principal, m: Row, replayed: boolean): Row {
    return {
      moment: {
        id: m.id,
        revision: m.revision,
        status: this.status(p, m),
        capturedAt: iso(m.captured_at),
        happenedOn: m.happened_on,
        editableUntil: iso(m.editable_until),
        nextReviewOn: m.next_review_on,
        tags: p.scopes.includes("read") ? this.tags(p, m.id) : [],
        webUrl: `${this.config.publicOrigin}/moments/${m.id}`,
      },
      replayed,
    };
  }
  patch(p: Principal, id: string, input: Row): Row {
    this.write(p);
    return this.db
      .transaction(() => {
        const m = this.row(p, id, true);
        if (
          p.kind !== "owner" &&
          p.kind !== "system" &&
          this.config.now() >= m.editable_until
        )
          fail(409, "MOMENT_FROZEN", "记录已冻结，请用 add_note 补充", {
            editableUntil: iso(m.editable_until),
            suggestedTool: "add_note",
          });
        if (input.expectedRevision !== m.revision)
          fail(409, "MOMENT_CONFLICT", "这件事刚被修改过，请刷新后再改", {
            currentRevision: m.revision,
          });
        const snapshot = this.snapshot(m),
          fields = Object.keys(input).filter(
            (k) =>
              !["expectedRevision", "reason", "clientRequestId"].includes(k),
          );
        if (!fields.length) fail(400, "EMPTY_PATCH", "请提供要修改的字段");
        if (input.emotions) this.validateEmotions(input.emotions);
        const row: Row = {};
        for (const [key, column] of Object.entries(captureColumns))
          if (key in input) row[column] = input[key];
        if ("emotions" in input)
          row.emotions_json = JSON.stringify(
            input.emotions.map((x: Row) => ({
              key: x.key,
              intensity: x.intensity ?? null,
            })),
          );
        if ("people" in input) row.people_json = JSON.stringify(input.people);
        if (input.happenedAt) {
          const t = parseHappened(
            input.happenedAt,
            this.user(p).timezone,
            this.config.now(),
            input.happenedAtPrecision ?? m.happened_precision,
          );
          row.happened_at = t.at;
          row.happened_on = t.on;
          row.happened_precision = t.precision;
        } else if (input.happenedAtPrecision)
          row.happened_precision = input.happenedAtPrecision;
        const nextSnapshot = this.snapshot({ ...m, ...row });
        const changed = Object.keys(snapshot).filter(
          (k) =>
            JSON.stringify(snapshot[k]) !==
            JSON.stringify(nextSnapshot[k]),
        );
        if (!changed.length)
          return {
            momentId: id,
            revision: m.revision,
            changedFields: [],
            editableUntil: iso(m.editable_until),
            replayed: false,
          };
        const now = this.config.now();
        insert(this.db, "moment_revisions", {
          id: randomUUID(),
          moment_id: id,
          revision: m.revision,
          snapshot_json: JSON.stringify(snapshot),
          changed_fields_json: JSON.stringify(changed),
          edited_by_kind: p.kind,
          edited_by_id: p.id,
          edited_by_label: p.label,
          reason: input.reason ?? null,
          edited_at: now,
        });
        Object.assign(row, {
          revision: m.revision + 1,
          last_edited_at: now,
          last_edited_by_kind: p.kind,
          last_edited_by_id: p.id,
          last_edited_by_label: p.label,
          updated_at: now,
          dedupe_fingerprint: contentFingerprint(
            input.narrative ?? m.narrative,
            row.happened_on ?? m.happened_on,
          ),
        });
        update(this.db, "moments", row, "id=@_id AND user_id=@_user", {
          _id: id,
          _user: p.userId,
        });
        this.recalculate(p, id);
        this.reindex(p, id);
        return {
          momentId: id,
          revision: m.revision + 1,
          changedFields: changed,
          editableUntil: iso(m.editable_until),
          replayed: false,
        };
      })
      .immediate();
  }
  revisions(p: Principal, id: string): Row {
    this.read(p);
    const m = this.row(p, id);
    return {
      current: m.revision,
      items: (
        this.db
          .prepare(
            "SELECT * FROM moment_revisions WHERE moment_id=? ORDER BY revision",
          )
          .all(id) as Row[]
      ).map((r) => ({
        revision: r.revision,
        snapshot: JSON.parse(r.snapshot_json),
        changedFields: JSON.parse(r.changed_fields_json),
        editedBy: actor(r, "edited_by"),
        reason: r.reason,
        editedAt: iso(r.edited_at),
      })),
    };
  }
  setTags(p: Principal, id: string, names: string[], recording = false): Row {
    if (!recording) this.owner(p);
    this.row(p, id, true);
    return this.db
      .transaction(() => {
        const normalized = [
          ...new Map(
            names.map((n) => {
              const t = normalizeTag(n);
              return [t.toLocaleLowerCase("en-US"), t];
            }),
          ).values(),
        ];
        if (normalized.length > 10)
          fail(400, "INVALID_INPUT", "最多关联 10 个标签");
        this.db.prepare("DELETE FROM moment_tags WHERE moment_id=?").run(id);
        for (const name of normalized) {
          let tag = this.db
            .prepare(
              "SELECT * FROM tags WHERE user_id=? AND name=? COLLATE NOCASE",
            )
            .get(p.userId, name) as Row | undefined;
          if (!tag) {
            tag = {
              id: randomUUID(),
              user_id: p.userId,
              name,
              created_at: this.config.now(),
            };
            insert(this.db, "tags", tag);
          }
          this.db
            .prepare("INSERT INTO moment_tags VALUES(?,?)")
            .run(id, tag.id);
        }
        return { momentId: id, tags: this.tags(p, id) };
      })
      .immediate();
  }
  addNote(p: Principal, id: string, body: string): Row {
    this.write(p);
    return this.db
      .transaction(() => {
        this.row(p, id, true);
        const n = {
          id: randomUUID(),
          moment_id: id,
          user_id: p.userId,
          body,
          author_kind: p.kind,
          author_id: p.id,
          author_label: p.label,
          created_at: this.config.now(),
        };
        insert(this.db, "moment_notes", n);
        this.reindex(p, id);
        return p.scopes.includes("read")
          ? this.noteDto(n)
          : { id: n.id, momentId: id, createdAt: iso(n.created_at) };
      })
      .immediate();
  }
  deleteNote(p: Principal, id: string) {
    this.owner(p);
    this.db
      .transaction(() => {
        const n = this.db
          .prepare("SELECT * FROM moment_notes WHERE id=? AND user_id=?")
          .get(id, p.userId) as Row | undefined;
        if (!n) fail(404, "NOTE_NOT_FOUND", "找不到补记");
        this.row(p, n.moment_id, true);
        this.db
          .prepare("DELETE FROM moment_notes WHERE id=? AND user_id=?")
          .run(id, p.userId);
        this.reindex(p, n.moment_id);
      })
      .immediate();
  }
  recalculate(p: Principal, id: string) {
    const m = this.row(p, id),
      refs = this.db
        .prepare(
          "SELECT * FROM reflections WHERE moment_id=? AND user_id=? ORDER BY created_at,id",
        )
        .all(id, p.userId) as Row[],
      latest = refs.at(-1);
    const next = computeNextReviewOn({
      capturedOn: m.captured_on,
      scheduleDays: this.config.scheduleDays,
      intensity: m.intensity,
      reflections: refs.map((r) => ({
        reflectedOn: r.reflected_on,
        resolution: r.resolution,
        intensityNow: r.intensity_now,
      })),
      snoozedUntil: m.snoozed_until,
      outcomeKnownBy: m.outcome_known_by,
    });
    this.db
      .prepare(
        "UPDATE moments SET reflection_count=?,latest_intensity_now=?,latest_resolution=?,next_review_on=?,updated_at=? WHERE id=? AND user_id=?",
      )
      .run(
        refs.length,
        latest?.intensity_now ?? null,
        latest?.resolution ?? null,
        next,
        this.config.now(),
        id,
        p.userId,
      );
  }
  addReflection(p: Principal, id: string, input: Row): Row {
    this.read(p);
    this.write(p);
    return this.db
      .transaction(() => {
        const m = this.row(p, id, true),
          now = this.config.now(),
          r: Row = {
            id: randomUUID(),
            moment_id: id,
            user_id: p.userId,
            intensity_now: input.intensityNow,
            severity_now: input.severityNow ?? null,
            fear_came_true:
              input.fearCameTrue ?? (m.feared_outcome ? "unknown" : null),
            what_happened: input.whatHappened ?? null,
            perspective: input.perspective ?? null,
            thinking_traps_json: JSON.stringify(input.thinkingTraps ?? []),
            resolution: input.resolution,
            reflected_on: this.today(p),
            author_kind: p.kind,
            author_id: p.id,
            author_label: p.label,
            created_at: now,
            updated_at: now,
          };
        insert(this.db, "reflections", r);
        this.linkReflection(p, r, input.lessonIds ?? []);
        this.db
          .prepare(
            "UPDATE moments SET snoozed_until=NULL WHERE id=? AND user_id=?",
          )
          .run(id, p.userId);
        this.recalculate(p, id);
        this.reindex(p, id);
        return this.reflectionResult(p, r);
      })
      .immediate();
  }
  linkReflection(p: Principal, r: Row, ids: string[]) {
    this.db
      .prepare("DELETE FROM reflection_lessons WHERE reflection_id=?")
      .run(r.id);
    for (const id of ids) {
      if (
        !this.db
          .prepare("SELECT 1 FROM lessons WHERE id=? AND user_id=?")
          .get(id, p.userId)
      )
        fail(404, "LESSON_NOT_FOUND", "找不到关联经验");
      this.db
        .prepare("INSERT INTO reflection_lessons VALUES(?,?)")
        .run(r.id, id);
      this.db
        .prepare("INSERT OR IGNORE INTO lesson_moments VALUES(?,?,?)")
        .run(id, r.moment_id, this.config.now());
    }
  }
  reflectionResult(p: Principal, r: Row): Row {
    const m = this.row(p, r.moment_id);
    return {
      reflection: this.reflectionDto(r, m),
      moment: {
        id: m.id,
        status: this.status(p, m),
        nextReviewOn: m.next_review_on,
      },
      comparison: {
        intensityThen: m.intensity,
        intensityNow: r.intensity_now,
        change: r.intensity_now - m.intensity,
        daysSinceHappened: Math.max(
          0,
          daysBetween(m.happened_on, r.reflected_on),
        ),
      },
    };
  }
  modifyReflection(p: Principal, id: string, input: Row | null): Row {
    this.owner(p);
    return this.db
      .transaction(() => {
        const r = this.db
          .prepare("SELECT * FROM reflections WHERE id=? AND user_id=?")
          .get(id, p.userId) as Row | undefined;
        if (!r) fail(404, "REFLECTION_NOT_FOUND", "找不到复盘");
        this.row(p, r.moment_id, true);
        if (input === null)
          this.db
            .prepare("DELETE FROM reflections WHERE id=? AND user_id=?")
            .run(id, p.userId);
        else {
          if (!Object.keys(input).length)
            fail(400, "EMPTY_PATCH", "请提供修改字段");
          const cols: Record<string, string> = {
              intensityNow: "intensity_now",
              severityNow: "severity_now",
              fearCameTrue: "fear_came_true",
              whatHappened: "what_happened",
              perspective: "perspective",
              resolution: "resolution",
            },
            values: Row = { updated_at: this.config.now() };
          for (const [k, c] of Object.entries(cols))
            if (k in input) values[c] = input[k];
          if (input.thinkingTraps)
            values.thinking_traps_json = JSON.stringify(input.thinkingTraps);
          update(this.db, "reflections", values, "id=@_id AND user_id=@_user", {
            _id: id,
            _user: p.userId,
          });
          if (input.lessonIds) this.linkReflection(p, r, input.lessonIds);
        }
        this.recalculate(p, r.moment_id);
        this.reindex(p, r.moment_id);
        return input === null
          ? this.scheduleState(p, r.moment_id)
          : this.reflectionResult(
              p,
              this.db
                .prepare("SELECT * FROM reflections WHERE id=? AND user_id=?")
                .get(id, p.userId) as Row,
            );
      })
      .immediate();
  }
  scheduleState(p: Principal, id: string): Row {
    const m = this.row(p, id);
    return {
      momentId: id,
      status: this.status(p, m),
      nextReviewOn: m.next_review_on,
      snoozedUntil: m.snoozed_until,
    };
  }
  snooze(p: Principal, id: string, _input: Row): Row {
    this.read(p);
    this.write(p);
    this.row(p, id, true);
    fail(409, "NOT_SCHEDULED", "自动复盘排程已关闭，可随时手动回看");
  }
  archive(p: Principal, id: string, on: boolean): Row {
    this.owner(p);
    this.row(p, id, true);
    this.db
      .prepare(
        "UPDATE moments SET archived_at=?,updated_at=? WHERE id=? AND user_id=?",
      )
      .run(on ? this.config.now() : null, this.config.now(), id, p.userId);
    const m = this.row(p, id);
    return {
      momentId: id,
      status: this.status(p, m),
      archivedAt: iso(m.archived_at),
      nextReviewOn: m.next_review_on,
    };
  }
  trash(p: Principal, id: string): Row {
    this.owner(p);
    const m = this.row(p, id);
    const now = m.deleted_at ?? this.config.now();
    this.db
      .prepare(
        "UPDATE moments SET deleted_at=?,updated_at=? WHERE id=? AND user_id=?",
      )
      .run(now, this.config.now(), id, p.userId);
    return {
      momentId: id,
      deletedAt: iso(now),
      purgeAt: iso(now + this.config.trashDays * DAY),
    };
  }
  restore(p: Principal, id: string): Row {
    this.owner(p);
    const m = this.row(p, id);
    if (m.deleted_at === null)
      fail(409, "MOMENT_NOT_IN_TRASH", "这件事不在回收站");
    this.db
      .prepare(
        "UPDATE moments SET deleted_at=NULL,updated_at=? WHERE id=? AND user_id=?",
      )
      .run(this.config.now(), id, p.userId);
    return this.summary(p, this.row(p, id));
  }
  purge(p: Principal, id: string) {
    this.owner(p);
    const m = this.row(p, id);
    if (m.deleted_at === null)
      fail(409, "MOMENT_NOT_IN_TRASH", "只能彻底删除回收站里的事件");
    this.db
      .transaction(() => {
        this.db
          .prepare("DELETE FROM moment_search WHERE moment_id=? AND user_id=?")
          .run(id, p.userId);
        this.db
          .prepare("DELETE FROM moments WHERE id=? AND user_id=?")
          .run(id, p.userId);
      })
      .immediate();
  }
  listTrash(p: Principal): Row {
    this.read(p);
    return {
      items: (
        this.db
          .prepare(
            "SELECT * FROM moments WHERE user_id=? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 500",
          )
          .all(p.userId) as Row[]
      ).map((m) => ({
        moment: this.summary(p, m),
        deletedAt: iso(m.deleted_at),
        purgeAt: iso(m.deleted_at + this.config.trashDays * DAY),
      })),
    };
  }
  due(p: Principal, _input: Row = {}): Row {
    this.read(p);
    return { items: [], dueCount: 0, upcoming: [] };
  }
  reindex(p: Principal, id: string) {
    const m = this.row(p, id),
      notes = this.db
        .prepare(
          "SELECT body FROM moment_notes WHERE moment_id=? AND user_id=?",
        )
        .all(id, p.userId) as Row[],
      refs = this.db
        .prepare(
          "SELECT what_happened,perspective FROM reflections WHERE moment_id=? AND user_id=?",
        )
        .all(id, p.userId) as Row[];
    const body = [
      m.narrative,
      m.agent_summary,
      m.feared_outcome,
      m.thoughts,
      ...notes.map((n) => n.body),
      ...refs.flatMap((r) => [r.what_happened, r.perspective]),
    ]
      .filter(Boolean)
      .join("\n");
    this.db
      .prepare("DELETE FROM moment_search WHERE moment_id=? AND user_id=?")
      .run(id, p.userId);
    this.db
      .prepare("INSERT INTO moment_search VALUES(?,?,?,?)")
      .run(id, p.userId, m.title, body);
  }
  list(p: Principal, q: Row = {}): Row {
    this.read(p);
    const where = ["m.user_id=@user", "m.deleted_at IS NULL"],
      params: Row = {
        user: p.userId,
        now: this.config.now(),
        today: this.today(p),
      };
    for (const [key, col] of Object.entries({
      scene: "scene",
      resolution: "latest_resolution",
    }))
      if (q[key]) {
        where.push(`m.${col}=@${key}`);
        params[key] = q[key];
      }
    if (q.status) {
      where.push(`(${statusSql})=@status`);
      params.status = q.status;
    }
    if (q.from) {
      where.push("m.happened_on>=@from");
      params.from = q.from;
    }
    if (q.to) {
      where.push("m.happened_on<=@to");
      params.to = q.to;
    }
    if (q.from && q.to && q.from > q.to)
      fail(400, "INVALID_INPUT", "开始日期不能晚于结束日期");
    if (q.emotion) {
      where.push(
        "EXISTS(SELECT 1 FROM json_each(m.emotions_json) e WHERE json_extract(e.value,'$.key')=@emotion)",
      );
      params.emotion = q.emotion;
    }
    if (q.tag) {
      where.push(
        "EXISTS(SELECT 1 FROM moment_tags mt JOIN tags t ON t.id=mt.tag_id WHERE mt.moment_id=m.id AND t.user_id=@user AND t.name=@tag COLLATE NOCASE)",
      );
      params.tag = normalizeTag(q.tag);
    }
    if (q.trap) {
      where.push(
        "EXISTS(SELECT 1 FROM reflections r,json_each(r.thinking_traps_json) j WHERE r.moment_id=m.id AND r.user_id=@user AND j.value=@trap)",
      );
      params.trap = q.trap;
    }
    if (q.fearCameTrue) {
      where.push(
        "(SELECT r.fear_came_true FROM reflections r WHERE r.moment_id=m.id AND r.user_id=@user ORDER BY r.created_at DESC,r.id DESC LIMIT 1)=@fear",
      );
      params.fear = q.fearCameTrue;
    }
    const words = String(q.q ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length > 5) fail(400, "INVALID_INPUT", "最多使用 5 个关键词");
    if (words.length) {
      if (words.every((w) => [...w].length >= 3)) {
        where.push(
          "m.id IN(SELECT moment_id FROM moment_search WHERE user_id=@user AND moment_search MATCH @match)",
        );
        params.match = words
          .map((w) => '"' + w.replace(/"/g, '""') + '"')
          .join(" AND ");
      } else
        words.forEach((word, i) => {
          where.push(
            `EXISTS(SELECT 1 FROM moment_search s WHERE s.moment_id=m.id AND s.user_id=@user AND (s.title||s.body) LIKE @word${i} ESCAPE '\\')`,
          );
          params["word" + i] = "%" + word.replace(/[\\%_]/g, "\\$&") + "%";
        });
    }
    const sort = q.sort ?? "happened_desc",
      sorts: Record<string, { column: string; dir: string }> = {
        happened_desc: { column: "happened_at", dir: "DESC" },
        happened_asc: { column: "happened_at", dir: "ASC" },
        captured_desc: { column: "captured_at", dir: "DESC" },
        intensity_desc: { column: "intensity", dir: "DESC" },
      },
      order = sorts[sort];
    if (!order) fail(400, "INVALID_INPUT", "排序方式无效");
    const total = (
      this.db
        .prepare(
          `SELECT count(*) n FROM moments m WHERE ${where.join(" AND ")}`,
        )
        .get(params) as Row
    ).n;
    if (q.cursor) {
      try {
        const c = JSON.parse(Buffer.from(q.cursor, "base64url").toString());
        if (
          c.sort !== sort ||
          !Number.isFinite(c.value) ||
          typeof c.id !== "string"
        )
          throw Error();
        where.push(
          `(m.${order.column}${order.dir === "ASC" ? ">" : "<"}@cursor OR (m.${order.column}=@cursor AND m.id<@cursorId))`,
        );
        params.cursor = c.value;
        params.cursorId = c.id;
      } catch {
        fail(400, "INVALID_CURSOR", "分页游标无效");
      }
    }
    const limit = Math.min(Number(q.limit ?? 20), 100);
    params.limit = limit + 1;
    const rows = this.db
        .prepare(
          `SELECT m.* FROM moments m WHERE ${where.join(" AND ")} ORDER BY m.${order.column} ${order.dir},m.id DESC LIMIT @limit`,
        )
        .all(params) as Row[],
      page = rows.slice(0, limit),
      last = page.at(-1);
    return {
      items: page.map((m) => {
        const dto = this.summary(p, m);
        if (words.length) {
          const s = this.db
            .prepare(
              "SELECT title,body FROM moment_search WHERE moment_id=? AND user_id=?",
            )
            .get(m.id, p.userId) as Row;
          const text = s.title + "\n" + s.body,
            pos = Math.max(
              0,
              text.toLocaleLowerCase().indexOf(words[0]!.toLocaleLowerCase()),
            );
          dto.matchSnippet = text
            .slice(Math.max(0, pos - 30), pos + words[0]!.length + 30)
            .slice(0, 200);
        }
        return dto;
      }),
      nextCursor:
        rows.length > limit && last
          ? Buffer.from(
              JSON.stringify({ sort, value: last[order.column], id: last.id }),
            ).toString("base64url")
          : null,
      total,
    };
  }
}
