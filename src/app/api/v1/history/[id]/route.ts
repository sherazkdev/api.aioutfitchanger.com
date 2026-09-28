import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { LookHistory } from "@/lib/server/models/LookHistory";
import { jsonError, jsonOk } from "@/lib/server/http";

async function loadLook(id: string, userId: string, role: string) {
  const doc = await LookHistory.findById(id);
  if (!doc) return null;
  if (role !== "admin" && String(doc.userId) !== userId) return undefined;
  return doc;
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  await connectMongo();
  const doc = await loadLook(id, auth.payload!.userId, auth.payload!.role);
  if (doc === null) return jsonError("NOT_FOUND", "Look not found", 404);
  if (doc === undefined) return jsonError("FORBIDDEN", "Not your look", 403);

  return jsonOk({
    id: String(doc._id),
    image_url: doc.imageUrl,
    source_image_url: doc.sourceImageUrl,
    style_id: doc.styleId,
    category_id: doc.categoryId,
    is_favorite: doc.isFavorite,
    created_at: doc.createdAt.toISOString(),
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  const body = (await req.json()) as { is_favorite?: boolean };

  await connectMongo();
  const doc = await loadLook(id, auth.payload!.userId, auth.payload!.role);
  if (doc === null) return jsonError("NOT_FOUND", "Look not found", 404);
  if (doc === undefined) return jsonError("FORBIDDEN", "Not your look", 403);

  if (body.is_favorite !== undefined) doc.isFavorite = body.is_favorite;
  await doc.save();

  return jsonOk({ id: String(doc._id), is_favorite: doc.isFavorite });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  await connectMongo();
  const doc = await loadLook(id, auth.payload!.userId, auth.payload!.role);
  if (doc === null) return jsonError("NOT_FOUND", "Look not found", 404);
  if (doc === undefined) return jsonError("FORBIDDEN", "Not your look", 403);

  await doc.deleteOne();
  return jsonOk({ deleted: true, id });
}
