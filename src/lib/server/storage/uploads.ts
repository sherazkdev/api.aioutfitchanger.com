import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import {
  ADMIN_CONTENT_UPLOAD_FOLDERS,
  type AdminContentUploadFolder,
} from "@/lib/admin/contentUploadFolders";
import { safeFetchRemoteBytes } from "@/lib/server/security/safeRemoteFetch";

const MAX_ADMIN_UPLOAD_BYTES = 5 * 1024 * 1024;

export { ADMIN_CONTENT_UPLOAD_FOLDERS, type AdminContentUploadFolder };

/** Save an admin-uploaded image under public/uploads/content/{folder}/ */
export async function saveAdminContentImage(opts: {
  folder: AdminContentUploadFolder;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  if (opts.buffer.length === 0) throw new Error("EMPTY_IMAGE");
  if (opts.buffer.length > MAX_ADMIN_UPLOAD_BYTES) throw new Error("FILE_TOO_LARGE");

  const ct = opts.contentType.toLowerCase();
  if (!ct.startsWith("image/")) throw new Error("INVALID_TYPE");

  let ext = "jpg";
  if (ct.includes("png")) ext = "png";
  else if (ct.includes("webp")) ext = "webp";
  else if (ct.includes("gif")) ext = "gif";
  else if (ct.includes("jpeg") || ct.includes("jpg")) ext = "jpg";
  else throw new Error("INVALID_TYPE");

  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "content", opts.folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), opts.buffer);

  return `/uploads/content/${opts.folder}/${filename}`;
}

/** True when URL already points at this app's public/uploads tree. */
export function isHostedUploadUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.startsWith("/uploads/")) return true;
  if (trimmed.startsWith("/api/v1/files/")) return true;
  const base = (process.env.APP_URL ?? "").replace(/\/$/, "");
  if (base && trimmed.startsWith(`${base}/uploads/`)) return true;
  if (base && trimmed.startsWith(`${base}/api/v1/files/`)) return true;
  return false;
}

/**
 * Download a remote image (e.g. BFL temp URL) into public/uploads/{subdir}/{userId}/.
 * Returns a site-relative path such as /uploads/looks/{userId}/{basename}.jpg
 */
export async function persistRemoteImageToUploads(opts: {
  userId: string;
  subdir: "looks" | "sources";
  basename: string;
  remoteUrl: string;
  /** Apply branded overlay when saving AI try-on results (looks only). */
  applyWatermark?: boolean;
}): Promise<string> {
  const remote = opts.remoteUrl.trim();
  if (!remote) throw new Error("EMPTY_URL");
  if (isHostedUploadUrl(remote)) {
    return remote.startsWith("/") ? remote : new URL(remote).pathname;
  }

  const { buffer: fetched, contentType } = await safeFetchRemoteBytes(remote, {
    timeoutMs: 60_000,
  });
  let ext = "jpg";
  if (contentType.includes("png")) ext = "png";
  else if (contentType.includes("webp")) ext = "webp";

  let buffer = fetched;
  if (buffer.length === 0) throw new Error("EMPTY_IMAGE");

  if (opts.subdir === "looks") {
    const { moderateGeneratedResultBuffer } = await import("../moderation/moderateTryOn");
    const blocked = await moderateGeneratedResultBuffer(buffer);
    if (blocked) {
      // Structural format/size failure — not external NSFW moderation.
      throw new Error("OUTPUT_VALIDATION_FAILED");
    }
  }

  if (opts.applyWatermark && opts.subdir === "looks") {
    const { applyAiResultWatermark } = await import("../watermark/applyWatermark");
    buffer = Buffer.from(await applyAiResultWatermark(buffer));
    ext = "jpg";
  }

  const dir = path.join(process.cwd(), "public", "uploads", opts.subdir, opts.userId);
  await mkdir(dir, { recursive: true });
  const filename = `${opts.basename}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);

  // Authenticated file API path (middleware also rewrites legacy /uploads/{private}/…).
  return `/api/v1/files/${opts.subdir}/${opts.userId}/${filename}`;
}
