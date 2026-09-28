import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { User } from "@/lib/server/models/User";
import { jsonError, jsonOk } from "@/lib/server/http";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const contentType = req.headers.get("content-type") ?? "";
  let buffer: Buffer;
  let ext = "jpg";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("avatar");
    if (!file || !(file instanceof File)) {
      return jsonError("VALIDATION", "avatar file required", 422);
    }
    if (file.size > MAX_BYTES) return jsonError("VALIDATION", "file too large (max 5MB)", 422);
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    if (file.type === "image/png") ext = "png";
    if (file.type === "image/webp") ext = "webp";
  } else {
    const body = (await req.json()) as { image_base64?: string };
    if (!body.image_base64) return jsonError("VALIDATION", "image_base64 or multipart avatar required", 422);
    const match = body.image_base64.match(/^data:image\/(\w+);base64,(.+)$/);
    const raw = match ? match[2] : body.image_base64;
    if (match?.[1]) ext = match[1] === "jpeg" ? "jpg" : match[1];
    buffer = Buffer.from(raw, "base64");
    if (buffer.length > MAX_BYTES) return jsonError("VALIDATION", "file too large (max 5MB)", 422);
  }

  await connectMongo();
  const user = await User.findById(auth.payload!.userId);
  if (!user) return jsonError("NOT_FOUND", "User not found", 404);

  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(dir, { recursive: true });
  const filename = `${user._id}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);

  const publicUrl = `/uploads/avatars/${filename}`;
  user.photoUrl = publicUrl;
  await user.save();

  return jsonOk({ photo_url: publicUrl });
}
