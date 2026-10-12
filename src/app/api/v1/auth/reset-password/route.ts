import { connectMongo } from "@/lib/server/db";
import { applyNewPassword } from "@/lib/server/auth/applyPasswordReset";
import { hashResetLinkToken } from "@/lib/server/auth/passwordResetSecrets";
import { User } from "@/lib/server/models/User";
import { PasswordResetToken } from "@/lib/server/models/PasswordResetToken";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`auth:reset:${ip}`, 10)) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  const body = (await req.json()) as { token?: string; password?: string };
  if (!body.token || !body.password) {
    return jsonError("VALIDATION", "token and password required", 422);
  }
  if (body.password.length < 8) {
    return jsonError("VALIDATION", "password must be at least 8 characters", 422);
  }

  await connectMongo();
  const doc = await PasswordResetToken.findOne({ tokenHash: hashResetLinkToken(body.token) });
  if (!doc || doc.usedAt || doc.expiresAt.getTime() < Date.now()) {
    return jsonError("INVALID_TOKEN", "Reset link is invalid or expired", 400);
  }
  if (doc.purpose === "email_verify") {
    return jsonError(
      "INVALID_TOKEN",
      "This link verifies your email only. Open the verify link from your welcome email or use forgot-password for a reset link.",
      400
    );
  }

  const user = await User.findById(doc.userId).select("+passwordHash");
  if (!user) return jsonError("INVALID_TOKEN", "Reset link is invalid or expired", 400);

  await applyNewPassword(user._id, body.password);

  doc.usedAt = new Date();
  await doc.save();

  return jsonOk({ password_updated: true });
}
