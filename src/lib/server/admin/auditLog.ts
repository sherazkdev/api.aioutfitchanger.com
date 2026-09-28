import { connectMongo } from "@/lib/server/db";
import { getClientIp } from "@/lib/server/http";
import { AdminAuditLog } from "@/lib/server/models/AdminAuditLog";
import { auditCategoryFilter } from "@/lib/server/admin/auditCategories";

export type AuditActor = { userId: string; email?: string | null };

export async function logAdminAudit(
  req: Request,
  actor: AuditActor,
  entry: {
    action: string;
    resource_type: string;
    resource_id?: string;
    meta?: Record<string, unknown>;
  }
) {
  try {
    await connectMongo();
    await AdminAuditLog.create({
      actorUserId: actor.userId,
      actorEmail: actor.email ?? undefined,
      action: entry.action,
      resourceType: entry.resource_type,
      resourceId: entry.resource_id,
      meta: entry.meta ?? {},
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent")?.slice(0, 256),
    });
  } catch (err) {
    console.error("[admin-audit]", err);
  }
}

const CATEGORY_KEYS = ["token", "device", "user", "broadcast", "content"] as const;

export function buildAuditListFilter(params: {
  category?: string | null;
  action?: string | null;
  q?: string | null;
}): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  const catFilter = auditCategoryFilter(params.category);
  if (catFilter) Object.assign(filter, catFilter);
  if (params.action?.trim()) filter.action = params.action.trim();

  const q = params.q?.trim();
  if (q) {
    const regex = { $regex: q, $options: "i" };
    filter.$or = [{ action: regex }, { actorEmail: regex }, { resourceId: regex }, { resourceType: regex }];
  }
  return filter;
}

export async function getAuditSummary() {
  await connectMongo();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  async function bucket(since: Date) {
    const base = { createdAt: { $gte: since } };
    const counts: Record<string, number> = {
      total: await AdminAuditLog.countDocuments(base),
    };
    for (const key of CATEGORY_KEYS) {
      const cat = auditCategoryFilter(key);
      counts[key] = await AdminAuditLog.countDocuments({ ...base, ...cat });
    }
    return counts;
  }

  return { last_24h: await bucket(since24h), last_7d: await bucket(since7d) };
}
