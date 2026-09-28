import { readFile, stat } from "fs/promises";
import path from "path";
import { jsonError } from "@/lib/server/http";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function mimeFor(ext: string): string {
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "image/jpeg";
}

function cacheControlFor(rel: string): string {
  if (rel.startsWith("looks/")) return "public, max-age=31536000, immutable";
  return "public, max-age=86400";
}

/** Serves runtime files under public/uploads (works with next start after new files are written). */
export async function GET(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path: segments } = await ctx.params;
  if (!segments?.length) return jsonError("NOT_FOUND", "File not found", 404);

  const rel = path.normalize(segments.join("/")).replace(/^(\.\.(\/|\\|$))+/, "");
  if (rel.startsWith("..") || rel.includes("..")) return jsonError("FORBIDDEN", "Invalid path", 403);

  const filePath = path.join(UPLOADS_ROOT, rel);
  if (!filePath.startsWith(UPLOADS_ROOT)) return jsonError("FORBIDDEN", "Invalid path", 403);

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return jsonError("NOT_FOUND", "File not found", 404);

    const etag = `W/"${info.size}-${Math.floor(info.mtimeMs)}"`;
    const cacheControl = cacheControlFor(rel);
    if (req.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control": cacheControl } });
    }

    const buf = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new Response(buf, {
      headers: {
        "Content-Type": mimeFor(ext),
        "Cache-Control": cacheControl,
        ETag: etag,
        "Content-Length": String(info.size),
      },
    });
  } catch {
    return jsonError("NOT_FOUND", "File not found", 404);
  }
}
