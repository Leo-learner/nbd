export interface paths {
    "/healthz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/readyz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getReady"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/meta": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 版本、功能开关、限额、排程参数和全部枚举的中文标签 */
        get: operations["getMeta"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 登录 */
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 退出当前会话 */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 退出所有会话 */
        post: operations["logoutAll"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 当前用户 */
        get: operations["getMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** 修改密码 */
        put: operations["changePassword"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 事件列表（时间线、搜索、洞察下钻） */
        get: operations["listMoments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moments/{momentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 事件详情 */
        get: operations["getMoment"];
        put?: never;
        post?: never;
        /** 移进回收站 */
        delete: operations["trashMoment"];
        options?: never;
        head?: never;
        /** 修改原始记录（会生成修订记录） */
        patch: operations["updateMoment"];
        trace?: never;
    };
    "/api/v1/moments/{momentId}/revisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 修订历史 */
        get: operations["listMomentRevisions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moments/{momentId}/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** 整组替换标签 */
        put: operations["setMomentTags"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moments/{momentId}/notes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 补记 */
        post: operations["createNote"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notes/{noteId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 删除补记（直接删除，进审计） */
        delete: operations["deleteNote"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moments/{momentId}/snooze": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 推迟回看 */
        post: operations["snoozeMoment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moments/{momentId}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 归档（暂停提醒） */
        post: operations["archiveMoment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moments/{momentId}/unarchive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 取消归档 */
        post: operations["unarchiveMoment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moments/{momentId}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 从回收站恢复 */
        post: operations["restoreMoment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 回收站 */
        get: operations["listTrash"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/trash/{momentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 立即彻底删除 */
        delete: operations["purgeMoment"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reviews/due": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 待回看收件箱 */
        get: operations["listDueReviews"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/moments/{momentId}/reflections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 写一次复盘 */
        post: operations["createReflection"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reflections/{reflectionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 删除复盘（直接删除，进审计） */
        delete: operations["deleteReflection"];
        options?: never;
        head?: never;
        /** 修改复盘 */
        patch: operations["updateReflection"];
        trace?: never;
    };
    "/api/v1/lessons": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 经验库 */
        get: operations["listLessons"];
        put?: never;
        /** 新建经验 */
        post: operations["createLesson"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lessons/{lessonId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 经验详情（含关联的事件） */
        get: operations["getLesson"];
        put?: never;
        post?: never;
        /** 删除经验（直接删除，进审计） */
        delete: operations["deleteLesson"];
        options?: never;
        head?: never;
        /** 修改经验 */
        patch: operations["updateLesson"];
        trace?: never;
    };
    "/api/v1/lessons/{lessonId}/moments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** 整组替换关联的事件 */
        put: operations["setLessonMoments"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 全部标签及使用次数 */
        get: operations["listTags"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/{tagId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 删除标签（从所有事件上摘掉） */
        delete: operations["deleteTag"];
        options?: never;
        head?: never;
        /** 重命名标签 */
        patch: operations["renameTag"];
        trace?: never;
    };
    "/api/v1/tags/{tagId}/merge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 把这个标签合并进另一个 */
        post: operations["mergeTag"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/insights/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 总览：担心没成真的比例、强度变化、多久放下、各维度分布 */
        get: operations["getInsightsOverview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/insights/decay": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 情绪衰减：按天数分桶的强度和散点 */
        get: operations["getInsightsDecay"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/insights/calendar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 日历热力图 */
        get: operations["getInsightsCalendar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/agent-keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Agent 密钥列表（含已撤销、已过期） */
        get: operations["listAgentKeys"];
        put?: never;
        /** 新建 Agent 密钥 */
        post: operations["createAgentKey"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/agent-keys/{keyId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 撤销 Agent 密钥（立即生效） */
        delete: operations["revokeAgentKey"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/connected-apps": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 已连接的应用（OAuth 授权） */
        get: operations["listConnectedApps"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/connected-apps/{appId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 断开应用（撤销授权及其全部令牌） */
        delete: operations["revokeConnectedApp"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 设置 */
        get: operations["getSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** 修改设置 */
        patch: operations["updateSettings"];
        trace?: never;
    };
    "/api/v1/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 导出全部数据（JSON） */
        get: operations["exportData"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 操作记录 */
        get: operations["listAudit"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {boolean} */
                        ok: true;
                    };
                };
            };
        };
    };
    getReady: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description 迁移版本与代码一致且数据库可读时为 true */
                        ok: boolean;
                        schemaVersion: number;
                    };
                };
            };
            /** @description Default Response */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    getMeta: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 前端所有枚举的中文标签只从这里取，不要在前端写死 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description 服务版本，例如 1.0.0（构建时写入） */
                        version: string;
                        /** @enum {string} */
                        apiVersion: "v1";
                        features: {
                            /** @description 附件（v1 为 false） */
                            attachments: boolean;
                            /** @description 复盘提醒推送（v1 为 false） */
                            reminders: boolean;
                            /** @description 匿名分享链接（v1 为 false） */
                            shareLinks: boolean;
                            /** @description 两步验证（v1 为 false） */
                            totp: boolean;
                            /** @description 开放注册（v1 为 false） */
                            registration: boolean;
                            /** @description OAuth 动态客户端注册（v1 为 false） */
                            dcr: boolean;
                            /** @description 自动复盘排程；所有者已关闭，手动复盘仍可用 */
                            reviewScheduling: boolean;
                        };
                        limits: {
                            titleMax: number;
                            narrativeMax: number;
                            agentSummaryMax: number;
                            fearedOutcomeMax: number;
                            thoughtsMax: number;
                            bodySignalsMax: number;
                            immediateResponseMax: number;
                            peopleMax: number;
                            personMax: number;
                            tagsMax: number;
                            tagMax: number;
                            emotionsMax: number;
                            noteMax: number;
                            whatHappenedMax: number;
                            perspectiveMax: number;
                            trapsMax: number;
                            lessonIdsMax: number;
                            lessonTitleMax: number;
                            lessonBodyMax: number;
                            reasonMax: number;
                            qMax: number;
                            pageMax: number;
                            listCap: number;
                            snoozeMaxDays: number;
                            keyLabelMax: number;
                            keyMaxDays: number;
                            passwordMin: number;
                            calendarMaxDays: number;
                        };
                        review: {
                            /** @description 默认复盘节奏（距记录日的天数） */
                            scheduleDays: number[];
                            /** @description Agent 可更正的小时数 */
                            freezeHours: number;
                            trashDays: number;
                            snoozeMaxDays: number;
                        };
                        enums: {
                            scene: {
                                key: string;
                                label: string;
                                /** @description 可选的补充说明（思维陷阱有） */
                                hint?: string;
                            }[];
                            emotion: {
                                key: string;
                                label: string;
                                /** @description 可选的补充说明（思维陷阱有） */
                                hint?: string;
                            }[];
                            thinkingTrap: {
                                key: string;
                                label: string;
                                /** @description 可选的补充说明（思维陷阱有） */
                                hint?: string;
                            }[];
                            resolution: {
                                key: string;
                                label: string;
                                /** @description 可选的补充说明（思维陷阱有） */
                                hint?: string;
                            }[];
                            fearCameTrue: {
                                key: string;
                                label: string;
                                /** @description 可选的补充说明（思维陷阱有） */
                                hint?: string;
                            }[];
                            status: {
                                key: string;
                                label: string;
                                /** @description 可选的补充说明（思维陷阱有） */
                                hint?: string;
                            }[];
                            precision: {
                                key: string;
                                label: string;
                                /** @description 可选的补充说明（思维陷阱有） */
                                hint?: string;
                            }[];
                            scope: {
                                key: string;
                                label: string;
                                /** @description 可选的补充说明（思维陷阱有） */
                                hint?: string;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description 大小写不敏感 */
                    username: string;
                    password: string;
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        user: {
                            /** Format: uuid */
                            id: string;
                            username: string;
                            displayName: string;
                            /** @description IANA 时区，例如 Asia/Shanghai */
                            timezone: string;
                            /** @description 一周从哪天开始：0=周日，1=周一 … 6=周六 */
                            weekStartsOn: number;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {boolean} */
                        ok: true;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    logoutAll: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {boolean} */
                        ok: true;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    getMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        user: {
                            /** Format: uuid */
                            id: string;
                            username: string;
                            displayName: string;
                            /** @description IANA 时区，例如 Asia/Shanghai */
                            timezone: string;
                            /** @description 一周从哪天开始：0=周日，1=周一 … 6=周六 */
                            weekStartsOn: number;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                        } | null;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    changePassword: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    currentPassword: string;
                    /** @description 至少 12 个字符 */
                    newPassword: string;
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {boolean} */
                        ok: true;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    listMoments: {
        parameters: {
            query?: {
                /** @description fresh=刚记下；cooling=冷却中；due=该回看；reflected=已回看；settled=已释怀；archived=已归档 */
                status?: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                /** @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他 */
                scene?: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                /** @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他 */
                emotion?: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                tag?: string;
                /** @description spotlight=聚光灯效应（以为所有人都在注意自己）；catastrophizing=灾难化（直接想到最坏的结果）；mind_reading=读心术（认定别人一定是这么看我的）；fortune_telling=预言未来（认定坏结果一定会发生）；overgeneralizing=以偏概全（一次出错就当成「我总是这样」）；personalizing=个人化（把不全是自己的责任都揽到身上）；all_or_nothing=非黑即白（不是完美就是彻底失败）；should=应该思维（「我本应该……」式的苛责） */
                trap?: "spotlight" | "catastrophizing" | "mind_reading" | "fortune_telling" | "overgeneralizing" | "personalizing" | "all_or_nothing" | "should";
                /** @description let_go=放下了；easing=好多了；still_matters=还在意 */
                resolution?: "let_go" | "easing" | "still_matters";
                /** @description no=没发生；partly=部分发生；yes=发生了；unknown=还不知道 */
                fearCameTrue?: "no" | "partly" | "yes" | "unknown";
                /** @description LocalDate：YYYY-MM-DD，按所有者时区解释 */
                from?: string;
                /** @description LocalDate：YYYY-MM-DD，按所有者时区解释 */
                to?: string;
                q?: string;
                /** @description happened_desc=发生时间从新到旧；happened_asc=发生时间从旧到新；captured_desc=记录时间从新到旧；intensity_desc=当时强度从高到低 */
                sort?: "happened_desc" | "happened_asc" | "captured_desc" | "intensity_desc";
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /** Format: uuid */
                            id: string;
                            title: string;
                            /**
                             * Format: date-time
                             * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                             */
                            happenedAt: string;
                            /**
                             * Format: date
                             * @description 发生日期（所有者时区），日历和统计按它分组
                             */
                            happenedOn: string;
                            /**
                             * @description exact=精确时间；day=只知道日期；approx=大概
                             * @enum {string}
                             */
                            happenedAtPrecision: "exact" | "day" | "approx";
                            /**
                             * Format: date-time
                             * @description 记录时间（服务器时间），也是冻结期和复盘排程的锚点
                             */
                            capturedAt: string;
                            /**
                             * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                             * @enum {string}
                             */
                            scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                            emotions: {
                                /**
                                 * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                 * @enum {string}
                                 */
                                key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                intensity: number | null;
                            }[];
                            /** @description 当时有多难受，0–10 */
                            intensity: number;
                            /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                            severity: number | null;
                            /** @description 最近一次复盘时的强度；没有复盘为 null */
                            latestIntensityNow: number | null;
                            /**
                             * @description 最近一次复盘的结论。let_go=放下了；easing=好多了；still_matters=还在意
                             * @enum {string|null}
                             */
                            latestResolution: "let_go" | "easing" | "still_matters" | null;
                            /**
                             * @description 由后端推导，前端只展示
                             * @enum {string}
                             */
                            status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                            /**
                             * Format: date
                             * @description 下次该回看的日期；不再提醒时为 null
                             */
                            nextReviewOn: string | null;
                            tags: string[];
                            noteCount: number;
                            reflectionCount: number;
                            lessonCount: number;
                            /** @description 当时是否写了担心的后果（fearedOutcome 不为空） */
                            hasFear: boolean;
                            source: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /** @description 正文开头最多 120 个字 */
                            excerpt: string;
                            /** @description 只在带 q 搜索时出现：命中位置附近的片段 */
                            matchSnippet?: string;
                        }[];
                        /** @description 下一页的游标；没有更多时为 null */
                        nextCursor: string | null;
                        /** @description 符合筛选条件的总数 */
                        total: number;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    getMoment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /**
                         * Format: date-time
                         * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                         */
                        happenedAt: string;
                        /**
                         * Format: date
                         * @description 发生日期（所有者时区），日历和统计按它分组
                         */
                        happenedOn: string;
                        /**
                         * @description exact=精确时间；day=只知道日期；approx=大概
                         * @enum {string}
                         */
                        happenedAtPrecision: "exact" | "day" | "approx";
                        /**
                         * Format: date-time
                         * @description 记录时间（服务器时间），也是冻结期和复盘排程的锚点
                         */
                        capturedAt: string;
                        /**
                         * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                         * @enum {string}
                         */
                        scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                        emotions: {
                            /**
                             * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                             * @enum {string}
                             */
                            key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                            /** @description 这种情绪单独的强度；没有单独评分时为 null */
                            intensity: number | null;
                        }[];
                        /** @description 当时有多难受，0–10 */
                        intensity: number;
                        /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                        severity: number | null;
                        /** @description 最近一次复盘时的强度；没有复盘为 null */
                        latestIntensityNow: number | null;
                        /**
                         * @description 最近一次复盘的结论。let_go=放下了；easing=好多了；still_matters=还在意
                         * @enum {string|null}
                         */
                        latestResolution: "let_go" | "easing" | "still_matters" | null;
                        /**
                         * @description 由后端推导，前端只展示
                         * @enum {string}
                         */
                        status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                        /**
                         * Format: date
                         * @description 下次该回看的日期；不再提醒时为 null
                         */
                        nextReviewOn: string | null;
                        /** @description 当时是否写了担心的后果（fearedOutcome 不为空） */
                        hasFear: boolean;
                        source: {
                            /**
                             * @description 谁做的
                             * @enum {string}
                             */
                            kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                            /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                            id: string | null;
                            /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                            label: string;
                        };
                        /** @description 用户原话，原样保存 */
                        narrative: string;
                        /** @description Agent 的概括 */
                        agentSummary: string | null;
                        /** @description 当时担心会发生什么 */
                        fearedOutcome: string | null;
                        /**
                         * Format: date
                         * @description 什么时候能知道担心的事有没有发生；第一次回看会排在这天之后
                         */
                        outcomeKnownBy: string | null;
                        /** @description 当时脑子里冒出来的想法 */
                        thoughts: string | null;
                        /** @description 身体反应，例如脸红、心跳快 */
                        bodySignals: string | null;
                        /** @description 当下是怎么应对的 */
                        immediateResponse: string | null;
                        /** @description 涉及的人，只写角色（如「新领导」），不写真名 */
                        people: string[];
                        tags: string[];
                        noteCount: number;
                        reflectionCount: number;
                        lessonCount: number;
                        /** @description 当前修订号；改动原始记录时要回传 expectedRevision */
                        revision: number;
                        /** @description 被替换下来的旧版本数量（0 表示从没改过） */
                        revisionCount: number;
                        /**
                         * Format: date-time
                         * @description Agent 能用 correct_moment 更正的截止时间（记录后 24 小时）
                         */
                        editableUntil: string;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        lastEditedAt: string | null;
                        lastEditedBy: {
                            /**
                             * @description 谁做的
                             * @enum {string}
                             */
                            kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                            /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                            id: string | null;
                            /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                            label: string;
                        } | null;
                        /**
                         * Format: date
                         * @description 推迟到哪天；没有推迟为 null
                         */
                        snoozedUntil: string | null;
                        reviewStep: {
                            /** @description 已经完成的排程步数 */
                            done: number;
                            /** @description 排程总步数；自动排程关闭时为 0 */
                            total: number;
                        };
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        archivedAt: string | null;
                        /**
                         * Format: date-time
                         * @description 在回收站中时才有值
                         */
                        deletedAt: string | null;
                        /**
                         * Format: date-time
                         * @description 在回收站中时，会被彻底删除的时间
                         */
                        purgeAt: string | null;
                        notes: {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            momentId: string;
                            body: string;
                            author: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                        }[];
                        /** @description 按时间从旧到新 */
                        reflections: {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            momentId: string;
                            /** @description 现在想起来有多难受 */
                            intensityNow: number;
                            /** @description 现在觉得有多严重 */
                            severityNow: number | null;
                            /**
                             * @description 当时担心的事有没有发生。no=没发生；partly=部分发生；yes=发生了；unknown=还不知道
                             * @enum {string|null}
                             */
                            fearCameTrue: "no" | "partly" | "yes" | "unknown" | null;
                            /** @description 后来实际发生了什么 */
                            whatHappened: string | null;
                            /** @description 现在怎么看 */
                            perspective: string | null;
                            thinkingTraps: ("spotlight" | "catastrophizing" | "mind_reading" | "fortune_telling" | "overgeneralizing" | "personalizing" | "all_or_nothing" | "should")[];
                            /**
                             * @description let_go=放下了；easing=好多了；still_matters=还在意
                             * @enum {string}
                             */
                            resolution: "let_go" | "easing" | "still_matters";
                            /**
                             * Format: date
                             * @description 复盘当天（所有者时区）
                             */
                            reflectedOn: string;
                            daysSinceHappened: number;
                            lessonIds: string[];
                            author: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            updatedAt: string;
                        }[];
                        lessons: {
                            /** Format: uuid */
                            id: string;
                            title: string;
                        }[];
                        /** @description 「当时」加上每次复盘的强度，画强度变化小图用 */
                        intensitySeries: {
                            /**
                             * Format: date
                             * @description 这个点的日期
                             */
                            on: string;
                            /** @description 距离 happenedOn 的天数 */
                            dayOffset: number;
                            /** @description 0–10 分 */
                            intensity: number;
                            /**
                             * @description capture=当时，reflection=某次复盘
                             * @enum {string}
                             */
                            kind: "capture" | "reflection";
                            /** Format: uuid */
                            reflectionId: string | null;
                        }[];
                        /** Format: uri */
                        webUrl: string;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    trashMoment: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        momentId: string;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        deletedAt: string;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        purgeAt: string;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    updateMoment: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        /** @description 只改原始记录的内容，每次修改都会生成一条修订记录。缺省的字段不变，可选字段传 null 表示清空。标签、归档、推迟走各自的接口。 */
        requestBody: {
            content: {
                "application/json": {
                    /** @description 必须等于当前 revision，否则 409 MOMENT_CONFLICT */
                    expectedRevision: number;
                    /** @description 为什么改，会写进修订记录 */
                    reason?: string;
                    title?: string;
                    narrative?: string;
                    agentSummary?: string | null;
                    /** @description 发生时间。精确时间写带时区偏移的 ISO 时间（如 2026-10-11T21:30:00+08:00）；只知道日期写 YYYY-MM-DD 并配合 happenedAtPrecision=day 或 approx。不填即为现在；晚于现在 10 分钟以上会被拒绝（HAPPENED_AT_IN_FUTURE） */
                    happenedAt?: string;
                    /**
                     * @description exact=精确时间；day=只知道日期；approx=大概
                     * @enum {string}
                     */
                    happenedAtPrecision?: "exact" | "day" | "approx";
                    /**
                     * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                     * @enum {string}
                     */
                    scene?: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                    emotions?: {
                        /**
                         * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                         * @enum {string}
                         */
                        key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                        /** @description 可选：这种情绪单独的强度 */
                        intensity?: number;
                    }[];
                    /** @description 0–10 分 */
                    intensity?: number;
                    severity?: number | null;
                    fearedOutcome?: string | null;
                    /**
                     * Format: date
                     * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                     */
                    outcomeKnownBy?: string | null;
                    thoughts?: string | null;
                    bodySignals?: string | null;
                    immediateResponse?: string | null;
                    people?: string[];
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /**
                         * Format: date-time
                         * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                         */
                        happenedAt: string;
                        /**
                         * Format: date
                         * @description 发生日期（所有者时区），日历和统计按它分组
                         */
                        happenedOn: string;
                        /**
                         * @description exact=精确时间；day=只知道日期；approx=大概
                         * @enum {string}
                         */
                        happenedAtPrecision: "exact" | "day" | "approx";
                        /**
                         * Format: date-time
                         * @description 记录时间（服务器时间），也是冻结期和复盘排程的锚点
                         */
                        capturedAt: string;
                        /**
                         * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                         * @enum {string}
                         */
                        scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                        emotions: {
                            /**
                             * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                             * @enum {string}
                             */
                            key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                            /** @description 这种情绪单独的强度；没有单独评分时为 null */
                            intensity: number | null;
                        }[];
                        /** @description 当时有多难受，0–10 */
                        intensity: number;
                        /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                        severity: number | null;
                        /** @description 最近一次复盘时的强度；没有复盘为 null */
                        latestIntensityNow: number | null;
                        /**
                         * @description 最近一次复盘的结论。let_go=放下了；easing=好多了；still_matters=还在意
                         * @enum {string|null}
                         */
                        latestResolution: "let_go" | "easing" | "still_matters" | null;
                        /**
                         * @description 由后端推导，前端只展示
                         * @enum {string}
                         */
                        status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                        /**
                         * Format: date
                         * @description 下次该回看的日期；不再提醒时为 null
                         */
                        nextReviewOn: string | null;
                        /** @description 当时是否写了担心的后果（fearedOutcome 不为空） */
                        hasFear: boolean;
                        source: {
                            /**
                             * @description 谁做的
                             * @enum {string}
                             */
                            kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                            /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                            id: string | null;
                            /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                            label: string;
                        };
                        /** @description 用户原话，原样保存 */
                        narrative: string;
                        /** @description Agent 的概括 */
                        agentSummary: string | null;
                        /** @description 当时担心会发生什么 */
                        fearedOutcome: string | null;
                        /**
                         * Format: date
                         * @description 什么时候能知道担心的事有没有发生；第一次回看会排在这天之后
                         */
                        outcomeKnownBy: string | null;
                        /** @description 当时脑子里冒出来的想法 */
                        thoughts: string | null;
                        /** @description 身体反应，例如脸红、心跳快 */
                        bodySignals: string | null;
                        /** @description 当下是怎么应对的 */
                        immediateResponse: string | null;
                        /** @description 涉及的人，只写角色（如「新领导」），不写真名 */
                        people: string[];
                        tags: string[];
                        noteCount: number;
                        reflectionCount: number;
                        lessonCount: number;
                        /** @description 当前修订号；改动原始记录时要回传 expectedRevision */
                        revision: number;
                        /** @description 被替换下来的旧版本数量（0 表示从没改过） */
                        revisionCount: number;
                        /**
                         * Format: date-time
                         * @description Agent 能用 correct_moment 更正的截止时间（记录后 24 小时）
                         */
                        editableUntil: string;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        lastEditedAt: string | null;
                        lastEditedBy: {
                            /**
                             * @description 谁做的
                             * @enum {string}
                             */
                            kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                            /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                            id: string | null;
                            /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                            label: string;
                        } | null;
                        /**
                         * Format: date
                         * @description 推迟到哪天；没有推迟为 null
                         */
                        snoozedUntil: string | null;
                        reviewStep: {
                            /** @description 已经完成的排程步数 */
                            done: number;
                            /** @description 排程总步数；自动排程关闭时为 0 */
                            total: number;
                        };
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        archivedAt: string | null;
                        /**
                         * Format: date-time
                         * @description 在回收站中时才有值
                         */
                        deletedAt: string | null;
                        /**
                         * Format: date-time
                         * @description 在回收站中时，会被彻底删除的时间
                         */
                        purgeAt: string | null;
                        notes: {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            momentId: string;
                            body: string;
                            author: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                        }[];
                        /** @description 按时间从旧到新 */
                        reflections: {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            momentId: string;
                            /** @description 现在想起来有多难受 */
                            intensityNow: number;
                            /** @description 现在觉得有多严重 */
                            severityNow: number | null;
                            /**
                             * @description 当时担心的事有没有发生。no=没发生；partly=部分发生；yes=发生了；unknown=还不知道
                             * @enum {string|null}
                             */
                            fearCameTrue: "no" | "partly" | "yes" | "unknown" | null;
                            /** @description 后来实际发生了什么 */
                            whatHappened: string | null;
                            /** @description 现在怎么看 */
                            perspective: string | null;
                            thinkingTraps: ("spotlight" | "catastrophizing" | "mind_reading" | "fortune_telling" | "overgeneralizing" | "personalizing" | "all_or_nothing" | "should")[];
                            /**
                             * @description let_go=放下了；easing=好多了；still_matters=还在意
                             * @enum {string}
                             */
                            resolution: "let_go" | "easing" | "still_matters";
                            /**
                             * Format: date
                             * @description 复盘当天（所有者时区）
                             */
                            reflectedOn: string;
                            daysSinceHappened: number;
                            lessonIds: string[];
                            author: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            updatedAt: string;
                        }[];
                        lessons: {
                            /** Format: uuid */
                            id: string;
                            title: string;
                        }[];
                        /** @description 「当时」加上每次复盘的强度，画强度变化小图用 */
                        intensitySeries: {
                            /**
                             * Format: date
                             * @description 这个点的日期
                             */
                            on: string;
                            /** @description 距离 happenedOn 的天数 */
                            dayOffset: number;
                            /** @description 0–10 分 */
                            intensity: number;
                            /**
                             * @description capture=当时，reflection=某次复盘
                             * @enum {string}
                             */
                            kind: "capture" | "reflection";
                            /** Format: uuid */
                            reflectionId: string | null;
                        }[];
                        /** Format: uri */
                        webUrl: string;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    listMomentRevisions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description 当前修订号（当前内容见 MomentDetail） */
                        current: number;
                        /** @description 被替换下来的旧版本，按修订号从小到大 */
                        items: {
                            /** @description 这份快照对应的修订号；1 是最初的原始记录 */
                            revision: number;
                            snapshot: {
                                title: string;
                                /** @description 用户原话，原样保存 */
                                narrative: string;
                                /** @description Agent 的概括 */
                                agentSummary: string | null;
                                /**
                                 * Format: date-time
                                 * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                                 */
                                happenedAt: string;
                                /**
                                 * Format: date
                                 * @description 发生日期（所有者时区），日历和统计按它分组
                                 */
                                happenedOn: string;
                                /**
                                 * @description exact=精确时间；day=只知道日期；approx=大概
                                 * @enum {string}
                                 */
                                happenedAtPrecision: "exact" | "day" | "approx";
                                /**
                                 * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                                 * @enum {string}
                                 */
                                scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                                emotions: {
                                    /**
                                     * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                     * @enum {string}
                                     */
                                    key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                    /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                    intensity: number | null;
                                }[];
                                /** @description 当时有多难受，0–10 */
                                intensity: number;
                                /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                                severity: number | null;
                                /** @description 当时担心会发生什么 */
                                fearedOutcome: string | null;
                                /**
                                 * Format: date
                                 * @description 什么时候能知道担心的事有没有发生；第一次回看会排在这天之后
                                 */
                                outcomeKnownBy: string | null;
                                /** @description 当时脑子里冒出来的想法 */
                                thoughts: string | null;
                                /** @description 身体反应，例如脸红、心跳快 */
                                bodySignals: string | null;
                                /** @description 当下是怎么应对的 */
                                immediateResponse: string | null;
                                /** @description 涉及的人，只写角色（如「新领导」），不写真名 */
                                people: string[];
                            };
                            /** @description 从这一版改到下一版时变了哪些字段 */
                            changedFields: string[];
                            editedBy: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            reason: string | null;
                            /**
                             * Format: date-time
                             * @description 改成下一版的时间
                             */
                            editedAt: string;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    setMomentTags: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description 整组替换；后端会去掉首尾空白和开头的 #，并做 NFKC 规范化 */
                    names: string[];
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        momentId: string;
                        tags: string[];
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    createNote: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
                "Idempotency-Key"?: string;
            };
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description 补记内容，只追加，不能编辑 */
                    body: string;
                };
            };
        };
        responses: {
            /** @description Default Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        /** Format: uuid */
                        momentId: string;
                        body: string;
                        author: {
                            /**
                             * @description 谁做的
                             * @enum {string}
                             */
                            kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                            /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                            id: string | null;
                            /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                            label: string;
                        };
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        createdAt: string;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    deleteNote: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                noteId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    snoozeMoment: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        /** @description 二选一：推迟几天（1–90），或推迟到某一天（不晚于 90 天后） */
        requestBody: {
            content: {
                "application/json": {
                    days: number;
                } | {
                    /**
                     * Format: date
                     * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                     */
                    until: string;
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        momentId: string;
                        /**
                         * @description fresh=刚记下；cooling=冷却中；due=该回看；reflected=已回看；settled=已释怀；archived=已归档
                         * @enum {string}
                         */
                        status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                        /**
                         * Format: date
                         * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                         */
                        nextReviewOn: string | null;
                        /**
                         * Format: date
                         * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                         */
                        snoozedUntil: string | null;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    archiveMoment: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        momentId: string;
                        /**
                         * @description fresh=刚记下；cooling=冷却中；due=该回看；reflected=已回看；settled=已释怀；archived=已归档
                         * @enum {string}
                         */
                        status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        archivedAt: string | null;
                        /**
                         * Format: date
                         * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                         */
                        nextReviewOn: string | null;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    unarchiveMoment: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        momentId: string;
                        /**
                         * @description fresh=刚记下；cooling=冷却中；due=该回看；reflected=已回看；settled=已释怀；archived=已归档
                         * @enum {string}
                         */
                        status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        archivedAt: string | null;
                        /**
                         * Format: date
                         * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                         */
                        nextReviewOn: string | null;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    restoreMoment: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /**
                         * Format: date-time
                         * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                         */
                        happenedAt: string;
                        /**
                         * Format: date
                         * @description 发生日期（所有者时区），日历和统计按它分组
                         */
                        happenedOn: string;
                        /**
                         * @description exact=精确时间；day=只知道日期；approx=大概
                         * @enum {string}
                         */
                        happenedAtPrecision: "exact" | "day" | "approx";
                        /**
                         * Format: date-time
                         * @description 记录时间（服务器时间），也是冻结期和复盘排程的锚点
                         */
                        capturedAt: string;
                        /**
                         * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                         * @enum {string}
                         */
                        scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                        emotions: {
                            /**
                             * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                             * @enum {string}
                             */
                            key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                            /** @description 这种情绪单独的强度；没有单独评分时为 null */
                            intensity: number | null;
                        }[];
                        /** @description 当时有多难受，0–10 */
                        intensity: number;
                        /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                        severity: number | null;
                        /** @description 最近一次复盘时的强度；没有复盘为 null */
                        latestIntensityNow: number | null;
                        /**
                         * @description 最近一次复盘的结论。let_go=放下了；easing=好多了；still_matters=还在意
                         * @enum {string|null}
                         */
                        latestResolution: "let_go" | "easing" | "still_matters" | null;
                        /**
                         * @description 由后端推导，前端只展示
                         * @enum {string}
                         */
                        status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                        /**
                         * Format: date
                         * @description 下次该回看的日期；不再提醒时为 null
                         */
                        nextReviewOn: string | null;
                        tags: string[];
                        noteCount: number;
                        reflectionCount: number;
                        lessonCount: number;
                        /** @description 当时是否写了担心的后果（fearedOutcome 不为空） */
                        hasFear: boolean;
                        source: {
                            /**
                             * @description 谁做的
                             * @enum {string}
                             */
                            kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                            /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                            id: string | null;
                            /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                            label: string;
                        };
                        /** @description 正文开头最多 120 个字 */
                        excerpt: string;
                        /** @description 只在带 q 搜索时出现：命中位置附近的片段 */
                        matchSnippet?: string;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    listTrash: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            moment: {
                                /** Format: uuid */
                                id: string;
                                title: string;
                                /**
                                 * Format: date-time
                                 * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                                 */
                                happenedAt: string;
                                /**
                                 * Format: date
                                 * @description 发生日期（所有者时区），日历和统计按它分组
                                 */
                                happenedOn: string;
                                /**
                                 * @description exact=精确时间；day=只知道日期；approx=大概
                                 * @enum {string}
                                 */
                                happenedAtPrecision: "exact" | "day" | "approx";
                                /**
                                 * Format: date-time
                                 * @description 记录时间（服务器时间），也是冻结期和复盘排程的锚点
                                 */
                                capturedAt: string;
                                /**
                                 * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                                 * @enum {string}
                                 */
                                scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                                emotions: {
                                    /**
                                     * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                     * @enum {string}
                                     */
                                    key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                    /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                    intensity: number | null;
                                }[];
                                /** @description 当时有多难受，0–10 */
                                intensity: number;
                                /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                                severity: number | null;
                                /** @description 最近一次复盘时的强度；没有复盘为 null */
                                latestIntensityNow: number | null;
                                /**
                                 * @description 最近一次复盘的结论。let_go=放下了；easing=好多了；still_matters=还在意
                                 * @enum {string|null}
                                 */
                                latestResolution: "let_go" | "easing" | "still_matters" | null;
                                /**
                                 * @description 由后端推导，前端只展示
                                 * @enum {string}
                                 */
                                status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                                /**
                                 * Format: date
                                 * @description 下次该回看的日期；不再提醒时为 null
                                 */
                                nextReviewOn: string | null;
                                tags: string[];
                                noteCount: number;
                                reflectionCount: number;
                                lessonCount: number;
                                /** @description 当时是否写了担心的后果（fearedOutcome 不为空） */
                                hasFear: boolean;
                                source: {
                                    /**
                                     * @description 谁做的
                                     * @enum {string}
                                     */
                                    kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                    /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                    id: string | null;
                                    /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                    label: string;
                                };
                                /** @description 正文开头最多 120 个字 */
                                excerpt: string;
                                /** @description 只在带 q 搜索时出现：命中位置附近的片段 */
                                matchSnippet?: string;
                            };
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            deletedAt: string;
                            /**
                             * Format: date-time
                             * @description 到这个时间会被彻底删除
                             */
                            purgeAt: string;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    purgeMoment: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    listDueReviews: {
        parameters: {
            query?: {
                upcomingDays?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description 已到期，按 dueOn 从早到晚 */
                        items: {
                            moment: {
                                /** Format: uuid */
                                id: string;
                                title: string;
                                excerpt: string;
                                /**
                                 * Format: date
                                 * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                                 */
                                happenedOn: string;
                                /**
                                 * @description exact=精确时间；day=只知道日期；approx=大概
                                 * @enum {string}
                                 */
                                happenedAtPrecision: "exact" | "day" | "approx";
                                /**
                                 * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                                 * @enum {string}
                                 */
                                scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                                emotions: {
                                    /**
                                     * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                     * @enum {string}
                                     */
                                    key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                    /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                    intensity: number | null;
                                }[];
                                /** @description 当时的强度 */
                                intensity: number;
                                severity: number | null;
                                fearedOutcome: string | null;
                            };
                            /**
                             * Format: date
                             * @description 该回看的日期
                             */
                            dueOn: string;
                            /** @description 过期几天；当天到期或即将到期为 0 */
                            overdueDays: number;
                            step: {
                                /** @description 这是第几次排程回看 */
                                index: number;
                                total: number;
                            };
                            lastReflection: {
                                /**
                                 * Format: date-time
                                 * @description Instant：UTC ISO 8601，精确到毫秒
                                 */
                                createdAt: string;
                                /** @description 0–10 分 */
                                intensityNow: number;
                                /**
                                 * @description let_go=放下了；easing=好多了；still_matters=还在意
                                 * @enum {string}
                                 */
                                resolution: "let_go" | "easing" | "still_matters";
                            } | null;
                        }[];
                        /** @description 已到期的总数，也用作导航角标 */
                        dueCount: number;
                        /** @description 未来 upcomingDays 天内将到期的 */
                        upcoming: {
                            moment: {
                                /** Format: uuid */
                                id: string;
                                title: string;
                                excerpt: string;
                                /**
                                 * Format: date
                                 * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                                 */
                                happenedOn: string;
                                /**
                                 * @description exact=精确时间；day=只知道日期；approx=大概
                                 * @enum {string}
                                 */
                                happenedAtPrecision: "exact" | "day" | "approx";
                                /**
                                 * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                                 * @enum {string}
                                 */
                                scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                                emotions: {
                                    /**
                                     * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                     * @enum {string}
                                     */
                                    key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                    /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                    intensity: number | null;
                                }[];
                                /** @description 当时的强度 */
                                intensity: number;
                                severity: number | null;
                                fearedOutcome: string | null;
                            };
                            /**
                             * Format: date
                             * @description 该回看的日期
                             */
                            dueOn: string;
                            /** @description 过期几天；当天到期或即将到期为 0 */
                            overdueDays: number;
                            step: {
                                /** @description 这是第几次排程回看 */
                                index: number;
                                total: number;
                            };
                            lastReflection: {
                                /**
                                 * Format: date-time
                                 * @description Instant：UTC ISO 8601，精确到毫秒
                                 */
                                createdAt: string;
                                /** @description 0–10 分 */
                                intensityNow: number;
                                /**
                                 * @description let_go=放下了；easing=好多了；still_matters=还在意
                                 * @enum {string}
                                 */
                                resolution: "let_go" | "easing" | "still_matters";
                            } | null;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    createReflection: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
                "Idempotency-Key"?: string;
            };
            path: {
                momentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description 现在想起来有多难受，0–10 */
                    intensityNow: number;
                    /**
                     * @description 结论由用户自己选
                     * @enum {string}
                     */
                    resolution: "let_go" | "easing" | "still_matters";
                    /** @description 现在觉得有多严重 */
                    severityNow?: number;
                    /**
                     * @description 当时担心的事有没有发生；事件有 fearedOutcome 而这里不填时记为 unknown
                     * @enum {string}
                     */
                    fearCameTrue?: "no" | "partly" | "yes" | "unknown";
                    /** @description 后来实际发生了什么 */
                    whatHappened?: string;
                    /** @description 现在怎么看这件事 */
                    perspective?: string;
                    /** @description 回头看，当时掉进了哪些思维陷阱 */
                    thinkingTraps?: ("spotlight" | "catastrophizing" | "mind_reading" | "fortune_telling" | "overgeneralizing" | "personalizing" | "all_or_nothing" | "should")[];
                    /** @description 关联已有的经验；新经验先用 createLesson 建好 */
                    lessonIds?: string[];
                };
            };
        };
        responses: {
            /** @description Default Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        reflection: {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            momentId: string;
                            /** @description 现在想起来有多难受 */
                            intensityNow: number;
                            /** @description 现在觉得有多严重 */
                            severityNow: number | null;
                            /**
                             * @description 当时担心的事有没有发生。no=没发生；partly=部分发生；yes=发生了；unknown=还不知道
                             * @enum {string|null}
                             */
                            fearCameTrue: "no" | "partly" | "yes" | "unknown" | null;
                            /** @description 后来实际发生了什么 */
                            whatHappened: string | null;
                            /** @description 现在怎么看 */
                            perspective: string | null;
                            thinkingTraps: ("spotlight" | "catastrophizing" | "mind_reading" | "fortune_telling" | "overgeneralizing" | "personalizing" | "all_or_nothing" | "should")[];
                            /**
                             * @description let_go=放下了；easing=好多了；still_matters=还在意
                             * @enum {string}
                             */
                            resolution: "let_go" | "easing" | "still_matters";
                            /**
                             * Format: date
                             * @description 复盘当天（所有者时区）
                             */
                            reflectedOn: string;
                            daysSinceHappened: number;
                            lessonIds: string[];
                            author: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            updatedAt: string;
                        };
                        moment: {
                            /** Format: uuid */
                            id: string;
                            /**
                             * @description fresh=刚记下；cooling=冷却中；due=该回看；reflected=已回看；settled=已释怀；archived=已归档
                             * @enum {string}
                             */
                            status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                            /**
                             * Format: date
                             * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                             */
                            nextReviewOn: string | null;
                        };
                        comparison: {
                            /** @description 记录时的强度 */
                            intensityThen: number;
                            /** @description 这次复盘的强度 */
                            intensityNow: number;
                            /** @description 现在减当时，负数表示减轻了 */
                            change: number;
                            daysSinceHappened: number;
                        };
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    deleteReflection: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                reflectionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        momentId: string;
                        /**
                         * @description fresh=刚记下；cooling=冷却中；due=该回看；reflected=已回看；settled=已释怀；archived=已归档
                         * @enum {string}
                         */
                        status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                        /**
                         * Format: date
                         * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                         */
                        nextReviewOn: string | null;
                        /**
                         * Format: date
                         * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                         */
                        snoozedUntil: string | null;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    updateReflection: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                reflectionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description 现在想起来有多难受，0–10 */
                    intensityNow?: number;
                    /**
                     * @description 结论由用户自己选
                     * @enum {string}
                     */
                    resolution?: "let_go" | "easing" | "still_matters";
                    /** @description 现在觉得有多严重 */
                    severityNow?: number | null;
                    /**
                     * @description 当时担心的事有没有发生；事件有 fearedOutcome 而这里不填时记为 unknown。no=没发生；partly=部分发生；yes=发生了；unknown=还不知道
                     * @enum {string|null}
                     */
                    fearCameTrue?: "no" | "partly" | "yes" | "unknown" | null;
                    /** @description 后来实际发生了什么 */
                    whatHappened?: string | null;
                    /** @description 现在怎么看这件事 */
                    perspective?: string | null;
                    /** @description 回头看，当时掉进了哪些思维陷阱 */
                    thinkingTraps?: ("spotlight" | "catastrophizing" | "mind_reading" | "fortune_telling" | "overgeneralizing" | "personalizing" | "all_or_nothing" | "should")[];
                    /** @description 关联已有的经验；新经验先用 createLesson 建好 */
                    lessonIds?: string[];
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        reflection: {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            momentId: string;
                            /** @description 现在想起来有多难受 */
                            intensityNow: number;
                            /** @description 现在觉得有多严重 */
                            severityNow: number | null;
                            /**
                             * @description 当时担心的事有没有发生。no=没发生；partly=部分发生；yes=发生了；unknown=还不知道
                             * @enum {string|null}
                             */
                            fearCameTrue: "no" | "partly" | "yes" | "unknown" | null;
                            /** @description 后来实际发生了什么 */
                            whatHappened: string | null;
                            /** @description 现在怎么看 */
                            perspective: string | null;
                            thinkingTraps: ("spotlight" | "catastrophizing" | "mind_reading" | "fortune_telling" | "overgeneralizing" | "personalizing" | "all_or_nothing" | "should")[];
                            /**
                             * @description let_go=放下了；easing=好多了；still_matters=还在意
                             * @enum {string}
                             */
                            resolution: "let_go" | "easing" | "still_matters";
                            /**
                             * Format: date
                             * @description 复盘当天（所有者时区）
                             */
                            reflectedOn: string;
                            daysSinceHappened: number;
                            lessonIds: string[];
                            author: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            updatedAt: string;
                        };
                        moment: {
                            /** Format: uuid */
                            id: string;
                            /**
                             * @description fresh=刚记下；cooling=冷却中；due=该回看；reflected=已回看；settled=已释怀；archived=已归档
                             * @enum {string}
                             */
                            status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                            /**
                             * Format: date
                             * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                             */
                            nextReviewOn: string | null;
                        };
                        comparison: {
                            /** @description 记录时的强度 */
                            intensityThen: number;
                            /** @description 这次复盘的强度 */
                            intensityNow: number;
                            /** @description 现在减当时，负数表示减轻了 */
                            change: number;
                            daysSinceHappened: number;
                        };
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    listLessons: {
        parameters: {
            query?: {
                q?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /** Format: uuid */
                            id: string;
                            title: string;
                            /** @description 纯文本 */
                            body: string;
                            /** @description 关联的事件数（不含回收站里的） */
                            momentCount: number;
                            author: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            updatedAt: string;
                        }[];
                        total: number;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    createLesson: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    title: string;
                    body?: string;
                    momentIds?: string[];
                };
            };
        };
        responses: {
            /** @description Default Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /** @description 纯文本 */
                        body: string;
                        /** @description 关联的事件数（不含回收站里的） */
                        momentCount: number;
                        author: {
                            /**
                             * @description 谁做的
                             * @enum {string}
                             */
                            kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                            /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                            id: string | null;
                            /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                            label: string;
                        };
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        createdAt: string;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        updatedAt: string;
                        moments: {
                            /** Format: uuid */
                            id: string;
                            title: string;
                            /**
                             * Format: date-time
                             * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                             */
                            happenedAt: string;
                            /**
                             * Format: date
                             * @description 发生日期（所有者时区），日历和统计按它分组
                             */
                            happenedOn: string;
                            /**
                             * @description exact=精确时间；day=只知道日期；approx=大概
                             * @enum {string}
                             */
                            happenedAtPrecision: "exact" | "day" | "approx";
                            /**
                             * Format: date-time
                             * @description 记录时间（服务器时间），也是冻结期和复盘排程的锚点
                             */
                            capturedAt: string;
                            /**
                             * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                             * @enum {string}
                             */
                            scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                            emotions: {
                                /**
                                 * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                 * @enum {string}
                                 */
                                key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                intensity: number | null;
                            }[];
                            /** @description 当时有多难受，0–10 */
                            intensity: number;
                            /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                            severity: number | null;
                            /** @description 最近一次复盘时的强度；没有复盘为 null */
                            latestIntensityNow: number | null;
                            /**
                             * @description 最近一次复盘的结论。let_go=放下了；easing=好多了；still_matters=还在意
                             * @enum {string|null}
                             */
                            latestResolution: "let_go" | "easing" | "still_matters" | null;
                            /**
                             * @description 由后端推导，前端只展示
                             * @enum {string}
                             */
                            status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                            /**
                             * Format: date
                             * @description 下次该回看的日期；不再提醒时为 null
                             */
                            nextReviewOn: string | null;
                            tags: string[];
                            noteCount: number;
                            reflectionCount: number;
                            lessonCount: number;
                            /** @description 当时是否写了担心的后果（fearedOutcome 不为空） */
                            hasFear: boolean;
                            source: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /** @description 正文开头最多 120 个字 */
                            excerpt: string;
                            /** @description 只在带 q 搜索时出现：命中位置附近的片段 */
                            matchSnippet?: string;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    getLesson: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                lessonId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /** @description 纯文本 */
                        body: string;
                        /** @description 关联的事件数（不含回收站里的） */
                        momentCount: number;
                        author: {
                            /**
                             * @description 谁做的
                             * @enum {string}
                             */
                            kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                            /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                            id: string | null;
                            /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                            label: string;
                        };
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        createdAt: string;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        updatedAt: string;
                        moments: {
                            /** Format: uuid */
                            id: string;
                            title: string;
                            /**
                             * Format: date-time
                             * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                             */
                            happenedAt: string;
                            /**
                             * Format: date
                             * @description 发生日期（所有者时区），日历和统计按它分组
                             */
                            happenedOn: string;
                            /**
                             * @description exact=精确时间；day=只知道日期；approx=大概
                             * @enum {string}
                             */
                            happenedAtPrecision: "exact" | "day" | "approx";
                            /**
                             * Format: date-time
                             * @description 记录时间（服务器时间），也是冻结期和复盘排程的锚点
                             */
                            capturedAt: string;
                            /**
                             * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                             * @enum {string}
                             */
                            scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                            emotions: {
                                /**
                                 * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                 * @enum {string}
                                 */
                                key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                intensity: number | null;
                            }[];
                            /** @description 当时有多难受，0–10 */
                            intensity: number;
                            /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                            severity: number | null;
                            /** @description 最近一次复盘时的强度；没有复盘为 null */
                            latestIntensityNow: number | null;
                            /**
                             * @description 最近一次复盘的结论。let_go=放下了；easing=好多了；still_matters=还在意
                             * @enum {string|null}
                             */
                            latestResolution: "let_go" | "easing" | "still_matters" | null;
                            /**
                             * @description 由后端推导，前端只展示
                             * @enum {string}
                             */
                            status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                            /**
                             * Format: date
                             * @description 下次该回看的日期；不再提醒时为 null
                             */
                            nextReviewOn: string | null;
                            tags: string[];
                            noteCount: number;
                            reflectionCount: number;
                            lessonCount: number;
                            /** @description 当时是否写了担心的后果（fearedOutcome 不为空） */
                            hasFear: boolean;
                            source: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /** @description 正文开头最多 120 个字 */
                            excerpt: string;
                            /** @description 只在带 q 搜索时出现：命中位置附近的片段 */
                            matchSnippet?: string;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    deleteLesson: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                lessonId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    updateLesson: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                lessonId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    title?: string;
                    body?: string;
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /** @description 纯文本 */
                        body: string;
                        /** @description 关联的事件数（不含回收站里的） */
                        momentCount: number;
                        author: {
                            /**
                             * @description 谁做的
                             * @enum {string}
                             */
                            kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                            /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                            id: string | null;
                            /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                            label: string;
                        };
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        createdAt: string;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        updatedAt: string;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    setLessonMoments: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                lessonId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description 整组替换 */
                    momentIds: string[];
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /** @description 纯文本 */
                        body: string;
                        /** @description 关联的事件数（不含回收站里的） */
                        momentCount: number;
                        author: {
                            /**
                             * @description 谁做的
                             * @enum {string}
                             */
                            kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                            /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                            id: string | null;
                            /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                            label: string;
                        };
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        createdAt: string;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        updatedAt: string;
                        moments: {
                            /** Format: uuid */
                            id: string;
                            title: string;
                            /**
                             * Format: date-time
                             * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                             */
                            happenedAt: string;
                            /**
                             * Format: date
                             * @description 发生日期（所有者时区），日历和统计按它分组
                             */
                            happenedOn: string;
                            /**
                             * @description exact=精确时间；day=只知道日期；approx=大概
                             * @enum {string}
                             */
                            happenedAtPrecision: "exact" | "day" | "approx";
                            /**
                             * Format: date-time
                             * @description 记录时间（服务器时间），也是冻结期和复盘排程的锚点
                             */
                            capturedAt: string;
                            /**
                             * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                             * @enum {string}
                             */
                            scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                            emotions: {
                                /**
                                 * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                 * @enum {string}
                                 */
                                key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                intensity: number | null;
                            }[];
                            /** @description 当时有多难受，0–10 */
                            intensity: number;
                            /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                            severity: number | null;
                            /** @description 最近一次复盘时的强度；没有复盘为 null */
                            latestIntensityNow: number | null;
                            /**
                             * @description 最近一次复盘的结论。let_go=放下了；easing=好多了；still_matters=还在意
                             * @enum {string|null}
                             */
                            latestResolution: "let_go" | "easing" | "still_matters" | null;
                            /**
                             * @description 由后端推导，前端只展示
                             * @enum {string}
                             */
                            status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                            /**
                             * Format: date
                             * @description 下次该回看的日期；不再提醒时为 null
                             */
                            nextReviewOn: string | null;
                            tags: string[];
                            noteCount: number;
                            reflectionCount: number;
                            lessonCount: number;
                            /** @description 当时是否写了担心的后果（fearedOutcome 不为空） */
                            hasFear: boolean;
                            source: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /** @description 正文开头最多 120 个字 */
                            excerpt: string;
                            /** @description 只在带 q 搜索时出现：命中位置附近的片段 */
                            matchSnippet?: string;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    listTags: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            momentCount: number;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    deleteTag: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                tagId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    renameTag: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                tagId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        name: string;
                        momentCount: number;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        createdAt: string;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    mergeTag: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                tagId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description 合并到哪个标签；当前标签会被删除
                     */
                    intoId: string;
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        tag: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            momentCount: number;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                        };
                        /** @description 从被合并标签上改挂过来的事件数 */
                        movedMoments: number;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    getInsightsOverview: {
        parameters: {
            query?: {
                /** @description LocalDate：YYYY-MM-DD，按所有者时区解释 */
                from?: string;
                /** @description LocalDate：YYYY-MM-DD，按所有者时区解释 */
                to?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 统计不含回收站里的事件；归档的计入。from/to 按 happenedOn 过滤。 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        range: {
                            /**
                             * Format: date
                             * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                             */
                            from: string | null;
                            /**
                             * Format: date
                             * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                             */
                            to: string | null;
                        };
                        /** @description 样本数低于它时前端显示「样本不足」，v1 为 5 */
                        minSample: number;
                        totals: {
                            moments: number;
                            /** @description 至少复盘过一次 */
                            reflected: number;
                            settled: number;
                            archived: number;
                        };
                        fear: {
                            /** @description 写了 fearedOutcome 的事件数 */
                            withFear: number;
                            /** @description no + partly + yes */
                            judged: number;
                            no: number;
                            partly: number;
                            yes: number;
                            /** @description 复盘过但都答「还不知道」 */
                            unknown: number;
                            /** @description 还没复盘 */
                            pending: number;
                            /** @description no ÷ judged；judged 为 0 时为 null。每件事取最近一次不是 unknown 的回答 */
                            neverHappenedRate: number | null;
                        };
                        intensity: {
                            /** @description 至少复盘过一次的事件数 */
                            pairs: number;
                            /** @description 这些事件当时强度的平均值 */
                            meanThen: number | null;
                            /** @description 这些事件最近一次复盘强度的平均值 */
                            meanNow: number | null;
                            /** @description meanThen − meanNow */
                            meanDrop: number | null;
                        };
                        letGo: {
                            count: number;
                            /** @description 从 happenedOn 到第一次 let_go 的天数中位数 */
                            medianDays: number | null;
                        };
                        distributions: {
                            emotions: {
                                key: string;
                                count: number;
                            }[];
                            scenes: {
                                key: string;
                                count: number;
                            }[];
                            thinkingTraps: {
                                key: string;
                                count: number;
                            }[];
                            resolutions: {
                                key: string;
                                count: number;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    getInsightsDecay: {
        parameters: {
            query?: {
                /** @description LocalDate：YYYY-MM-DD，按所有者时区解释 */
                from?: string;
                /** @description LocalDate：YYYY-MM-DD，按所有者时区解释 */
                to?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        range: {
                            /**
                             * Format: date
                             * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                             */
                            from: string | null;
                            /**
                             * Format: date
                             * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                             */
                            to: string | null;
                        };
                        minSample: number;
                        buckets: {
                            /** @enum {string} */
                            key: "d0_1" | "d2_7" | "d8_30" | "d31_90" | "d91p";
                            /** @description 例如「当天–1 天」「2–7 天」 */
                            label: string;
                            n: number;
                            meanIntensity: number | null;
                            medianIntensity: number | null;
                        }[];
                        /** @description 散点，最多 2000 个 */
                        points: {
                            /** Format: uuid */
                            momentId: string;
                            /** @description 距离 happenedOn 的天数 */
                            dayOffset: number;
                            /** @description 0–10 分 */
                            intensity: number;
                            /** @enum {string} */
                            kind: "capture" | "reflection";
                        }[];
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    getInsightsCalendar: {
        parameters: {
            query: {
                /** @description LocalDate：YYYY-MM-DD，按所有者时区解释 */
                from: string;
                /** @description LocalDate：YYYY-MM-DD，按所有者时区解释 */
                to: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        timezone: string;
                        weekStartsOn: number;
                        /**
                         * Format: date
                         * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                         */
                        from: string;
                        /**
                         * Format: date
                         * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                         */
                        to: string;
                        /** @description 只列出有记录的日子 */
                        days: {
                            /**
                             * Format: date
                             * @description LocalDate：YYYY-MM-DD，按所有者时区解释
                             */
                            date: string;
                            count: number;
                            /** @description 当天各事件当时强度的最大值 */
                            maxIntensity: number;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    listAgentKeys: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /** Format: uuid */
                            id: string;
                            label: string;
                            /** @description 用来辨认是哪把密钥的前缀，不是密钥本身 */
                            prefix: string;
                            scopes: ("read" | "write")[];
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            expiresAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            lastUsedAt: string | null;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            revokedAt: string | null;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    createAgentKey: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description 起个能认出来的名字，例如「Claude Code（MacBook）」 */
                    label: string;
                    /** @description 只给 write 就是只写密钥：能记、能补记，读不到历史 */
                    scopes: ("read" | "write")[];
                    /** @default 365 */
                    expiresInDays?: number;
                    /** @description 再输一次当前密码，防止被盗的 Cookie 换出长期密钥 */
                    currentPassword: string;
                };
            };
        };
        responses: {
            /** @description Default Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        agentKey: {
                            /** Format: uuid */
                            id: string;
                            label: string;
                            /** @description 用来辨认是哪把密钥的前缀，不是密钥本身 */
                            prefix: string;
                            scopes: ("read" | "write")[];
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            expiresAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            lastUsedAt: string | null;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            revokedAt: string | null;
                        };
                        /** @description 完整密钥，只在这一次响应里出现，之后再也拿不到 */
                        secret: string;
                        /**
                         * Format: uri
                         * @example https://nbd.dkz12345.com/mcp
                         */
                        mcpUrl: string;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    revokeAgentKey: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                keyId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        label: string;
                        /** @description 用来辨认是哪把密钥的前缀，不是密钥本身 */
                        prefix: string;
                        scopes: ("read" | "write")[];
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        createdAt: string;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        expiresAt: string;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        lastUsedAt: string | null;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        revokedAt: string | null;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    listConnectedApps: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /**
                             * Format: uuid
                             * @description 授权（grant）ID
                             */
                            id: string;
                            /**
                             * Format: uri
                             * @description 客户端元数据文档（CIMD）的地址
                             */
                            clientId: string;
                            /** @description 来自客户端元数据文档，不可信，展示时必须转义，并和 clientHost 一起显示 */
                            clientName: string;
                            /** @description clientId 的域名，例如 claude.ai */
                            clientHost: string;
                            /** @description 授权时回调地址的域名 */
                            redirectHost: string;
                            scopes: ("read" | "write")[];
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            lastUsedAt: string | null;
                            /**
                             * Format: date-time
                             * @description 刷新令牌到期时间；过期后要在客户端里重新连接
                             */
                            refreshExpiresAt: string | null;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    revokeConnectedApp: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path: {
                appId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    getSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        displayName: string;
                        /** @description IANA 时区；改时区只影响「今天」怎么算，已记录的日期不会被重算 */
                        timezone: string;
                        weekStartsOn: number;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    updateSettings: {
        parameters: {
            query?: never;
            header?: {
                "X-NBD-Request"?: "1";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    displayName?: string;
                    /** @description 必须是 Intl.supportedValuesOf("timeZone") 里的值，否则 400 INVALID_TIMEZONE */
                    timezone?: string;
                    weekStartsOn?: number;
                };
            };
        };
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        displayName: string;
                        /** @description IANA 时区；改时区只影响「今天」怎么算，已记录的日期不会被重算 */
                        timezone: string;
                        weekStartsOn: number;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    exportData: {
        parameters: {
            query?: {
                format?: "json";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {string} */
                        format: "nbd-export";
                        /** @enum {integer} */
                        version: 1;
                        /**
                         * Format: date-time
                         * @description Instant：UTC ISO 8601，精确到毫秒
                         */
                        exportedAt: string;
                        owner: {
                            username: string;
                            displayName: string;
                            timezone: string;
                        };
                        /** @description 含回收站里的事件 */
                        moments: {
                            moment: {
                                /** Format: uuid */
                                id: string;
                                title: string;
                                /**
                                 * Format: date-time
                                 * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                                 */
                                happenedAt: string;
                                /**
                                 * Format: date
                                 * @description 发生日期（所有者时区），日历和统计按它分组
                                 */
                                happenedOn: string;
                                /**
                                 * @description exact=精确时间；day=只知道日期；approx=大概
                                 * @enum {string}
                                 */
                                happenedAtPrecision: "exact" | "day" | "approx";
                                /**
                                 * Format: date-time
                                 * @description 记录时间（服务器时间），也是冻结期和复盘排程的锚点
                                 */
                                capturedAt: string;
                                /**
                                 * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                                 * @enum {string}
                                 */
                                scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                                emotions: {
                                    /**
                                     * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                     * @enum {string}
                                     */
                                    key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                    /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                    intensity: number | null;
                                }[];
                                /** @description 当时有多难受，0–10 */
                                intensity: number;
                                /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                                severity: number | null;
                                /** @description 最近一次复盘时的强度；没有复盘为 null */
                                latestIntensityNow: number | null;
                                /**
                                 * @description 最近一次复盘的结论。let_go=放下了；easing=好多了；still_matters=还在意
                                 * @enum {string|null}
                                 */
                                latestResolution: "let_go" | "easing" | "still_matters" | null;
                                /**
                                 * @description 由后端推导，前端只展示
                                 * @enum {string}
                                 */
                                status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                                /**
                                 * Format: date
                                 * @description 下次该回看的日期；不再提醒时为 null
                                 */
                                nextReviewOn: string | null;
                                /** @description 当时是否写了担心的后果（fearedOutcome 不为空） */
                                hasFear: boolean;
                                source: {
                                    /**
                                     * @description 谁做的
                                     * @enum {string}
                                     */
                                    kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                    /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                    id: string | null;
                                    /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                    label: string;
                                };
                                /** @description 用户原话，原样保存 */
                                narrative: string;
                                /** @description Agent 的概括 */
                                agentSummary: string | null;
                                /** @description 当时担心会发生什么 */
                                fearedOutcome: string | null;
                                /**
                                 * Format: date
                                 * @description 什么时候能知道担心的事有没有发生；第一次回看会排在这天之后
                                 */
                                outcomeKnownBy: string | null;
                                /** @description 当时脑子里冒出来的想法 */
                                thoughts: string | null;
                                /** @description 身体反应，例如脸红、心跳快 */
                                bodySignals: string | null;
                                /** @description 当下是怎么应对的 */
                                immediateResponse: string | null;
                                /** @description 涉及的人，只写角色（如「新领导」），不写真名 */
                                people: string[];
                                tags: string[];
                                noteCount: number;
                                reflectionCount: number;
                                lessonCount: number;
                                /** @description 当前修订号；改动原始记录时要回传 expectedRevision */
                                revision: number;
                                /** @description 被替换下来的旧版本数量（0 表示从没改过） */
                                revisionCount: number;
                                /**
                                 * Format: date-time
                                 * @description Agent 能用 correct_moment 更正的截止时间（记录后 24 小时）
                                 */
                                editableUntil: string;
                                /**
                                 * Format: date-time
                                 * @description Instant：UTC ISO 8601，精确到毫秒
                                 */
                                lastEditedAt: string | null;
                                lastEditedBy: {
                                    /**
                                     * @description 谁做的
                                     * @enum {string}
                                     */
                                    kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                    /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                    id: string | null;
                                    /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                    label: string;
                                } | null;
                                /**
                                 * Format: date
                                 * @description 推迟到哪天；没有推迟为 null
                                 */
                                snoozedUntil: string | null;
                                reviewStep: {
                                    /** @description 已经完成的排程步数 */
                                    done: number;
                                    /** @description 排程总步数；自动排程关闭时为 0 */
                                    total: number;
                                };
                                /**
                                 * Format: date-time
                                 * @description Instant：UTC ISO 8601，精确到毫秒
                                 */
                                archivedAt: string | null;
                                /**
                                 * Format: date-time
                                 * @description 在回收站中时才有值
                                 */
                                deletedAt: string | null;
                                /**
                                 * Format: date-time
                                 * @description 在回收站中时，会被彻底删除的时间
                                 */
                                purgeAt: string | null;
                                notes: {
                                    /** Format: uuid */
                                    id: string;
                                    /** Format: uuid */
                                    momentId: string;
                                    body: string;
                                    author: {
                                        /**
                                         * @description 谁做的
                                         * @enum {string}
                                         */
                                        kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                        /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                        id: string | null;
                                        /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                        label: string;
                                    };
                                    /**
                                     * Format: date-time
                                     * @description Instant：UTC ISO 8601，精确到毫秒
                                     */
                                    createdAt: string;
                                }[];
                                /** @description 按时间从旧到新 */
                                reflections: {
                                    /** Format: uuid */
                                    id: string;
                                    /** Format: uuid */
                                    momentId: string;
                                    /** @description 现在想起来有多难受 */
                                    intensityNow: number;
                                    /** @description 现在觉得有多严重 */
                                    severityNow: number | null;
                                    /**
                                     * @description 当时担心的事有没有发生。no=没发生；partly=部分发生；yes=发生了；unknown=还不知道
                                     * @enum {string|null}
                                     */
                                    fearCameTrue: "no" | "partly" | "yes" | "unknown" | null;
                                    /** @description 后来实际发生了什么 */
                                    whatHappened: string | null;
                                    /** @description 现在怎么看 */
                                    perspective: string | null;
                                    thinkingTraps: ("spotlight" | "catastrophizing" | "mind_reading" | "fortune_telling" | "overgeneralizing" | "personalizing" | "all_or_nothing" | "should")[];
                                    /**
                                     * @description let_go=放下了；easing=好多了；still_matters=还在意
                                     * @enum {string}
                                     */
                                    resolution: "let_go" | "easing" | "still_matters";
                                    /**
                                     * Format: date
                                     * @description 复盘当天（所有者时区）
                                     */
                                    reflectedOn: string;
                                    daysSinceHappened: number;
                                    lessonIds: string[];
                                    author: {
                                        /**
                                         * @description 谁做的
                                         * @enum {string}
                                         */
                                        kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                        /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                        id: string | null;
                                        /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                        label: string;
                                    };
                                    /**
                                     * Format: date-time
                                     * @description Instant：UTC ISO 8601，精确到毫秒
                                     */
                                    createdAt: string;
                                    /**
                                     * Format: date-time
                                     * @description Instant：UTC ISO 8601，精确到毫秒
                                     */
                                    updatedAt: string;
                                }[];
                                lessons: {
                                    /** Format: uuid */
                                    id: string;
                                    title: string;
                                }[];
                                /** @description 「当时」加上每次复盘的强度，画强度变化小图用 */
                                intensitySeries: {
                                    /**
                                     * Format: date
                                     * @description 这个点的日期
                                     */
                                    on: string;
                                    /** @description 距离 happenedOn 的天数 */
                                    dayOffset: number;
                                    /** @description 0–10 分 */
                                    intensity: number;
                                    /**
                                     * @description capture=当时，reflection=某次复盘
                                     * @enum {string}
                                     */
                                    kind: "capture" | "reflection";
                                    /** Format: uuid */
                                    reflectionId: string | null;
                                }[];
                                /** Format: uri */
                                webUrl: string;
                            };
                            revisions: {
                                /** @description 这份快照对应的修订号；1 是最初的原始记录 */
                                revision: number;
                                snapshot: {
                                    title: string;
                                    /** @description 用户原话，原样保存 */
                                    narrative: string;
                                    /** @description Agent 的概括 */
                                    agentSummary: string | null;
                                    /**
                                     * Format: date-time
                                     * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                                     */
                                    happenedAt: string;
                                    /**
                                     * Format: date
                                     * @description 发生日期（所有者时区），日历和统计按它分组
                                     */
                                    happenedOn: string;
                                    /**
                                     * @description exact=精确时间；day=只知道日期；approx=大概
                                     * @enum {string}
                                     */
                                    happenedAtPrecision: "exact" | "day" | "approx";
                                    /**
                                     * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                                     * @enum {string}
                                     */
                                    scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                                    emotions: {
                                        /**
                                         * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                         * @enum {string}
                                         */
                                        key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                        /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                        intensity: number | null;
                                    }[];
                                    /** @description 当时有多难受，0–10 */
                                    intensity: number;
                                    /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                                    severity: number | null;
                                    /** @description 当时担心会发生什么 */
                                    fearedOutcome: string | null;
                                    /**
                                     * Format: date
                                     * @description 什么时候能知道担心的事有没有发生；第一次回看会排在这天之后
                                     */
                                    outcomeKnownBy: string | null;
                                    /** @description 当时脑子里冒出来的想法 */
                                    thoughts: string | null;
                                    /** @description 身体反应，例如脸红、心跳快 */
                                    bodySignals: string | null;
                                    /** @description 当下是怎么应对的 */
                                    immediateResponse: string | null;
                                    /** @description 涉及的人，只写角色（如「新领导」），不写真名 */
                                    people: string[];
                                };
                                /** @description 从这一版改到下一版时变了哪些字段 */
                                changedFields: string[];
                                editedBy: {
                                    /**
                                     * @description 谁做的
                                     * @enum {string}
                                     */
                                    kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                    /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                    id: string | null;
                                    /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                    label: string;
                                };
                                reason: string | null;
                                /**
                                 * Format: date-time
                                 * @description 改成下一版的时间
                                 */
                                editedAt: string;
                            }[];
                        }[];
                        lessons: {
                            /** Format: uuid */
                            id: string;
                            title: string;
                            /** @description 纯文本 */
                            body: string;
                            /** @description 关联的事件数（不含回收站里的） */
                            momentCount: number;
                            author: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            updatedAt: string;
                            moments: {
                                /** Format: uuid */
                                id: string;
                                title: string;
                                /**
                                 * Format: date-time
                                 * @description 发生时间。precision 为 day/approx 时是所有者时区当天 12:00 对应的 UTC 时刻，只用于排序
                                 */
                                happenedAt: string;
                                /**
                                 * Format: date
                                 * @description 发生日期（所有者时区），日历和统计按它分组
                                 */
                                happenedOn: string;
                                /**
                                 * @description exact=精确时间；day=只知道日期；approx=大概
                                 * @enum {string}
                                 */
                                happenedAtPrecision: "exact" | "day" | "approx";
                                /**
                                 * Format: date-time
                                 * @description 记录时间（服务器时间），也是冻结期和复盘排程的锚点
                                 */
                                capturedAt: string;
                                /**
                                 * @description work=工作；study=学习；social=社交；family=家庭；romance=感情；online=网络；public=公共场合；other=其他
                                 * @enum {string}
                                 */
                                scene: "work" | "study" | "social" | "family" | "romance" | "online" | "public" | "other";
                                emotions: {
                                    /**
                                     * @description embarrassed=尴尬；ashamed=丢脸；anxious=焦虑；afraid=害怕；guilty=内疚；regretful=后悔；angry=生气；aggrieved=委屈；sad=难过；helpless=无力；other=其他
                                     * @enum {string}
                                     */
                                    key: "embarrassed" | "ashamed" | "anxious" | "afraid" | "guilty" | "regretful" | "angry" | "aggrieved" | "sad" | "helpless" | "other";
                                    /** @description 这种情绪单独的强度；没有单独评分时为 null */
                                    intensity: number | null;
                                }[];
                                /** @description 当时有多难受，0–10 */
                                intensity: number;
                                /** @description 当时觉得这件事有多严重，0–10；没评分为 null */
                                severity: number | null;
                                /** @description 最近一次复盘时的强度；没有复盘为 null */
                                latestIntensityNow: number | null;
                                /**
                                 * @description 最近一次复盘的结论。let_go=放下了；easing=好多了；still_matters=还在意
                                 * @enum {string|null}
                                 */
                                latestResolution: "let_go" | "easing" | "still_matters" | null;
                                /**
                                 * @description 由后端推导，前端只展示
                                 * @enum {string}
                                 */
                                status: "fresh" | "cooling" | "due" | "reflected" | "settled" | "archived";
                                /**
                                 * Format: date
                                 * @description 下次该回看的日期；不再提醒时为 null
                                 */
                                nextReviewOn: string | null;
                                tags: string[];
                                noteCount: number;
                                reflectionCount: number;
                                lessonCount: number;
                                /** @description 当时是否写了担心的后果（fearedOutcome 不为空） */
                                hasFear: boolean;
                                source: {
                                    /**
                                     * @description 谁做的
                                     * @enum {string}
                                     */
                                    kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                    /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                    id: string | null;
                                    /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                    label: string;
                                };
                                /** @description 正文开头最多 120 个字 */
                                excerpt: string;
                                /** @description 只在带 q 搜索时出现：命中位置附近的片段 */
                                matchSnippet?: string;
                            }[];
                        }[];
                        tags: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            momentCount: number;
                            /**
                             * Format: date-time
                             * @description Instant：UTC ISO 8601，精确到毫秒
                             */
                            createdAt: string;
                        }[];
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
    listAudit: {
        parameters: {
            query?: {
                /** @description web=网页；mcp=MCP；oauth=OAuth；cli=命令行；system=系统任务 */
                channel?: "web" | "mcp" | "oauth" | "cli" | "system";
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Default Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /** @description 自增编号，也是游标的依据 */
                            id: number;
                            /**
                             * Format: date-time
                             * @description 开始时间
                             */
                            at: string;
                            /**
                             * @description web=网页；mcp=MCP；oauth=OAuth；cli=命令行；system=系统任务
                             * @enum {string}
                             */
                            channel: "web" | "mcp" | "oauth" | "cli" | "system";
                            actor: {
                                /**
                                 * @description 谁做的
                                 * @enum {string}
                                 */
                                kind: "owner" | "agent_key" | "oauth_app" | "system" | "anonymous";
                                /** @description Agent 密钥 ID 或 OAuth 授权 ID；owner、system、anonymous 为 null */
                                id: string | null;
                                /** @description 展示名，例如「Claude Code（MacBook）」「Claude」「我」 */
                                label: string;
                            };
                            /** @description 例如 moment.record、reflection.create、auth.login、agent_key.create */
                            action: string;
                            targetType: string | null;
                            targetId: string | null;
                            /** @enum {string} */
                            status: "running" | "success" | "error";
                            errorCode: string | null;
                        }[];
                        nextCursor: string | null;
                        total: number;
                    };
                };
            };
            /** @description Default Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
            /** @description Default Response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: {
                            /** @description 错误码（SCREAMING_SNAKE_CASE），完整列表见 docs/API.md 的错误码表 */
                            code: string;
                            /** @description 给人看的中文说明，不含堆栈、SQL 或服务器路径 */
                            message: string;
                            /** @description 部分错误附带的结构化信息，例如 currentRevision、editableUntil */
                            details?: {
                                [key: string]: unknown;
                            };
                        };
                        /** @description 与响应头 X-Request-Id 相同，排障时提供 */
                        requestId: string;
                    };
                };
            };
        };
    };
}
