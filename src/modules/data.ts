import type { Db, Row } from "../db/index.js";
import type { Config } from "../config.js";
import type { Principal } from "./principal.js";
import { ownerPrincipal } from "./principal.js";
import { MomentService, actor } from "./moments.js";
import { LibraryService } from "./library.js";
import { publicUser } from "./auth.js";
import { fail } from "../errors.js";
import { DAY, iso } from "../time.js";
import { metaDefaults } from "../domain/constants.js";
export class DataService {
  constructor(
    public db: Db,
    public config: Config,
    public moments: MomentService,
    public library: LibraryService,
  ) {}
  meta(): Row {
    return {
      ...metaDefaults,
      features: { ...metaDefaults.features, reviewScheduling: false },
      review: {
        scheduleDays: [],
        freezeHours: this.config.freezeHours,
        trashDays: this.config.trashDays,
        snoozeMaxDays: 90,
      },
    };
  }
  settings(p: Principal): Row {
    const u = this.moments.user(p);
    return {
      displayName: u.display_name,
      timezone: u.timezone,
      weekStartsOn: u.week_starts_on,
    };
  }
  updateSettings(p: Principal, input: Row): Row {
    this.moments.owner(p);
    if (!Object.keys(input).length) fail(400, "EMPTY_PATCH", "请提供修改字段");
    if (input.timezone) {
      try {
        new Intl.DateTimeFormat("en-CA", { timeZone: input.timezone });
      } catch {
        fail(400, "INVALID_TIMEZONE", "时区无效");
      }
    }
    const u = this.moments.user(p);
    this.db
      .prepare(
        "UPDATE users SET display_name=?,timezone=?,week_starts_on=?,updated_at=? WHERE id=?",
      )
      .run(
        input.displayName ?? u.display_name,
        input.timezone ?? u.timezone,
        input.weekStartsOn ?? u.week_starts_on,
        this.config.now(),
        p.userId,
      );
    return this.settings(p);
  }
  export(p: Principal): Row {
    this.moments.owner(p);
    return this.db
      .transaction(() => ({
        format: "nbd-export",
        version: 1,
        exportedAt: iso(this.config.now()),
        owner: publicUser(this.moments.user(p)),
        moments: (
          this.db
            .prepare(
              "SELECT id FROM moments WHERE user_id=? ORDER BY captured_at,id",
            )
            .all(p.userId) as Row[]
        ).map((r) => ({
          ...this.moments.detail(p, r.id),
          revisions: this.moments.revisions(p, r.id).items,
        })),
        lessons: (
          this.db
            .prepare(
              "SELECT id FROM lessons WHERE user_id=? ORDER BY created_at,id",
            )
            .all(p.userId) as Row[]
        ).map((l) => this.library.detail(p, l.id)),
        tags: this.library.tags(p).items,
      }))
      .deferred();
  }
  audit(p: Principal, q: Row): Row {
    this.moments.read(p);
    const where = ["user_id=@user"],
      params: Row = { user: p.userId };
    if (q.channel) {
      where.push("channel=@channel");
      params.channel = q.channel;
    }
    const total = (
      this.db
        .prepare(
          `SELECT count(*) n FROM audit_events WHERE ${where.join(" AND ")}`,
        )
        .get(params) as Row
    ).n;
    if (q.cursor) {
      const cursor = Number(q.cursor);
      if (!Number.isSafeInteger(cursor) || cursor < 1)
        fail(400, "INVALID_CURSOR", "审计游标无效");
      where.push("id<@cursor");
      params.cursor = cursor;
    }
    const limit = Math.min(Number(q.limit ?? 50), 100);
    params.limit = limit + 1;
    const rows = this.db
        .prepare(
          `SELECT * FROM audit_events WHERE ${where.join(" AND ")} ORDER BY id DESC LIMIT @limit`,
        )
        .all(params) as Row[],
      page = rows.slice(0, limit);
    return {
      items: page.map((a) => ({
        id: a.id,
        at: iso(a.started_at),
        channel: a.channel,
        actor: actor(a, "actor"),
        action: a.action,
        targetType: a.target_type,
        targetId: a.target_id,
        status: a.status,
        errorCode: a.error_code,
      })),
      nextCursor: rows.length > limit ? String(page.at(-1)!.id) : null,
      total,
    };
  }
  cleanup() {
    const now = this.config.now();
    this.db
      .transaction(() => {
        for (const m of this.db
          .prepare("SELECT id,user_id FROM moments WHERE deleted_at<?")
          .all(now - this.config.trashDays * DAY) as Row[]) {
          const u = this.db
            .prepare("SELECT * FROM users WHERE id=?")
            .get(m.user_id) as Row;
          this.moments.purge(
            {
              ...ownerPrincipal(u as { id: string; display_name: string }),
              kind: "system",
            },
            m.id,
          );
          this.db
            .prepare(
              "INSERT INTO audit_events(user_id,started_at,finished_at,channel,actor_kind,actor_label,action,target_type,target_id,status) VALUES(?,?,?,'system','system','自动清理','moment.purge','moment',?,'success')",
            )
            .run(m.user_id, now, now, m.id);
        }
        this.db.prepare("DELETE FROM sessions WHERE expires_at<?").run(now);
        this.db
          .prepare("DELETE FROM idempotency_keys WHERE expires_at<?")
          .run(now);
        this.db
          .prepare("DELETE FROM oauth_requests WHERE expires_at<?")
          .run(now);
        this.db
          .prepare("DELETE FROM oauth_codes WHERE expires_at<?")
          .run(now - DAY);
        this.db
          .prepare(
            "DELETE FROM oauth_tokens WHERE (expires_at<? OR revoked_at<?) AND (kind!='refresh' OR expires_at<?)",
          )
          .run(now - 7 * DAY, now - 7 * DAY, now - 7 * DAY);
        this.db
          .prepare("DELETE FROM audit_events WHERE started_at<?")
          .run(now - this.config.auditDays * DAY);
      })
      .immediate();
  }
}
