import { requireAuth } from "@/lib/server/auth/requireAuth";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";
import { revokeGatewayApiKey } from "@/lib/server/gatewayApiKey/service";

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const ip = getClientIp(req) ?? "unknown";
  if (!(await rateLimit(`admin:gwkey:revoke:${auth.payload!.userId}`, 5, 60_000))) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  let body: { key_id?: string; confirm_revoke_active?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  if (!body.key_id?.trim()) {
    return jsonError("VALIDATION", "key_id required", 422);
  }

  try {
    const result = await revokeGatewayApiKey({
      adminUserId: auth.payload!.userId,
      keyId: body.key_id.trim(),
      confirmNoActive: Boolean(body.confirm_revoke_active),
      ip,
    });
    return jsonOk({
      revoked_key_id: result.revokedKeyId,
      warning: "Cloud Function traffic using this key will fail immediately.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "KEY_NOT_FOUND") return jsonError("NOT_FOUND", "Key not found", 404);
    if (msg === "ALREADY_REVOKED") return jsonError("CONFLICT", "Key already revoked", 409);
    if (msg === "CONFIRM_REVOKE_ACTIVE_REQUIRED") {
      return jsonError(
        "CONFIRM_REQUIRED",
        "Revoking the active key leaves no valid key. Pass confirm_revoke_active=true to proceed.",
        409
      );
    }
    throw e;
  }
}
