import { createHash } from "crypto";
import { connectMongo } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/auth/password";
import { revokeAllUserSessions } from "@/lib/server/auth/tokens";
import { User } from "@/lib/server/models/User";
import { PasswordResetToken } from "@/lib/server/models/PasswordResetToken";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

function hashResetToken(raw: string) {
  return createHash("sha256").update(raw).digest("base64url");
}

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
  const doc = await PasswordResetToken.findOne({ tokenHash: hashResetToken(body.token) });
  if (!doc || doc.usedAt || doc.expiresAt.getTime() < Date.now()) {
    return jsonError("INVALID_TOKEN", "Reset link is invalid or expired", 400);
  }

  const user = await User.findById(doc.userId).select("+passwordHash");
  if (!user) return jsonError("INVALID_TOKEN", "Reset link is invalid or expired", 400);

  user.passwordHash = await hashPassword(body.password);
  await user.save();

  doc.usedAt = new Date();
  await doc.save();

  await revokeAllUserSessions(user._id);

  return jsonOk({ password_updated: true });
}
