import { jsonError } from "../http";
import { requireAuth } from "./requireAuth";
import {
  hasGatewayAuthHeaders,
  requireFirebaseGatewayAuth,
} from "./requireFirebaseGatewayAuth";

type MobileAuthError = { error: Response; payload?: undefined };
type MobileAuthOk = {
  error?: undefined;
  payload: { userId: string; role: string };
  admin?: { email: string | null; role: string };
  firebaseUid?: string;
  subscriptionPlan?: "free" | "premium";
  authVia: "gateway" | "jwt";
};

export type MobileAuthResult = MobileAuthError | MobileAuthOk;

/**
 * Dual auth for mobile business routes during migration:
 * 1) Valid X-API-Key + X-Firebase-Uid gateway path
 * 2) Else legacy Bearer JWT via requireAuth
 *
 * Invalid API key never falls through to trusting UID alone.
 */
export async function requireMobileUser(
  req: Request,
  roles: ("user" | "admin")[] = ["user", "admin"]
): Promise<MobileAuthResult> {
  const hasGw = hasGatewayAuthHeaders(req);

  if (hasGw) {
    const gw = await requireFirebaseGatewayAuth(req);
    if ("error" in gw) return { error: gw.error };
    const role = gw.payload.role as "admin" | "user";
    if (!roles.includes(role)) {
      return { error: jsonError("FORBIDDEN", "Insufficient role", 403) };
    }
    return {
      error: undefined,
      payload: gw.payload,
      firebaseUid: gw.firebaseUid,
      subscriptionPlan: gw.subscriptionPlan,
      authVia: "gateway",
    };
  }

  const jwt = await requireAuth(req, roles);
  if ("error" in jwt && jwt.error) return { error: jwt.error };
  return {
    error: undefined,
    payload: jwt.payload!,
    admin: jwt.admin,
    authVia: "jwt",
  };
}
