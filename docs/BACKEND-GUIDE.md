> 实现更新（2026-10-11）：后端已实现；自动回看排程已由所有者取消。本文保留原设计背景，当前行为以 [IMPLEMENTATION.md](IMPLEMENTATION.md) 为准。

# NBD 后端开发指南

给负责后端的开发者看。整体方案见 [PLAN.md](../PLAN.md)，数据和规则见 [DATA-MODEL.md](DATA-MODEL.md)，对外契约见 [openapi.yaml](openapi.yaml)、[mcp-tools.json](mcp-tools.json)。

工程约定照搬 Game Hub（`~/Desktop/game_site`，公开仓库 `Leo-learner/game-hub`），遇到本文没写到的细节，先看 Game Hub 是怎么做的。

## 1. 技术栈

| 用途 | 选择 | 备注 |
|---|---|---|
| 运行时 | Node.js 22（服务器 v22.23.0），TypeScript，ESM | `engines: ">=22 <25"` |
| Web 框架 | Fastify 5 + TypeBox | 校验用 ajv：`removeAdditional: false`，所有对象都 `additionalProperties: false` |
| 契约 | @fastify/swagger → `docs/openapi.json`；openapi-typescript → `sdk/generated.ts` | 照搬 `game_site/scripts/generate-contract.ts` |
| 数据库 | better-sqlite3 ^13（自带 SQLite 3.53，支持 FTS5 trigram） | WAL、外键、busy_timeout 3000 |
| 密码 | argon2id（memoryCost 19456，timeCost 2，parallelism 1），同时最多 2 个哈希 | 照搬 `game_site/src/modules/auth.ts` |
| MCP | `@modelcontextprotocol/server` + `@modelcontextprotocol/node` ^2.3，工具 schema 用 zod 4 | 测试用 `@modelcontextprotocol/client` |
| 其他 | @fastify/cookie、@fastify/rate-limit、@fastify/static、@fastify/formbody（OAuth token 端点） | 不引入 helmet，安全头自己设 |
| 测试 | `node --import tsx --test`，Fastify `app.inject()`，真实临时 SQLite 文件 | |

## 2. 目录结构与分层

```text
nbd/
  src/
    server.ts            # 读配置、openDb、assertMigrated、buildApp、listen；每小时清理任务；SIGTERM 优雅退出
    app.ts               # buildApp(config, deps)：全局钩子、三个上下文、错误处理、静态文件与 SPA 回退
    config.ts            # 读取并校验环境变量（照搬 game_site：process.loadEnvFile + 手写校验）
    errors.ts            # AppError(status, code, message, details?) 和 fail()
    time.ts              # clock = config.now；todayIn(tz)；LocalDate 加减和相差天数
    schemas/             # TypeBox schema，$id 与 openapi 组件同名
    domain/
      constants.ts       # 枚举和限额：REST schema、MCP schema、/meta、迁移的 CHECK 都从这里来
      status.ts          # 状态推导：SQL CASE 片段 + TS 函数，共用一张测试向量表
      schedule.ts        # computeNextReviewOn ← 所有者亲手写（第 12 节）
      tags.ts            # 标签规范化
      fingerprint.ts     # 幂等参数指纹、内容去重指纹
    db/
      index.ts           # openDb、migrate、assertMigrated、schemaVersion
      migrations/001_init.sql
    modules/             # 业务服务，REST、MCP、CLI 共用
      auth.ts sessions.ts moments.ts notes.ts reflections.ts lessons.ts tags.ts
      insights.ts search.ts access.ts audit.ts idempotency.ts exporter.ts cleanup.ts
    routes/              # /api/v1 各模块的路由，只做输入输出、鉴权、调用服务
    mcp/
      handler.ts         # createMcpHandler 接到 Fastify；Bearer 鉴权和 Host/Origin 检查
      tools.ts           # 12 个工具（按作用域注册，统一审计包装）
      prompts.ts         # record / reflect
      instructions.ts    # server instructions（「语气」段落见 MCP.md 6.1）
    oauth/
      metadata.ts        # 两份 well-known
      cimd.ts            # 取并校验客户端元数据文档（带缓存）
      authorize.ts       # 确认页（服务端渲染）和提交
      token.ts revoke.ts tokens.ts
  scripts/
    admin.ts             # migrate、create-owner、reset-password、create-agent-key、revoke-agent-key、backup、verify-backup、restore
    seed.ts              # 本地开发种子数据（拒绝在 NODE_ENV=production 下运行）
    generate-contract.ts # 生成 docs/openapi.json 和 sdk/generated.ts
    deploy.sh            # 后端发版（照搬 Game Hub）
    deploy-frontend.sh   # 前端发版：上传静态产物，软链切换 frontend/
  deploy/                # nbd.service、nbd-backup.service、nbd-backup.timer、nginx.conf、install.sh、renew-certificate.sh、fail2ban/
  test/                  # api、mcp、oauth、domain、migrations、contract
  docs/
```

**分层规则**：
- 路由、MCP 工具、CLI 只做三件事：解析输入、确认身份和权限、调用服务。**不写 SQL**（Game Hub 在 `app.ts`、`tools.ts` 里有少量内联 SQL，这里不要这样做）。
- 服务类接收 `(db, config, deps)`，返回经过 `present*()` 映射的 camelCase DTO；规则不满足时 `fail(status, code, message, details)`。
- 业务规则只在服务层实现一次。REST 和 MCP 的参数 schema 只管格式，冻结期、修订、幂等、只写可见性这些都在服务里判断，这样 REST 和 MCP 的行为不会分叉。
- 所有服务方法都接收一个 `Principal`：`{userId, kind: 'owner'|'agent_key'|'oauth_app'|'system', id, label, scopes}`。审计、作者字段、只写可见性都从它来。

## 3. 三个 Fastify 上下文

单进程监听 `127.0.0.1:3230`。用 Fastify 的封装（`app.register(plugin, {prefix})`）把三类入口的钩子隔开。Game Hub 的 CSRF/Origin 钩子是全局的，照搬到单进程里会把 `/mcp` 和 `/oauth/token` 的 POST 全部挡成 403。

| 上下文 | 路径 | 身份 | 请求防护 | 限流 | bodyLimit | 错误格式 |
|---|---|---|---|---|---|---|
| 网页 API | `/api/v1/*` | 会话 Cookie | 写请求要求 `X-NBD-Request: 1`；Origin 存在时必须精确匹配（拒绝 `null`）；`Cache-Control: no-store` | 全局每 IP 300/分；login 10/分；password、agent-keys 5/分 | 128 KiB | `{"error":{…},"requestId"}` |
| MCP | `/mcp` | Bearer（`nbd_ak_` / `nbd_at_`） | `onRequest` 里先鉴权；Host 必须匹配 `PUBLIC_ORIGIN`；Origin 存在时必须在允许列表里 | 每个主体 120/分；`record_moment` 30/小时 | 256 KiB | 401 带 `WWW-Authenticate`；工具错误在 JSON-RPC 结果里 |
| OAuth | `/.well-known/*`、`/oauth/*` | 公开；确认页用会话 Cookie + 表单 CSRF 令牌 | well-known 允许 `Access-Control-Allow-Origin: *`（只读元数据）；确认页 `frame-ancestors 'none'` | authorize 提交每 IP 10/分；token 每个 client 60/分 | 16 KiB | 按 RFC 6749 的 `{error, error_description}` |

全局钩子只做：生成请求 ID（`X-Request-Id`）、`X-Content-Type-Options: nosniff`、`Referrer-Policy: same-origin`、`X-Robots-Tag: noindex`。日志脱敏照搬 Game Hub：`authorization`、`cookie`、`set-cookie`、`password` 不进日志，也**不记录请求体**。`trustProxy` 只信任回环地址。

静态前端（`PUBLIC_DIR`）和 SPA 回退不在上面三个上下文里。HTML 响应加 CSP：

```text
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'
```

SPA 回退只对 `Accept` 含 `text/html`、并且不在保留前缀下的 GET 生效，不能吞掉 API 的 404。

## 4. 不变量

[DATA-MODEL.md](DATA-MODEL.md) 第 4 节是数据层的不变量。代码层面再加几条：

1. **时间只从 `config.now()` 来**。服务里禁止直接用 `Date.now()` / `new Date()`，测试用固定时钟。
2. **LocalDate 在写入时算好并存储**（`happened_on`、`captured_on`、`reflected_on`），之后不重算；「今天」每次请求时按所有者当前时区算。
3. **一个写操作 = 一个 `.immediate()` 事务**：业务写入、修订、派生字段、检索索引、幂等记录、审计结束状态在同一个事务里提交。审计的 `running` 行在事务**之前**单独写，这样失败也有痕迹。
4. **只写主体的结果里不回显正文**：服务层返回给 MCP 的结果按主体的作用域裁剪；不要指望工具层自己记得删字段。
5. **MCP 里没有删除**：`tools.ts` 不 import 任何删除方法。代码评审时 grep 一下。
6. **令牌比较用常量时间比较**（比对 SHA-256 摘要）；令牌、会话、授权码、CSRF 令牌都只存摘要。
7. **外部来的文本一律当数据**：CIMD 的 `client_name`、用户原话都不会被当成 HTML 或指令；确认页渲染必须转义。

## 5. 时间与时钟

- `todayIn(tz, nowMs)`：用 `new Intl.DateTimeFormat('en-CA', {timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'}).format(nowMs)` 得到 `YYYY-MM-DD`。
- LocalDate 运算：把 `YYYY-MM-DD` 当作 UTC 午夜做加减（`Date.UTC`），再格式化回字符串，不受夏令时影响。
- `happenedAt` 输入解析：带偏移的时间按偏移换算成 Instant，`happened_on` 按**输入的偏移**取日期；只有日期的取所有者时区当天 12:00 作为 `happened_at`；晚于 `now + 10 分钟` 时 400 `HAPPENED_AT_IN_FUTURE`。
- 时区校验：`Intl.supportedValuesOf('timeZone').includes(tz)`。

## 6. 新增一个 REST 端点

1. 在 `src/schemas/` 写 TypeBox schema，`$id` 用 openapi 组件名；枚举和限额从 `domain/constants.ts` 引用。
2. 在对应的 `modules/*.ts` 里加服务方法（规则、事务、审计都在这里）。
3. 在 `routes/` 用路由帮助函数注册：设置 `operationId`、tag、`auth`、单独的限流和可能的错误码。照搬 Game Hub 的 `add()`，前缀固定 `/api/v1`，写方法自动挂 `X-NBD-Request` 头的 schema。
4. 测试：用 `app.inject()` 覆盖成功、校验失败、未登录、缺请求头、主要的业务错误。
5. `npm run build` 重新生成 `docs/openapi.json` 和 `sdk/generated.ts`，一起提交；同时更新 [API.md](API.md) 和 [FRONTEND-GUIDE.md](FRONTEND-GUIDE.md) 的对照表。

## 7. 新增一个 MCP 工具

1. 在 `mcp/tools.ts` 里用 `z.strictObject` 定义输入，枚举描述写成 `key=中文`；输出 schema 写具体类型，外面包一层 `{data}`。
2. 注册时声明需要的作用域（不满足就不注册）和全部四个注解；`destructiveHint` 必须显式写，因为 MCP 规范默认是 `true`。
3. 写工具必须要求 `clientRequestId`，并经过 `idempotency` 服务。
4. 统一包装：先检查令牌是否仍然有效 → 写审计 `running` → 调服务 → 审计 `success`/`error` → 返回 `{content: [{type:'text', text}], structuredContent: {data}}`。业务错误返回 `isError: true` 加 `{error, auditId}`，不抛异常（照搬 `game_site/src/mcp/tools.ts:30-56`）。
5. 更新 [mcp-tools.json](mcp-tools.json) 和 [MCP.md](MCP.md)；契约测试会比对真实的 `tools/list`。

## 8. MCP SDK 注意事项

- **每个请求新建一个 server**：`createMcpHandler(factory, {legacy: 'stateless'})` 的 `factory` 接收当次请求的身份信息，按作用域注册工具，所以「只写令牌看不到读工具」是自然成立的。
- **handler 不管鉴权**：令牌校验、Host/Origin 检查都在 Fastify 的 `onRequest` 里完成，通过后把 `AgentPrincipal` 作为 `authInfo` 传进去。
- **SDK 会先校验参数**：参数通不过 `inputSchema` 时，SDK 2.x 会在 handler 之前自己返回一个 `isError` 文本结果（在 game_site 的 2.1.0 上确认过，升级到 2.3 后要再验一次）。这种调用不进审计，也不是项目自己的错误格式。所以：
  1. 业务规则绝不能只靠 schema；
  2. 在 MCP.md 里已经告诉 Agent 怎么处理。
- **SDK 会校验 `structuredContent`**：有 `outputSchema` 时，返回值不符合会被 SDK 拦下。这同时是一层免费的契约测试。
- **函数名以安装版本为准**：`createMcpHandler`、`toNodeHandler`、`NodeStreamableHTTPServerTransport` 的确切导出名和参数，先看 `node_modules/@modelcontextprotocol/*/dist/*.d.mts`。P3 第一件事就是用官方 client 分别跑通新、旧两种协议。

## 9. OAuth 实现清单

SDK v2 只提供资源服务器的辅助函数（`requireBearerAuth`、`checkResourceAllowed`、PRM 相关函数），授权服务器的部分已经移进废弃的 `server-legacy` 包，所以我们自己实现一个精简版。逐条核对：

- [ ] PRM 的 `resource` 等于 `${PUBLIC_ORIGIN}/mcp`；`authorization_servers` 只有一个；路径版和根路径版都提供。
- [ ] 授权服务器元数据包含 `code_challenge_methods_supported: ["S256"]`、`client_id_metadata_document_supported: true`、`token_endpoint_auth_methods_supported: ["none"]`、`authorization_response_iss_parameter_supported: true`，不含 `offline_access` 和 `registration_endpoint`。
- [ ] CIMD 获取：域名白名单、只走 HTTPS、不跟随重定向、5 秒超时、≤5 KB、文档的 `client_id` 等于请求地址、缓存 24 小时；测试环境用 `NODE_ENV=test` 下才生效的开关，允许 `http://127.0.0.1` 上的假文档。
- [ ] `redirect_uri` 和文档里的某一项**完全相等**，并且域名在 `OAUTH_REDIRECT_HOSTS` 里；本机回调默认关闭。
- [ ] 参数不合格时显示错误页，**绝不跳回**未经验证的 `redirect_uri`。
- [ ] 只接受 S256；`code_verifier` 按 RFC 7636 校验，比较用常量时间。
- [ ] `resource` 在 authorize 和 token 两步都必须出现，且等于 MCP 地址；令牌记录受众，MCP 鉴权时核对。
- [ ] 授权码只存哈希，60 秒有效；用 `UPDATE … SET used_at = ? WHERE code_hash = ? AND used_at IS NULL` 保证只能用一次。重复使用视为攻击，撤销整个授权。
- [ ] 刷新令牌每次轮换；旧令牌（`replaced_by` 不为空）再出现时撤销整个授权，返回 `invalid_grant`。
- [ ] 回调带 `iss`（RFC 9207）；拒绝时返回 `error=access_denied`。
- [ ] token 端点接受 form-urlencoded，10 秒内响应，带 `Cache-Control: no-store`；错误码按 RFC 6749，受众不对返回 `invalid_target`。
- [ ] 确认页：转义所有外部字段；显示 client_id 域名和回调域名；可以取消勾选 `read`；一次性 CSRF 令牌和 `oauth_requests` 绑定；`frame-ancestors 'none'`；登录失败返回 401（给 fail2ban 用）。
- [ ] 每一步都写审计（`oauth.authorize`、`oauth.token`、`oauth.refresh`、`oauth.revoke`、`oauth.replay_detected`），不记令牌。

## 10. 测试

`npm test` = `node --import tsx --test --test-concurrency=1 test/*.test.ts`；`npm run check` = build + typecheck + test。

| 文件 | 覆盖 |
|---|---|
| `domain.test.ts` | 状态推导（SQL 与 TS 跑同一张向量表，见 DATA-MODEL 第 6 节）；排程约束 C1–C5 加所有者自己的向量；标签规范化；两种指纹；LocalDate 运算和时区边界 |
| `migrations.test.ts` | 空库迁移；重复迁移幂等；`assertMigrated` 版本不一致时拒绝启动 |
| `api.test.ts` | 每个端点的成功和主要失败：会话续期和撤销、CSRF 头、Origin、冻结与修订、`MOMENT_CONFLICT`、回收站和彻底删除的级联、标签合并、洞察口径（构造已知数据核对每个数字）、导出、限流 |
| `mcp.test.ts` | 用官方 client 走真实 HTTP（端口 0），新、旧两种协议都测：401/405/Host/Origin；三种作用域分别看到的 `tools/list`（和 `docs/mcp-tools.json` 比对）；只写主体碰别人事件返回 `MOMENT_NOT_FOUND`、结果不含正文；幂等重放和冲突；内容去重；`MOMENT_FROZEN`；审计不含参数；过期、撤销的密钥 |
| `oauth.test.ts` | 假 CIMD 服务器下跑完整 PKCE 流程；回调地址、PKCE、resource、过期授权码、重复使用授权码；刷新轮换和重放撤销；确认页 CSRF；拒绝授权；只写授权 |
| `contract.test.ts` | 生成的 `docs/openapi.json` 和 `docs/openapi.yaml` 做规范化比对：operationId 集合、路径和方法、状态码、必填字段、枚举值一致（P2 通过后 yaml 退役，这一项改为防止 openapi.json 未提交） |

测试夹具照搬 Game Hub：`mkdtemp('.work/tests/case-')`；`createConfig({dataDir, logger: false, now: () => clock}, {})` 用空的环境变量对象，隔离 `.env`；`openDb` → `migrate` 两次 → `buildApp`。

## 11. 环境变量

本地开发用 `.env`（从 `.env.example` 复制），生产在 `/etc/nbd.env`（见 [DEPLOYMENT.md](DEPLOYMENT.md)）。数值只接受正整数，布尔值只接受 `true`/`false`，其他值启动时报错（照搬 Game Hub）。`NODE_ENV=production` 时必须 `COOKIE_SECURE=true`，并且 `PUBLIC_ORIGIN` 必须是 https。

| 变量 | 默认值 | 说明 |
|---|---|---|
| `NODE_ENV` | `development` | `production` / `development` / `test` |
| `HOST` / `PORT` | `127.0.0.1` / `3230` | 只监听回环地址 |
| `PUBLIC_ORIGIN` | `http://127.0.0.1:3230` | 对外地址；也决定 MCP 资源地址和 OAuth issuer |
| `DATA_DIR` | `.work/data` | 数据库和备份目录 |
| `PUBLIC_DIR` | `public` | 前端静态文件目录 |
| `COOKIE_SECURE` | `false` | `true` 时 Cookie 名为 `__Host-nbd_sid` |
| `TRUST_PROXY` | `false` | 只信任回环代理 |
| `ALLOWED_ORIGINS` | 空 | 额外允许的来源，逗号分隔，不能用通配符 |
| `SESSION_TTL_DAYS` | `30` | 会话闲置有效期 |
| `DEFAULT_TIMEZONE` | `Asia/Shanghai` | 创建所有者时的默认时区 |
| `REVIEW_SCHEDULE_DAYS` | `3,14,60` | 复盘节奏参数，传给排程函数 |
| `FREEZE_HOURS` | `24` | Agent 可更正的小时数 |
| `TRASH_DAYS` | `30` | 回收站保留天数 |
| `AUDIT_RETENTION_DAYS` | `365` | 审计保留天数 |
| `MCP_RATE_PER_MIN` | `120` | 每个令牌每分钟请求数 |
| `MCP_RECORD_PER_HOUR` | `30` | 每个令牌每小时 `record_moment` 次数 |
| `OAUTH_CLIENT_ID_HOSTS` | `claude.ai,claude.com,chatgpt.com` | 允许获取 CIMD 文档的域名 |
| `OAUTH_REDIRECT_HOSTS` | `claude.ai,claude.com,chatgpt.com` | 允许的回调域名 |
| `OAUTH_ALLOW_LOOPBACK_REDIRECT` | `false` | 是否允许 localhost / 127.0.0.1 回调 |
| `OAUTH_ACCESS_TTL_MIN` | `60` | 访问令牌有效分钟数 |
| `OAUTH_REFRESH_TTL_DAYS` | `60` | 刷新令牌滑动有效天数 |
| `API_DOCS` | `false` | 是否开放 `/docs` 和 `/openapi.json` |
| `SPA_FALLBACK` | `true` | 是否对前端路由返回 `index.html` |
| `LOG_LEVEL` | `info` | pino 日志级别 |

## 12. 留给所有者亲手写的函数

`src/domain/schedule.ts` 里的 `computeNextReviewOn()` 决定**多久之后提醒你回看**，是这个产品手感的核心，由所有者在 P1 亲自实现。签名和必须满足的约束 C1–C5 见 [DATA-MODEL.md](DATA-MODEL.md) 第 7 节。后端开发者先把文件、类型和调用点准备好，函数体留一个 `TODO(human)`，并让约束测试先跑起来（期望失败）。

可选的节奏，各有取舍：

| 方案 | 做法 | 好处 | 代价 |
|---|---|---|---|
| A 固定锚点 | 从记录日起第 3、14、60 天；复盘时把「已经过去的点」算作用掉 | 简单、可预测，和示例一致 | 一件事早早就释怀了，也还得等到第 14 天才会再问 |
| B 跟着上次复盘走 | 下次 = 上次复盘日 + `scheduleDays[已复盘次数]` | 节奏贴着用户的实际行动 | 一直不复盘就一直只停在第一步 |
| C 看强度调整 | 在 A 或 B 的基础上，当时强度 ≥ 8 时第一次提前到第 1 天；最近一次 `intensityNow` ≤ 2 时下一次间隔加倍 | 更贴合「情绪在消退」这件事 | 规则多了，要多写测试向量 |

不管选哪个，都要补几条自己的测试向量，写进 `domain.test.ts`；如果选的不是 A，还要更新 [examples/](examples/) 里的 `nextReviewOn`。
