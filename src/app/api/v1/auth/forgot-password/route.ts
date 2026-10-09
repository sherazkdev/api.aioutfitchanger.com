import { createHash, randomBytes } from "crypto";
import {
  buildPasswordResetUrl,
  formatResetTokenExpiresIn,
  sendPasswordResetEmail,
} from "@/lib/server/emails/email.service";
import { connectMongo } from "@/lib/server/db";
import { User } from "@/lib/server/models/User";
import { PasswordResetToken } from "@/lib/server/models/PasswordResetToken";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

function hashResetToken(raw: string) {
  return createHash("sha256").update(raw).digest("base64url");
}

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`auth:forgot:${ip}`, 8)) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  const body = (await req.json()) as { email?: string };
  if (!body.email) return jsonError("VALIDATION", "email required", 422);

  const generic = {
    message: "If an account exists for this email, a reset link has been sent.",
  };

  await connectMongo();
  const user = await User.findOne({ email: body.email.toLowerCase() }).select("+passwordHash");
  if (!user || !user.passwordHash) {
    return jsonOk(generic);
  }

  const raw = randomBytes(32).toString("base64url");
  const ttlHours = Number(process.env.RESET_TOKEN_TTL_HOURS ?? 1);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  await PasswordResetToken.updateMany({ userId: user._id, usedAt: null }, { usedAt: new Date() });

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash: hashResetToken(raw),
    expiresAt,
  });

  const resetUrl = buildPasswordResetUrl(raw);
  const expiresIn = formatResetTokenExpiresIn(ttlHours);

  await sendPasswordResetEmail({
    to: body.email.toLowerCase(),
    resetUrl,
    expiresIn,
  });

  const payload: Record<string, string> = { ...generic };
  if (process.env.NODE_ENV !== "production") {
    payload.dev_reset_url = resetUrl;
  }

  return jsonOk(payload);
}
