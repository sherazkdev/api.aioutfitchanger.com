import { connectMongo } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/auth/password";
import { REGISTER_VERIFICATION_MESSAGE } from "@/lib/server/auth/forgotPasswordMessages";
import { normalizeEmail } from "@/lib/server/auth/normalizeEmail";
import { issuePasswordResetChallenge } from "@/lib/server/auth/passwordResetChallenge";
import { issueSession } from "@/lib/server/auth/tokens";
import { User } from "@/lib/server/models/User";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

/** Mobile / app email sign-up (role=user). Not for admin dashboard. */
export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`auth:register:${ip}`, 15)) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  const body = (await req.json()) as {
    email?: string;
    password?: string;
    display_name?: string;
  };

  if (!body.email || !body.password) {
    return jsonError("VALIDATION", "email and password required", 422);
  }
  if (body.password.length < 8) {
    return jsonError("VALIDATION", "password must be at least 8 characters", 422);
  }

  await connectMongo();
  const email = normalizeEmail(body.email);
  const existing = await User.findOne({ email });
  if (existing) return jsonError("CONFLICT", "Email already registered", 409);

  const user = await User.create({
    email,
    displayName: body.display_name?.trim() || email.split("@")[0],
    role: "user",
    emailVerified: false,
    passwordHash: await hashPassword(body.password),
  });

  const verification = await issuePasswordResetChallenge({
    userId: user._id,
    email,
    kind: "welcome_verify",
  });
  if (!verification.emailSent && verification.sendError && !verification.sendError.ok) {
    console.error("[auth] register verification email not delivered", {
      emailDomain: email.split("@")[1],
      reason: verification.sendError.error,
      detail: verification.sendError.detail,
    });
  }

  const session = await issueSession({
    userId: user._id,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ip,
    label: "email-register",
  });

  const data: Record<string, unknown> = {
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires_at: session.expiresAt.toISOString(),
    verification_message: REGISTER_VERIFICATION_MESSAGE,
    verification_email_sent: verification.emailSent,
    otp_length: verification.otpLength,
    expires_in_seconds: verification.expiresInSeconds,
    user: {
      id: String(user._id),
      email: user.email,
      display_name: user.displayName,
      role: user.role,
      email_verified: user.emailVerified,
    },
  };
  if (verification.devOtp) data.dev_otp = verification.devOtp;
  if (verification.devActionUrl) data.dev_verify_url = verification.devActionUrl;

  return jsonOk(data);
}
