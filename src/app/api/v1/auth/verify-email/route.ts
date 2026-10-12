import { connectMongo } from "@/lib/server/db";
import { verifyEmailWithLinkToken } from "@/lib/server/auth/verifyEmailToken";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

/**
 * Confirm email from web link or mobile app (after user taps email link).
 * Body: { "token": "<from verify-email?token=…>" }
 */
export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`auth:verify-email-link:${ip}`, 20)) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  const token = body.token?.trim();
  if (!token) return jsonError("VALIDATION", "token required", 422);

  await connectMongo();
  const result = await verifyEmailWithLinkToken(token);

  if (!result.ok) {
    if (result.code === "WRONG_PURPOSE") {
      return jsonError(
        "INVALID_TOKEN",
        "This link is for password reset. Use the reset-password page or request a new verification email.",
        400
      );
    }
    return jsonError("INVALID_TOKEN", "Verification link is invalid or expired", 400);
  }

  return jsonOk({
    email_verified: true,
    already_verified: result.alreadyVerified,
    user_id: result.userId,
    next_step: "return_to_app",
  });
}
