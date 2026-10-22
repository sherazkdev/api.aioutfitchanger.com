import { jsonError } from "../http";

const DEFAULT_MAX_JSON_BYTES = 18 * 1024 * 1024;

export function maxApiBodyBytes(): number {
  const n = Number(process.env.API_MAX_BODY_BYTES ?? DEFAULT_MAX_JSON_BYTES);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_JSON_BYTES;
}

/** Reject oversized bodies before JSON parse (try-on base64). Content-Length check. */
export function rejectOversizedBody(req: Request, maxBytes = maxApiBodyBytes()) {
  const raw = req.headers.get("content-length");
  if (!raw) return null;
  const len = Number(raw);
  if (!Number.isFinite(len) || len <= maxBytes) return null;
  return jsonError("PAYLOAD_TOO_LARGE", "Request body is too large", 413);
}

/**
 * Read request text with a hard byte cap (protects chunked/missing Content-Length).
 * Rejects when decoded UTF-8 byte length exceeds maxBytes.
 */
export async function readBodyTextLimited(
  req: Request,
  maxBytes = maxApiBodyBytes()
): Promise<{ ok: true; text: string } | { ok: false; response: Response }> {
  const headerReject = rejectOversizedBody(req, maxBytes);
  if (headerReject) return { ok: false, response: headerReject };

  const ab = await req.arrayBuffer();
  if (ab.byteLength > maxBytes) {
    return {
      ok: false,
      response: jsonError("PAYLOAD_TOO_LARGE", "Request body is too large", 413),
    };
  }
  return { ok: true, text: Buffer.from(ab).toString("utf8") };
}

export async function authFailureDelay(): Promise<void> {
  const base = 180 + Math.floor(Math.random() * 220);
  await new Promise((r) => setTimeout(r, base));
}
