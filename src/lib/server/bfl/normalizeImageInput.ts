/** Normalize client/base64 image inputs for BFL (data URL or raw base64). */
export type NormalizedImageInput = {
  dataUrl: string;
  mime: "image/jpeg" | "image/png" | "image/webp";
  rawBase64Length: number;
};

const DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i;

export function normalizeImageInput(input: string, label: string): NormalizedImageInput {
  const trimmed = input.trim();
  if (!trimmed) throw new Error(`${label}_EMPTY`);

  const match = trimmed.match(DATA_URL_RE);
  if (match) {
    const mime = match[1].toLowerCase() as NormalizedImageInput["mime"];
    const b64 = match[2];
    if (b64.length < 100) throw new Error(`${label}_TOO_SMALL`);
    return { dataUrl: trimmed, mime, rawBase64Length: b64.length };
  }

  if (/^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.replace(/\s/g, "").length >= 100) {
    const b64 = trimmed.replace(/\s/g, "");
    const mime: NormalizedImageInput["mime"] = "image/jpeg";
    return {
      dataUrl: `data:${mime};base64,${b64}`,
      mime,
      rawBase64Length: b64.length,
    };
  }

  throw new Error(`${label}_INVALID_FORMAT`);
}
