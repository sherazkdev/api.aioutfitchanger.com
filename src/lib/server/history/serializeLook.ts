import { publicAssetUrl } from "../publicUrl";

/** Fields needed for list endpoints (smaller Mongo payloads). */
export const LOOK_LIST_SELECT =
  "imageUrl sourceImageUrl styleId categoryId isFavorite savedToWardrobe createdAt";

export function serializeLookRow(r: {
  _id: unknown;
  imageUrl?: string | null;
  sourceImageUrl?: string | null;
  styleId?: string | null;
  categoryId?: string | null;
  isFavorite?: boolean;
  savedToWardrobe?: boolean;
  createdAt?: Date;
}) {
  return {
    id: String(r._id),
    image_url: r.imageUrl,
    image_absolute_url: publicAssetUrl(r.imageUrl ?? undefined),
    source_image_url: r.sourceImageUrl ?? undefined,
    source_image_absolute_url: publicAssetUrl(r.sourceImageUrl ?? undefined),
    style_id: r.styleId,
    category_id: r.categoryId,
    is_favorite: r.isFavorite,
    saved_to_wardrobe: r.savedToWardrobe,
    created_at: r.createdAt ? new Date(r.createdAt).toISOString() : null,
  };
}
