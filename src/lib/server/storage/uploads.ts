import { mkdir, writeFile } from "fs/promises";
import path from "path";

/** True when URL already points at this app's public/uploads tree. */
export function isHostedUploadUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.startsWith("/uploads/")) return true;
  const base = (process.env.APP_URL ?? "").replace(/\/$/, "");
  if (base && trimmed.startsWith(`${base}/uploads/`)) return true;
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
}): Promise<string> {
  const remote = opts.remoteUrl.trim();
  if (!remote) throw new Error("EMPTY_URL");
  if (isHostedUploadUrl(remote)) {
    return remote.startsWith("/") ? remote : new URL(remote).pathname;
  }

  const res = await fetch(remote, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`FETCH_FAILED_${res.status}`);

  const contentType = res.headers.get("content-type") ?? "";
  let ext = "jpg";
  if (contentType.includes("png")) ext = "png";
  else if (contentType.includes("webp")) ext = "webp";

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length === 0) throw new Error("EMPTY_IMAGE");

  const dir = path.join(process.cwd(), "public", "uploads", opts.subdir, opts.userId);
  await mkdir(dir, { recursive: true });
  const filename = `${opts.basename}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${opts.subdir}/${opts.userId}/${filename}`;
}
