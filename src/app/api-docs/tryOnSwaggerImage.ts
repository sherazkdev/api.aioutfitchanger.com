/** Shared state between upload panel and Swagger requestInterceptor (client-only). */
let sourceImageDataUrl: string | null = null;

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
