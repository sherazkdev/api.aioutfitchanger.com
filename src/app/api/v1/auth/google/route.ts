import { connectMongo } from "@/lib/server/db";
import { verifyGoogleIdToken } from "@/lib/server/auth/google";
import { issueSession } from "@/lib/server/auth/tokens";
import { User } from "@/lib/server/models/User";
import { getServerEnv } from "@/lib/server/env";
import { getClientIp, jsonError, jsonOk, rateLimit } from "@/lib/server/http";

/** Browser GET is not Google Sign-In — Chrome shows an error page on empty 405. */
export async function GET() {
  return jsonOk({
    endpoint: "/api/v1/auth/google",
    method: "POST",
    body: { id_token: "<Google Sign-In idToken from Android>", device_id: "optional" },
    admin_ui: "/login",
  });
}

export async function POST(req: Request) {
  try {
    getServerEnv();
  } catch {
    return jsonError("SERVER_CONFIG", "Server environment not configured", 503);
  }

  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`auth:google:${ip}`, 20)) {
    return jsonError("RATE_LIMIT", "Too many requests", 429);
  }

  let body: { id_token?: string; device_id?: string };
  try {
    body = (await req.json()) as { id_token?: string; device_id?: string };
  } catch {
    return jsonError("VALIDATION", "JSON body required: { id_token }", 422);
  }
  if (!body.id_token) return jsonError("VALIDATION", "id_token is required", 422);

  await connectMongo();
  let profile;
  try {
    profile = await verifyGoogleIdToken(body.id_token);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid Google token";
    if (message === "GOOGLE_CLIENT_IDS_NOT_CONFIGURED") {
      return jsonError("SERVER_CONFIG", "Google client IDs are not configured", 503);
    }
    return jsonError("INVALID_GOOGLE_TOKEN", "Google id_token is invalid or expired", 401);
  }

  let user = await User.findOne({ googleId: profile.googleId });
  if (!user && profile.email) {
    user = await User.findOne({ email: profile.email });
    if (user) {
      user.googleId = profile.googleId;
    }
  }
  if (!user) {
    user = await User.create({
      googleId: profile.googleId,
      email: profile.email,
      displayName: profile.displayName,
      photoUrl: profile.photoUrl,
      role: "user",
    });
  } else {
    user.displayName = profile.displayName ?? user.displayName;
    user.photoUrl = profile.photoUrl ?? user.photoUrl;
    user.lastLoginAt = new Date();
    await user.save();
  }

  const session = await issueSession({
    userId: user._id,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ip,
    deviceId: body.device_id,
    label: "google",
  });

  const res = jsonOk({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires_at: session.expiresAt.toISOString(),
    token_type: "Bearer",
    user: {
      id: String(user._id),
      email: user.email,
      display_name: user.displayName,
      photo_url: user.photoUrl,
      role: user.role,
    },
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
