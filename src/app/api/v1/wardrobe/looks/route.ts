import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { LookHistory } from "@/lib/server/models/LookHistory";
import { jsonOk } from "@/lib/server/http";
import { LOOK_LIST_SELECT, serializeLookRow } from "@/lib/server/history/serializeLook";

/** Saved wardrobe looks (subset of history where saved_to_wardrobe=true). */
export async function GET(req: Request) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  await connectMongo();
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const filter =
    auth.payload!.role === "admin" && url.searchParams.get("user_id")
      ? { userId: url.searchParams.get("user_id"), savedToWardrobe: true }
      : auth.payload!.role === "admin"
        ? { savedToWardrobe: true }
        : { userId: auth.payload!.userId, savedToWardrobe: true };

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
