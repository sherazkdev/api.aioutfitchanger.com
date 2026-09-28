import { connectMongo } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/auth/password";
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
  const email = body.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) return jsonError("CONFLICT", "Email already registered", 409);

  const user = await User.create({
    email,
    displayName: body.display_name?.trim() || email.split("@")[0],
    role: "user",
    passwordHash: await hashPassword(body.password),
  });

  const session = await issueSession({
    userId: user._id,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ip,
    label: "email-register",
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
