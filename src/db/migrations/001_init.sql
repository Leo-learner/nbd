CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 24),
  password_hash TEXT NOT NULL,                       -- argon2id
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',     -- IANA，写入前用 Intl.supportedValuesOf('timeZone') 校验
  week_starts_on INTEGER NOT NULL DEFAULT 1 CHECK (week_starts_on BETWEEN 0 AND 6),
  password_changed_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,                    -- SHA-256(会话令牌)
  created_at INTEGER NOT NULL,
  renewed_at INTEGER NOT NULL,                        -- 最多每 24 小时续期一次
  expires_at INTEGER NOT NULL,                        -- 闲置 30 天过期
  user_agent TEXT,
  ip TEXT
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE INDEX sessions_expiry ON sessions(expires_at);


CREATE TABLE moments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),

  -- 原始记录（修改会生成修订记录）
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 60),
  narrative TEXT NOT NULL CHECK (length(narrative) BETWEEN 1 AND 20000),
  agent_summary TEXT CHECK (agent_summary IS NULL OR length(agent_summary) BETWEEN 1 AND 500),
  happened_at INTEGER NOT NULL,                       -- day/approx 时为所有者时区当天 12:00
  happened_on TEXT NOT NULL,                          -- LocalDate，写入时算好，之后不重算
  happened_precision TEXT NOT NULL CHECK (happened_precision IN ('exact','day','approx')),
  scene TEXT NOT NULL CHECK (scene IN ('work','study','social','family','romance','online','public','other')),
  emotions_json TEXT NOT NULL,                        -- [{"key":"embarrassed","intensity":8|null}]，1–5 个，key 不重复
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 0 AND 10),
  severity INTEGER CHECK (severity BETWEEN 0 AND 10),
  feared_outcome TEXT CHECK (feared_outcome IS NULL OR length(feared_outcome) BETWEEN 1 AND 1000),
  outcome_known_by TEXT,                              -- LocalDate
  thoughts TEXT CHECK (thoughts IS NULL OR length(thoughts) BETWEEN 1 AND 2000),
  body_signals TEXT CHECK (body_signals IS NULL OR length(body_signals) BETWEEN 1 AND 500),
  immediate_response TEXT CHECK (immediate_response IS NULL OR length(immediate_response) BETWEEN 1 AND 1000),
  people_json TEXT NOT NULL DEFAULT '[]',             -- 只写角色，最多 10 个

  -- 记录信息（不随修改变化）
  captured_at INTEGER NOT NULL,
  captured_on TEXT NOT NULL,                          -- LocalDate，复盘排程的锚点
  editable_until INTEGER NOT NULL,                    -- captured_at + FREEZE_HOURS
  source_kind TEXT NOT NULL CHECK (source_kind IN ('agent_key','oauth_app','owner','system')),
  source_id TEXT,                                     -- 密钥 ID 或授权 ID；system（种子数据）为 NULL
  source_label TEXT NOT NULL,
  dedupe_fingerprint TEXT NOT NULL,                   -- 见第 9 节

  -- 排程与派生字段（复盘写入时在同一事务里更新）
  next_review_on TEXT,                                -- LocalDate；NULL 表示不再提醒
  snoozed_until TEXT,                                 -- LocalDate
  reflection_count INTEGER NOT NULL DEFAULT 0,
  latest_intensity_now INTEGER CHECK (latest_intensity_now BETWEEN 0 AND 10),
  latest_resolution TEXT CHECK (latest_resolution IN ('let_go','easing','still_matters')),

  -- 整理与修改
  archived_at INTEGER,
  deleted_at INTEGER,
  last_edited_at INTEGER,
  last_edited_by_kind TEXT,
  last_edited_by_id TEXT,
  last_edited_by_label TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX moments_timeline ON moments(user_id, happened_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX moments_review ON moments(user_id, next_review_on) WHERE deleted_at IS NULL AND archived_at IS NULL;
CREATE INDEX moments_trash ON moments(user_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX moments_dedupe ON moments(user_id, source_id, dedupe_fingerprint, captured_at);

CREATE TABLE moment_revisions (
  id TEXT PRIMARY KEY,
  moment_id TEXT NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,                          -- 这份快照对应的修订号，1 = 最初的原始记录
  snapshot_json TEXT NOT NULL,                        -- 该修订号时的全部原始记录字段（CaptureSnapshot）
  changed_fields_json TEXT NOT NULL,                  -- 从这一版改到下一版时变了哪些字段
  edited_by_kind TEXT NOT NULL,
  edited_by_id TEXT,
  edited_by_label TEXT NOT NULL,
  reason TEXT,
  edited_at INTEGER NOT NULL,
  UNIQUE (moment_id, revision)
);

CREATE TABLE moment_notes (
  id TEXT PRIMARY KEY,
  moment_id TEXT NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  author_kind TEXT NOT NULL,
  author_id TEXT,
  author_label TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX notes_moment ON moment_notes(moment_id, created_at);


CREATE TABLE reflections (
  id TEXT PRIMARY KEY,
  moment_id TEXT NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  intensity_now INTEGER NOT NULL CHECK (intensity_now BETWEEN 0 AND 10),
  severity_now INTEGER CHECK (severity_now BETWEEN 0 AND 10),
  fear_came_true TEXT CHECK (fear_came_true IN ('no','partly','yes','unknown')),
  what_happened TEXT CHECK (what_happened IS NULL OR length(what_happened) BETWEEN 1 AND 2000),
  perspective TEXT CHECK (perspective IS NULL OR length(perspective) BETWEEN 1 AND 5000),
  thinking_traps_json TEXT NOT NULL DEFAULT '[]',     -- 最多 5 个，不重复
  resolution TEXT NOT NULL CHECK (resolution IN ('let_go','easing','still_matters')),
  reflected_on TEXT NOT NULL,                         -- LocalDate，写入时算好
  author_kind TEXT NOT NULL,
  author_id TEXT,
  author_label TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX reflections_moment ON reflections(moment_id, created_at);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 80),
  body TEXT NOT NULL DEFAULT '' CHECK (length(body) <= 5000),
  author_kind TEXT NOT NULL,
  author_id TEXT,
  author_label TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE lesson_moments (
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  moment_id TEXT NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (lesson_id, moment_id)
);
CREATE INDEX lesson_moments_moment ON lesson_moments(moment_id);
CREATE TABLE reflection_lessons (                     -- 复盘里 lessonIds 的来源；写入时同时补 lesson_moments
  reflection_id TEXT NOT NULL REFERENCES reflections(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  PRIMARY KEY (reflection_id, lesson_id)
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 20),   -- 已规范化，见第 4 节
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX tags_name ON tags(user_id, name COLLATE NOCASE);
CREATE TABLE moment_tags (
  moment_id TEXT NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (moment_id, tag_id)
);
CREATE INDEX moment_tags_tag ON moment_tags(tag_id);


CREATE TABLE idempotency_keys (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  principal_id TEXT NOT NULL,                         -- 'owner'、密钥 ID 或授权 ID
  operation TEXT NOT NULL,                            -- MCP 工具名或 REST operationId
  key TEXT NOT NULL,                                  -- clientRequestId / Idempotency-Key
  fingerprint TEXT NOT NULL,                          -- SHA-256(规范化参数，不含 key)
  response_json TEXT NOT NULL,                        -- 只存 ID 和元数据，不存正文
  expires_at INTEGER NOT NULL,                        -- 24 小时
  PRIMARY KEY (user_id, principal_id, operation, key)
);
CREATE INDEX idempotency_expiry ON idempotency_keys(expires_at);

CREATE TABLE agent_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (length(label) BETWEEN 1 AND 40),
  prefix TEXT NOT NULL,                               -- nbd_ak_ + 前 4 位，只用于辨认
  token_hash TEXT NOT NULL UNIQUE,                    -- SHA-256 hex(完整密钥)
  scopes_json TEXT NOT NULL,                          -- ["read","write"] 的非空子集
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,                        -- 1–365 天，必须有到期时间
  last_used_at INTEGER,                               -- 最多每分钟更新一次
  revoked_at INTEGER
);

CREATE TABLE oauth_clients (                          -- CIMD 元数据文档缓存（24 小时）
  client_id TEXT PRIMARY KEY,                         -- 文档自身的 https 地址
  client_name TEXT,
  redirect_uris_json TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  fetched_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE oauth_requests (                         -- 确认页上待处理的授权请求（10 分钟）
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  state TEXT,
  code_challenge TEXT NOT NULL,                       -- 只接受 S256
  scopes_json TEXT NOT NULL,
  resource TEXT NOT NULL,
  csrf_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE oauth_grants (                           -- 「已连接的应用」
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  redirect_host TEXT NOT NULL,
  scopes_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER,
  revoked_at INTEGER
);
CREATE UNIQUE INDEX oauth_grants_active ON oauth_grants(user_id, client_id) WHERE revoked_at IS NULL;
CREATE TABLE oauth_codes (
  code_hash TEXT PRIMARY KEY,
  grant_id TEXT NOT NULL REFERENCES oauth_grants(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  scopes_json TEXT NOT NULL,
  resource TEXT NOT NULL,
  expires_at INTEGER NOT NULL,                        -- 60 秒
  used_at INTEGER                                     -- 只能用一次
);
CREATE TABLE oauth_tokens (
  id TEXT PRIMARY KEY,
  grant_id TEXT NOT NULL REFERENCES oauth_grants(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('access','refresh')),
  token_hash TEXT NOT NULL UNIQUE,
  scopes_json TEXT NOT NULL,
  resource TEXT NOT NULL,                             -- 受众，必须等于 MCP 地址
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  last_used_at INTEGER,
  revoked_at INTEGER,
  replaced_by TEXT                                    -- 刷新令牌轮换后指向新令牌；旧令牌再出现即视为重放
);
CREATE INDEX oauth_tokens_grant ON oauth_tokens(grant_id);


CREATE TABLE audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,                                       -- 登录失败等场景可能为 NULL
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  channel TEXT NOT NULL CHECK (channel IN ('web','mcp','oauth','cli','system')),
  actor_kind TEXT NOT NULL CHECK (actor_kind IN ('owner','agent_key','oauth_app','system','anonymous')),
  actor_id TEXT,
  actor_label TEXT NOT NULL,
  action TEXT NOT NULL,                               -- 例如 moment.record、auth.login
  target_type TEXT,
  target_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('running','success','error')),
  error_code TEXT,
  ip TEXT,
  request_id TEXT
);
CREATE INDEX audit_user ON audit_events(user_id, id DESC);

CREATE VIRTUAL TABLE moment_search USING fts5(
  moment_id UNINDEXED,
  user_id UNINDEXED,
  title,
  body,                                               -- 原话 + 概括 + 担心 + 想法 + 全部补记 + 全部复盘文字
  tokenize = 'trigram'
);
