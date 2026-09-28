import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { User } from "@/lib/server/models/User";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;

  return handleApiRoute(async () => {
    await connectMongo();
    const user = await User.findById(id).select("_id").lean();
    if (!user) return jsonError("NOT_FOUND", "User not found", 404);

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 10)));
    const status = url.searchParams.get("status");
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId: user._id };
    if (status && ["queued", "processing", "completed", "failed", "cancelled"].includes(status)) {
      filter.status = status;
    }

    const [rows, total] = await Promise.all([
      TryOnJob.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      TryOnJob.countDocuments(filter),
    ]);

    return jsonOk({
      items: rows.map((j) => ({
        id: String(j._id),
        job_id: j.externalJobId ? `JOB-${String(j.externalJobId).slice(-4)}` : String(j._id).slice(-8),
        style: j.styleId ?? "—",
        status: j.status,
        created_at: j.createdAt ? new Date(j.createdAt).toISOString() : null,
      })),
      meta: { page, limit, total },
    });
  });
}
