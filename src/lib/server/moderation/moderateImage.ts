import type { NormalizedImageInput } from "../bfl/normalizeImageInput";

const MAX_DECODED_BYTES = 12 * 1024 * 1024;

export type ImageModerationResult =
  | { ok: true }
  | { ok: false; code: "MODERATION_BLOCKED" | "VALIDATION"; message: string };

function decodeBase64FromDataUrl(dataUrl: string): Buffer | null {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return null;
  try {
    return Buffer.from(dataUrl.slice(comma + 1), "base64");
  } catch {
    return null;
  }
}

/** Basic server checks on uploaded images (size/format). NSFW classifiers need a separate vision API. */
export function moderateImageInput(
  input: NormalizedImageInput,
  label: string
): ImageModerationResult {
  const buf = decodeBase64FromDataUrl(input.dataUrl);
  if (!buf || buf.length < 200) {
    return { ok: false, code: "VALIDATION", message: `${label} image is too small or invalid` };
  }
  if (buf.length > MAX_DECODED_BYTES) {
    return { ok: false, code: "VALIDATION", message: `${label} image exceeds size limit` };
  }

  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50;
  const isWebp =
    buf.length > 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50;

  if (!isJpeg && !isPng && !isWebp) {
    return { ok: false, code: "VALIDATION", message: `${label} must be JPEG, PNG, or WebP` };
  }

  return { ok: true };
}
