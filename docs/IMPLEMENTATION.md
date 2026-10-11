# 当前后端实现

开发目录为 `nbd-claude`，公开仓库为 Leo-learner/nbd，域名为 nbd.dkz12345.com。相邻的原 nbd 目录未修改。

## 契约与行为

48 个 REST 操作由 OpenAPI 契约注册和校验，生成的 openapi.json 与 sdk/generated.ts 可供前端使用。12 个 MCP 工具与 2 个提示词直接使用契约的输入输出 Schema；新版与旧版协议均用官方 SDK 实测。

使用 MCP server/client 2.3.1、Node 适配包 2.1.1；它们的版本独立发布，不要求一致。运行环境为 Node 22，Fastify 5，better-sqlite3 与 FTS5 trigram。

所有者取消自动回看排程：meta.features.reviewScheduling=false，scheduleDays=[]，nextReviewOn=null，reviewStepTotal=0。到期列表为空，推迟返回 NOT_SCHEDULED；保留手动回看、反思、统计和归档。前端不得按旧文档显示到期提醒。

## 身份与隐私

单一所有者使用 Argon2id；会话、Agent 密钥和 OAuth 令牌只保存哈希。OAuth 使用 PKCE、精确回调、白名单客户端元数据、资源绑定、刷新轮换及重放撤销。日志和审计不记录请求正文、密码、密钥或授权码。

REST 幂等请求的成功响应会在私有数据库内缓存 24 小时，以便精确重放；响应可能包含所有者原本可见的正文。MCP 写操作缓存 ID 与元数据。登录、密码修改和密钥签发不缓存凭据。删除记录后，旧幂等响应可能仍留存最多 24 小时，备份保留最多 14 天。

生产信任 nginx 单跳代理；nginx 覆盖转发地址，不直接信任来路不明的 Cloudflare 身份头。当前限流可能按 Cloudflare 出口地址聚合；本项目没有启用基于出口地址封禁的 fail2ban jail，以免误封其他用户。附带过滤器仅供以后配置。

## 运维

生产启动仅检查迁移状态，部署脚本负责迁移。独立系统用户 nbd，数据目录 0700，systemd 限制写入路径和内存。TLS 由 Certbot 续期；备份每日执行并进行哈希、SQLite 完整性与外键检查，恢复仅允许空目标目录。

部署先检查本地、推送 GitHub，再安装同一提交与 SHA256 校验后的归档。版本目录保留，失败回退代码、环境文件与 nginx 站点；数据库迁移不自动降级。

## 验证与边界

测试覆盖 REST 契约、权限与 CSRF、冻结和修订、去重与幂等、搜索分页、标签经验库、统计、官方 MCP 客户端、OAuth、备份恢复与清理。真实客户端账号授权不在自动测试范围。

完整前端尚未实现，首页仅是后端状态页。生产不导入演示数据。
