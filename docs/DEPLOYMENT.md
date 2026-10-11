> 实现更新（2026-10-11）：后端已实现；自动回看排程已由所有者取消。本文保留原设计背景，当前行为以 [IMPLEMENTATION.md](IMPLEMENTATION.md) 为准。

# 部署与运维

目标：`https://nbd.dkz12345.com`，部署在和 ai-chat、Game Hub 同一台 Azure 机器上（`20.48.14.96`，Ubuntu 22.04）。流程照搬 Game Hub 已经跑通的 `scripts/deploy.sh` + `deploy/install.sh`，在下文标出了不同之处。

> **服务器上需要 sudo 的写操作，每次都要先征得所有者同意再执行**（所有者的规矩）。下文用「需要同意」标出这些步骤。DNS 由所有者在 Cloudflare 后台自己加。

## 1. 环境事实

2026-10-10 只读勘察的结果。实施前再查一遍，不要依赖过期的状态。

| 项目 | 情况 |
|---|---|
| 系统 | Ubuntu 22.04.5，2 核，内存 891 MB（可用约 355 MB），swap 1 GB（已用约一半），磁盘 62 GB（已用 12%） |
| 软件 | Node v22.23.0（`/usr/bin/node`）、nginx 1.18、certbot 1.21、fail2ban（只有默认的 sshd jail）；**没有** `sqlite3` 命令行（备份用 better-sqlite3 的 API，不需要它） |
| 已占用端口 | 22、80、443、3010、3030、3040、3200、3210、3220、3221、5100、43210；**3230 空闲** |
| 已有应用 | `/opt/apps/` 下有 ai-chat、clawdrop、game-hub、mac-remote-relay、plos、pocket-terminal、remote-term-relay、unfortunately |
| DNS | dkz12345.com 的 NS 在 Cloudflare，子域名都是灰云（只解析，不代理）；`nbd.dkz12345.com` 目前是 NXDOMAIN |
| 访问 | `ssh -i ~/Desktop/ssh-key-removing-restricted/leo-web-key.pem leo@20.48.14.96`；用域名连接时加 `-o HostKeyAlias=20.48.14.96`；leo 有免密 sudo |

内存很紧，所以 nbd 用**单进程**（网页 API、MCP、OAuth 都在一起），并限制 `MemoryMax=256M`、`--max-old-space-size=128`。

## 2. 目录、用户与端口

| 内容 | 位置 | 属主与权限 |
|---|---|---|
| 代码版本 | `/opt/apps/nbd/releases/<UTC 时间戳>/`，`/opt/apps/nbd/current` 软链指向当前版本 | root:root；软链用 `mv -Tf` 原子切换；只保留最近 5 个版本 |
| 前端 | `/opt/apps/nbd/frontend` → 软链到 `/opt/apps/nbd/frontend-releases/<UTC>/` | root:root；不随后端发版变化 |
| 数据 | `/var/lib/nbd/nbd.sqlite`（+ `-wal`、`-shm`），备份在 `/var/lib/nbd/backups/` | `nbd:nbd 0700`，库文件 0600（比 Game Hub 更严：nginx 不需要读数据目录） |
| 配置 | `/etc/nbd.env` | `root:nbd 0640`，**不放任何密钥**（会话和令牌只存哈希，OAuth 令牌是不透明随机串，不需要签名密钥） |
| 服务 | `nbd.service`、`nbd-backup.service` + `nbd-backup.timer` | 运行用户 `nbd`（系统用户，nologin） |
| 端口 | `127.0.0.1:3230` | 只监听回环地址，nginx 反代 |
| 日志 | `journalctl -u nbd`；nginx：`/var/log/nginx/nbd.access.log`（**不记查询字符串**） | |

## 3. 首次开通

按顺序做。前 3 步不碰服务器。

1. **代码就绪**：本地 `npm run check` 通过；推送到公开仓库 `Leo-learner/nbd` 前，对 `git archive HEAD` 的内容做一次密钥扫描，并确认 `docs/deployment-private/`、`.work/` 在 `.gitignore` 里。
2. **DNS**（所有者在 Cloudflare 后台操作）：加 A 记录 `nbd` → `20.48.14.96`，**灰云**（只解析），和其他子域名一致。本机走 Clash 的 fake-ip，`dig` 看到的是假地址，要用 DoH 确认：
   ```bash
   curl -s 'https://cloudflare-dns.com/dns-query?name=nbd.dkz12345.com&type=A' -H 'accept: application/dns-json'
   ```
3. **本机 Clash**（需要同意）：在 Merge.yaml 的 hosts 里加 `nbd.dkz12345.com: 20.48.14.96`，命中已有的 `IP-CIDR,20.48.14.96/32,DIRECT` 规则，否则每条新 TLS 连接要多花约 5 秒，Claude Code 的 MCP 面板会误报失败。按之前验证过的「先校验、再热加载、带 watchdog 自动回滚」的做法改。
4. **只读勘察**：再确认一遍 3230 端口空闲、内存和磁盘、`/etc/nginx/sites-enabled/` 里没有同名站点。
5. **首次部署**（需要同意，install.sh 整体用 sudo 运行）：`scripts/deploy.sh`。第一次运行会额外完成这些事：
   - 建系统用户 `nbd`；建 `/var/lib/nbd`、`/opt/apps/nbd/{releases,frontend-releases}`；写 `/etc/nbd.env`（模板见附录 A）；
   - 放一个占位前端（只有一句「NBD 正在准备中」，带 noindex）；
   - 安装 `/etc/nginx/conf.d/nbd-logformat.conf`；用临时的 HTTP 站点跑 `certbot certonly --webroot` 申请证书；再装正式站点，跑 `nginx -t` 后 reload；
   - 安装证书续期钩子；启用 `nbd-backup.timer`。
6. **创建所有者账号**（需要同意）。密码从标准输入读，不出现在命令行和日志里：
   ```bash
   ssh -i ~/Desktop/ssh-key-removing-restricted/leo-web-key.pem leo@20.48.14.96 "cd /opt/apps/nbd/current && sudo -n -u nbd node --env-file=/etc/nbd.env dist/scripts/admin.js create-owner leo"
   ```
   密码只记在所有者自己的密码管理器里，不写进任何文件。
7. **第一把 Agent 密钥**：前端上线前，用 CLI 签发（照 Game Hub 的 `mcp-admin create-token`）。密钥在本机生成，通过标准输入传到服务器，服务器只存哈希；明文写进本机已 gitignore 的 `docs/deployment-private/claude-code.env`（权限 600）。前端上线后，改在网页「设置 → Agent 密钥」里签发。
8. **接入客户端并实测**：
   - Claude Code（[MCP.md](MCP.md) 7.1）：记一笔、补记、读回来；
   - claude.ai 连接器：完成 OAuth，然后在**手机 App** 上记一笔；
   - ChatGPT：完成 OAuth，确认能看到工具。
   顺手把 claude.ai 托管 App 实际用的 `client_id` 记进 MCP.md 2.3。
9. **fail2ban**（需要同意）：装附录 D 的过滤器和 jail，`ignoreip` 必须包含 Anthropic 的 `160.79.104.0/21` 和 ChatGPT 的出口段（以 OpenAI 公布的列表为准）。
10. **可选**：把 nbd 加进 `/opt/apps/check-services.sh`（服务状态、3230 端口、证书剩余天数）。这个文件归 leo 所有，不需要 sudo，但同样先问。
11. **备份恢复演练**：见第 6 节，结果填进附录 F 的验证记录。

## 4. 发版与回滚

**发版**（每次需要同意）：在本机运行 `scripts/deploy.sh`：

1. 要求 Node 22，跑 `npm run check`；要求工作区干净，并且 HEAD 已经推到 `origin` 的当前分支。
2. 版本号 = UTC 时间戳；`git archive` + `dist` + `RELEASE.json`（提交号、版本号、仓库地址）打成 tar.gz。
3. 把包 `scp` 到服务器的 `/tmp/`，然后 `ssh … "sudo -n bash -s -- <release> <commit>" < deploy/install.sh`。

`install.sh` 在服务器上依次执行：
1. 校验参数、提交号；首次部署时如果 3230 已被别的程序占用就拒绝。
2. 解压到 `releases/<release>`，以 `nbd` 用户运行 `npm ci --omit=dev`，并自检原生模块（better-sqlite3、argon2）；然后把整个目录交给 root。
3. 用**上一个版本**的代码做部署前备份（`admin.js backup`）。
4. 设置 `trap rollback ERR`；停 `nbd`；跑迁移（`admin.js migrate`）；安装 unit 和 timer。
5. 用 `ln -s … current.next && mv -Tf current.next current` 原子切换，启动服务；轮询 `http://127.0.0.1:3230/readyz` 最多 30 秒。
6. 安装 nginx 站点前，先备份旧配置；`nginx -t` 失败就恢复旧配置并回滚。
7. 从本机发起检查：`curl --resolve nbd.dkz12345.com:443:127.0.0.1` 访问 `/readyz`；`/mcp` 应返回 401。
8. 清理：删掉 `/tmp` 里的包；`releases/` 只保留最近 5 个。

**回滚**：
- 部署过程中失败时，`trap` 会把 `current` 指回上一个版本、重启服务、恢复 nginx 配置，**但不回滚数据库**。
- 只能回滚到和当前数据库结构兼容的版本。迁移已经跑过、旧代码不兼容时，要走第 6 节的数据库恢复流程，并且会丢掉备份之后写入的数据。
- 手动回滚：`sudo ln -sfn /opt/apps/nbd/releases/<旧版本> /opt/apps/nbd/current.rb && sudo mv -Tf /opt/apps/nbd/current.rb /opt/apps/nbd/current && sudo systemctl restart nbd`（需要同意）。

`install.sh` 和 Game Hub 版本的差异：只有一个服务（没有单独的 MCP 进程，也就没有 sudo 助手和 sudoers 文件）；端口 3230；数据目录 `nbd:nbd 0700`；前端用软链切换；多了 nginx 日志格式；只保留 5 个版本。

## 5. 前端上线

前端构建产物和后端版本分开发布（需要同意）：

```bash
bash scripts/deploy-frontend.sh
```

脚本把产物打包上传，然后在服务器上依次：
1. 构建当前已推送提交，解压到 `/opt/apps/nbd/frontend-releases/<commit>/`（root:root，文件 644）；
2. 校验归档 SHA256、`index.html` 和 `frontend-release.json` 逐文件哈希；
3. 用 `ln -s … frontend.next && mv -Tf frontend.next frontend` 原子切换；
4. 验证每个产物的 HTTP 内容及健康检查；失败恢复原软链。旧前端版本保留，不自动清理。

回滚就是把软链指回上一个目录，不需要重启服务。HTML 用 ETag 重新验证，用户不需要强制刷新。

## 6. 备份与恢复

- **自动备份**：`nbd-backup.timer` 每天 20:00 UTC（北京时间 04:00）运行，随机延迟最多 5 分钟，`Persistent=true`。也可以手动跑：`sudo systemctl start nbd-backup.service`。
- **备份内容**：`/var/lib/nbd/backups/<UTC>/` 下有：
  - `nbd.sqlite`：用 better-sqlite3 的在线 `db.backup()` 生成，不直接复制正在运行的库文件；
  - `manifest.json`：创建时间、schemaVersion、字节数、SHA-256、`integrity_check` 结果、`foreign_key_check` 结果。
  只保留 14 天；部署前那一份也算在内。
- **校验**：`admin.js verify-backup <dir>` 重新计算哈希，以只读方式打开数据库，再跑一遍 `integrity_check` 和 `foreign_key_check`。
- **恢复**（需要同意）：
  1. `admin.js restore <备份目录> <一个空目录>`，它只写空目录，写完会校验；
  2. `sudo systemctl stop nbd`，把 `/var/lib/nbd/nbd.sqlite*` 移到旁边留底，把恢复出来的库移进去，属主改成 `nbd:nbd`，权限 0600；
  3. `sudo systemctl start nbd`，检查 `/readyz`；
  4. **翻一遍审计日志**：备份时间之后撤销过的 Agent 密钥和断开过的应用，在恢复后的库里会重新变成有效，必须再撤销一次。
- **风险要写清楚**：
  - 备份和数据在同一块磁盘上，整机磁盘坏了，备份也跟着没了（所有者已确认 v1 不做异机副本）。
  - 彻底删除的事件，还会在备份里留最多 14 天。

## 7. 凭据与轮换

| 凭据 | 存放 | 轮换和撤销 |
|---|---|---|
| 所有者密码 | 只在所有者的密码管理器里；服务器只存 argon2id | 网页「设置」里修改（其他会话全部失效）；忘了就在服务器上用 `admin.js reset-password leo` 重置（撤销全部会话） |
| Agent 密钥 | 明文只在本机 `docs/deployment-private/*.env`（600）；服务器只存 SHA-256 | 新签一把 → 更新客户端 → 确认能用 → 撤销旧的。Claude Code 只需要改 env 文件，headersHelper 下次连接自动生效 |
| OAuth 授权 | 服务器只存令牌哈希 | 网页「设置 → 已连接的应用」里断开；客户端重新连接即可 |
| TLS 证书 | `/etc/letsencrypt/live/nbd.dkz12345.com/` | `certbot.timer` 自动续期；续期钩子 reload nginx |
| SSH 私钥 | 本机 `~/Desktop/ssh-key-removing-restricted/leo-web-key.pem` | 和其他站点共用，不在本项目管理 |

`docs/deployment-private/` 可能包含：`claude-code.env`、`codex.env`，以及各把密钥的元数据（ID、到期时间，用于撤销）。这个目录永远不进 Git；公开仓库每次推送前都要扫描一遍。

## 8. 客户端接入

见 [MCP.md](MCP.md) 第 7 节：Claude Code（headersHelper）、Codex、claude.ai 连接器（网页上连接后手机可用）、ChatGPT。

## 9. 监控与排障

常用命令（在服务器上执行）：

```bash
systemctl status nbd --no-pager
journalctl -u nbd -n 100 --no-pager
curl -fsS http://127.0.0.1:3230/readyz
systemctl list-timers nbd-backup.timer --no-pager
systemctl show nbd -p MemoryCurrent
sudo nginx -t
sudo fail2ban-client status nbd-auth
```

| 现象 | 处理 |
|---|---|
| 服务反复重启 | `journalctl -u nbd`：常见原因是 `assertMigrated` 版本不一致（迁移没跑）、`/etc/nbd.env` 校验失败、超过内存上限被杀（`MemoryMax=256M`） |
| `/readyz` 返回 503 `NOT_READY` | 迁移版本和代码不一致，或者数据库不可读；不要硬重启，先查原因 |
| 503 `STORAGE_BUSY` 偶发 | 写事务撞上了备份或清理任务，客户端重试即可；频繁出现要查有没有长事务 |
| 自己被 fail2ban 封了 | `sudo fail2ban-client set nbd-auth unbanip <IP>`（需要同意） |
| claude.ai 连接器突然全部失败 | 先查 `160.79.104.0/21` 有没有被封，再查证书和 well-known 元数据 |
| 磁盘或内存告警 | 先看备份目录大小和 `releases/` 数量；内存看 `MemoryCurrent` 和 swap |

## 附录 A：`/etc/nbd.env`

```ini
NODE_ENV=production
HOST=127.0.0.1
PORT=3230
PUBLIC_ORIGIN=https://nbd.dkz12345.com
DATA_DIR=/var/lib/nbd
PUBLIC_DIR=/opt/apps/nbd/frontend
COOKIE_SECURE=true
TRUST_PROXY=true
ALLOWED_ORIGINS=
SESSION_TTL_DAYS=30
DEFAULT_TIMEZONE=Asia/Shanghai
REVIEW_SCHEDULE_DAYS=3,14,60
FREEZE_HOURS=24
TRASH_DAYS=30
AUDIT_RETENTION_DAYS=365
MCP_RATE_PER_MIN=120
MCP_RECORD_PER_HOUR=30
OAUTH_CLIENT_ID_HOSTS=claude.ai,claude.com,chatgpt.com
OAUTH_REDIRECT_HOSTS=claude.ai,claude.com,chatgpt.com
OAUTH_ALLOW_LOOPBACK_REDIRECT=false
OAUTH_ACCESS_TTL_MIN=60
OAUTH_REFRESH_TTL_DAYS=60
API_DOCS=false
SPA_FALLBACK=true
LOG_LEVEL=info
```

## 附录 B：systemd 单元

`deploy/nbd.service`：

```ini
[Unit]
Description=NBD (No Big Deal): web API, MCP and OAuth
After=network.target

[Service]
Type=simple
User=nbd
Group=nbd
WorkingDirectory=/opt/apps/nbd/current
EnvironmentFile=/etc/nbd.env
ExecStart=/usr/bin/node --max-old-space-size=128 dist/src/server.js
Restart=on-failure
RestartSec=3
TimeoutStopSec=30
KillSignal=SIGTERM
UMask=0077
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/nbd
RestrictSUIDSGID=true
MemoryHigh=192M
MemoryMax=256M

[Install]
WantedBy=multi-user.target
```

`deploy/nbd-backup.service`：

```ini
[Unit]
Description=NBD verified backup
After=nbd.service

[Service]
Type=oneshot
User=nbd
Group=nbd
WorkingDirectory=/opt/apps/nbd/current
EnvironmentFile=/etc/nbd.env
ExecStart=/usr/bin/node --max-old-space-size=128 dist/scripts/admin.js backup
UMask=0077
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/nbd
MemoryMax=256M
```

`deploy/nbd-backup.timer`：

```ini
[Unit]
Description=Daily NBD backup at 04:00 Asia/Shanghai

[Timer]
OnCalendar=*-*-* 20:00:00 UTC
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
```

上线后用 `systemd-analyze security nbd` 检查沙箱评分（ai-chat 加固后是 1.5）。

## 附录 C：nginx

`deploy/nginx-logformat.conf` → `/etc/nginx/conf.d/nbd-logformat.conf`（http 级别，只装一次）：

```nginx
# 只记录路径，不记录查询字符串：搜索关键词、OAuth 参数都不进日志
log_format nbd_noquery '$remote_addr - [$time_local] "$request_method $uri $server_protocol" '
                       '$status $body_bytes_sent "$http_user_agent" $request_time';
```

`deploy/nginx.conf` → `/etc/nginx/sites-available/nbd.dkz12345.com`：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name nbd.dkz12345.com;
    location ^~ /.well-known/acme-challenge/ { root /var/www/letsencrypt; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name nbd.dkz12345.com;
    ssl_certificate /etc/letsencrypt/live/nbd.dkz12345.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nbd.dkz12345.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    client_max_body_size 1m;
    access_log /var/log/nginx/nbd.access.log nbd_noquery;
    error_log /var/log/nginx/nbd.error.log warn;
    add_header Strict-Transport-Security "max-age=31536000" always;

    location ^~ /.well-known/acme-challenge/ { root /var/www/letsencrypt; }

    # MCP：JSON 响应，不需要关闭缓冲，只放宽超时
    location ~ ^/mcp(?:/|$) {
        proxy_pass http://127.0.0.1:3230;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Connection "";
        proxy_read_timeout 180s;
        proxy_send_timeout 180s;
    }

    # 网页、API、OAuth、well-known 元数据
    location / {
        proxy_pass http://127.0.0.1:3230;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Connection "";
        proxy_read_timeout 60s;
    }
}
```

注意：`/.well-known/oauth-*` 必须走到应用，所以 ACME 只匹配 `/.well-known/acme-challenge/` 这个前缀。

## 附录 D：fail2ban（需要同意后安装）

`/etc/fail2ban/filter.d/nbd-auth.conf`：

```ini
[Definition]
failregex = ^<HOST> - \[[^\]]+\] "POST /api/v1/auth/login HTTP/[0-9.]+" 401
            ^<HOST> - \[[^\]]+\] "POST /oauth/authorize HTTP/[0-9.]+" 401
ignoreregex =
```

`/etc/fail2ban/jail.d/nbd.conf`：

```ini
[nbd-auth]
enabled  = true
port     = http,https
filter   = nbd-auth
logpath  = /var/log/nginx/nbd.access.log
maxretry = 8
findtime = 10m
bantime  = 1h
# 云端连接器的出口段绝不能封：Anthropic 160.79.104.0/21；ChatGPT 的出口段以 OpenAI 公布的为准
ignoreip = 127.0.0.1/8 ::1 160.79.104.0/21
```

装好后用 `fail2ban-regex /var/log/nginx/nbd.access.log /etc/fail2ban/filter.d/nbd-auth.conf` 验证规则能匹配到登录失败的记录。

## 附录 E：首次部署后的检查

| 检查 | 命令或方法 | 期望 |
|---|---|---|
| 就绪 | `curl -fsS https://nbd.dkz12345.com/readyz` | `{"ok":true,"schemaVersion":1}` |
| MCP 未授权 | `curl -si -X POST https://nbd.dkz12345.com/mcp` | 401，`WWW-Authenticate` 里有 `resource_metadata` |
| 元数据 | `curl -s https://nbd.dkz12345.com/.well-known/oauth-protected-resource/mcp` 和 `/.well-known/oauth-authorization-server` | 内容和 MCP.md 2.2 一致 |
| Cookie | 登录响应的 `Set-Cookie` | `__Host-nbd_sid`；带 `HttpOnly; Secure; SameSite=Lax; Path=/`，没有 `Domain` |
| 安全头 | 首页响应头 | 有 CSP（含 `frame-ancestors 'none'`）、`X-Robots-Tag: noindex`、HSTS |
| 日志 | `sudo tail /var/log/nginx/nbd.access.log` | 没有 `?` 后面的查询字符串 |
| 其他站点 | games、aichat、tetris 等各访问一次 | 不受影响 |
| 内存 | `systemctl show nbd -p MemoryCurrent` | 明显低于 192M |
| 备份 | 手动跑一次并 `verify-backup` | 通过 |
| 三类客户端 | Claude Code、claude.ai（含手机）、ChatGPT | 都能记一笔，网页上能看到，操作记录里有对应来源 |

## 附录 F：验证记录模板

每次首次开通、重要发版、恢复演练后补一行：

| 日期 | 事项 | 版本 / 提交 | 结果 | 备份 ID | 备注 |
|---|---|---|---|---|---|
| 2026-__-__ | 首次部署 | `<release>` / `<commit>` | readyz ✓ / MCP 401 ✓ / 元数据 ✓ | `<部署前备份>` | |
| 2026-__-__ | 恢复演练 | — | 恢复到空目录 ✓ / 校验 ✓ / 只读启动 ✓ | `<备份 ID>` | |
