import { connectMongo } from "@/lib/server/db";
import { rotateRefreshToken } from "@/lib/server/auth/tokens";
import { getServerEnv } from "@/lib/server/env";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

export async function POST(req: Request) {
  try {
    getServerEnv();
  } catch {
    return jsonError("SERVER_CONFIG", "Server environment not configured", 503);
  }

  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`auth:refresh:${ip}`, 40)) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  const cookie = req.headers.get("cookie") ?? "";
  const cookieMatch = cookie.match(/refresh_token=([^;]+)/);
  const body = (await req.json().catch(() => ({}))) as { refresh_token?: string };
  const raw = body.refresh_token ?? cookieMatch?.[1];
  if (!raw) return jsonError("VALIDATION", "refresh_token required", 422);

  await connectMongo();

  try {
    const session = await rotateRefreshToken({
      rawRefresh: decodeURIComponent(raw),
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip,
    });

    const res = jsonOk({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      expires_at: session.expiresAt.toISOString(),
      token_type: "Bearer",
    });

    res.cookies.set("refresh_token", session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      expires: session.expiresAt,
    });

    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "REFRESH_FAILED";
    if (msg === "REFRESH_EXPIRED" || msg === "INVALID_REFRESH") {
      return jsonError("UNAUTHORIZED", "Session expired — sign in again", 401);
    }
    return jsonError("UNAUTHORIZED", "Could not refresh session", 401);
  }
}
