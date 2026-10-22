import { connectMongo } from "../db";
import { jsonError, getClientIp, rateLimit } from "../http";
import { resolveFirebaseUser } from "../cloudFunctionAuth/resolveFirebaseUser";
import { normalizeAndValidateFirebaseUid } from "../cloudFunctionAuth/validateFirebaseUid";
import { verifyGatewayApiKey } from "../gatewayApiKey/verifyApiKey";
import { setCachedUserGate } from "./userAuthCache";

export const GATEWAY_HEADERS = {
  apiKey: "X-API-Key",
  firebaseUid: "X-Firebase-Uid",
} as const;

export type FirebaseGatewayAuthSuccess = {
  payload: { userId: string; role: string };
  firebaseUid: string;
  subscriptionPlan: "free" | "premium";
  authVia: "gateway";
};

function gatewayEnabled(): boolean {
  const v = process.env.FIREBASE_GATEWAY_AUTH_ENABLED?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off") return false;
  // Default ON when master key configured; off otherwise so local JWT-only still boots.
  return Boolean(process.env.GATEWAY_API_KEY_MASTER_KEY?.trim());
}

export function isFirebaseGatewayAuthEnabled(): boolean {
  return gatewayEnabled();
}

export function hasGatewayAuthHeaders(req: Request): boolean {
  return Boolean(req.headers.get(GATEWAY_HEADERS.apiKey)?.trim() || req.headers.get(GATEWAY_HEADERS.firebaseUid)?.trim());
}

/**
 * Cloud Function → backend auth.
 * Order: API key FIRST, then Firebase UID, then Mongo resolve + status.
 */
export async function requireFirebaseGatewayAuth(
  req: Request
): Promise<{ error: Response } | FirebaseGatewayAuthSuccess> {
  if (!gatewayEnabled()) {
    return { error: jsonError("GATEWAY_DISABLED", "Firebase gateway auth is not enabled", 503) };
  }

  const ip = getClientIp(req) ?? "unknown";
  const apiKey = req.headers.get(GATEWAY_HEADERS.apiKey);
  const uidRaw = req.headers.get(GATEWAY_HEADERS.firebaseUid);

  if (!apiKey?.trim() || !uidRaw?.trim()) {
    if (!(await rateLimit(`gw:miss:${ip}`, 30, 60_000))) {
      return { error: jsonError("RATE_LIMIT", "Too many requests", 429) };
    }
    return { error: jsonError("UNAUTHORIZED", "Missing gateway authentication", 401) };
  }

  const keyResult = await verifyGatewayApiKey(apiKey);
  if (!keyResult.ok) {
    if (!(await rateLimit(`gw:fail:${ip}`, 20, 60_000))) {
      return { error: jsonError("RATE_LIMIT", "Too many requests", 429) };
    }
    if (keyResult.reason === "NOT_CONFIGURED") {
      return { error: jsonError("GATEWAY_NOT_CONFIGURED", "Gateway API key system not configured", 503) };
    }
    return { error: jsonError("UNAUTHORIZED", "Invalid API key", 401) };
  }

  // ONLY after API key succeeds — trust UID structure, then resolve.
  const firebaseUid = normalizeAndValidateFirebaseUid(uidRaw);
  if (!firebaseUid) {
    return { error: jsonError("UNAUTHORIZED", "Invalid Firebase UID", 401) };
  }

  await connectMongo();
  const user = await resolveFirebaseUser(firebaseUid);
  if (user.status === "disabled") {
    return { error: jsonError("FORBIDDEN", "Account disabled", 403) };
  }

  const userId = String(user._id);
  const role = user.role === "admin" ? "admin" : "user";
  const subscriptionPlan = (user.subscriptionPlan as "free" | "premium" | undefined) ?? "free";
  setCachedUserGate(userId, role, user.status, user.email ?? null);

  return {
    payload: { userId, role },
    firebaseUid,
    subscriptionPlan,
    authVia: "gateway",
  };
}
