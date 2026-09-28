import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { revokeAllUserSessions } from "@/lib/server/auth/tokens";
import { User } from "@/lib/server/models/User";
import { Device } from "@/lib/server/models/Device";
import { LookHistory } from "@/lib/server/models/LookHistory";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { jsonError, jsonOk } from "@/lib/server/http";
export async function GET(req: Request) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  await connectMongo();
  const user = await User.findById(auth.payload!.userId)
    .select("email displayName photoUrl role status preferences")
    .lean();
  if (!user) return jsonError("NOT_FOUND", "User not found", 404);

  return jsonOk({
    id: String(user._id),
    email: user.email,
    display_name: user.displayName,
    photo_url: user.photoUrl,
    role: user.role,
    status: user.status,
    preferences: {
      theme_mode: user.preferences?.themeMode ?? "system",
      notifications_enabled: user.preferences?.notificationsEnabled ?? true,
      language_id: user.preferences?.languageId ?? "en_US",
      style_gender_preference: user.preferences?.styleGenderPreference ?? "women",
    },
  });
}
export async function PATCH(req: Request) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const body = (await req.json()) as { display_name?: string };
  await connectMongo();
  const user = await User.findById(auth.payload!.userId);
  if (!user) return jsonError("NOT_FOUND", "User not found", 404);

  if (body.display_name !== undefined) user.displayName = body.display_name;
  await user.save();

  return jsonOk({
    id: String(user._id),
    display_name: user.displayName,
  });
}

export async function DELETE(req: Request) {
  const auth = await requireAuth(req, ["user"]);
  if (auth.error) return auth.error;

  await connectMongo();
  const user = await User.findById(auth.payload!.userId);
  if (!user) return jsonError("NOT_FOUND", "User not found", 404);
  if (user.role === "admin") {
    return jsonError("FORBIDDEN", "Admin accounts cannot be deleted via this endpoint", 403);
  }

  const userId = user._id;
  await revokeAllUserSessions(userId);
  await Promise.all([
    Device.updateMany({ userId }, { revokedAt: new Date() }),
    LookHistory.deleteMany({ userId }),
    TryOnJob.deleteMany({ userId }),
    user.deleteOne(),
  ]);

  const res = jsonOk({ deleted: true });
  res.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: 0,
  });
  return res;
}