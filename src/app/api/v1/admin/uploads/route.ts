import { ADMIN_CONTENT_UPLOAD_FOLDERS, type AdminContentUploadFolder } from "@/lib/admin/contentUploadFolders";
import { saveAdminContentImage } from "@/lib/server/storage/uploads";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { jsonError, jsonOk } from "@/lib/server/http";

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return jsonError("VALIDATION", "multipart form with file required", 422);
  }

  const form = await req.formData();
  const file = form.get("file");
  const folderRaw = String(form.get("folder") ?? "").trim();

  if (!file || !(file instanceof File)) {
    return jsonError("VALIDATION", "file required", 422);
  }
  if (!ADMIN_CONTENT_UPLOAD_FOLDERS.includes(folderRaw as AdminContentUploadFolder)) {
    return jsonError("VALIDATION", `folder must be one of: ${ADMIN_CONTENT_UPLOAD_FOLDERS.join(", ")}`, 422);
  }

  const folder = folderRaw as AdminContentUploadFolder;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const url = await saveAdminContentImage({
      folder,
      buffer,
      contentType: file.type || "application/octet-stream",
    });
    return jsonOk({ url });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UPLOAD_FAILED";
    if (code === "FILE_TOO_LARGE") {
      return jsonError("VALIDATION", "file too large (max 5MB)", 422);
    }
    if (code === "INVALID_TYPE" || code === "EMPTY_IMAGE") {
      return jsonError("VALIDATION", "valid image file required (jpg, png, webp, gif)", 422);
    }
    return jsonError("UPLOAD_FAILED", "Could not save image", 500);
  }
}
