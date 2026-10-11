import { randomUUID } from "node:crypto";
import { insert, update, type Db, type Row } from "../db/index.js";
import type { Config } from "../config.js";
import type { Principal } from "./principal.js";
import { fail } from "../errors.js";
import { iso } from "../time.js";
import { normalizeTag } from "../domain/tags.js";
import { MomentService, actor } from "./moments.js";
export class LibraryService {
  constructor(
    public db: Db,
    public config: Config,
    public moments: MomentService,
  ) {}
  lesson(p: Principal, id: string): Row {
    const l = this.db
      .prepare("SELECT * FROM lessons WHERE id=? AND user_id=?")
      .get(id, p.userId) as Row | undefined;
    if (!l) fail(404, "LESSON_NOT_FOUND", "找不到这条经验");
    return l;
  }
  dto(p: Principal, l: Row): Row {
    return {
      id: l.id,
      title: l.title,
      body: l.body,
      momentCount: (
        this.db
          .prepare(
            "SELECT count(*) n FROM lesson_moments lm JOIN moments m ON m.id=lm.moment_id WHERE lm.lesson_id=? AND m.user_id=? AND m.deleted_at IS NULL",
          )
          .get(l.id, p.userId) as Row
      ).n,
      author: actor(l),
      createdAt: iso(l.created_at),
      updatedAt: iso(l.updated_at),
    };
  }
  detail(p: Principal, id: string): Row {
    this.moments.read(p);
    return {
      ...this.dto(p, this.lesson(p, id)),
      moments: (
        this.db
          .prepare(
            "SELECT m.* FROM moments m JOIN lesson_moments lm ON lm.moment_id=m.id WHERE lm.lesson_id=? AND m.user_id=? AND m.deleted_at IS NULL ORDER BY m.happened_at DESC,m.id DESC LIMIT 500",
          )
          .all(id, p.userId) as Row[]
      ).map((m) => this.moments.summary(p, m)),
    };
  }
  list(p: Principal, q: Row = {}): Row {
    this.moments.read(p);
    const rows = this.db
      .prepare(
        "SELECT * FROM lessons WHERE user_id=? ORDER BY updated_at DESC,id DESC",
      )
      .all(p.userId) as Row[];
    const filtered = rows.filter(
      (l) =>
        !q.q ||
        (l.title + "\n" + l.body)
          .toLocaleLowerCase()
          .includes(String(q.q).toLocaleLowerCase()),
    );
    return {
      items: filtered
        .slice(0, Math.min(Number(q.limit ?? 500), 500))
        .map((l) => this.dto(p, l)),
      total: filtered.length,
    };
  }
  create(p: Principal, input: Row): Row {
    this.moments.read(p);
    this.moments.write(p);
    return this.db
      .transaction(() => {
        const now = this.config.now(),
          l = {
            id: randomUUID(),
            user_id: p.userId,
            title: input.title,
            body: input.body ?? "",
            author_kind: p.kind,
            author_id: p.id,
            author_label: p.label,
            created_at: now,
            updated_at: now,
          };
        insert(this.db, "lessons", l);
        this.link(p, l.id, input.momentIds ?? []);
        return this.detail(p, l.id);
      })
      .immediate();
  }
  modify(p: Principal, id: string, input: Row): Row {
    this.moments.owner(p);
    this.lesson(p, id);
    if (!Object.keys(input).length) fail(400, "EMPTY_PATCH", "请提供修改字段");
    update(
      this.db,
      "lessons",
      { ...input, updated_at: this.config.now() },
      "id=@_id AND user_id=@_user",
      { _id: id, _user: p.userId },
    );
    return this.dto(p, this.lesson(p, id));
  }
  delete(p: Principal, id: string) {
    this.moments.owner(p);
    this.lesson(p, id);
    this.db
      .prepare("DELETE FROM lessons WHERE id=? AND user_id=?")
      .run(id, p.userId);
  }
  link(p: Principal, id: string, ids: string[]): Row {
    this.moments.read(p);
    this.moments.write(p);
    this.lesson(p, id);
    return this.db
      .transaction(() => {
        for (const moment of ids) this.moments.row(p, moment, true);
        this.db.prepare("DELETE FROM lesson_moments WHERE lesson_id=?").run(id);
        for (const moment of new Set(ids))
          this.db
            .prepare("INSERT INTO lesson_moments VALUES(?,?,?)")
            .run(id, moment, this.config.now());
        return this.detail(p, id);
      })
      .immediate();
  }
  tag(p: Principal, id: string): Row {
    const t = this.db
      .prepare("SELECT * FROM tags WHERE id=? AND user_id=?")
      .get(id, p.userId) as Row | undefined;
    if (!t) fail(404, "TAG_NOT_FOUND", "找不到标签");
    return t;
  }
  tagDto(p: Principal, t: Row): Row {
    return {
      id: t.id,
      name: t.name,
      createdAt: iso(t.created_at),
      momentCount: (
        this.db
          .prepare(
            "SELECT count(*) n FROM moment_tags mt JOIN moments m ON m.id=mt.moment_id WHERE mt.tag_id=? AND m.user_id=? AND m.deleted_at IS NULL",
          )
          .get(t.id, p.userId) as Row
      ).n,
    };
  }
  tags(p: Principal): Row {
    this.moments.read(p);
    return {
      items: (
        this.db
          .prepare("SELECT * FROM tags WHERE user_id=? ORDER BY name LIMIT 500")
          .all(p.userId) as Row[]
      ).map((t) => this.tagDto(p, t)),
    };
  }
  rename(p: Principal, id: string, name: string): Row {
    this.moments.owner(p);
    this.tag(p, id);
    name = normalizeTag(name);
    if (
      this.db
        .prepare(
          "SELECT 1 FROM tags WHERE user_id=? AND name=? COLLATE NOCASE AND id<>?",
        )
        .get(p.userId, name, id)
    )
      fail(409, "TAG_EXISTS", "已有同名标签，请使用合并");
    this.db
      .prepare("UPDATE tags SET name=? WHERE id=? AND user_id=?")
      .run(name, id, p.userId);
    return this.tagDto(p, this.tag(p, id));
  }
  merge(p: Principal, id: string, into: string): Row {
    this.moments.owner(p);
    this.tag(p, id);
    this.tag(p, into);
    if (id === into) fail(400, "INVALID_INPUT", "不能合并到自身");
    return this.db
      .transaction(() => {
        const ids = this.db
          .prepare("SELECT moment_id FROM moment_tags WHERE tag_id=?")
          .all(id) as Row[];
        for (const r of ids) {
          const count = (
            this.db
              .prepare("SELECT count(*) n FROM moment_tags WHERE moment_id=?")
              .get(r.moment_id) as Row
          ).n;
          if (count > 10) fail(400, "INVALID_INPUT", "事件的标签数量超限");
          this.db
            .prepare("INSERT OR IGNORE INTO moment_tags VALUES(?,?)")
            .run(r.moment_id, into);
        }
        this.db
          .prepare("DELETE FROM tags WHERE id=? AND user_id=?")
          .run(id, p.userId);
        return {
          tag: this.tagDto(p, this.tag(p, into)),
          movedMoments: ids.length,
        };
      })
      .immediate();
  }
  deleteTag(p: Principal, id: string) {
    this.moments.owner(p);
    this.tag(p, id);
    this.db
      .prepare("DELETE FROM tags WHERE id=? AND user_id=?")
      .run(id, p.userId);
  }
}
