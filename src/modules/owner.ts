import {
  createClerkGate,
  type ClerkGate,
  type HeaderSource,
} from "../lib/clerk-gate/clerk-gate.js";
import type { Config } from "../config.js";
import type { Db, Row } from "../db/index.js";

export type OwnerAccess =
  | { ok: true; user: Row }
  | { ok: false; access: "signed-out" | "reauth-required" | "not-owner" };

/**
 * The one NBD owner, signed in with the shared dkz12345 Clerk account. The
 * Clerk session token (`__session` cookie) is verified with the instance's
 * public key; the owner policy in clerk-gate decides whether the session is
 * fresh enough for NBD (both factors within the last hour).
 */
export class OwnerService {
  private gate: ClerkGate | null;
  constructor(
    private db: Db,
    private config: Config,
  ) {
    this.gate = config.clerk
      ? createClerkGate({
          publishableKey: config.clerk.publishableKey,
          jwtKey: config.clerk.jwtKey,
          authorizedParties: [config.publicOrigin],
        })
      : null;
  }
  async check(headers: HeaderSource): Promise<OwnerAccess> {
    if (!this.gate || !this.config.clerk)
      return { ok: false, access: "signed-out" };
    const result = await this.gate.requireOwner(headers, {
      ownerUserId: this.config.clerk.ownerUserId,
      site: "nbd",
    });
    if (!result.ok)
      return {
        ok: false,
        access:
          result.status === 401
            ? "signed-out"
            : result.reason === "not-owner"
              ? "not-owner"
              : "reauth-required",
      };
    const user = this.db
      .prepare("SELECT * FROM users ORDER BY created_at LIMIT 1")
      .get() as Row | undefined;
    // No owner row yet means the server was never initialised with create-owner.
    return user ? { ok: true, user } : { ok: false, access: "signed-out" };
  }
}
