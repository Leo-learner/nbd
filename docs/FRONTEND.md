# 前端交付

实现参考所有者提供的「NBD · 没什么大不了.html」15 张画板与「NBD 前端设计交付说明.pdf」。文档中的待确认项按现有后端行为落实：手动复盘为独立页面、手机导航为右侧抽屉，未提供的编辑表单使用已有组件和字段。自动回看排程保持关闭。

## 开发与路由

Node 22，React 19，TypeScript，Vite。代码位于 `frontend/`。`npm run frontend:dev` 启动开发服务器并代理本地 API；`npm run frontend:build` 输出 `dist/frontend/`；`npm run check` 包含两端类型检查、构建和后端测试。

主要路由：`/`、`/moments/:id`、`/moments/:id/reflect`、`/moments/:id/revisions`、`/insights`、`/lessons`、`/lessons/:id`、`/settings/tags`、`/settings/trash`、`/settings/access`、`/settings`、`/settings/activity`。

时间线筛选保存在 URL，可以刷新、分享和返回；搜索防抖 250ms。精确时间按所有者时区格式化，LocalDate 不转换时区。非默认排序保持 API 返回顺序。复盘草稿只在页面内存中，离开时提示；不会恢复旧草稿。原话修改使用 expectedRevision，冲突时保留输入并重新加载当前版本。正文按纯文本显示，保留换行。

## 隐私与交互

API 使用同源 Cookie 会话、CSRF header、no-store。401 重新进入登录；读取遇到 STORAGE_BUSY 时只重试一次，写入不盲目重试。按钮防止重复提交；错误保留表单内容，显示可读文案与 requestId。

不使用 localStorage、sessionStorage、IndexedDB、Service Worker，不引入 CDN、外部字体、统计或第三方请求。Agent 密钥明文只在成功弹窗显示，Esc 和遮罩不能关闭该弹窗；点击「我已保存，关闭」后丢弃明文。回收站彻底删除需要勾选确认。洞察遵守 minSample，样本不足时隐藏易误导的数值。

## 发布

先本地验收，提交并推送同一版本。首次上线本实现需要先运行 `bash scripts/deploy.sh` 更新静态资源路由，再运行 `bash scripts/deploy-frontend.sh`。以后纯前端变更只需后一个脚本。

前端脚本验证干净工作区与远端提交，构建和扫描产物，生成 `frontend-release.json` 的逐文件 SHA256 清单。服务器验证归档及清单后，切换 `/opt/apps/nbd/frontend` 到 `/opt/apps/nbd/frontend-releases/<commit>`，验证每个文件的 HTTP 内容及 `/readyz`；失败自动恢复上一软链。保留旧前端版本，不自动清理。线上 `/frontend-release.json` 可核对发布提交。

## 验收

使用隔离的本地 SQLite 和虚构数据，覆盖桌面与 375px 手机：登录、筛选、详情、补记、复盘、离开保护、修订、经验关联、标签、回收站、密钥、设置、导出与操作记录。同时检查中间宽度布局、全局横向溢出、控制台错误、外部请求和浏览器存储。生产验收使用现有所有者账号，不写入虚构记录、不更改密码或密钥。

真实 Claude / ChatGPT 账号连接须由所有者在对应客户端授权；模拟客户端协议测试不能替代此授权。
