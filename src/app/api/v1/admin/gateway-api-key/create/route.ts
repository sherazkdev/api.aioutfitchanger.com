import { requireAuth } from "@/lib/server/auth/requireAuth";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";
import { createGatewayApiKey, serializeGatewayKeyStatus } from "@/lib/server/gatewayApiKey/service";
import { GatewayApiKey } from "@/lib/server/models/GatewayApiKey";
import { connectMongo } from "@/lib/server/db";

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const ip = getClientIp(req) ?? "unknown";
  if (!(await rateLimit(`admin:gwkey:create:${auth.payload!.userId}`, 5, 60_000))) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }
  if (!(await rateLimit(`admin:gwkey:create:ip:${ip}`, 10, 60_000))) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  try {
    const created = await createGatewayApiKey({
      adminUserId: auth.payload!.userId,
      ip,
    });
    await connectMongo();
    const doc = await GatewayApiKey.findOne({ keyId: created.keyId }).lean();
    return jsonOk({
      api_key: created.plaintext,
      key: doc ? serializeGatewayKeyStatus(doc) : { key_id: created.keyId },
      warning: "Copy this key now. It will not be shown again without email OTP reveal. Store it only in Cloud Function secret storage — never in Flutter.",
    });
  } catch (e) {
    if (e instanceof Error && e.message === "ACTIVE_KEY_EXISTS") {
      return jsonError("CONFLICT", "An active gateway API key already exists. Use rotate instead.", 409);
    }
    if (e instanceof Error && e.message === "GATEWAY_API_KEY_MASTER_KEY_MISSING") {
      return jsonError("SERVER_CONFIG", "GATEWAY_API_KEY_MASTER_KEY not configured", 503);
    }
    throw e;
  }
}
