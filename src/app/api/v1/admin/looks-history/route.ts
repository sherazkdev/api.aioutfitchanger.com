import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { LookHistory } from "@/lib/server/models/LookHistory";
import { User } from "@/lib/server/models/User";
import { jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await connectMongo();
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
    const skip = (page - 1) * limit;
    const q = url.searchParams.get("q")?.trim();
    const userId = url.searchParams.get("user_id");
    const favorites = url.searchParams.get("favorites") === "true";

    const filter: Record<string, unknown> = {};
    if (userId) filter.userId = userId;
    if (favorites) filter.isFavorite = true;

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
          { categoryId: { $regex: q, $options: "i" } },
          { userId: { $in: userIds } },
        ];
      }
    }

    const [rows, total] = await Promise.all([
      LookHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "email displayName")
        .lean(),
      LookHistory.countDocuments(filter),
    ]);

    const items = rows.map((r) => {
      const user = r.userId as { email?: string; displayName?: string; _id?: unknown } | null;
      return {
        id: String(r._id),
        user_id: user?._id ? String(user._id) : String(r.userId),
        user_email: user?.email ?? "—",
        user_name: user?.displayName ?? "—",
        image_url: r.imageUrl,
        source_image_url: r.sourceImageUrl ?? null,
        style_id: r.styleId ?? null,
        category_id: r.categoryId ?? null,
        is_favorite: Boolean(r.isFavorite),
        created_at: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      };
    });

    return jsonOk({ items, meta: { page, limit, total } });
  });
}
