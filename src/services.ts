import type { Db } from "./db/index.js";
import type { Config } from "./config.js";
import { AuthService } from "./modules/auth.js";
import { MomentService } from "./modules/moments.js";
import { LibraryService } from "./modules/library.js";
import { InsightService } from "./modules/insights.js";
import { AccessService } from "./modules/access.js";
import { DataService } from "./modules/data.js";
import { AuditService } from "./modules/audit.js";
import { IdempotencyService } from "./modules/idempotency.js";
import { OAuthService } from "./oauth/service.js";
export function createServices(db: Db, config: Config, fetcher?: typeof fetch) {
  const auth = new AuthService(db, config),
    moments = new MomentService(db, config),
    library = new LibraryService(db, config, moments),
    insights = new InsightService(db, moments),
    access = new AccessService(db, config),
    data = new DataService(db, config, moments, library),
    audit = new AuditService(db, config),
    idempotency = new IdempotencyService(db, config),
    oauth = new OAuthService(db, config, auth, access, audit, fetcher);
  return {
    db,
    config,
    auth,
    moments,
    library,
    insights,
    access,
    data,
    audit,
    idempotency,
    oauth,
  };
}
export type Services = ReturnType<typeof createServices>;
