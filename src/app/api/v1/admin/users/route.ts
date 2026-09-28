import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { User } from "@/lib/server/models/User";
import { jsonOk } from "@/lib/server/http";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  await connectMongo();
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
  const q = url.searchParams.get("q")?.trim();
  const skip = (page - 1) * limit;

  const filter = q
    ? {
        $or: [
          { email: { $regex: q, $options: "i" } },
          { displayName: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return jsonOk({
    items: rows.map((u) => ({
      id: String(u._id),
      email: u.email,
      display_name: u.displayName,
      photo_url: u.photoUrl,
      role: u.role,
      status: u.status,
      is_guest: u.isGuest,
      google_id: u.googleId,
      last_login_at: u.lastLoginAt?.toISOString() ?? null,
      created_at: u.createdAt ? new Date(u.createdAt).toISOString() : null,
    })),
    meta: { page, limit, total },
  });
}
