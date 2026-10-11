> 实现更新（2026-10-11）：后端已实现；自动回看排程已由所有者取消。本文保留原设计背景，当前行为以 [IMPLEMENTATION.md](IMPLEMENTATION.md) 为准。

# NBD 前端开发指南

给负责网页的开发者看。接口的完整定义见 [API.md](API.md) 和 [openapi.yaml](openapi.yaml)，本文讲怎么接、页面和接口怎么对应，以及哪些规则必须遵守。

## 0. 先知道这三件事

1. **网页不能新建记录。** 一件事只能由 Agent（Claude、ChatGPT、Claude Code……）通过 MCP 记下来。网页负责：浏览、复盘、补记、整理（标签、经验、归档、删除）、看统计、管理接入。时间线为空时，引导用户去 Agent 里说「帮我记一笔」。
2. **「当时的记录」是这个产品的核心，界面要护住它。** 原始记录可以改，但每次改都会留旧版本。冻结期（`editableUntil`，记录后 24 小时）过了以后再改，要先提醒用户「这会改变当时的记录」。详情页要让人一眼看到「当时的我」和「后来的我」的对比。
3. **状态、统计口径、枚举文案都由后端给。** `status` 直接用后端返回的；情绪、场景、思维陷阱等的中文从 `GET /api/v1/meta` 取。前端不自己推导、不写死。

## 1. 技术与部署边界

- 框架随你选。最后交付的是一组静态文件（`index.html` + 带哈希的 JS/CSS），部署到服务器的 `/opt/apps/nbd/frontend/`；后端发版不会覆盖这个目录。
- **同源部署**：页面和 API 都在 `https://nbd.dkz12345.com`，所以 Cookie 自动携带，不需要处理 CORS 和令牌。
- 路由用 history 模式即可：后端开了 `SPA_FALLBACK`，对接受 `text/html` 的未知路径返回 `index.html`。下面这些前缀归后端，前端路由不能用：`/api/`、`/mcp`、`/oauth/`、`/.well-known/`、`/healthz`、`/readyz`、`/docs`、`/openapi.json`、`/s/`。
- OAuth 授权确认页由后端渲染，前端不用做。前端只负责「设置 → 已连接的应用」的列表和断开。

## 2. 本地开发

**后端还没好（P0–P2 期间）**：用契约起 mock。openapi.yaml 里嵌了示例，mock 会直接返回它们。需要从 npm 下载 Prism：

```bash
npx @stoplight/prism-cli mock docs/openapi.yaml
```

mock 默认在 `http://127.0.0.1:4010`。Prism 会校验必填的请求头，写请求不带 `X-NBD-Request: 1` 会被拒绝，正好用来检查你的封装。mock 不校验 Cookie，登录态要自己模拟。

**后端好了以后（P2 起）**：在后端仓库里运行：

```bash
npm run dev
```

```bash
npm run seed -- --reset
```

`seed` 会建一个本地开发用的所有者账号（用户名和密码打印在终端，只用于本地），以及大约 15 件覆盖全部状态的事件（刚记下、冷却中、该回看、已回看、已释怀、已归档、回收站里的）。网页不能新建记录，所以种子数据是唯一的造数方式。

前端开发服务器把 API 代理到后端，保持同源。以 Vite 为例：

```ts
// vite.config.ts
export default defineConfig({
  server: { proxy: { '/api': 'http://127.0.0.1:3230' } },
});
```

如果不用代理、直接跨端口访问，需要在后端 `.env` 里加 `ALLOWED_ORIGINS=http://localhost:5173`；本地 Cookie 名是 `nbd_sid`（不带 `__Host-` 前缀，因为没有 HTTPS）。

## 3. 类型与请求封装

从契约生成类型：

```bash
npx openapi-typescript docs/openapi.yaml -o src/api/types.ts
```

后端 P2 完成后，改成从线上或本地的 `/openapi.json` 生成（后端也会在仓库里提交 `sdk/generated.ts`，可以直接用）。

所有请求都经过一个封装，三件事不能漏：带 Cookie、写请求带 `X-NBD-Request: 1`、把错误转成带 `code` 和 `requestId` 的异常。

```ts
// src/api/client.ts
import type { components } from './types';

type ErrorBody = components['schemas']['Error'];
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string,
              readonly details?: Record<string, unknown>, readonly requestId?: string) {
    super(message);
  }
}

export async function api<T>(method: Method, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(method === 'GET' ? {} : { 'X-NBD-Request': '1' }),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (data as ErrorBody | null)?.error;
    throw new ApiError(res.status, err?.code ?? 'INTERNAL_ERROR', err?.message ?? '服务出错了',
      err?.details, (data as ErrorBody | null)?.requestId ?? res.headers.get('X-Request-Id') ?? undefined);
  }
  return data as T;
}

// 用法
type MomentDetail = components['schemas']['MomentDetail'];
export const getMoment = (id: string) => api<MomentDetail>('GET', `/moments/${id}`);
```

也可以改用 `openapi-fetch` 这类按 `paths` 类型自动推断的客户端，只要满足上面三点。

## 4. 页面与接口对照

| 页面 | 建议路由 | 用到的接口（operationId） |
|---|---|---|
| 登录 | `/login` | `getMe`、`login` |
| 时间线（首页） | `/` | `listMoments`、`listDueReviews`（用 `dueCount` 做角标，`upcomingDays=0`）、`getMeta` |
| 待回看 | `/reviews` | `listDueReviews`、`snoozeMoment`、`getMoment` |
| 事件详情 | `/moments/:id` | `getMoment`、`updateMoment`、`listMomentRevisions`、`setMomentTags`、`createNote`、`deleteNote`、`snoozeMoment`、`archiveMoment`、`unarchiveMoment`、`trashMoment` |
| 写复盘（详情页里的表单或弹窗） | — | `createReflection`、`updateReflection`、`deleteReflection`、`listLessons`、`createLesson` |
| 经验库 | `/lessons`、`/lessons/:id` | `listLessons`、`getLesson`、`createLesson`、`updateLesson`、`deleteLesson`、`setLessonMoments` |
| 洞察 | `/insights` | `getInsightsOverview`、`getInsightsDecay`、`getInsightsCalendar`；点进分布时用 `listMoments` 带过滤参数 |
| 标签管理 | `/settings/tags` | `listTags`、`renameTag`、`mergeTag`、`deleteTag` |
| 回收站 | `/settings/trash` | `listTrash`、`restoreMoment`、`purgeMoment`、`getMoment` |
| 接入管理 | `/settings/access` | `listAgentKeys`、`createAgentKey`、`revokeAgentKey`、`listConnectedApps`、`revokeConnectedApp` |
| 设置 | `/settings` | `getSettings`、`updateSettings`、`changePassword`、`logoutAll`、`logout`、`exportData` |
| 操作记录 | `/settings/activity` | `listAudit` |

`getMe` 未登录时返回 `{user: null}`，不返回 401。启动时先调它，决定进登录页还是首页。

## 5. 状态与日期的显示

### 5.1 状态徽标

| `status` | 文案（来自 `/meta`） | 建议附带的信息 |
|---|---|---|
| `fresh` | 刚记下 | 「24 小时内 Agent 还能更正」，可以显示到 `editableUntil` 的倒计时 |
| `cooling` | 冷却中 | 「N 天后回看」（`nextReviewOn` 减今天） |
| `due` | 该回看 | 醒目；首页导航上显示 `dueCount` |
| `reflected` | 已回看 | 「下次回看：M月D日」；`nextReviewOn` 为 `null` 时写「不再提醒」 |
| `settled` | 已释怀 | 柔和的完成态 |
| `archived` | 已归档 | 弱化显示 |

配色建议用单一色相的深浅表示强度，不要用刺眼的红色警示高强度：这是一个帮人放下的地方。

### 5.2 日期与时间

- **LocalDate**（`happenedOn`、`nextReviewOn`、`dueOn`、日历）是 `YYYY-MM-DD` 字符串，**不要用 `new Date('2026-10-11')` 解析**：它会被当成 UTC 午夜，换到别的时区就可能变成前一天。直接拆字符串显示，或者用只处理日期的库。
- **Instant**（`capturedAt`、`createdAt`……）按所有者时区（`getMe` / `getSettings` 里的 `timezone`）显示，不要按浏览器时区。
- 发生时间按 `happenedAtPrecision` 显示：`exact` 显示日期和时间；`day` 只显示日期；`approx` 显示「约 9月20日」。

```ts
export function formatLocalDate(d: string, precision: 'exact' | 'day' | 'approx' = 'day') {
  const [, month, day] = d.split('-').map(Number);
  return `${precision === 'approx' ? '约 ' : ''}${month}月${day}日`;
}
export function formatInstant(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}
```

- 「今天」以所有者时区为准；需要比较日期时（例如算「N 天后回看」），用所有者时区的今天和 LocalDate 字符串做日期差。

### 5.3 当时 vs 现在

- 详情页顶部放「当时的我」：原话（`narrative`，保留换行）、当时的情绪和强度、担心什么。下面按时间顺序排补记和复盘（「后来的我」）。
- 强度变化用 `intensitySeries` 画一条小折线：横轴 `dayOffset`（距发生的天数），纵轴 0–10，点分「当时」和「复盘」两种。
- 复盘结果用 `comparison` 做一句话总结，例如「当时 8 分 → 现在 3 分，过了 4 天」。

## 6. 错误码与界面行为

| 错误码 | 界面怎么处理 |
|---|---|
| `AUTH_REQUIRED` | 跳到登录页，登录后回到原来的页面 |
| `INVALID_CREDENTIALS` | 登录表单提示「用户名或密码不对」，不区分是哪个错 |
| `PASSWORD_INCORRECT` | 在「再次输入当前密码」的框下面提示 |
| `VALIDATION_ERROR`、`EMPTY_PATCH`、`HAPPENED_AT_IN_FUTURE` | 表单字段提示（`details.field` 指出字段） |
| `MOMENT_CONFLICT` | 弹窗：「这件事刚被修改过（可能是 Agent 在 24 小时内更正了）」，提供「重新加载」；保留用户刚输入的内容，方便复制 |
| `MOMENT_IN_TRASH` | 提示「这件事在回收站里」，并提供恢复按钮 |
| `TAG_EXISTS` | 询问「已有同名标签，要合并吗？」，确认后调用 `mergeTag`，`intoId` 用 `details.existingTagId` |
| `TOO_MANY_KEYS` | 提示先撤销不用的密钥 |
| `RANGE_TOO_LARGE` | 日历组件本来就不允许选超过 400 天，不应出现 |
| `INVALID_TIMEZONE` | 时区选择器只提供 `Intl.supportedValuesOf('timeZone')` 里的值，不应出现 |
| `NOT_SCHEDULED` | 已释怀或已归档时不显示「推迟」按钮，不应出现 |
| `IDEMPOTENCY_CONFLICT` | 每次新建都生成新的 `Idempotency-Key`，不应出现 |
| `*_NOT_FOUND` | 显示「找不到了」，并提供返回列表的入口 |
| `RATE_LIMITED`、`AUTH_BUSY` | 轻提示「太频繁了，稍等一下」，按 `Retry-After` 暂时禁用按钮 |
| `STORAGE_BUSY` | GET 自动重试一次；写操作提示稍后重试 |
| `REQUEST_HEADER_REQUIRED`、`ORIGIN_REJECTED` | 开发错误：检查请求封装和代理配置，生产环境不应出现 |
| `INTERNAL_ERROR` | 提示出错，并显示 `requestId`，方便排查 |

## 7. 交互约定

- **改原始记录**：表单提交时带上打开时拿到的 `revision`（作为 `expectedRevision`）。现在已经过了 `editableUntil` 的话，保存前先确认：「这会改变当时的记录。旧版本会完整保留在修订历史里。」可以附一个可选的「修改原因」（`reason`）。
- **修订历史**：`revisionCount > 0` 时显示「已修改 N 次」的入口，打开后列出每一版的 `snapshot` 和 `changedFields`；`revision = 1` 标为「最初的记录」。
- **写复盘**：先展示「当时的你」，再出表单：
  - 「现在想起来有多难受」0–10，滑块旁边必须显示数字；
  - 结论三选一（放下了、好多了、还在意），文案来自 `/meta`；
  - 只有 `hasFear` 为真时才问「当时担心的事发生了吗」；
  - 思维陷阱多选，最多 5 个，带 `/meta` 里的说明（`hint`）；
  - 关联经验用 `lessonIds` 从经验库里选；需要新经验时先调 `createLesson`。
- **推迟**：提供 1、3、7、30 天的快捷按钮，也可以选一个日期（最多 90 天后）。
- **删除**：移进回收站只需要轻确认，并给「撤销」入口（调 `restoreMoment`）。彻底删除要明确的二次确认，并说明「服务器备份里最多还会保留 14 天」。
- **新建 Agent 密钥**：
  - 必须再输一次当前密码。
  - 作用域默认读 + 写，并解释「只写：Agent 能帮你记，但读不到以前的记录」。
  - 成功后弹窗显示完整 `secret` 和复制按钮，明确告诉用户「关掉就再也看不到了」，同时显示 `mcpUrl`。
  - 之后列表里只显示 `prefix`。
- **已连接的应用**：显示 `clientName`（转义）加上 `clientHost`，例如「Claude（claude.ai）」，并显示权限、最近使用时间和 `refreshExpiresAt`；断开前确认。
- **导出**：直接让浏览器访问 `/api/v1/export`（GET 请求，带 Cookie），由响应头触发下载。
- **空状态**：
  - 时间线为空：说明「在 Claude 或 ChatGPT 里说『帮我记一笔』」，并链接到接入管理页。
  - 待回看为空：「现在没有需要回看的事」。
  - 洞察样本不足：显示「再多记几件、回看几次，这里才看得出规律」。

## 8. 洞察页

- 数字一律带样本数。`n < minSample`（v1 是 5）时只显示「样本不足（n/5）」，不显示百分比，免得几件事就给人下结论。
- 主卡片：「你担心的事，有 X% 没有发生」（`fear.neverHappenedRate`，分母是 `fear.judged`），「当时平均 X 分 → 现在平均 Y 分」（`intensity`），「通常 N 天后就放下了」（`letGo.medianDays`）。
- 分布（情绪、场景、思维陷阱、结论）点进去就是带对应过滤参数的 `listMoments`，例如 `?trap=spotlight`。
- 衰减图：`buckets` 画柱或折线，`points` 画散点（最多 2000 个）。
- 日历热力图：`getInsightsCalendar` 必须传 `from`、`to`（最多 400 天），只返回有记录的日子；颜色深浅按 `count` 或 `maxIntensity`，周起始用 `weekStartsOn`。

## 9. 隐私与安全

这个网站存的是最私密的情绪记录，下面几条是硬要求：

- **不加载任何第三方资源**：没有外部脚本、字体、统计、错误上报和 CDN。字体用系统字体或打包进静态文件。后端会给页面加严格的 CSP（`default-src 'self'`；`frame-ancestors 'none'`），第三方资源加载不了。
- **正文不落本地存储**：原话、补记、复盘不写进 localStorage、IndexedDB 或 Service Worker 缓存；本地只存界面偏好（例如筛选条件）。
- **不要把正文放进 URL**。搜索关键词可以放在页面 URL 里；服务器的访问日志不记查询字符串。
- 页面加 `<meta name="robots" content="noindex">`（后端也会发 `X-Robots-Tag: noindex`）。
- 渲染用户内容一律按纯文本处理（原话、补记、经验都不是 Markdown/HTML），只保留换行。`clientName` 等来自外部的字段也必须转义。

## 10. 交付与上线

- 构建产物用带哈希的文件名；`index.html` 不带哈希。后端静态服务用 ETag 做重新验证，发版后用户不需要强制刷新。
- 交付方式：把构建产物打包交给后端，由部署脚本上传到 `/opt/apps/nbd/frontend/`（步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)「前端上线」）。旧版本会先备份，出问题可以直接换回来。
- 上线前在手机宽度（375px）和桌面各走一遍：登录 → 时间线 → 详情 → 写复盘 → 洞察 → 新建并撤销一把 Agent 密钥。
