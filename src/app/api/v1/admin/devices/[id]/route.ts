import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { Device } from "@/lib/server/models/Device";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;

  return handleApiRoute(async () => {
    await connectMongo();
    const device = await Device.findById(id);
    if (!device) return jsonError("NOT_FOUND", "Device not found", 404);
    device.revokedAt = new Date();
    await device.save();
    await logAdminAudit(req, auditActor(auth), {
      action: "device.revoke",
      resource_type: "device",
      resource_id: id,
    });
    return jsonOk({ id, revoked: true });
  });
}
