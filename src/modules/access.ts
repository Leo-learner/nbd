import { randomUUID } from "node:crypto";
import { insert, type Db, type Row } from "../db/index.js";
import type { Config } from "../config.js";
import type { Principal } from "./principal.js";
import { secret } from "./auth.js";
import { digest, sameDigest } from "../domain/fingerprint.js";
import { DAY, iso } from "../time.js";
import { fail } from "../errors.js";
export class AccessService {
  constructor(
    public db: Db,
    public config: Config,
  ) {}
  keyDto(k: Row): Row {
    return {
      id: k.id,
      label: k.label,
      prefix: k.prefix,
      scopes: JSON.parse(k.scopes_json),
      createdAt: iso(k.created_at),
      expiresAt: iso(k.expires_at),
      lastUsedAt: iso(k.last_used_at),
      revokedAt: iso(k.revoked_at),
    };
  }
  list(p: Principal): Row {
    return {
      items: (
        this.db
          .prepare(
            "SELECT * FROM agent_keys WHERE user_id=? ORDER BY created_at DESC,id DESC",
          )
          .all(p.userId) as Row[]
      ).map((k) => this.keyDto(k)),
    };
  }
  create(p: Principal, input: Row, suppliedSecret?: string): Row {
    if (p.kind !== "owner" && p.kind !== "system")
      fail(403, "FORBIDDEN", "只有所有者能签发密钥");
    const scopes = input.scopes as string[];
    if (
      !scopes?.length ||
      scopes.length > 2 ||
      new Set(scopes).size !== scopes.length ||
      scopes.some((s) => !["read", "write"].includes(s))
    )
      fail(400, "INVALID_INPUT", "密钥作用域无效");
    const days = input.expiresInDays ?? 365;
    if (!Number.isInteger(days) || days < 1 || days > 365)
      fail(400, "INVALID_INPUT", "密钥有效期必须为 1–365 天");
    if (!input.label || [...input.label].length > 40)
      fail(400, "INVALID_INPUT", "密钥名称须为 1–40 字");
    return this.db
      .transaction(() => {
        const now = this.config.now(),
          n = (
            this.db
              .prepare(
                "SELECT count(*) n FROM agent_keys WHERE user_id=? AND revoked_at IS NULL AND expires_at>?",
              )
              .get(p.userId, now) as Row
          ).n;
        if (n >= 20) fail(409, "KEY_LIMIT_REACHED", "最多同时启用 20 把密钥");
        const token = suppliedSecret ?? secret("nbd_ak_");
        if (!/^nbd_ak_[A-Za-z0-9_-]{43}$/.test(token))
          fail(400, "INVALID_INPUT", "密钥格式无效");
        const row = {
          id: randomUUID(),
          user_id: p.userId,
          label: input.label,
          prefix: token.slice(0, 11),
          token_hash: digest(token),
          scopes_json: JSON.stringify(scopes),
          created_at: now,
          expires_at: now + days * DAY,
        };
        insert(this.db, "agent_keys", row);
        return {
          agentKey: this.keyDto({
            ...row,
            last_used_at: null,
            revoked_at: null,
          }),
          secret: token,
          mcpUrl: this.config.publicOrigin + "/mcp",
        };
      })
      .immediate();
  }
  revoke(p: Principal, id: string): Row {
    const k = this.db
      .prepare("SELECT * FROM agent_keys WHERE id=? AND user_id=?")
      .get(id, p.userId) as Row | undefined;
    if (!k) fail(404, "KEY_NOT_FOUND", "找不到密钥");
    this.db
      .prepare(
        "UPDATE agent_keys SET revoked_at=COALESCE(revoked_at,?) WHERE id=? AND user_id=?",
      )
      .run(this.config.now(), id, p.userId);
    return this.keyDto(
      this.db
        .prepare("SELECT * FROM agent_keys WHERE id=? AND user_id=?")
        .get(id, p.userId) as Row,
    );
  }
  authenticate(token: string): Principal {
    if (!/^nbd_(ak|at)_[A-Za-z0-9_-]{43}$/.test(token))
      fail(401, "UNAUTHORIZED", "请提供有效的 Agent 密钥或 OAuth 令牌");
    const hash = digest(token),
      now = this.config.now();
    if (token.startsWith("nbd_ak_")) {
      const k = this.db
        .prepare(
          "SELECT * FROM agent_keys WHERE token_hash=? AND revoked_at IS NULL AND expires_at>?",
        )
        .get(hash, now) as Row | undefined;
      if (!k || !sameDigest(k.token_hash, hash))
        fail(401, "UNAUTHORIZED", "密钥无效或已失效");
      if (k.last_used_at === null || now - k.last_used_at >= 60000)
        this.db
          .prepare("UPDATE agent_keys SET last_used_at=? WHERE id=?")
          .run(now, k.id);
      return {
        userId: k.user_id,
        kind: "agent_key",
        id: k.id,
        label: k.label,
        scopes: JSON.parse(k.scopes_json),
      };
    }
    const t = this.db
      .prepare(
        `SELECT t.*,g.user_id,g.client_name,g.revoked_at AS grant_revoked FROM oauth_tokens t JOIN oauth_grants g ON g.id=t.grant_id WHERE t.token_hash=? AND t.kind='access' AND t.revoked_at IS NULL AND t.expires_at>? AND g.revoked_at IS NULL`,
      )
      .get(hash, now) as Row | undefined;
    if (
      !t ||
      !sameDigest(t.token_hash, hash) ||
      t.resource !== this.config.publicOrigin + "/mcp"
    )
      fail(401, "UNAUTHORIZED", "OAuth 令牌无效或已失效");
    if (t.last_used_at === null || now - t.last_used_at >= 60000) {
      this.db
        .prepare("UPDATE oauth_tokens SET last_used_at=? WHERE id=?")
        .run(now, t.id);
      this.db
        .prepare("UPDATE oauth_grants SET last_used_at=? WHERE id=?")
        .run(now, t.grant_id);
    }
    return {
      userId: t.user_id,
      kind: "oauth_app",
      id: t.grant_id,
      label: t.client_name,
      scopes: JSON.parse(t.scopes_json),
    };
  }
  apps(p: Principal): Row {
    return {
      items: (
        this.db
          .prepare(
            "SELECT * FROM oauth_grants WHERE user_id=? AND revoked_at IS NULL ORDER BY created_at DESC",
          )
          .all(p.userId) as Row[]
      ).map((g) => ({
        id: g.id,
        clientId: g.client_id,
        clientName: g.client_name,
        clientHost: new URL(g.client_id).hostname,
        redirectHost: g.redirect_host,
        scopes: JSON.parse(g.scopes_json),
        createdAt: iso(g.created_at),
        lastUsedAt: iso(g.last_used_at),
        refreshExpiresAt: iso(
          (
            this.db
              .prepare(
                "SELECT MAX(expires_at) expiry FROM oauth_tokens WHERE grant_id=? AND kind='refresh' AND revoked_at IS NULL AND replaced_by IS NULL",
              )
              .get(g.id) as Row
          ).expiry,
        ),
      })),
    };
  }
  revokeGrant(id: string) {
    const now = this.config.now();
    this.db
      .transaction(() => {
        this.db
          .prepare(
            "UPDATE oauth_grants SET revoked_at=COALESCE(revoked_at,?) WHERE id=?",
          )
          .run(now, id);
        this.db
          .prepare(
            "UPDATE oauth_tokens SET revoked_at=COALESCE(revoked_at,?) WHERE grant_id=?",
          )
          .run(now, id);
      })
      .immediate();
  }
  revokeApp(p: Principal, id: string) {
    if (
      !this.db
        .prepare("SELECT 1 FROM oauth_grants WHERE id=? AND user_id=?")
        .get(id, p.userId)
    )
      fail(404, "APP_NOT_FOUND", "找不到应用");
    this.revokeGrant(id);
  }
}
