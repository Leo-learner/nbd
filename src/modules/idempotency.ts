import type { Db, Row } from "../db/index.js";
import type { Config } from "../config.js";
import type { Principal } from "./principal.js";
import { fingerprint } from "../domain/fingerprint.js";
import { DAY } from "../time.js";
import { fail } from "../errors.js";
export class IdempotencyService {
  constructor(
    public db: Db,
    public config: Config,
  ) {}
  run<T extends Row>(
    p: Principal,
    operation: string,
    key: string | undefined,
    args: unknown,
    fn: () => T,
  ): T {
    return this.db
      .transaction(() => {
        if (!key) return fn();
        if (!/^[A-Za-z0-9_-]{8,64}$/.test(key))
          fail(
            400,
            "INVALID_INPUT",
            "幂等键应为 8–64 位字母、数字、下划线或连字符",
          );
        const principal = p.id ?? p.kind,
          fp = fingerprint(args),
          now = this.config.now();
        const row = this.db
          .prepare(
            "SELECT * FROM idempotency_keys WHERE user_id=? AND principal_id=? AND operation=? AND key=?",
          )
          .get(p.userId, principal, operation, key) as Row | undefined;
        if (row && row.expires_at > now) {
          if (row.fingerprint !== fp)
            fail(409, "IDEMPOTENCY_CONFLICT", "同一个请求编号不能用于不同内容");
          return { ...JSON.parse(row.response_json), replayed: true };
        }
        const result = fn();
        this.db
          .prepare(
            "INSERT OR REPLACE INTO idempotency_keys VALUES(?,?,?,?,?,?,?)",
          )
          .run(
            p.userId,
            principal,
            operation,
            key,
            fp,
            JSON.stringify(result),
            now + DAY,
          );
        return result;
      })
      .immediate();
  }
}
