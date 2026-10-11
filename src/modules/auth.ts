import { randomBytes, randomUUID } from "node:crypto";
import argon2 from "argon2";
import { insert, type Db, type Row } from "../db/index.js";
import type { Config } from "../config.js";
import { fail } from "../errors.js";
import { digest, sameDigest } from "../domain/fingerprint.js";
import { DAY, iso } from "../time.js";
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
  private dummy = "";
  constructor(
    public db: Db,
    public config: Config,
  ) {}
  async init() {
    this.dummy = await this.hash(secret());
  }
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
  async login(username: string, password: string): Promise<Row> {
    const row = this.db
      .prepare("SELECT * FROM users WHERE username=? COLLATE NOCASE")
      .get(username) as Row | undefined;
    const valid = await this.verify(password, row?.password_hash ?? this.dummy);
    if (!row || !valid) fail(401, "INVALID_CREDENTIALS", "用户名或密码错误");
    if (this.user(row.id)?.password_hash !== row.password_hash)
      fail(401, "INVALID_CREDENTIALS", "账号凭证已变化，请重新登录");
    return row;
  }
  issue(userId: string, previous?: string): string {
    const token = secret(),
      now = this.config.now();
    this.db
      .transaction(() => {
        if (previous) this.logout(previous);
        insert(this.db, "sessions", {
          id: randomUUID(),
          user_id: userId,
          token_hash: digest(token),
          created_at: now,
          renewed_at: now,
          expires_at: now + this.config.sessionDays * DAY,
        });
      })
      .immediate();
    return token;
  }
  lookup(token?: string): { user: Row; renew: boolean } | null {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const row = this.db
      .prepare(
        "SELECT u.*,s.token_hash,s.renewed_at,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?",
      )
      .get(digest(token), this.config.now()) as Row | undefined;
    if (!row || !sameDigest(row.token_hash, digest(token))) return null;
    return { user: row, renew: this.config.now() - row.renewed_at >= DAY };
  }
  touch(token: string) {
    const now = this.config.now();
    this.db
      .prepare(
        "UPDATE sessions SET renewed_at=?,expires_at=? WHERE token_hash=? AND expires_at>?",
      )
      .run(now, now + this.config.sessionDays * DAY, digest(token), now);
  }
  logout(token?: string) {
    if (token)
      this.db
        .prepare("DELETE FROM sessions WHERE token_hash=?")
        .run(digest(token));
  }
  logoutAll(id: string) {
    this.db.prepare("DELETE FROM sessions WHERE user_id=?").run(id);
  }
  async changePassword(user: Row, current: string, password: string) {
    if (!(await this.verify(current, user.password_hash)))
      fail(403, "PASSWORD_INCORRECT", "当前密码错误");
    const hash = await this.hash(password);
    this.db
      .transaction(() => {
        if (this.user(user.id).password_hash !== user.password_hash)
          fail(409, "ACCOUNT_CHANGED", "账号凭证已变化");
        this.db
          .prepare(
            "UPDATE users SET password_hash=?,password_changed_at=?,updated_at=? WHERE id=?",
          )
          .run(hash, this.config.now(), this.config.now(), user.id);
        this.logoutAll(user.id);
      })
      .immediate();
  }
  async resetPassword(username: string, password: string) {
    const user = this.db
      .prepare("SELECT * FROM users WHERE username=?")
      .get(username) as Row | undefined;
    if (!user) fail(404, "USER_NOT_FOUND", "账号不存在");
    const hash = await this.hash(password);
    this.db
      .transaction(() => {
        this.db
          .prepare(
            "UPDATE users SET password_hash=?,password_changed_at=?,updated_at=? WHERE id=?",
          )
          .run(hash, this.config.now(), this.config.now(), user.id);
        this.logoutAll(user.id);
      })
      .immediate();
  }
}
