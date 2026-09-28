import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { User } from "@/lib/server/models/User";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { verifyPassword, hashPassword } from "@/lib/server/auth/password";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { expiresInMs, tokenStatus, ttlElapsedPercent } from "@/lib/server/admin/tokenStatus";
import { hashToken } from "@/lib/server/auth/tokens";
import type { Types } from "mongoose";

function currentSessionIdFromRequest(req: Request): string | null {
  const raw = req.headers.get("x-refresh-session");
  if (!raw) return null;
  const hash = hashToken(raw);
  return hash;
}

async function resolveCurrentSessionId(req: Request, userId: Types.ObjectId): Promise<string | null> {
  const hash = currentSessionIdFromRequest(req);
  if (!hash) return null;
  const doc = await RefreshToken.findOne({ userId, tokenHash: hash, revokedAt: null }).select("_id").lean();
  return doc ? String(doc._id) : null;
}

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await connectMongo();
    const user = await User.findById(auth.payload!.userId);
    if (!user) return jsonError("NOT_FOUND", "Admin not found", 404);

    const currentSessionId = await resolveCurrentSessionId(req, user._id);

    const sessions = await RefreshToken.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return jsonOk({
      profile: {
        id: String(user._id),
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoUrl,
        role: user.role,
        last_login_at: user.lastLoginAt?.toISOString() ?? null,
        created_at: user.createdAt ? new Date(user.createdAt).toISOString() : null,
      },
      preferences: {
        theme_mode: user.preferences?.themeMode ?? "system",
        notify_job_failures: user.preferences?.notifyJobFailures ?? true,
        notify_new_users: user.preferences?.notifyNewUsers ?? false,
      },
      sessions: sessions.map((s) => {
        const st = tokenStatus(s.expiresAt, s.revokedAt);
        const created = s.createdAt ? new Date(s.createdAt) : null;
        return {
          id: String(s._id),
          is_current: currentSessionId ? String(s._id) === currentSessionId : false,
          label: s.label ?? s.userAgent?.slice(0, 40) ?? "Session",
          ip: s.ip,
          last_used_at: s.lastUsedAt?.toISOString() ?? null,
          expires_at: new Date(s.expiresAt).toISOString(),
          expires_in_ms: st === "active" ? expiresInMs(s.expiresAt) : 0,
          ttl_elapsed_percent: created ? ttlElapsedPercent(created, s.expiresAt) : null,
          status: st,
        };
      }),
    });
  });
}

export async function PATCH(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    const body = (await req.json()) as {
      display_name?: string;
      photo_url?: string;
      theme_mode?: "system" | "light" | "dark";
      notify_job_failures?: boolean;
      notify_new_users?: boolean;
      current_password?: string;
      new_password?: string;
      revoke_session_id?: string;
      revoke_other_sessions?: boolean;
    };

    await connectMongo();
    const user = await User.findById(auth.payload!.userId).select("+passwordHash");
    if (!user) return jsonError("NOT_FOUND", "Admin not found", 404);

    if (body.display_name !== undefined) user.displayName = body.display_name;
    if (body.photo_url !== undefined) user.photoUrl = body.photo_url;

    if (!user.preferences) {
      user.preferences = {
        themeMode: "system",
        notificationsEnabled: true,
        languageId: "en_US",
        styleGenderPreference: "women",
        notifyJobFailures: true,
        notifyNewUsers: false,
      };
    }
    if (body.theme_mode) user.preferences.themeMode = body.theme_mode;
    if (body.notify_job_failures !== undefined) user.preferences.notifyJobFailures = body.notify_job_failures;
    if (body.notify_new_users !== undefined) user.preferences.notifyNewUsers = body.notify_new_users;

    const currentSessionId = await resolveCurrentSessionId(req, user._id);

    if (body.revoke_session_id) {
      if (body.revoke_session_id === currentSessionId) {
        return jsonError("VALIDATION", "Cannot revoke the current session from this screen", 422);
      }
      const target = await RefreshToken.findOne({ _id: body.revoke_session_id, userId: user._id });
      if (!target) return jsonError("NOT_FOUND", "Session not found", 404);
      target.revokedAt = new Date();
      await target.save();
      await logAdminAudit(req, auditActor(auth), {
        action: "token.self_revoke",
        resource_type: "token_session",
        resource_id: body.revoke_session_id,
      });
    }

    if (body.revoke_other_sessions) {
      const filter: Record<string, unknown> = { userId: user._id, revokedAt: null };
      if (currentSessionId) filter._id = { $ne: currentSessionId };
      const result = await RefreshToken.updateMany(filter, { revokedAt: new Date() });
      await logAdminAudit(req, auditActor(auth), {
        action: "token.self_revoke",
        resource_type: "token_session",
        meta: { revoke_other_sessions: true, count: result.modifiedCount },
      });
    }

    if (body.new_password) {
      if (!body.current_password || !user.passwordHash) {
        return jsonError("VALIDATION", "Current password required", 422);
      }
      const ok = await verifyPassword(body.current_password, user.passwordHash);
      if (!ok) return jsonError("AUTH", "Current password is incorrect", 401);
      if (body.new_password.length < 8) {
        return jsonError("VALIDATION", "Password must be at least 8 characters", 422);
      }
      user.passwordHash = await hashPassword(body.new_password);
    }

    await user.save();
    return jsonOk({ saved: true });
  });
}
