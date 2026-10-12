import { connectMongo } from "@/lib/server/db";
import { applyNewPassword } from "@/lib/server/auth/applyPasswordReset";
import { resolvePasswordResetLink } from "@/lib/server/auth/resolvePasswordResetLink";
import { User } from "@/lib/server/models/User";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "unknown";
  if (!(await rateLimit(`auth:reset:${ip}`, 10))) {
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
  const resolved = await resolvePasswordResetLink(body.token);
  if (!resolved.ok) {
    return jsonError(resolved.code, resolved.message, 400);
  }

  const user = await User.findById(resolved.doc.userId).select("+passwordHash");
  if (!user) {
    return jsonError("INVALID_TOKEN", "Reset link is invalid. Request a new password reset.", 400);
  }

  await applyNewPassword(user._id, body.password);

  return jsonOk({ password_updated: true });
}
