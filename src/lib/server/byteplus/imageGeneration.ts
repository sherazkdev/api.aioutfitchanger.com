import type { BytePlusBeautyGenerationInput, BytePlusImageGenerationRequest } from "./types";

/** Person = image[0], style/reference = image[1] (same semantics as BFL input_image / input_image_2). */
export function buildBytePlusBeautyRequest(
  input: BytePlusBeautyGenerationInput,
  model: string
): BytePlusImageGenerationRequest {
  const images: string[] = [input.personDataUrl];
  if (input.referenceDataUrl) {
    images.push(input.referenceDataUrl);
  }

  const width = input.width ?? 768;
  const height = input.height ?? 1024;
  const size = formatBytePlusSize(width, height);

  const req: BytePlusImageGenerationRequest = {
    model,
    prompt: input.prompt,
    image: images.length === 1 ? images[0] : images,
    size,
    output_format: "jpeg",
    response_format: "url",
    watermark: false,
  };

  return req;
}

/** ModelArk requires at least 921600 pixels (e.g. 960×960). */
export const BYTEPLUS_MIN_PIXELS = 921_600;
const BYTEPLUS_DIM_GRID = 16;
const BYTEPLUS_MIN_SIDE = 512;
const BYTEPLUS_MAX_SIDE = 4096;

function snapUpToGrid(value: number, grid: number): number {
  return Math.ceil(value / grid) * grid;
}

function clampSide(n: number): number {
  return Math.min(BYTEPLUS_MAX_SIDE, Math.max(BYTEPLUS_MIN_SIDE, n));
}

/**
 * BytePlus output size: min area, 16px grid, sides in [512, 4096], aspect ratio ~source.
 * Scales uniformly from source aspect ratio (does not stretch one axis only).
 */
export function formatBytePlusSize(width: number, height: number): string {
  const srcW = Math.max(1, width);
  const srcH = Math.max(1, height);
  const aspect = srcW / srcH;

  let w: number;
  let h: number;

  if (srcW * srcH >= BYTEPLUS_MIN_PIXELS) {
    w = srcW;
    h = srcH;
  } else {
    // Smallest uniform scale meeting min area at source aspect ratio.
    h = Math.sqrt(BYTEPLUS_MIN_PIXELS / aspect);
    w = h * aspect;
  }

  w = clampSide(snapUpToGrid(w, BYTEPLUS_DIM_GRID));
  h = clampSide(snapUpToGrid(w / aspect, BYTEPLUS_DIM_GRID));

  while (w * h < BYTEPLUS_MIN_PIXELS) {
    const nextW = clampSide(w + BYTEPLUS_DIM_GRID);
    if (nextW === w) {
      h = clampSide(h + BYTEPLUS_DIM_GRID);
    } else {
      w = nextW;
      h = clampSide(snapUpToGrid(w / aspect, BYTEPLUS_DIM_GRID));
    }
    if (w >= BYTEPLUS_MAX_SIDE && h >= BYTEPLUS_MAX_SIDE) break;
  }

  return `${w}x${h}`;
}

export function parseBytePlusSize(size: string): { width: number; height: number } {
  const [w, h] = size.split("x").map(Number);
  return { width: w, height: h };
}

/** Percent difference between source and output aspect ratios (width/height). */
export function bytePlusAspectRatioDriftPercent(
  sourceWidth: number,
  sourceHeight: number,
  size: string
): number {
  const srcAspect = sourceWidth / sourceHeight;
  const { width, height } = parseBytePlusSize(size);
  const outAspect = width / height;
  return (Math.abs(outAspect - srcAspect) / srcAspect) * 100;
}

export function extractBytePlusResultUrl(response: {
  data?: Array<{ url?: string; b64_json?: string }>;
}): string | null {
  const first = response.data?.[0];
  if (!first) return null;
  if (typeof first.url === "string" && first.url.length > 0) return first.url;
  if (typeof first.b64_json === "string" && first.b64_json.length > 0) {
    return `data:image/jpeg;base64,${first.b64_json}`;
  }
  return null;
}
