import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { User } from "@/lib/server/models/User";
import { revokeAllUserSessions } from "@/lib/server/auth/tokens";
import { invalidateUserAuthCache } from "@/lib/server/auth/userAuthCache";
import { jsonError, jsonOk } from "@/lib/server/http";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  await connectMongo();
  const user = await User.findById(id).lean();
  if (!user) return jsonError("NOT_FOUND", "User not found", 404);

  return jsonOk({
    id: String(user._id),
    email: user.email,
    display_name: user.displayName,
    photo_url: user.photoUrl,
    role: user.role,
    status: user.status,
    is_guest: user.isGuest,
    last_login_at: user.lastLoginAt?.toISOString() ?? null,
    created_at: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  const body = (await req.json()) as {
    display_name?: string;
    role?: "user" | "admin";
    status?: "active" | "disabled";
  };

  await connectMongo();
  const user = await User.findById(id);
  if (!user) return jsonError("NOT_FOUND", "User not found", 404);

  if (body.display_name !== undefined) user.displayName = body.display_name;
  if (body.role !== undefined) {
    if (body.role !== "user" && body.role !== "admin") {
      return jsonError("VALIDATION", "Invalid role", 422);
    }
    if (String(user._id) === auth.payload!.userId && body.role !== "admin") {
      return jsonError("VALIDATION", "Cannot remove your own admin role", 422);
    }
    user.role = body.role;
  }
  if (body.status !== undefined) {
    if (String(user._id) === auth.payload!.userId && body.status === "disabled") {
      return jsonError("VALIDATION", "Cannot disable your own account", 422);
    }
    user.status = body.status;
    if (body.status === "disabled") await revokeAllUserSessions(user._id);
  }
  await user.save();
  invalidateUserAuthCache(id);

  await logAdminAudit(req, auditActor(auth), {
    action: "user.update",
    resource_type: "user",
    resource_id: id,
    meta: {
      role: body.role,
      status: body.status,
      display_name: body.display_name !== undefined,
    },
  });

  return jsonOk({
    id: String(user._id),
    email: user.email,
    display_name: user.displayName,
    role: user.role,
    status: user.status,
  });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  await connectMongo();
  const user = await User.findById(id);
  if (!user) return jsonError("NOT_FOUND", "User not found", 404);

  await revokeAllUserSessions(user._id);
  await user.deleteOne();

  await logAdminAudit(req, auditActor(auth), {
    action: "user.delete",
    resource_type: "user",
    resource_id: id,
    meta: { email: user.email },
  });

  return jsonOk({ deleted: true, id });
}
