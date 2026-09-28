import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { LookHistory } from "@/lib/server/models/LookHistory";
import { jsonError, jsonOk } from "@/lib/server/http";
import { LOOK_LIST_SELECT, serializeLookRow } from "@/lib/server/history/serializeLook";
import { persistLookImageUrl, persistSourceImageUrl } from "@/lib/server/storage/persistLookImages";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  await connectMongo();
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
  const favorites = url.searchParams.get("favorites") === "true";
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> =
    auth.payload!.role === "admin" && url.searchParams.get("user_id")
      ? { userId: url.searchParams.get("user_id") }
      : auth.payload!.role === "admin"
        ? {}
        : { userId: auth.payload!.userId };

  if (favorites) filter.isFavorite = true;

  const [rows, total] = await Promise.all([
    LookHistory.find(filter)
      .select(LOOK_LIST_SELECT)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LookHistory.countDocuments(filter),
  ]);

  return jsonOk({
    items: rows.map((r) => serializeLookRow(r)),
    meta: { page, limit, total },
  });
}

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const body = (await req.json()) as {
    image_url?: string;
    source_image_url?: string;
    style_id?: string;
    category_id?: string;
    is_favorite?: boolean;
    saved_to_wardrobe?: boolean;
    try_on_job_id?: string;
  };

  if (!body.image_url) return jsonError("VALIDATION", "image_url required", 422);

  await connectMongo();
  const userId = auth.payload!.userId;
  let imageUrl: string;
  let sourceImageUrl: string | undefined;
  try {
    imageUrl = await persistLookImageUrl(userId, body.image_url);
    sourceImageUrl = body.source_image_url
      ? await persistSourceImageUrl(userId, body.source_image_url)
      : undefined;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "IMAGE_PERSIST_FAILED";
    return jsonError("STORAGE", `Could not persist look image: ${msg}`, 502);
  }

  const doc = await LookHistory.create({
    userId,
    imageUrl,
    sourceImageUrl,
    styleId: body.style_id,
    categoryId: body.category_id,
    isFavorite: body.is_favorite ?? false,
    savedToWardrobe: body.saved_to_wardrobe ?? false,
    tryOnJobId: body.try_on_job_id,
  });

  return jsonOk({
    id: String(doc._id),
    image_url: doc.imageUrl,
    image_absolute_url: serializeLookRow(doc).image_absolute_url,
    created_at: doc.createdAt.toISOString(),
  });
}

export async function DELETE(req: Request) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const body = (await req.json()) as { ids?: string[] };
  if (!body.ids?.length) return jsonError("VALIDATION", "ids array required", 422);

  await connectMongo();
  const filter =
    auth.payload!.role === "admin"
      ? { _id: { $in: body.ids } }
      : { _id: { $in: body.ids }, userId: auth.payload!.userId };

  const result = await LookHistory.deleteMany(filter);
  return jsonOk({ deleted_count: result.deletedCount });
}
