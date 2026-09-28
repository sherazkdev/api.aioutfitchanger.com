import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { LookHistory } from "@/lib/server/models/LookHistory";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(_req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;

  return handleApiRoute(async () => {
    await connectMongo();
    const row = await LookHistory.findById(id).populate("userId", "email displayName photoUrl").lean();
    if (!row) return jsonError("NOT_FOUND", "Look not found", 404);

    const user = row.userId as { email?: string; displayName?: string; photoUrl?: string; _id?: unknown } | null;

    return jsonOk({
      id: String(row._id),
      user: user
        ? {
            id: String(user._id ?? row.userId),
            email: user.email,
            display_name: user.displayName,
            photo_url: user.photoUrl,
          }
        : null,
      image_url: row.imageUrl,
      source_image_url: row.sourceImageUrl ?? null,
      style_id: row.styleId ?? null,
      category_id: row.categoryId ?? null,
      is_favorite: Boolean(row.isFavorite),
      created_at: row.createdAt ? new Date(row.createdAt).toISOString() : null,
    });
  });
}
