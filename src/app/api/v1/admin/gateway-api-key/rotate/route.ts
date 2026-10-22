import { requireAuth } from "@/lib/server/auth/requireAuth";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";
import { rotateGatewayApiKey, serializeGatewayKeyStatus } from "@/lib/server/gatewayApiKey/service";
import { GatewayApiKey } from "@/lib/server/models/GatewayApiKey";
import { connectMongo } from "@/lib/server/db";

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const ip = getClientIp(req) ?? "unknown";
  if (!(await rateLimit(`admin:gwkey:rotate:${auth.payload!.userId}`, 5, 60_000))) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  try {
    const rotated = await rotateGatewayApiKey({
      adminUserId: auth.payload!.userId,
      ip,
    });
    await connectMongo();
    const doc = await GatewayApiKey.findOne({ keyId: rotated.keyId }).lean();
    return jsonOk({
      api_key: rotated.plaintext,
      key: doc ? serializeGatewayKeyStatus(doc) : { key_id: rotated.keyId },
      grace_expires_at: rotated.graceExpiresAt?.toISOString() ?? null,
      warning:
        "Update the Firebase Cloud Function secret with the new key before the grace period expires.",
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NO_ACTIVE_KEY") {
      return jsonError("NOT_FOUND", "No active gateway API key to rotate", 404);
    }
    if (e instanceof Error && e.message === "GATEWAY_API_KEY_MASTER_KEY_MISSING") {
      return jsonError("SERVER_CONFIG", "GATEWAY_API_KEY_MASTER_KEY not configured", 503);
    }
    throw e;
  }
}
