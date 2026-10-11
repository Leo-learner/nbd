# NBD · 没什么大不了

私人记录与回看服务。Agent 通过 MCP 保存当时的原话，所有者通过 REST 接口管理记录、补记、手动回看和经验库。

代码仓库：[Leo-learner/nbd](https://github.com/Leo-learner/nbd) · 部署地址：[nbd.dkz12345.com](https://nbd.dkz12345.com) · MCP：`https://nbd.dkz12345.com/mcp`

## 已实现

- 48 个 REST 操作、12 个 MCP 工具、2 个提示词；OpenAPI 与 MCP 契约检查。
- 唯一所有者、Argon2id 密码、会话与 CSRF 防护、可撤销的 Agent 密钥。
- OAuth 授权码、PKCE、白名单 CIMD、资源绑定、刷新令牌轮换和重放撤销。
- SQLite 事务、原话版本、24 小时冻结、去重、幂等、全文搜索、标签、经验库与统计。
- 回收站、导出、审计、定时清理、在线备份、校验与空目录恢复。
- 独立 nginx 站点、HTTPS、systemd、每日备份和按已推送提交部署。

**按所有者要求，不启用自动回看排程。** 手动回看保留；`nextReviewOn` 为 null、到期列表为空，推迟接口返回 `NOT_SCHEDULED`。前端应检查 `meta.features.reviewScheduling`。

当前首页是后端状态占位页，完整前端尚未实现。Claude / ChatGPT 的实际账号接入仍需在对应客户端授权；后端协议已经通过官方 SDK 集成测试。

## 本地运行

需要 Node.js 22。演示数据完全虚构，仅供本地使用。

```bash
npm ci
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

不使用演示数据时，以标准输入向 `npm run admin -- create-owner leo` 提供至少 12 位密码；不把密码放进命令参数。

```bash
npm run contract
npm run check
node scripts/scan-secrets.mjs
```

## 发布

先完成本地检查，提交并推送，再执行：

```bash
bash scripts/deploy.sh
node scripts/bootstrap-owner.mjs
```

部署脚本拒绝脏目录和未推送提交，校验部署包 SHA256，保留旧版本并在失败时回退代码与站点配置。数据库不自动降级。

初始化脚本把随机密码和一年有效的 Agent 密钥保存在本机 `docs/deployment-private/credentials.json`（目录 0700，文件 0600，Git 忽略）。服务器只保存密码和密钥的哈希。重复运行不会覆盖凭据。

配置 MCP 客户端时使用上述 MCP URL；`node scripts/mcp-headers.mjs` 输出本机私有 Authorization 配置，输出包含密钥，请仅供客户端读取。

## 文档

以 [当前实现说明](docs/IMPLEMENTATION.md)、[生成的 OpenAPI](docs/openapi.json)、[MCP 契约](docs/mcp-tools.json) 和 [TypeScript 类型](sdk/generated.ts) 为准。原设计文档保留背景，其中排程与阶段计划已被当前实现说明覆盖。

生产数据在 `/var/lib/nbd/`，每日备份保存 14 天。服务器上的备份不等于异地备份。日记、数据库和凭据均不进入公开仓库。
