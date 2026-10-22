import { requireAuth } from "@/lib/server/auth/requireAuth";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";
import { loadAdminEmail, requestGatewayKeyReveal } from "@/lib/server/gatewayApiKey/revealOtp";

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const ip = getClientIp(req) ?? "unknown";
  const adminId = auth.payload!.userId;
  if (!(await rateLimit(`admin:gwkey:reveal:req:${adminId}`, 5, 60_000))) {
    return jsonError("RATE_LIMIT", "Too many reveal requests", 429);
  }
  if (!(await rateLimit(`admin:gwkey:reveal:req:ip:${ip}`, 10, 60_000))) {
    return jsonError("RATE_LIMIT", "Too many reveal requests", 429);
  }

  try {
    const email = auth.admin?.email ?? (await loadAdminEmail(adminId));
    const result = await requestGatewayKeyReveal({
      adminUserId: adminId,
      adminEmail: email,
      ip,
    });
    return jsonOk({
      challenge_id: result.challengeId,
      expires_at: result.expiresAt,
      message: "If email is configured, a one-time code was sent to the admin email.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "ADMIN_EMAIL_REQUIRED") {
      return jsonError("VALIDATION", "Admin account has no email for OTP delivery", 422);
    }
    if (msg === "NO_ACTIVE_KEY") return jsonError("NOT_FOUND", "No active gateway API key", 404);
    if (msg === "EMAIL_SEND_FAILED") {
      return jsonError("EMAIL_FAILED", "Could not send OTP email", 502);
    }
    if (msg === "GATEWAY_API_KEY_MASTER_KEY_MISSING" || msg === "OTP_PEPPER_MISSING") {
      return jsonError("SERVER_CONFIG", "Server not configured for key reveal", 503);
    }
    throw e;
  }
}
