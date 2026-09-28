import { connectMongo } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/auth/password";
import { issueSession } from "@/lib/server/auth/tokens";
import { User } from "@/lib/server/models/User";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

/** App email sign-in (role=user). Admins should use POST /auth/admin/login for dashboard. */
export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`auth:login:${ip}`, 20)) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  const body = (await req.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return jsonError("VALIDATION", "email and password required", 422);
  }

  await connectMongo();
  const user = await User.findOne({ email: body.email.toLowerCase() }).select("+passwordHash");
  if (!user || user.role === "admin") {
    return jsonError("UNAUTHORIZED", "Invalid email or password", 401);
  }
  if (user.status === "disabled") return jsonError("FORBIDDEN", "Account disabled", 403);

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) return jsonError("UNAUTHORIZED", "Invalid email or password", 401);

  user.lastLoginAt = new Date();
  await user.save();

  const session = await issueSession({
    userId: user._id,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ip,
    label: "email-login",
  });

  return jsonOk({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires_at: session.expiresAt.toISOString(),
    user: {
      id: String(user._id),
      email: user.email,
      display_name: user.displayName,
      role: user.role,
    },
  });
}
