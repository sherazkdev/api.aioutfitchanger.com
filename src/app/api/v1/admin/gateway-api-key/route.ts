import { requireAuth, auditActor } from "@/lib/server/auth/requireAuth";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";
import { getGatewayKeyOverview } from "@/lib/server/gatewayApiKey/service";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const ip = getClientIp(req) ?? "unknown";
  if (!(await rateLimit(`admin:gwkey:get:${auth.payload!.userId}:${ip}`, 60, 60_000))) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  try {
    const overview = await getGatewayKeyOverview();
    return jsonOk({
      ...overview,
      actor: auditActor(auth).userId,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "GATEWAY_API_KEY_MASTER_KEY_MISSING") {
      return jsonError("SERVER_CONFIG", "GATEWAY_API_KEY_MASTER_KEY not configured", 503);
    }
    throw e;
  }
}
