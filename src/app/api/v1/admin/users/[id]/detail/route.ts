import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { User } from "@/lib/server/models/User";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { LookHistory } from "@/lib/server/models/LookHistory";
import { Device } from "@/lib/server/models/Device";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { AppLanguage } from "@/lib/server/models/AppLanguage";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { tokenStatus } from "@/lib/server/admin/tokenStatus";
import { buildUserDetailDemo } from "@/lib/admin/user-detail-demo";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  const demo = new URL(req.url).searchParams.get("demo") === "1";

  return handleApiRoute(async () => {
    await connectMongo();
    const user = await User.findById(id).lean();
    if (!user) return jsonError("NOT_FOUND", "User not found", 404);

    if (demo) {
      return jsonOk(
        buildUserDetailDemo({
          id: String(user._id),
          display_name: user.displayName,
          email: user.email,
          photo_url: user.photoUrl,
          uid: String(user._id),
          role: user.role,
          status: user.status,
          created_at: user.createdAt ? new Date(user.createdAt).toISOString() : null,
          last_active: user.lastLoginAt?.toISOString() ?? null,
          is_guest: user.isGuest,
        })
      );
    }

    const uid = user._id;

    const [
      jobsTotal,
      jobsCompleted,
      jobsFailed,
      looksTotal,
      recentJobs,
      recentLooks,
      devices,
      sessions,
      lang,
    ] = await Promise.all([
      TryOnJob.countDocuments({ userId: uid }),
      TryOnJob.countDocuments({ userId: uid, status: "completed" }),
      TryOnJob.countDocuments({ userId: uid, status: "failed" }),
      LookHistory.countDocuments({ userId: uid }),
      TryOnJob.find({ userId: uid }).sort({ createdAt: -1 }).limit(10).lean(),
      LookHistory.find({ userId: uid }).sort({ createdAt: -1 }).limit(10).lean(),
      Device.find({ userId: uid }).sort({ lastSeenAt: -1 }).limit(5).lean(),
      RefreshToken.find({ userId: uid }).sort({ createdAt: -1 }).limit(10).lean(),
      user.preferences?.languageId
        ? AppLanguage.findOne({ languageId: user.preferences.languageId }).lean()
        : null,
    ]);

    return jsonOk({
      profile: {
        id: String(user._id),
        display_name: user.displayName,
        email: user.email,
        photo_url: user.photoUrl,
        uid: String(user._id),
        role: user.role,
        status: user.status,
        created_at: user.createdAt ? new Date(user.createdAt).toISOString() : null,
        last_active: user.lastLoginAt?.toISOString() ?? null,
        is_guest: user.isGuest,
      },
      auth_providers: {
        email: Boolean(user.email && !user.googleId),
        google: Boolean(user.googleId),
      },
      preferences: {
        language: lang?.englishName ?? user.preferences?.languageId ?? "—",
        theme: user.preferences?.themeMode ?? "system",
        gender: user.preferences?.styleGenderPreference ?? "—",
        notifications: user.preferences?.notificationsEnabled ? "Enabled" : "Disabled",
      },
      stats: {
        try_on_jobs: jobsTotal,
        completed: jobsCompleted,
        failed: jobsFailed,
        saved_looks: looksTotal,
      },
      devices: devices.map((d) => ({
        id: String(d._id),
        platform: d.platform,
        device_id: d.deviceId,
        last_seen_at: d.lastSeenAt?.toISOString() ?? null,
      })),
      recent_jobs: recentJobs.map((j) => ({
        id: String(j._id),
        style: j.styleId ?? "—",
        status: j.status,
        created_at: j.createdAt ? new Date(j.createdAt).toISOString() : null,
      })),
      recent_looks: recentLooks.map((l) => ({
        id: String(l._id),
        preview_url: l.imageUrl,
        style: l.styleId ?? "—",
        created_at: l.createdAt ? new Date(l.createdAt).toISOString() : null,
        is_favorite: l.isFavorite,
      })),
      sessions: sessions.map((s) => ({
        id: String(s._id),
        status: tokenStatus(s.expiresAt, s.revokedAt),
        expires_at: new Date(s.expiresAt).toISOString(),
        device_id: s.deviceId,
      })),
    });
  });
}
