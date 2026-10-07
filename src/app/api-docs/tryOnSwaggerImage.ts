/** Shared state between upload panel and Swagger requestInterceptor (client-only). */
let sourceImageDataUrl: string | null = null;

export const TRYON_SWAGGER_MAX_IMAGE_MB = 20;

export type TryOnImageReadResult =
  | { ok: true; dataUrl: string; fileName: string; sizeKb: number }
  | { ok: false; error: string };

export function setTryOnSourceImageDataUrl(dataUrl: string | null) {
  sourceImageDataUrl = dataUrl?.trim() || null;
}

export function getTryOnSourceImageDataUrl(): string | null {
  return sourceImageDataUrl;
}

export function applyTryOnSourceImageToRequestBody(body: Record<string, unknown>): boolean {
  if (!sourceImageDataUrl) return false;
  body.source_image_base64 = sourceImageDataUrl;
  return true;
}

export function isTryOnGenerateRequestUrl(url: string): boolean {
  return /\/try-on\/generate(?:\?|$)/i.test(url);
}

export function readTryOnImageFile(file: File | undefined): Promise<TryOnImageReadResult> {
  return new Promise((resolve) => {
    if (!file) {
      setTryOnSourceImageDataUrl(null);
      resolve({ ok: false, error: "No file selected." });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setTryOnSourceImageDataUrl(null);
      resolve({ ok: false, error: "Sirf image file (JPEG, PNG, WebP)." });
      return;
    }
    if (file.size > TRYON_SWAGGER_MAX_IMAGE_MB * 1024 * 1024) {
      setTryOnSourceImageDataUrl(null);
      resolve({ ok: false, error: `File ${TRYON_SWAGGER_MAX_IMAGE_MB}MB se choti honi chahiye.` });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result || !result.startsWith("data:image/")) {
        setTryOnSourceImageDataUrl(null);
        resolve({ ok: false, error: "Image read fail — dubara try karo." });
        return;
      }
      setTryOnSourceImageDataUrl(result);
      resolve({
        ok: true,
        dataUrl: result,
        fileName: file.name,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    reader.onerror = () => {
      setTryOnSourceImageDataUrl(null);
      resolve({ ok: false, error: "File read error." });
    };
    reader.readAsDataURL(file);
  });
}
