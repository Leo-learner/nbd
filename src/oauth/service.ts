import { randomUUID } from "node:crypto";
import { insert, type Db, type Row } from "../db/index.js";
import type { Config } from "../config.js";
import { AuthService, secret } from "../modules/auth.js";
import { AccessService } from "../modules/access.js";
import { AuditService } from "../modules/audit.js";
import { ownerPrincipal } from "../modules/principal.js";
import { digest, sameDigest } from "../domain/fingerprint.js";
import { DAY } from "../time.js";
import { AppError } from "../errors.js";
export class OAuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
function error(code: string, message: string, status = 400): never {
  throw new OAuthError(code, message, status);
}
export const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export class OAuthService {
  constructor(
    public db: Db,
    public config: Config,
    public auth: AuthService,
    public access: AccessService,
    public audit: AuditService,
    public fetcher: typeof fetch = fetch,
  ) {}
  get resource() {
    return this.config.publicOrigin + "/mcp";
  }
  metadata() {
    return {
      issuer: this.config.publicOrigin,
      authorization_endpoint: this.config.publicOrigin + "/oauth/authorize",
      token_endpoint: this.config.publicOrigin + "/oauth/token",
      revocation_endpoint: this.config.publicOrigin + "/oauth/revoke",
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
      client_id_metadata_document_supported: true,
      authorization_response_iss_parameter_supported: true,
      scopes_supported: ["read", "write"],
    };
  }
  resourceMetadata() {
    return {
      resource: this.resource,
      authorization_servers: [this.config.publicOrigin],
      scopes_supported: ["read", "write"],
      bearer_methods_supported: ["header"],
      resource_name: "NBD 没什么大不了",
    };
  }
  validateUrl(value: string, hosts: string[], loopback = false): URL {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return error("invalid_client", "Invalid URL");
    }
    const testLocal =
      this.config.env === "test" &&
      url.hostname === "127.0.0.1" &&
      hosts.includes("127.0.0.1");
    const local =
      loopback &&
      this.config.loopbackRedirect &&
      ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
    if (
      url.username ||
      url.password ||
      url.hash ||
      (!testLocal &&
        !local &&
        (url.protocol !== "https:" ||
          !hosts.includes(url.hostname) ||
          (url.port && url.port !== "443")))
    )
      error("invalid_client", "Client or callback domain is not permitted");
    if ((testLocal || local) && !["http:", "https:"].includes(url.protocol))
      error("invalid_client", "Invalid URL protocol");
    return url;
  }
  async client(id: string): Promise<Row> {
    this.validateUrl(id, this.config.clientHosts);
    const cached = this.db
      .prepare("SELECT * FROM oauth_clients WHERE client_id=? AND expires_at>?")
      .get(id, this.config.now()) as Row | undefined;
    if (cached) return JSON.parse(cached.metadata_json);
    let doc: Row;
    try {
      const response = await this.fetcher(id, {
        redirect: "error",
        signal: AbortSignal.timeout(5000),
        headers: { accept: "application/json" },
      });
      if (
        !response.ok ||
        Number(response.headers.get("content-length") ?? 0) > 5120
      )
        throw Error();
      const reader = response.body?.getReader();
      if (!reader) throw Error();
      let length = 0;
      const chunks: Uint8Array[] = [];
      try {
        for (;;) {
          const part = await reader.read();
          if (part.done) break;
          length += part.value.length;
          if (length > 5120) throw Error();
          chunks.push(part.value);
        }
      } finally {
        await reader.cancel();
      }
      doc = JSON.parse(Buffer.concat(chunks).toString());
    } catch {
      return error("invalid_client", "Unable to load client metadata");
    }
    if (
      doc.client_id !== id ||
      !Array.isArray(doc.redirect_uris) ||
      !doc.redirect_uris.length ||
      doc.redirect_uris.length > 20 ||
      doc.redirect_uris.some((u: unknown) => typeof u !== "string") ||
      (doc.token_endpoint_auth_method &&
        doc.token_endpoint_auth_method !== "none")
    )
      error("invalid_client", "Invalid client metadata");
    if (
      doc.client_name !== undefined &&
      (typeof doc.client_name !== "string" || doc.client_name.length > 200)
    )
      error("invalid_client", "Invalid client name");
    doc.client_name = doc.client_name?.trim() || new URL(id).hostname;
    const now = this.config.now();
    this.db
      .prepare("INSERT OR REPLACE INTO oauth_clients VALUES(?,?,?,?,?,?)")
      .run(
        id,
        doc.client_name,
        JSON.stringify(doc.redirect_uris),
        JSON.stringify(doc),
        now,
        now + DAY,
      );
    return doc;
  }
  async begin(q: Row): Promise<{ request: Row; csrf: string; client: Row }> {
    if (
      q.response_type !== "code" ||
      q.code_challenge_method !== "S256" ||
      !/^[-_A-Za-z0-9]{43}$/.test(q.code_challenge ?? "")
    )
      error("invalid_request", "A code response and S256 PKCE are required");
    if (q.resource !== this.resource)
      error("invalid_target", "Invalid resource");
    if (
      typeof q.client_id !== "string" ||
      typeof q.redirect_uri !== "string" ||
      (q.state !== undefined &&
        (typeof q.state !== "string" || q.state.length > 1024))
    )
      error("invalid_request", "Invalid authorization request");
    const client = await this.client(q.client_id);
    this.validateUrl(q.redirect_uri, this.config.redirectHosts, true);
    if (!client.redirect_uris.includes(q.redirect_uri))
      error("invalid_request", "Redirect URI is not registered");
    const scopes = String(q.scope ?? "read write")
      .split(" ")
      .filter(Boolean);
    if (
      !scopes.length ||
      new Set(scopes).size !== scopes.length ||
      scopes.some((s) => !["read", "write"].includes(s))
    )
      error("invalid_scope", "Unsupported scopes");
    const now = this.config.now(),
      csrf = secret(),
      request = {
        id: randomUUID(),
        client_id: q.client_id,
        redirect_uri: q.redirect_uri,
        state: q.state ?? null,
        code_challenge: q.code_challenge,
        scopes_json: JSON.stringify(scopes),
        resource: this.resource,
        csrf_hash: digest(csrf),
        created_at: now,
        expires_at: now + 600000,
      };
    insert(this.db, "oauth_requests", request);
    return { request, csrf, client };
  }
  form(
    r: Row,
    csrf: string,
    client: Row,
    loggedIn: boolean,
    retry?: { message: string; selected: Row },
  ): string {
    const scopes = JSON.parse(r.scopes_json) as string[],
      field = (name: string, value: string) =>
        `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`;
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NBD · 授权确认</title><style> *{box-sizing:border-box}body{margin:0;background:#f5f3ee;color:#272d29;font:16px/1.6 system-ui,sans-serif;padding:24px}main{max-width:520px;margin:8vh auto;background:#fff;padding:32px;border-radius:20px;border:1px solid #dddcd4}h1{margin-top:0}p{overflow-wrap:anywhere}.identity{font-size:14px;color:#58615b}label{display:block;margin:16px 0}input:not([type=checkbox]){display:block;width:100%;font:inherit;padding:10px;border:1px solid #b5bdb5;border-radius:8px}input[type=checkbox]{width:18px;height:18px;vertical-align:middle;margin-right:8px}button{font:inherit;padding:12px 20px;min-height:44px;border:1px solid #3b5947;border-radius:8px;background:#3b5947;color:#fff;margin:4px 8px 4px 0}button[value=deny]{background:#fff;color:#3b5947}.error{padding:12px;border-radius:8px;background:#fff0ed;color:#9b3425}@media(max-width:540px){body{padding:16px}main{margin:16px auto;padding:24px}button{width:100%}}</style></head><body><main><h1>连接 NBD</h1><p>${escapeHtml(client.client_name)} 请求访问你的私人记录。</p><p class="identity">客户端：${escapeHtml(new URL(r.client_id).hostname)}<br>回调：${escapeHtml(new URL(r.redirect_uri).hostname)}</p>${retry ? `<p class="error" role="alert">${escapeHtml(retry.message)}</p>` : ""}<form method="post" action="/oauth/authorize">${field("requestId", r.id)}${field("csrf", csrf)}${loggedIn ? "" : '<label>用户名 <input name="username" autocomplete="username" required></label><label>密码 <input type="password" name="password" autocomplete="current-password" required></label>'}${scopes.map((s) => `<label><input type="checkbox" name="${s}" value="1"${!retry || retry.selected[s] === "1" ? " checked" : ""}>${s === "read" ? "读取历史" : "记录与补记"}</label>`).join("")}<p><button name="decision" value="approve">同意连接</button> <button name="decision" value="deny" formnovalidate>拒绝</button></p></form></main></body></html>`;
  }
  consentRequest(body: Row, csrfCookie: string | undefined): Row {
    if (typeof body.requestId !== "string")
      error("invalid_request", "Invalid consent request");
    const r = this.db
      .prepare("SELECT * FROM oauth_requests WHERE id=? AND expires_at>?")
      .get(body.requestId, this.config.now()) as Row | undefined;
    if (
      !r ||
      typeof body.csrf !== "string" ||
      !csrfCookie ||
      !sameDigest(r.csrf_hash, digest(body.csrf)) ||
      !sameDigest(digest(csrfCookie), digest(body.csrf))
    )
      error("invalid_request", "Invalid or expired consent request");
    return r;
  }
  async approve(
    body: Row,
    csrfCookie: string | undefined,
    sessionToken?: string,
    context?: { requestId: string; ip: string },
  ): Promise<{ redirect: string; session?: string }> {
    const r = this.consentRequest(body, csrfCookie);
    if (!["approve", "deny"].includes(body.decision))
      error("invalid_request", "Consent decision is required");
    const redirect = new URL(r.redirect_uri);
    if (r.state !== null) redirect.searchParams.set("state", r.state);
    redirect.searchParams.set("iss", this.config.publicOrigin);
    if (body.decision === "deny") {
      this.db.prepare("DELETE FROM oauth_requests WHERE id=?").run(r.id);
      redirect.searchParams.set("error", "access_denied");
      return { redirect: redirect.href };
    }
    let user = this.auth.lookup(sessionToken)?.user,
      session: string | undefined;
    if (!user) {
      if (
        typeof body.username !== "string" ||
        typeof body.password !== "string" ||
        body.password.length > 128
      )
        error("invalid_request", "Login credentials are required");
      const loginAudit = this.audit.start(
        null,
        "oauth.login",
        "oauth",
        context?.requestId,
        context?.ip,
      );
      try {
        user = await this.auth.login(body.username, body.password);
        session = this.auth.issue(user.id, sessionToken);
        this.audit.attachUser(loginAudit, user.id);
        this.audit.finish(loginAudit, "success");
      } catch (e) {
        this.audit.finish(
          loginAudit,
          "error",
          e instanceof AppError ? e.code : "INTERNAL_ERROR",
        );
        throw e;
      }
    }
    const requested = JSON.parse(r.scopes_json) as string[],
      scopes = requested.filter((s) => body[s] === "1");
    if (!scopes.length) error("invalid_scope", "Choose at least one scope");
    const client = await this.client(r.client_id),
      code = secret();
    const p = ownerPrincipal(user as { id: string; display_name: string }),
      auditId = this.audit.start(p, "oauth.authorize", "oauth");
    try {
      this.db
        .transaction(() => {
          if (this.auth.user(user!.id).password_hash !== user!.password_hash)
            error(
              "invalid_request",
              "Credentials changed; please log in again",
            );
          if (
            this.db
              .prepare("DELETE FROM oauth_requests WHERE id=? AND expires_at>?")
              .run(r.id, this.config.now()).changes !== 1
          )
            error("invalid_request", "Consent already used or expired");
          // The schema permits only one active grant per user/client. A
          // pending code references that grant without changing its tokens
          // or scopes; exchange creates the replacement atomically.
          const previous = this.db
            .prepare(
              "SELECT * FROM oauth_grants WHERE user_id=? AND client_id=? AND revoked_at IS NULL",
            )
            .get(user!.id, r.client_id) as Row | undefined;
          const grant = {
            id: previous?.id ?? randomUUID(),
            user_id: user!.id,
            client_id: r.client_id,
            client_name: client.client_name,
            redirect_host: new URL(r.redirect_uri).hostname,
            scopes_json: JSON.stringify(scopes),
            created_at: this.config.now(),
          };
          if (!previous) insert(this.db, "oauth_grants", grant);
          insert(this.db, "oauth_codes", {
            code_hash: digest(code),
            grant_id: grant.id,
            client_id: r.client_id,
            redirect_uri: r.redirect_uri,
            code_challenge: r.code_challenge,
            scopes_json: JSON.stringify(scopes),
            resource: this.resource,
            expires_at: this.config.now() + 60000,
          });
          this.audit.finish(auditId, "success", undefined, grant.id);
        })
        .immediate();
    } catch (e) {
      this.audit.finish(
        auditId,
        "error",
        e instanceof OAuthError ? e.code : "AUTHORIZE_FAILED",
      );
      throw e;
    }
    redirect.searchParams.set("code", code);
    return { redirect: redirect.href, session };
  }
  mint(grant: Row, scopesJson: string): Row {
    const now = this.config.now(),
      access = secret("nbd_at_"),
      refresh = secret("nbd_rt_"),
      refreshId = randomUUID();
    insert(this.db, "oauth_tokens", {
      id: randomUUID(),
      grant_id: grant.id,
      kind: "access",
      token_hash: digest(access),
      scopes_json: scopesJson,
      resource: this.resource,
      created_at: now,
      expires_at: now + this.config.accessMinutes * 60000,
    });
    insert(this.db, "oauth_tokens", {
      id: refreshId,
      grant_id: grant.id,
      kind: "refresh",
      token_hash: digest(refresh),
      scopes_json: scopesJson,
      resource: this.resource,
      created_at: now,
      expires_at: now + this.config.refreshDays * DAY,
    });
    return {
      refreshId,
      response: {
        access_token: access,
        token_type: "Bearer",
        expires_in: this.config.accessMinutes * 60,
        refresh_token: refresh,
        scope: JSON.parse(scopesJson).join(" "),
      },
    };
  }
  token(body: Row): Row {
    if (!["authorization_code", "refresh_token"].includes(body.grant_type))
      error("unsupported_grant_type", "Unsupported grant type");
    if (typeof body.client_id !== "string")
      error("invalid_client", "Client ID is required");
    if (body.resource !== this.resource)
      error("invalid_target", "Invalid resource");
    const outcome = this.db
      .transaction(() => {
        const now = this.config.now(),
          isCode = body.grant_type === "authorization_code";
        const token = isCode ? body.code : body.refresh_token;
        if (typeof token !== "string" || token.length > 128)
          return { error: "invalid_grant" };
        const row = (
          isCode
            ? this.db.prepare("SELECT * FROM oauth_codes WHERE code_hash=?")
            : this.db.prepare(
                "SELECT * FROM oauth_tokens WHERE token_hash=? AND kind='refresh'",
              )
        ).get(digest(token)) as Row | undefined;
        if (!row || row.resource !== this.resource)
          return { error: "invalid_grant" };
        let grant = this.db
          .prepare("SELECT * FROM oauth_grants WHERE id=?")
          .get(row.grant_id) as Row | undefined;
        if (
          !grant ||
          grant.client_id !== body.client_id ||
          grant.revoked_at !== null
        )
          return { error: "invalid_grant" };
        if (isCode) {
          if (
            row.client_id !== body.client_id ||
            row.redirect_uri !== body.redirect_uri ||
            typeof body.code_verifier !== "string" ||
            !/^[-._~A-Za-z0-9]{43,128}$/.test(body.code_verifier) ||
            !sameDigest(
              row.code_challenge,
              Buffer.from(digest(body.code_verifier), "hex").toString(
                "base64url",
              ),
            )
          )
            return { error: "invalid_grant" };
        }
        if (isCode ? row.used_at !== null : row.replaced_by !== null) {
          this.access.revokeGrant(grant.id);
          const id = this.audit.start(
            {
              userId: grant.user_id,
              kind: "oauth_app",
              id: grant.id,
              label: grant.client_name,
              scopes: [],
            },
            "oauth.replay_detected",
            "oauth",
          );
          this.audit.finish(id, "error", "invalid_grant");
          return { error: "invalid_grant" };
        }
        if (row.expires_at <= now || (!isCode && row.revoked_at !== null))
          return { error: "invalid_grant" };
        let scopesJson = row.scopes_json;
        if (body.scope !== undefined) {
          const requested = String(body.scope).split(" ").filter(Boolean),
            original = JSON.parse(scopesJson);
          if (
            !requested.length ||
            new Set(requested).size !== requested.length ||
            requested.some((s) => !original.includes(s))
          )
            return { error: "invalid_scope" };
          scopesJson = JSON.stringify(requested);
        }
        if (
          isCode &&
          this.db
            .prepare(
              "UPDATE oauth_codes SET used_at=? WHERE code_hash=? AND used_at IS NULL",
            )
            .run(now, row.code_hash).changes !== 1
        )
          return { error: "invalid_grant" };
        if (isCode) {
          const client = this.db
            .prepare("SELECT client_name FROM oauth_clients WHERE client_id=?")
            .get(grant.client_id) as Row | undefined;
          const replacement = {
            id: randomUUID(),
            user_id: grant.user_id,
            client_id: grant.client_id,
            client_name: client?.client_name ?? grant.client_name,
            redirect_host: new URL(row.redirect_uri).hostname,
            scopes_json: scopesJson,
            created_at: now,
          };
          this.access.revokeGrant(grant.id);
          insert(this.db, "oauth_grants", replacement);
          this.db
            .prepare("UPDATE oauth_codes SET grant_id=? WHERE code_hash=?")
            .run(replacement.id, row.code_hash);
          grant = replacement;
        }
        const minted = this.mint(grant, scopesJson);
        if (!isCode)
          this.db
            .prepare(
              "UPDATE oauth_tokens SET replaced_by=?,revoked_at=? WHERE id=? AND replaced_by IS NULL",
            )
            .run(minted.refreshId, now, row.id);
        const auditId = this.audit.start(
          {
            userId: grant.user_id,
            kind: "oauth_app",
            id: grant.id,
            label: grant.client_name,
            scopes: JSON.parse(scopesJson),
          },
          isCode ? "oauth.token" : "oauth.refresh",
          "oauth",
        );
        this.audit.finish(auditId, "success");
        return { response: minted.response };
      })
      .immediate();
    if (outcome.error)
      error(outcome.error, "Invalid, expired or previously used grant");
    return outcome.response!;
  }
  revoke(body: Row): void {
    if (
      typeof body.token !== "string" ||
      body.token.length > 128 ||
      typeof body.client_id !== "string"
    )
      error("invalid_request", "Token and client ID are required");
    const row = this.db
      .prepare(
        "SELECT t.grant_id,g.client_id,g.user_id,g.client_name FROM oauth_tokens t JOIN oauth_grants g ON g.id=t.grant_id WHERE t.token_hash=?",
      )
      .get(digest(body.token)) as Row | undefined;
    if (row && row.client_id === body.client_id) {
      this.access.revokeGrant(row.grant_id);
      const id = this.audit.start(
        {
          userId: row.user_id,
          kind: "oauth_app",
          id: row.grant_id,
          label: row.client_name,
          scopes: [],
        },
        "oauth.revoke",
        "oauth",
      );
      this.audit.finish(id, "success");
    }
  }
}
