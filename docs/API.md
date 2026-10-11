> 实现更新（2026-10-11）：后端已实现；自动回看排程已由所有者取消。本文保留原设计背景，当前行为以 [IMPLEMENTATION.md](IMPLEMENTATION.md) 为准。

# NBD 网页 API

线上根地址 `https://nbd.dkz12345.com`，业务前缀 `/api/v1`。完整字段、必填项、长度限制和示例在 [openapi.yaml](openapi.yaml)（OpenAPI 3.0.3）；后端完成 P2 后，以服务端生成的 `/openapi.json` 为准，那时 yaml 退役。

这套接口只给**网页前端**用。新记录只能由 Agent 通过 MCP 创建，网页上没有「新建一件事」的接口；MCP 见 [MCP.md](MCP.md)。前端怎么接、页面对应哪些接口，见 [FRONTEND-GUIDE.md](FRONTEND-GUIDE.md)。

## 通用约定

- JSON 字段 camelCase；请求体 `Content-Type: application/json`。
- 登录用 HttpOnly 会话 Cookie。生产名为 `__Host-nbd_sid`（Secure、SameSite=Lax、只属于当前主机），本地 `COOKIE_SECURE=false` 时名为 `nbd_sid`。fetch 设 `credentials: 'include'`；前端不需要也读不到令牌。
- **所有 POST、PUT、PATCH、DELETE 都必须带 `X-NBD-Request: 1`**，包括登录、退出和没有请求体的操作。缺少时返回 403 `REQUEST_HEADER_REQUIRED`。
- 请求带 `Origin` 时必须完全等于允许的来源（生产只有 `https://nbd.dkz12345.com`），`Origin: null` 一律拒绝（403 `ORIGIN_REJECTED`）。本地前端跑在其他端口时，在后端 `.env` 里加 `ALLOWED_ORIGINS=http://localhost:5173`，或者让前端开发服务器把 `/api` 代理到 `http://127.0.0.1:3230`（推荐，与生产一样同源）。
- 未知字段一律拒绝（400 `VALIDATION_ERROR`），例如给 PATCH 多传一个 `status`。
- 所有 `/api/` 响应都带 `Cache-Control: no-store` 和 `X-Request-Id`。
- 枚举的中文标签、各种长度限制、排程参数都从 `GET /api/v1/meta` 取，前端不要写死。

### 两种时间类型

| 类型 | 格式 | 例子 | 用在 |
|---|---|---|---|
| Instant | UTC ISO 8601，毫秒 | `2026-10-11T01:02:10.500Z` | `capturedAt`、`createdAt`、`editableUntil`、`happenedAt` 等 |
| LocalDate | `YYYY-MM-DD`，按所有者时区解释 | `2026-10-11` | `happenedOn`、`nextReviewOn`、`dueOn`、`reflectedOn`、日历、`from`/`to` |

`happenedAtPrecision` 说明发生时间有多准：`exact` 精确时间，`day` 只知道哪天，`approx` 大概哪天。`day`/`approx` 时 `happenedAt` 只是排序用的近似值（所有者时区当天 12:00），界面上应该只显示日期。

### 错误结构

```json
{"error":{"code":"MOMENT_CONFLICT","message":"这件事刚被修改过，请刷新后再改","details":{"currentRevision":3}},"requestId":"req-7f"}
```

`message` 是给人看的中文，不含堆栈、SQL 或服务器路径。每个操作可能返回哪些错误码，见 openapi.yaml 里该操作的 `x-nbd-error-codes`。

| 错误码 | 状态 | 含义 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 参数不符合 schema（`details.field` 指出字段） |
| `EMPTY_PATCH` | 400 | PATCH 里除了 `expectedRevision`/`reason` 没有任何要改的字段 |
| `HAPPENED_AT_IN_FUTURE` | 400 | 发生时间比现在晚 10 分钟以上 |
| `INVALID_TIMEZONE` | 400 | 不是合法的 IANA 时区 |
| `RANGE_TOO_LARGE` | 400 | 日历查询超过 400 天 |
| `TAG_MERGE_SELF` | 400 | 把标签合并进它自己 |
| `AUTH_REQUIRED` | 401 | 没登录或会话过期 |
| `INVALID_CREDENTIALS` | 401 | 用户名或密码错误（不区分哪个错） |
| `PASSWORD_INCORRECT` | 403 | 已登录，但再次确认的当前密码不对（改密码、新建 Agent 密钥） |
| `REQUEST_HEADER_REQUIRED` | 403 | 写请求缺少 `X-NBD-Request: 1` |
| `ORIGIN_REJECTED` | 403 | Origin 不在允许列表里 |
| `NOT_FOUND` | 404 | 路径不存在 |
| `MOMENT_NOT_FOUND` / `NOTE_NOT_FOUND` / `REFLECTION_NOT_FOUND` / `LESSON_NOT_FOUND` / `TAG_NOT_FOUND` / `AGENT_KEY_NOT_FOUND` / `APP_NOT_FOUND` | 404 | 对应资源不存在 |
| `MOMENT_CONFLICT` | 409 | `expectedRevision` 和当前修订号不一致（`details.currentRevision`） |
| `MOMENT_IN_TRASH` | 409 | 事件在回收站里，只能查看、恢复或彻底删除 |
| `MOMENT_NOT_IN_TRASH` | 409 | 恢复或彻底删除时，事件并不在回收站里 |
| `NOT_SCHEDULED` | 409 | 已释怀或已归档的事件不能推迟回看 |
| `TAG_EXISTS` | 409 | 重命名撞上已有标签（`details.existingTagId`），需要的话改用合并 |
| `IDEMPOTENCY_CONFLICT` | 409 | 同一个 `Idempotency-Key` 带了不同的内容 |
| `TOO_MANY_KEYS` | 409 | 同时有效的 Agent 密钥已达上限（20 把） |
| `PAYLOAD_TOO_LARGE` | 413 | 请求体过大 |
| `RATE_LIMITED` | 429 | 请求太频繁（响应带 `Retry-After`） |
| `AUTH_BUSY` | 429 | 同时进行的密码校验太多，稍后重试 |
| `INTERNAL_ERROR` | 500 | 服务出错，带上 `requestId` 排查 |
| `STORAGE_BUSY` | 503 | 数据库暂时忙，可以重试 |
| `NOT_READY` | 503 | 只用于 `/readyz`：迁移版本不一致或数据库不可读 |

MCP 另有 `MOMENT_FROZEN`、`INVALID_INPUT` 等，见 [MCP.md](MCP.md) 第 5 节。

### 分页

- `GET /moments` 和 `GET /audit` 用游标：返回 `{items, nextCursor, total}`。拿到的 `nextCursor` 原样传回 `cursor` 参数；为 `null` 表示没有下一页。`total` 是符合当前筛选条件的总数，用来显示「共 N 件」。
- 经验、标签、回收站、Agent 密钥、已连接应用数量少，直接返回完整列表（最多 500 条），不分页。

### 幂等

`createNote`、`createReflection`、`createLesson` 接受可选的 `Idempotency-Key` 头（8–64 位字母、数字、`-`、`_`）。网络重试时带同一个值，24 小时内不会重复创建，返回第一次的结果；同一个键带了不同内容返回 409 `IDEMPOTENCY_CONFLICT`。

## 系统

| 方法与路径 | operationId | 说明 |
|---|---|---|
| `GET /healthz` | `getHealth` | 存活检查，`{ok:true}` |
| `GET /readyz` | `getReady` | 就绪检查：数据库可读且迁移版本一致，`{ok, schemaVersion}`；否则 503 |
| `GET /api/v1/meta` | `getMeta` | 公开。版本、功能开关、限额、排程参数、全部枚举的中文标签 |

`meta.features` 里 `attachments`、`reminders`、`shareLinks`、`totp`、`registration`、`dcr` 在 v1 全部为 `false`，前端据此隐藏对应入口（见「保留接口」）。完整响应见 [examples/meta.json](examples/meta.json)。

## 账号

| 方法与路径 | operationId | 输入 | 输出/行为 |
|---|---|---|---|
| `POST /auth/login` | `login` | `{username, password}` | `{user}`，设置 Cookie，轮换会话 |
| `POST /auth/logout` | `logout` | 无请求体 | `{ok:true}`，没登录也成功 |
| `POST /auth/logout-all` | `logoutAll` | 无请求体 | `{ok:true}`，所有会话失效 |
| `GET /auth/me` | `getMe` | — | `{user}`；未登录时 `{user:null}`，**不返回 401** |
| `PUT /auth/password` | `changePassword` | `{currentPassword, newPassword}` | `{ok:true}`；其他会话全部失效，当前会话轮换 |

- User 字段：`id`、`username`、`displayName`、`timezone`、`weekStartsOn`、`createdAt`。
- 用户名 3–20 位字母、数字、下划线，大小写不敏感；新密码至少 12 个字符。
- 没有注册接口：唯一的所有者账号由服务器 CLI 创建，忘记密码也在服务器上用 CLI 重置（会撤销全部会话）。
- 会话闲置 30 天过期，最多每 24 小时续期一次。登录按 IP 限流每分钟 10 次。

## 事件（一件事）

| 方法与路径 | operationId | 输入 | 输出/行为 |
|---|---|---|---|
| `GET /moments` | `listMoments` | 见下方过滤参数 | `MomentPage`：`{items: MomentSummary[], nextCursor, total}` |
| `GET /moments/{momentId}` | `getMoment` | — | `MomentDetail`，含补记、复盘、经验、强度序列 |
| `PATCH /moments/{momentId}` | `updateMoment` | `MomentPatch`：`expectedRevision` + 要改的字段 + 可选 `reason` | 新的 `MomentDetail`；生成一条修订记录 |
| `GET /moments/{momentId}/revisions` | `listMomentRevisions` | — | `{current, items: Revision[]}` |
| `PUT /moments/{momentId}/tags` | `setMomentTags` | `{names: string[]}`（≤10 个） | `{momentId, tags}`；整组替换，不产生修订记录 |
| `POST /moments/{momentId}/notes` | `createNote` | `{body}`（1–5000 字） | 201，`Note` |
| `DELETE /notes/{noteId}` | `deleteNote` | — | 204 |
| `POST /moments/{momentId}/snooze` | `snoozeMoment` | `{days: 1–90}` 或 `{until: LocalDate}` 二选一 | `ScheduleState` |
| `POST /moments/{momentId}/archive` | `archiveMoment` | 无请求体 | `ArchiveState`；幂等 |
| `POST /moments/{momentId}/unarchive` | `unarchiveMoment` | 无请求体 | `ArchiveState`；幂等 |
| `DELETE /moments/{momentId}` | `trashMoment` | — | `{momentId, deletedAt, purgeAt}`；移进回收站 |
| `POST /moments/{momentId}/restore` | `restoreMoment` | 无请求体 | 恢复后的 `MomentSummary` |
| `GET /trash` | `listTrash` | — | `{items: [{moment, deletedAt, purgeAt}]}` |
| `DELETE /trash/{momentId}` | `purgeMoment` | — | 204；立即彻底删除，不可恢复 |

**`GET /moments` 过滤参数**（都可选，可组合）：`status`、`scene`、`emotion`、`tag`（标签名）、`trap`（任一次复盘标过的思维陷阱）、`resolution`（最近一次复盘的结论）、`fearCameTrue`、`from`/`to`（按 `happenedOn`，含两端）、`q`（关键词）、`sort`（`happened_desc` 默认 / `happened_asc` / `captured_desc` / `intensity_desc`）、`cursor`、`limit`（默认 20，最多 100）。洞察页点进某个分布，就是带上对应过滤参数的列表。

**关键词 `q`**：按字面匹配标题、原话、概括、担心、想法、补记和复盘文字；空格分开的多个词表示同时包含。带 `q` 时每条结果多一个 `matchSnippet`（命中位置附近的片段）。

**字段要点**（完整定义见 openapi.yaml 的 `MomentSummary` / `MomentDetail`，示例见 [examples/moment-detail.json](examples/moment-detail.json)）：

- `status` 由后端推导：`fresh` 刚记下（24 小时内，Agent 还能更正）、`cooling` 冷却中、`due` 该回看、`reflected` 已回看（等下一次）、`settled` 已释怀、`archived` 已归档。前端只展示，不要自己算。
- `intensity`（当时多难受）、`severity`（当时觉得多严重）都是 0–10；`latestIntensityNow` 是最近一次复盘时的强度，没复盘为 `null`。
- `emotions` 是 1–5 个 `{key, intensity}`，`intensity` 可以是 `null`（没单独打分）。
- `source` 是记录它的 Agent（`{kind, id, label}`），例如 `{"kind":"oauth_app","label":"Claude"}`。
- `revision` 是当前修订号；`editableUntil` 之前 Agent 还能更正；`revisionCount > 0` 表示原始记录被改过，可以去看修订历史。
- `intensitySeries` 是「当时」加上每次复盘的强度点（`on`、`dayOffset`、`intensity`、`kind`），直接用来画详情页的强度小图。
- 回收站里的事件也能用 `getMoment` 取到，此时 `deletedAt`、`purgeAt` 有值；回收站里的事件不能修改、补记或复盘（409 `MOMENT_IN_TRASH`）。

**修改原始记录**（`updateMoment`）：

```json
{"expectedRevision": 2, "reason": "补上当时的身体反应", "bodySignals": "手心出汗，脸发烫"}
```

- 必须带当前的 `expectedRevision`，不一致返回 409 `MOMENT_CONFLICT`（`details.currentRevision`），前端应提示刷新。
- 缺省的字段不变；可选字段传 `null` 表示清空。可改的字段：`title`、`narrative`、`agentSummary`、`happenedAt`、`happenedAtPrecision`、`scene`、`emotions`、`intensity`、`severity`、`fearedOutcome`、`outcomeKnownBy`、`thoughts`、`bodySignals`、`immediateResponse`、`people`。
- 所有者随时能改，但改的是「当时的记录」。旧版本会完整保留在修订历史里，`revision = 1` 永远是最初的原始记录。

**删除**：`DELETE /moments/{id}` 只是移进回收站，30 天后自动彻底删除；关联的经验保留。补记、复盘、经验的删除是直接删除（会进操作记录）。彻底删除的数据还会在服务器备份里留最多 14 天。

## 复盘与待回看

| 方法与路径 | operationId | 输入 | 输出/行为 |
|---|---|---|---|
| `GET /reviews/due` | `listDueReviews` | `upcomingDays`（0–30，默认 7） | `{items, dueCount, upcoming}` |
| `POST /moments/{momentId}/reflections` | `createReflection` | `ReflectionCreate` | 201，`{reflection, moment: {id, status, nextReviewOn}, comparison}` |
| `PATCH /reflections/{reflectionId}` | `updateReflection` | `ReflectionPatch`（至少一个字段） | 同上 |
| `DELETE /reflections/{reflectionId}` | `deleteReflection` | — | `ScheduleState`（状态和下次回看日期会重算） |

- `items` 是已到期的（按 `dueOn` 从早到晚），`upcoming` 是未来 `upcomingDays` 天内将到期的；`dueCount` 也用作导航上的角标。每一项带上当时的强度、担心和最近一次复盘，见 [examples/due-list.json](examples/due-list.json)。
- 写复盘：`intensityNow`（现在多难受）和 `resolution`（`let_go` 放下了 / `easing` 好多了 / `still_matters` 还在意）必填；`severityNow`、`fearCameTrue`、`whatHappened`、`perspective`、`thinkingTraps`（≤5）、`lessonIds`（≤10，只能关联已有经验）可选。请求和响应示例见 [examples/reflection-create.json](examples/reflection-create.json)、[examples/reflection-result.json](examples/reflection-result.json)。
- 事件当时写了 `fearedOutcome`、复盘没填 `fearCameTrue` 时，记为 `unknown`。
- 最近一次复盘决定状态和下次回看日期：结论是 `let_go` 就变成 `settled`，不再提醒；其他结论按排程继续。已释怀的事件也可以再写复盘。
- `comparison` 给出 `intensityThen`、`intensityNow`、`change`（现在减当时，负数表示减轻）和 `daysSinceHappened`，用来做「当时 8 分 → 现在 3 分」的展示。

## 经验

| 方法与路径 | operationId | 输入 | 输出/行为 |
|---|---|---|---|
| `GET /lessons` | `listLessons` | `q`（可选） | `{items: Lesson[], total}` |
| `POST /lessons` | `createLesson` | `{title, body?, momentIds?}` | 201，`LessonDetail` |
| `GET /lessons/{lessonId}` | `getLesson` | — | `LessonDetail`（含关联事件的摘要） |
| `PATCH /lessons/{lessonId}` | `updateLesson` | `{title?, body?}` | `Lesson` |
| `DELETE /lessons/{lessonId}` | `deleteLesson` | — | 204 |
| `PUT /lessons/{lessonId}/moments` | `setLessonMoments` | `{momentIds}`（≤200） | `LessonDetail`；整组替换 |

标题 1–80 字，正文 ≤5000 字纯文本。`momentCount` 不算回收站里的事件。Agent 只能新建经验，不能改正文；修改都在网页上做。

## 标签

| 方法与路径 | operationId | 输入 | 输出/行为 |
|---|---|---|---|
| `GET /tags` | `listTags` | — | `{items: [{id, name, momentCount, createdAt}]}` |
| `PATCH /tags/{tagId}` | `renameTag` | `{name}` | `Tag`；重名返回 409 `TAG_EXISTS` |
| `POST /tags/{tagId}/merge` | `mergeTag` | `{intoId}` | `{tag, movedMoments}`；当前标签被删除 |
| `DELETE /tags/{tagId}` | `deleteTag` | — | 204；从所有事件上摘掉 |

标签名会被规范化：去首尾空白、去开头的 `#`、Unicode NFKC，1–20 字；规范化后同名的视为同一个（拉丁字母不分大小写）。

## 洞察

| 方法与路径 | operationId | 输入 | 输出 |
|---|---|---|---|
| `GET /insights/overview` | `getInsightsOverview` | `from`、`to`（可选） | `InsightsOverview` |
| `GET /insights/decay` | `getInsightsDecay` | `from`、`to`（可选） | `{range, minSample, buckets, points}` |
| `GET /insights/calendar` | `getInsightsCalendar` | `from`、`to`（必填，≤400 天） | `{timezone, weekStartsOn, from, to, days}` |

口径（完整定义见 [DATA-MODEL.md](DATA-MODEL.md) 第 13 节）：

- 统计不含回收站里的事件；归档的计入；`from`/`to` 按 `happenedOn` 过滤。
- `fear.neverHappenedRate` = 「担心的事没发生」÷「已经知道结果的」，即 `no ÷ (no + partly + yes)`，每件事取最近一次不是 `unknown` 的回答；分母为 0 时为 `null`。
- `intensity.meanDrop` = 复盘过的事件「当时强度平均值 − 最近一次复盘强度平均值」。
- `letGo.medianDays` = 从发生到第一次「放下了」的天数中位数。
- 每个比率都带样本数；`minSample = 5`，低于它时前端显示「样本不足」，不显示百分比。
- 衰减分桶：0–1、2–7、8–30、31–90、91+ 天；`points` 最多 2000 个，用于散点。
- 日历只列出有记录的日子：`{date, count, maxIntensity}`。

示例见 [examples/insights-overview.json](examples/insights-overview.json)。

## 接入管理

| 方法与路径 | operationId | 输入 | 输出/行为 |
|---|---|---|---|
| `GET /agent-keys` | `listAgentKeys` | — | `{items: AgentKey[]}`（含已撤销、已过期的） |
| `POST /agent-keys` | `createAgentKey` | `{label, scopes, expiresInDays?, currentPassword}` | 201，`{agentKey, secret, mcpUrl}` |
| `DELETE /agent-keys/{keyId}` | `revokeAgentKey` | — | 撤销后的 `AgentKey`，立即生效 |
| `GET /connected-apps` | `listConnectedApps` | — | `{items: ConnectedApp[]}` |
| `DELETE /connected-apps/{appId}` | `revokeConnectedApp` | — | 204；撤销授权和它的全部令牌 |

- 新建密钥必须再输一次当前密码（403 `PASSWORD_INCORRECT`），防止被盗的 Cookie 换出长期密钥。
- `scopes` 是 `read`、`write` 的非空子集。只给 `write` 就是只写密钥：能记、能补记，读不到历史。
- `expiresInDays` 为 1–365，默认 365；同时有效的密钥最多 20 把。
- `secret`（形如 `nbd_ak_…`）**只在这一次响应里出现**，之后只能看到 `prefix`。示例见 [examples/agent-key-created.json](examples/agent-key-created.json)。
- 已连接应用是 Claude、ChatGPT 通过 OAuth 得到的授权。`clientName` 来自对方的元数据文档，不可信，展示时要转义，并且和 `clientHost` 一起显示。授权的流程不经过前端（见 MCP.md）。

## 设置、导出、操作记录

| 方法与路径 | operationId | 输入 | 输出/行为 |
|---|---|---|---|
| `GET /settings` | `getSettings` | — | `{displayName, timezone, weekStartsOn}` |
| `PATCH /settings` | `updateSettings` | 至少一个字段 | 新的 `Settings` |
| `GET /export` | `exportData` | `format=json`（默认） | 附件下载：`{format:"nbd-export", version:1, exportedAt, owner, moments, lessons, tags}` |
| `GET /audit` | `listAudit` | `channel`、`cursor`、`limit`（默认 50） | `{items: AuditEvent[], nextCursor, total}` |

- 改时区只影响「今天」怎么算（待回看、日历），已经记下的日期不会被重算。
- 导出包含回收站里的事件和每件事的全部修订记录，适合自己备份。Markdown 导出是 P6 的可选项。
- 操作记录只写谁（`actor`）、从哪（`channel`：web/mcp/oauth/cli/system）、做了什么（`action`）、结果（`status`、`errorCode`），**不含正文**。

## 保留接口（v2，未实现）

下面这些只是预留的路径和接口草案，v1 **不注册**这些路由（请求会得到 404）；对应的 `meta.features` 开关为 `false`。前端可以先在设计稿里留位置，但不要提前调用。实现时如有改动，以届时的 openapi 为准。

| 能力 | 开关 | 预留接口草案 |
|---|---|---|
| 附件（截图等） | `attachments` | `POST /moments/{id}/attachments/upload-ticket` → `{uploadUrl, uploadToken, expiresAt, maxBytes}`；`PUT /api/v1/uploads/{ticketId}` 上传；`GET`、`DELETE /attachments/{id}`。MCP 侧对应 `prepare_attachment_upload`（照 Game Hub 的一次性上传票据） |
| 复盘提醒推送 | `reminders` | `GET`、`PUT /settings/reminders` `{enabled, channel: "telegram"\|"email", sendAt: "HH:mm", target}`；`POST /settings/reminders/test` |
| 两步验证 | `totp` | `POST /auth/totp/setup` → `{otpauthUrl}`；`POST /auth/totp/enable` `{code}`；`POST /auth/totp/disable` `{code, currentPassword}`。开启后登录返回 `{totpRequired:true, challengeId}`，再 `POST /auth/login/totp` `{challengeId, code}`。通行密钥预留 `/auth/passkeys/*` |
| 匿名分享 | `shareLinks` | `POST /moments/{id}/share-links` `{expiresInDays, fields}` → `{url}`；`DELETE /share-links/{id}`；公开页面 `GET /s/{token}` |
| 邀请注册（多人） | `registration` | `POST /auth/register` `{username, password, inviteCode}`；数据表已经带 `user_id` |
| OAuth 动态注册 | `dcr` | `POST /oauth/register`（RFC 7591），只在某个目标客户端不支持 CIMD 时才补（见 MCP.md） |

## 保留路径前缀

下面的前缀归后端，前端路由不能使用，SPA 回退也不能吞掉它们的 404：

`/api/`、`/mcp`、`/oauth/`、`/.well-known/`、`/healthz`、`/readyz`、`/docs`、`/openapi.json`、`/s/`（为匿名分享预留）。
