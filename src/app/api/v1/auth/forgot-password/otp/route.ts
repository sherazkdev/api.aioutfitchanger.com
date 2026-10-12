import { sendPasswordResetOtpEmail } from "@/lib/server/emails/email.service";
import { connectMongo } from "@/lib/server/db";
import {
  buildOtpHash,
  generatePasswordResetOtp,
  otpExpiresAt,
  otpTtlMinutes,
  PASSWORD_RESET_OTP_LENGTH,
} from "@/lib/server/auth/passwordResetOtp";
import { User } from "@/lib/server/models/User";
import { PasswordResetOtp } from "@/lib/server/models/PasswordResetOtp";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

const GENERIC_MESSAGE =
  "If an account exists for this email, a verification code has been sent.";

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`auth:forgot-otp:${ip}`, 8)) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  const body = (await req.json()) as { email?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email) return jsonError("VALIDATION", "email required", 422);

  if (!rateLimit(`auth:forgot-otp:email:${email}`, 4)) {
    return jsonError("RATE_LIMIT", "Too many requests for this email", 429);
  }

  await connectMongo();
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !user.passwordHash) {
    return jsonOk({
      message: GENERIC_MESSAGE,
      otp_length: PASSWORD_RESET_OTP_LENGTH,
      expires_in_seconds: otpTtlMinutes() * 60,
    });
  }

  const otp = generatePasswordResetOtp();
  const expiresAt = otpExpiresAt();

  await PasswordResetOtp.updateMany({ userId: user._id, usedAt: null }, { usedAt: new Date() });

  await PasswordResetOtp.create({
    userId: user._id,
    otpHash: buildOtpHash(String(user._id), otp),
    expiresAt,
  });

  const ttlMin = otpTtlMinutes();
  const sent = await sendPasswordResetOtpEmail({
    to: email,
    otp,
    expiresInMinutes: ttlMin,
  });

  if (!sent.ok) {
    console.error("[auth] forgot-password OTP email not delivered", {
      reason: sent.error,
      detail: sent.detail ?? null,
      userId: String(user._id),
    });
  }

  const payload: Record<string, string | number> = {
    message: GENERIC_MESSAGE,
    otp_length: PASSWORD_RESET_OTP_LENGTH,
    expires_in_seconds: ttlMin * 60,
  };
  if (process.env.NODE_ENV !== "production") {
    payload.dev_otp = otp;
  }

  return jsonOk(payload);
}
