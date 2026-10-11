> 实现更新（2026-10-11）：后端已实现；自动回看排程已由所有者取消。本文保留原设计背景，当前行为以 [IMPLEMENTATION.md](docs/IMPLEMENTATION.md) 为准。

# NBD（No Big Deal · 没什么大不了）后端实施方案 v1

NBD 是一个私人网站，用来记下「当时觉得尴尬或很严重，过一段时间再看其实没什么大不了」的事，有两个目标：

1. **留住当时的情绪**：事情刚发生时由 Agent 记下来，原话和当时的强度原样保存，不会被悄悄改写。
2. **积累经验**：过一段时间回看，对比「当时 vs 现在」，从规律里提炼经验，例如「我担心的事 83% 没有发生」。

首版范围（2026-10-10/11 与所有者确认）：
- 只给所有者一个人用；
- 新记录只由 Agent 通过 MCP 上传，客户端有 Claude Code、Codex、Claude 网页/手机 App、ChatGPT；
- 网页只做复盘和整理；
- 部署到 `nbd.dkz12345.com`。

复盘提醒推送、两步验证、附件、匿名分享、多人注册都列入后续阶段，首版只预留接口。

项目根目录 `/Users/leo/Desktop/01-项目/nbd/`。本文件是总方案，细节分别在：
- [docs/DATA-MODEL.md](docs/DATA-MODEL.md)：数据与规则
- [docs/API.md](docs/API.md)、[docs/openapi.yaml](docs/openapi.yaml)：网页 API
- [docs/MCP.md](docs/MCP.md)、[docs/mcp-tools.json](docs/mcp-tools.json)：MCP 与 OAuth
- [docs/FRONTEND-GUIDE.md](docs/FRONTEND-GUIDE.md)：前端开发指南
- [docs/BACKEND-GUIDE.md](docs/BACKEND-GUIDE.md)：后端开发指南
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)：部署与运维

## 1. 主要决策

| 项目 | 最终选择 | 原因与效果 |
|---|---|---|
| 使用者 | 单一所有者，没有注册接口；所有表保留 `user_id` | 最简单、最私密；以后开放给朋友时不用改表 |
| 写入方式 | 新记录**只能**由 Agent 通过 MCP 创建；网页负责复盘、补记、整理、统计、接入管理 | 事情刚发生时人在手机上和 Agent 说话最自然；网页专注「后来的我」 |
| 技术栈 | Node.js 22、TypeScript、Fastify 5、TypeBox、better-sqlite3、MCP SDK v2 | 和 Game Hub 一致，服务器环境、部署脚本、测试方式都能复用 |
| 进程 | **单进程**，用三个 Fastify 封装上下文分别处理网页 API、MCP、OAuth | 服务器只剩约 355 MB 可用内存；SQLite 只有一个写入方；Game Hub 拆进程是为了 sudo 助手，nbd 用不着 |
| Agent 鉴权 | Claude Code/Codex 用 Agent 密钥；Claude App/ChatGPT 用 OAuth 2.1 + PKCE，客户端注册只做 CIMD | SDK v2 只提供资源服务器的部分，授权服务器自己写精简版；规范已经把 DCR 标为废弃，Claude、ChatGPT 都优先走 CIMD |
| 作用域 | `read`、`write`；只给 `write` 的令牌只能记、不能读，看不到正文 | 不太信任的客户端也能帮你记，但情绪史不会进入它的上下文 |
| 原始记录 | Agent 只能在 24 小时内更正；每次修改都留修订快照；带 `expectedRevision` 的乐观并发 | 「当时的情绪」永远找得回来；网页和 Agent 同时修改时不会互相覆盖 |
| 复盘排程 | 后端算 `nextReviewOn`（默认第 3/14/60 天），状态由后端推导 | 前端只展示；节奏函数由所有者亲手写 |
| 删除 | 事件先进回收站（30 天）；MCP 里没有任何删除工具 | 防止 Agent 出错或被提示词注入后清空日记 |
| 时间 | Instant（UTC 时刻）和 LocalDate（所有者时区的日期）两种类型，不混用 | 「第 3 天回看」「日历」都是日历概念，存成 UTC 时刻会跨日出错 |
| 检索 | SQLite FTS5 `trigram`；不足 3 个字时退回 LIKE | 本机实测中文 3 个字以上的子串能命中；个人数据量下 LIKE 足够快 |
| 契约 | 先写 `openapi.yaml` 和 `mcp-tools.json`，P2/P3 用生成结果和真实的 `tools/list` 比对 | 前端从第一天就能对着契约开发；实现完成后以生成的契约为准 |
| 提醒与 2FA | v1 不推送提醒、不做 TOTP，接口写进文档预留 | 先把记录和回看的循环跑通；登录用强密码、限流和 fail2ban |
| 部署 | 同一台 Azure 机器，`127.0.0.1:3230`，release 目录加 `current` 软链，前端单独用软链发布 | 照搬 Game Hub 已验证的流程，单独保留前端的回滚路径 |
| 备份 | 本机每日在线备份，保留 14 天，不做异机副本 | 所有者已确认；风险写进运维文档 |
| 仓库 | 公开仓库 `Leo-learner/nbd`，密钥只放 gitignore 的 `docs/deployment-private/`，推送前扫描 | 和所有者其他项目一致；数据永远不进仓库 |

## 2. 工程结构与运行边界

目录结构见 [BACKEND-GUIDE.md](docs/BACKEND-GUIDE.md) 第 2 节。

- **分层**：路由、MCP 工具、CLI 只负责解析输入、确认身份、调用服务；业务规则（冻结、修订、幂等、只写可见性、排程）只在服务层实现一次，REST 和 MCP 共用，行为不会分叉。
- **三个上下文**：
  - `/api/v1`：会话 Cookie + `X-NBD-Request` 头 + Origin 检查；
  - `/mcp`：Bearer 令牌 + Host/Origin 检查 + 按令牌限流；
  - `/oauth`、`/.well-known`：公开端点，加上服务端渲染的确认页。
  CSRF 钩子只挂在 `/api` 上，否则会挡住 MCP 和 OAuth 的 POST。
- **注入**：`buildApp(config)` 接收数据目录和时钟，测试不依赖生产目录、真实域名和全局环境变量。
- **不进 Git 的东西**：数据库、备份、私有凭据、`.env`。

## 3. 领域规则

完整定义和测试向量见 [DATA-MODEL.md](docs/DATA-MODEL.md)。

- **一件事（Moment）**：
  - 必填：标题、用户原话、场景、1–5 种情绪、当时的强度（0–10）。
  - 可选：当时觉得多严重、担心会发生什么、什么时候能知道结果、想法、身体反应、当下的应对、涉及的人（只写角色）、标签、Agent 的概括。
- **补记**只追加；**复盘**记录现在的强度、担心的事有没有发生、现在怎么看、思维陷阱，以及结论（放下了、好多了、还在意）；**经验**和事件多对多。
- **冻结与修订**：
  - Agent 只能在记录后 24 小时内更正；所有者随时可改。
  - 每次修改都先存旧快照，`revision = 1` 永远是最初的原始记录。
  - 两边都要带 `expectedRevision`。
- **状态**：已归档 > 已释怀 > 该回看 > 刚记下 > 已回看 > 冷却中。SQL 和 TypeScript 各实现一遍，用同一张向量表对拍。
- **排程**：纯函数 `computeNextReviewOn`，必须满足五条约束（结论是 let_go 时不再提醒、不早于推迟日期、在「能知道结果」那天之后……），具体节奏由所有者选定。
- **回收站**：30 天后彻底删除，并级联删除补记、复盘、修订、关联和检索索引；关联过的经验保留。
- **幂等**：写操作都带 `clientRequestId`，24 小时内重放返回原结果；另外按「原话 + 发生日期」在同一个令牌内去重，挡住模型换了 ID 的重试。

## 4. 会话与请求防护

- 用户名大小写不敏感；密码至少 12 位，用 argon2id 存（参数同 Game Hub），同时最多 2 个哈希在算。
- 会话存在数据库里，只存 SHA-256；Cookie `__Host-nbd_sid` 带 HttpOnly、Secure、SameSite=Lax；闲置 30 天过期，每 24 小时最多续期一次。
- 修改密码会撤销其他会话；新建 Agent 密钥要再输一次密码。
- 所有写请求都要求 `X-NBD-Request: 1`；请求带 Origin 时必须精确匹配，`Origin: null` 一律拒绝。
- 只信任回环代理；按 IP 限流，登录每分钟 10 次；fail2ban 盯登录失败和 OAuth 确认页的失败，但 `ignoreip` 里必须放连接器的出口段（Anthropic `160.79.104.0/21`）。
- 页面安全头：严格 CSP（`default-src 'self'`、`frame-ancestors 'none'`）、`X-Robots-Tag: noindex`、HSTS。
- 日志不记请求体、Cookie 和 Authorization；nginx 访问日志不记查询字符串。

## 5. Agent 接入与作用域

详见 [MCP.md](docs/MCP.md)。

- **传输**：`POST /mcp`，Streamable HTTP，无状态。默认用 SDK v2 的 `createMcpHandler`，同时服务 2026-07-28 新协议和 2025 年的各版本；兼容性有问题就退回 Game Hub 用的 `NodeStreamableHTTPServerTransport`。
- **令牌**：Agent 密钥 `nbd_ak_`（1–365 天）；OAuth 访问令牌 `nbd_at_`（1 小时）；刷新令牌 `nbd_rt_`（60 天，每次轮换，发现重放就撤销整个授权）。全部只存 SHA-256。
- **OAuth**：
  - 两份 well-known 元数据（RFC 9728、RFC 8414）；
  - CIMD 文档只从白名单域名获取（防 SSRF）；回调地址既要在文档里，也要在白名单里；
  - PKCE S256；authorize 和 token 都要带 `resource`；回调带 `iss`；
  - 确认页由后端渲染，可以取消勾选「读取历史」，得到只写授权；
  - 首版不做 DCR。
- **工具**：12 个（6 个读、3 个写、3 个读写），没有删除工具。写工具必须带 `clientRequestId`；只有 `correct_moment` 标为 destructive。
- **提示词**：`record`（记一笔）和 `reflect`（回看）。server instructions 里有九条硬规矩，语气部分采用所有者选定的 `NBD_AGENT_TONE`。
- **审计**：每次调用先记 running，再记 success 或 error；不记参数和正文。

## 6. 接口总表

| 面向 | 范围 | 契约 |
|---|---|---|
| 网页前端 | 48 个 REST 操作：系统 3 个、账号 5 个、事件 14 个、复盘 4 个、经验 6 个、标签 4 个、洞察 3 个、接入管理 5 个、设置与数据 4 个 | [API.md](docs/API.md)、[openapi.yaml](docs/openapi.yaml)（OpenAPI 3.0.3，嵌有示例，可直接起 mock） |
| Agent | `get_context`、`record_moment`、`add_note`、`correct_moment`、`list_due_reviews`、`search_moments`、`get_moment`、`list_lessons`、`get_insights`、`add_reflection`、`snooze_review`、`create_lesson`；提示词 `record`、`reflect` | [MCP.md](docs/MCP.md)、[mcp-tools.json](docs/mcp-tools.json) |
| OAuth 客户端 | `/.well-known/oauth-protected-resource/mcp`、`/.well-known/oauth-authorization-server`、`/oauth/authorize`、`/oauth/token`、`/oauth/revoke` | [MCP.md](docs/MCP.md) 第 2 节 |
| 预留（v2） | 附件、提醒推送、TOTP/通行密钥、匿名分享、邀请注册、DCR | [API.md](docs/API.md)「保留接口」；首版不注册这些路由，`meta.features` 全部为 false |

通用约定：前缀 `/api/v1`，字段 camelCase，错误结构 `{"error":{"code","message","details?"},"requestId"}`，时间分 Instant 和 LocalDate 两种；`/moments` 和 `/audit` 用游标分页，其他列表直接返回全部。

## 7. 数据与迁移

首版共 20 张表（含 FTS5 检索表），DDL 草案见 [DATA-MODEL.md](docs/DATA-MODEL.md) 第 3 节，已在内存数据库里实际执行通过：
- 账号：`users`、`sessions`
- 事件：`moments`、`moment_revisions`、`moment_notes`、`reflections`、`lessons`、`lesson_moments`、`reflection_lessons`、`tags`、`moment_tags`
- 接入：`idempotency_keys`、`agent_keys`、`oauth_clients`、`oauth_requests`、`oauth_grants`、`oauth_codes`、`oauth_tokens`
- 其他：`audit_events`、`moment_search`

迁移规则：
- 数据库开 WAL、外键和 busy_timeout；迁移文件 `NNN_*.sql`，**只在部署时运行**，启动时检查版本一致。
- 写事务短小，事务里不做网络请求。
- 每小时一次的清理任务负责：回收站到期、过期会话、过期幂等键、OAuth 临时数据、超过保留期的审计。

## 8. 部署、备份与交付

详见 [DEPLOYMENT.md](docs/DEPLOYMENT.md)。

1. 本地 `npm run check` 通过 → 推送公开仓库前做密钥扫描 → `scripts/deploy.sh` 打包上传 → `install.sh` 在服务器上依次备份、停服务、迁移、原子切换、检查就绪，失败时自动回滚软链和 nginx。
2. 运行环境：
   - 系统用户 `nbd`；systemd 沙箱 `ProtectSystem=strict`，只有 `/var/lib/nbd` 可写；`MemoryMax=256M`。
   - 数据目录 `nbd:nbd 0700`；`/etc/nbd.env` 里不放密钥。
3. nginx 单独一个站点，证书走 certbot webroot。访问日志用不含查询字符串的格式。
4. 每天北京时间 04:00 在线备份并校验，保留 14 天；恢复只写到空目录，恢复后要重新撤销在备份之后撤销过的密钥和授权。
5. 服务器上需要 sudo 的每一步都先征得所有者同意。DNS 由所有者在 Cloudflare 添加。本机 Clash 的 hosts 也要先问再改。

## 9. 开发阶段

| 阶段 | 内容 | 验收 |
|---|---|---|
| P0 骨架（0.5 天） | 照 Game Hub 搭仓库：config、日志、错误格式、healthz/readyz、迁移器、测试夹具、三个上下文的钩子 | `npm run check` 通过 |
| P1 数据与领域（2 天） | 迁移 001、各服务、时间模型、冻结/修订/乐观并发、排程/状态（SQL 与 TS 对拍）、FTS、回收站清理、**种子数据 CLI** | 领域测试覆盖 DATA-MODEL 的每条规则和向量；所有者完成 `computeNextReviewOn` |
| P2 网页鉴权 + REST（1.5 天） | 所有者 CLI、会话、请求防护、全部 `/api/v1` 端点、生成契约和 `sdk/generated.ts` | 生成的 openapi.json 和 yaml 规范化比对一致，之后 yaml 退役；**从这里起前端改接真实后端** |
| P3 MCP + Agent 密钥（1.5 天） | `/mcp`、密钥签发和撤销、12 个工具、2 个提示词、审计、限流、只写可见性 | 官方 client 跑通新、旧两种协议；`tools/list` 和 `mcp-tools.json` 一致；Claude Code 实测记一笔 |
| P4 OAuth（2.5 天） | 元数据、CIMD、确认页、授权码与令牌、刷新轮换和重放检测、撤销、`iss`、已连接应用 | 假 CIMD 服务器下跑通完整 PKCE 流程；claude.ai 网页连接成功、手机 App 能记一笔；ChatGPT 能连上 |
| P5 部署（1 天） | 首次开通、deploy.sh、deploy-frontend.sh、备份定时器、fail2ban、恢复演练 | DEPLOYMENT 附录 E 全部通过；三类客户端可用；恢复演练通过 |
| P6 收尾（1 天） | 安全检查、文档和实现对齐、可选的 Markdown 导出、推送前密钥扫描 | 第 10 节清单全部勾完 |

前端从 P0 开始对着 `docs/openapi.yaml` 用 mock 开发，P2 以后切到真实后端加种子数据。

## 10. 验收清单

使用 `node:test`、Fastify `app.inject()`、真实临时 SQLite 文件，以及官方 MCP client 走真实 HTTP。

1. **账号**：错误密码、未登录时 `{user:null}`、会话续期、退出全部会话、改密码和 CLI 重置后旧会话失效、新建密钥前的密码确认。
2. **请求防护**：缺 `X-NBD-Request`、恶意 Origin、`Origin: null`、伪造代理头都按契约处理；MCP 和 OAuth 不受 CSRF 钩子影响。
3. **原始记录**：Agent 冻结期内能更正、过期返回 `MOMENT_FROZEN`；所有者的修改生成修订记录；`revision = 1` 是原文；`MOMENT_CONFLICT`；标签和归档不产生修订。
4. **复盘与排程**：状态向量（SQL 与 TS 一致）；排程约束 C1–C5；复盘的新建、修改、删除都会重算派生字段；推迟；释怀后可以再复盘；归档后再取消归档。
5. **重试与去重**：同一个 `clientRequestId` 重放返回原结果，参数不同返回冲突；换了 ID 但内容相同时去重；只存成功结果；REST 的 `Idempotency-Key`。
6. **MCP**：401/405/Host/Origin；三种作用域各自的 `tools/list`；只写主体碰别人事件返回不存在、结果不含正文；审计不含参数；过期和撤销的密钥立即失效；没有删除工具。
7. **OAuth**：元数据内容；CIMD 白名单和大小、超时限制；回调地址必须完全匹配；PKCE；resource；授权码只能用一次；刷新轮换与重放撤销；确认页 CSRF 和防嵌入；只写授权；拒绝授权。
8. **契约**：生成的 openapi 与 yaml 对齐；`tools/list` 与 mcp-tools.json 一致；示例都能通过 schema 校验；前端能从契约生成类型。
9. **运维**：空库迁移、重复迁移；优雅退出；健康检查；日志脱敏；备份与校验；恢复到空目录后数据完整。
10. **上线**：HTTPS、Cookie 属性、CSP、noindex、访问日志不含查询字符串、内存在上限以内；同机其他站点不受影响。

## 11. 后续扩展边界

首版只在文档里预留，不建空表、不注册占位路由：

- **复盘提醒推送**（Telegram/邮件）：启用时再定发送时间、频率上限和退订方式；推送内容只放标题，不放原话。
- **两步验证、通行密钥**：同时覆盖网页登录和 OAuth 确认页。
- **附件**：照 Game Hub 的一次性上传票据；先确定大小上限、类型白名单，以及截图里的第三方隐私怎么处理。
- **匿名分享**：只分享所有者明确选中的字段，链接可以过期、可以撤销，公开页面在 `/s/` 下。
- **多人**：表都带 `user_id`，启用时补邀请注册、配额和逐用户的数据隔离测试。
- **DCR**：只有某个目标客户端不支持 CIMD 时才补。
- **异机备份**：所有者决定后，再加加密的异机副本。

## 12. 由所有者亲手完成的部分

- **已完成（文档阶段）**：[MCP.md](docs/MCP.md) 第 6.1 节 server instructions 里的「语气」段落，采用所有者 2026-10-11 选定的 `NBD_AGENT_TONE`，可以继续修改。
- **P1**：`src/domain/schedule.ts` 的 `computeNextReviewOn()`，决定多久提醒你回看一次。签名和约束见 [DATA-MODEL.md](docs/DATA-MODEL.md) 第 7 节，可选的节奏见 [BACKEND-GUIDE.md](docs/BACKEND-GUIDE.md) 第 12 节。
