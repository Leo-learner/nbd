import type { Db, Row } from "../db/index.js";
import type { Config } from "../config.js";
import type { Principal } from "./principal.js";
import { AppError } from "../errors.js";
export class AuditService {
  constructor(
    public db: Db,
    public config: Config,
  ) {}
  start(
    actor: Principal | null,
    action: string,
    channel = "web",
    requestId?: string,
    ip?: string,
  ): number {
    return Number(
      this.db
        .prepare(
          `INSERT INTO audit_events(user_id,started_at,channel,actor_kind,actor_id,actor_label,action,status,request_id,ip) VALUES(?,?,?,?,?,?,?,'running',?,?)`,
        )
        .run(
          actor?.userId ?? null,
          this.config.now(),
          channel,
          actor?.kind ?? "anonymous",
          actor?.id ?? null,
          actor?.label ?? "未登录",
          action,
          requestId ?? null,
          ip ?? null,
        ).lastInsertRowid,
    );
  }
  finish(
    id: number,
    status: "success" | "error",
    code?: string,
    target?: string,
  ) {
    this.db
      .prepare(
        "UPDATE audit_events SET finished_at=?,status=?,error_code=?,target_id=? WHERE id=?",
      )
      .run(this.config.now(), status, code ?? null, target ?? null, id);
  }
  attachUser(id: number, userId: string) {
    this.db
      .prepare("UPDATE audit_events SET user_id=? WHERE id=?")
      .run(userId, id);
  }
  run<T>(actor: Principal, action: string, fn: () => T, channel = "web"): T {
    const id = this.start(actor, action, channel);
    try {
      return this.db
        .transaction(() => {
          const value = fn();
          this.finish(id, "success");
          return value;
        })
        .immediate();
    } catch (e) {
      this.finish(
        id,
        "error",
        e instanceof AppError ? e.code : "INTERNAL_ERROR",
      );
      throw e;
    }
  }
}
