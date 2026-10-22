import {
  verifyCloudFunctionRequest,
  type CloudFunctionAuthFailureReason,
} from "@/lib/server/cloudFunctionAuth";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";

function statusForReason(reason: CloudFunctionAuthFailureReason): number {
  if (reason === "INTERNAL_AUTH_NOT_CONFIGURED") return 503;
  return 401;
}

function messageForReason(reason: CloudFunctionAuthFailureReason): string {
  switch (reason) {
    case "INTERNAL_AUTH_NOT_CONFIGURED":
      return "Cloud Function auth is not configured on this server";
    case "MISSING_INTERNAL_AUTH":
      return "Missing internal authentication headers";
    case "INVALID_INTERNAL_API_KEY":
      return "Invalid internal API key";
    case "INVALID_FIREBASE_UID":
      return "Invalid Firebase UID";
    case "INVALID_TIMESTAMP":
      return "Invalid timestamp";
    case "EXPIRED_TIMESTAMP":
      return "Timestamp outside allowed skew";
    case "INVALID_SIGNATURE":
      return "Invalid request signature";
    default:
      return "Unauthorized";
  }
}

/**
 * Phase 2A internal ping — Cloud Function HMAC verification only.
 *
 * Intentionally does NOT call resolveFirebaseUser / create Mongo users.
 * (Anonymous Firebase + App Check OFF would otherwise allow user-table farming.)
 *
 * Temporary validation endpoint — not a permanent production mobile API.
 * Does not call BFL/BytePlus/history/billing.
 */
export async function POST(req: Request) {
  return handleApiRoute(async () => {
    const ip = getClientIp(req) ?? "unknown";
    if (!(await rateLimit(`cf:ping:${ip}`, 60, 60_000))) {
      return jsonError("RATE_LIMIT", "Too many requests", 429);
    }

    const rawBody = await req.text();
    const verified = await verifyCloudFunctionRequest(req, { rawBody });
    if (!verified.ok) {
      return jsonError(verified.reason, messageForReason(verified.reason), statusForReason(verified.reason));
    }

    return jsonOk({
      ok: true,
      auth_ok: true,
    });
  });
}
