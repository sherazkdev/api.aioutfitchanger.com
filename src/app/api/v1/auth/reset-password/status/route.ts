import { connectMongo } from "@/lib/server/db";
import { resolvePasswordResetLink } from "@/lib/server/auth/resolvePasswordResetLink";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

/** Check reset link before showing the form (expired / already used). */
export async function GET(req: Request) {
  const ip = getClientIp(req) ?? "unknown";
  if (!(await rateLimit(`auth:reset-status:${ip}`, 30))) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) return jsonError("VALIDATION", "token query parameter required", 422);

  await connectMongo();
  const resolved = await resolvePasswordResetLink(token);
  if (!resolved.ok) {
    return jsonError(resolved.code, resolved.message, 400);
  }

  return jsonOk({
    valid: true,
    expires_at: resolved.doc.expiresAt.toISOString(),
  });
}
