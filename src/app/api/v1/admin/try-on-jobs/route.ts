import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { User } from "@/lib/server/models/User";
import { jsonOk } from "@/lib/server/http";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  await connectMongo();
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
  const status = url.searchParams.get("status");
  const userId = url.searchParams.get("user_id");
  const q = url.searchParams.get("q")?.trim();
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status && ["queued", "processing", "completed", "failed", "cancelled"].includes(status)) {
    filter.status = status;
  }
  if (userId) filter.userId = userId;

  if (q) {
    if (/^[a-f0-9]{24}$/i.test(q)) {
      filter._id = q;
    } else {
      const userIds = await User.find({
        $or: [
          { email: { $regex: q, $options: "i" } },
          { displayName: { $regex: q, $options: "i" } },
        ],
      }).distinct("_id");
      filter.$or = [
        { styleId: { $regex: q, $options: "i" } },
        { externalJobId: { $regex: q, $options: "i" } },
        { categoryId: { $regex: q, $options: "i" } },
        { userId: { $in: userIds } },
      ];
    }
  }

  const [rows, total] = await Promise.all([
    TryOnJob.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "email displayName")
      .lean(),
    TryOnJob.countDocuments(filter),
  ]);

  return jsonOk({
    items: rows.map((j) => {
      const user = j.userId as { email?: string; displayName?: string } | null;
      return {
        id: String(j._id),
        external_job_id: j.externalJobId,
        user: user ? { email: user.email, display_name: user.displayName } : null,
        style_id: j.styleId,
        category_id: j.categoryId,
        status: j.status,
        result_url: j.resultUrl,
        error: j.errorMessage,
        created_at: j.createdAt ? new Date(j.createdAt).toISOString() : null,
      };
    }),
    meta: { page, limit, total },
  });
}
