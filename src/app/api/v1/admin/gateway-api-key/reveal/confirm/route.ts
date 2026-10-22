import { requireAuth } from "@/lib/server/auth/requireAuth";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";
import { confirmGatewayKeyReveal } from "@/lib/server/gatewayApiKey/revealOtp";

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const ip = getClientIp(req) ?? "unknown";
  const adminId = auth.payload!.userId;
  if (!(await rateLimit(`admin:gwkey:reveal:confirm:${adminId}`, 10, 60_000))) {
    return jsonError("RATE_LIMIT", "Too many attempts", 429);
  }
  if (!(await rateLimit(`admin:gwkey:reveal:confirm:ip:${ip}`, 20, 60_000))) {
    return jsonError("RATE_LIMIT", "Too many attempts", 429);
  }

  let body: { challenge_id?: string; otp?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  if (!body.challenge_id?.trim() || !body.otp?.trim()) {
    return jsonError("VALIDATION", "challenge_id and otp required", 422);
  }

  try {
    const result = await confirmGatewayKeyReveal({
      adminUserId: adminId,
      challengeId: body.challenge_id.trim(),
      otp: body.otp,
      ip,
    });
    return jsonOk({
      api_key: result.plaintext,
      key_id: result.keyId,
      warning: "Copy this key now. Do not store it in the browser. Update Cloud Function secrets only.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "INVALID_OTP") return jsonError("INVALID_OTP", "Incorrect OTP", 401);
    if (msg === "CHALLENGE_NOT_FOUND") return jsonError("NOT_FOUND", "Challenge not found", 404);
    if (msg === "CHALLENGE_FORBIDDEN") return jsonError("FORBIDDEN", "Challenge not owned by this admin", 403);
    if (msg === "CHALLENGE_USED") return jsonError("CONFLICT", "Challenge already used", 409);
    if (msg === "CHALLENGE_EXPIRED") return jsonError("EXPIRED", "Challenge expired", 410);
    if (msg === "ATTEMPTS_EXCEEDED") return jsonError("LOCKED", "Too many failed attempts", 429);
    if (msg === "NO_ACTIVE_KEY") return jsonError("NOT_FOUND", "No active gateway API key", 404);
    throw e;
  }
}
