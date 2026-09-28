import { connectMongo } from "@/lib/server/db";
import { issueSession } from "@/lib/server/auth/tokens";
import { verifyPassword } from "@/lib/server/auth/password";
import { User } from "@/lib/server/models/User";
import { ensureAdminFromEnv } from "@/lib/server/admin/ensureAdmin";
import { getServerEnv } from "@/lib/server/env";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

/** Dashboard admin sign-in only (role=admin, password verified from Mongo bcrypt). */
export async function POST(req: Request) {
  try {
    getServerEnv();
  } catch {
    return jsonError("SERVER_CONFIG", "Server environment not configured", 503);
  }

  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`auth:admin:${ip}`, 10)) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  const body = (await req.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) return jsonError("VALIDATION", "email and password required", 422);

  await ensureAdminFromEnv();
  await connectMongo();

  const user = await User.findOne({ email: body.email.toLowerCase() }).select("+passwordHash");
  if (!user || user.role !== "admin") {
    return jsonError("UNAUTHORIZED", "Invalid admin credentials", 401);
  }

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) return jsonError("UNAUTHORIZED", "Invalid admin credentials", 401);

  if (user.status === "disabled") return jsonError("FORBIDDEN", "Account disabled", 403);

  user.lastLoginAt = new Date();
  await user.save();

  const session = await issueSession({
    userId: user._id,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ip,
    label: "admin-dashboard",
  });

  const res = jsonOk({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires_at: session.expiresAt.toISOString(),
    user: { id: String(user._id), email: user.email, role: user.role },
  });

  res.cookies.set("refresh_token", session.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    expires: session.expiresAt,
  });

  return res;
}
