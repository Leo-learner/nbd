import { randomBytes, randomUUID } from "node:crypto";
import argon2 from "argon2";
import { insert, type Db, type Row } from "../db/index.js";
import type { Config } from "../config.js";
import { fail } from "../errors.js";
import { iso } from "../time.js";
export const secret = (prefix = "") =>
  prefix + randomBytes(32).toString("base64url");
export const publicUser = (u: Row) => ({
  id: u.id,
  username: u.username,
  displayName: u.display_name,
  timezone: u.timezone,
  weekStartsOn: u.week_starts_on,
  createdAt: iso(u.created_at),
});
export class AuthService {
  private activeHashes = 0;
  constructor(
    public db: Db,
    public config: Config,
  ) {}
  private async limited<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeHashes >= 2) fail(429, "AUTH_BUSY", "认证繁忙，请稍后重试");
    this.activeHashes++;
    try {
      return await fn();
    } finally {
      this.activeHashes--;
    }
  }
  hash(password: string) {
    if (password.length < 12 || password.length > 128)
      fail(400, "INVALID_INPUT", "密码长度必须为 12–128 个字符");
    return this.limited(() =>
      argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      }),
    );
  }
  verify(password: string, hash: string) {
    return this.limited(() => argon2.verify(hash, password));
  }
  async createOwner(username: string, password: string) {
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username))
      fail(400, "INVALID_INPUT", "用户名须为 3–20 位字母、数字或下划线");
    if (this.db.prepare("SELECT 1 FROM users LIMIT 1").get())
      fail(409, "OWNER_EXISTS", "所有者账号已存在");
    const password_hash = await this.hash(password),
      now = this.config.now();
    const row = {
      id: randomUUID(),
      username,
      display_name: username,
      password_hash,
      timezone: this.config.timezone,
      password_changed_at: now,
      created_at: now,
      updated_at: now,
    };
    this.db
      .transaction(() => {
        if (this.db.prepare("SELECT 1 FROM users LIMIT 1").get())
          fail(409, "OWNER_EXISTS", "所有者账号已存在");
        insert(this.db, "users", row);
      })
      .immediate();
    return this.user(row.id);
  }
  user(id: string): Row {
    return this.db.prepare("SELECT * FROM users WHERE id=?").get(id) as Row;
  }
}
