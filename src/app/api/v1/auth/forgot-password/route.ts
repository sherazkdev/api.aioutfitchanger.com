import { connectMongo } from "@/lib/server/db";
import { FORGOT_PASSWORD_GENERIC_MESSAGE } from "@/lib/server/auth/forgotPasswordMessages";
import { normalizeEmail } from "@/lib/server/auth/normalizeEmail";
import {
  issuePasswordResetChallenge,
  notifyGoogleOnlyAccount,
} from "@/lib/server/auth/passwordResetChallenge";
import { User } from "@/lib/server/models/User";
import { requireCaptchaIfEnabled } from "@/lib/server/security/authGuards";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

/** Web + mobile: always generic success (no "account not found"). Email includes OTP + link. */
export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "unknown";
  if (!(await rateLimit(`auth:forgot:${ip}`, 8))) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  const body = (await req.json()) as {
    email?: string;
    captcha_token?: string;
    turnstile_token?: string;
  };
  const captchaErr = await requireCaptchaIfEnabled(req, body);
  if (captchaErr) return captchaErr;

  const email = body.email ? normalizeEmail(body.email) : "";
  if (!email) return jsonError("VALIDATION", "email required", 422);

  await connectMongo();
  const user = await User.findOne({ email }).select("+passwordHash googleId");

  const payload: Record<string, string | number | boolean> = {
    message: FORGOT_PASSWORD_GENERIC_MESSAGE,
  };

  if (!user) {
    return jsonOk(payload);
  }

  if (!user.passwordHash) {
    if (user.googleId) {
      await notifyGoogleOnlyAccount(email);
    }
    return jsonOk(payload);
  }

  const challenge = await issuePasswordResetChallenge({
    userId: user._id,
    email,
    kind: "password_reset",
  });

  payload.email_dispatched = challenge.emailSent;
  if (!challenge.emailSent && challenge.sendError && !challenge.sendError.ok) {
    console.error("[auth] forgot-password bundle not delivered", {
      emailDomain: email.split("@")[1],
      reason: challenge.sendError.error,
      detail: challenge.sendError.detail,
    });
  }
  if (challenge.devActionUrl) payload.dev_reset_url = challenge.devActionUrl;
  if (challenge.devOtp) payload.dev_otp = challenge.devOtp;

  return jsonOk(payload);
}
