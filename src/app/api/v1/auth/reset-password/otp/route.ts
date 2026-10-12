import { connectMongo } from "@/lib/server/db";
import { applyNewPassword } from "@/lib/server/auth/applyPasswordReset";
import {
  normalizeOtpInput,
  otpMaxAttempts,
  PASSWORD_RESET_OTP_LENGTH,
} from "@/lib/server/auth/passwordResetOtp";
import { verifyPasswordResetOtpHash } from "@/lib/server/auth/passwordResetSecrets";
import { User } from "@/lib/server/models/User";
import { PasswordResetOtp } from "@/lib/server/models/PasswordResetOtp";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`auth:reset-otp:${ip}`, 15)) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  const body = (await req.json()) as { email?: string; otp?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const otp = body.otp != null ? normalizeOtpInput(String(body.otp)) : null;

  if (!email || !otp || !body.password) {
    return jsonError("VALIDATION", "email, otp, and password required", 422);
  }
  if (body.password.length < 8) {
    return jsonError("VALIDATION", "password must be at least 8 characters", 422);
  }

  await connectMongo();
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !user.passwordHash) {
    return jsonError("INVALID_OTP", "Verification code is invalid or expired", 400);
  }

  const doc = await PasswordResetOtp.findOne({
    userId: user._id,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!doc) {
    return jsonError("INVALID_OTP", "Verification code is invalid or expired", 400);
  }

  const maxAttempts = otpMaxAttempts();
  if (doc.failedAttempts >= maxAttempts) {
    doc.usedAt = new Date();
    await doc.save();
    return jsonError("OTP_LOCKED", "Too many failed attempts. Request a new code.", 400);
  }

  const userId = String(user._id);
  const valid = verifyPasswordResetOtpHash(userId, otp, doc.otpHash);

  if (!valid) {
    doc.failedAttempts += 1;
    if (doc.failedAttempts >= maxAttempts) {
      doc.usedAt = new Date();
    }
    await doc.save();
    const remaining = Math.max(0, maxAttempts - doc.failedAttempts);
    if (remaining === 0) {
      return jsonError("OTP_LOCKED", "Too many failed attempts. Request a new code.", 400);
    }
    return jsonError(
      "INVALID_OTP",
      `Verification code is incorrect. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      400
    );
  }

  await applyNewPassword(user._id, body.password);

  doc.usedAt = new Date();
  await doc.save();

  await PasswordResetOtp.updateMany(
    { userId: user._id, usedAt: null, _id: { $ne: doc._id } },
    { usedAt: new Date() }
  );

  return jsonOk({
    password_updated: true,
    otp_length: PASSWORD_RESET_OTP_LENGTH,
  });
}
