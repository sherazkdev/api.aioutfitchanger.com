import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { User } from "@/lib/server/models/User";
import { LookHistory } from "@/lib/server/models/LookHistory";
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
    const skip = (page - 1) * limit;

    const filter = { userId: user._id };
    const [rows, total] = await Promise.all([
      LookHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      LookHistory.countDocuments(filter),
    ]);

    return jsonOk({
      items: rows.map((l) => ({
        id: String(l._id),
        preview_url: l.imageUrl,
        style: l.styleId ?? "—",
        created_at: l.createdAt ? new Date(l.createdAt).toISOString() : null,
        is_favorite: l.isFavorite,
      })),
      meta: { page, limit, total },
    });
  });
}
