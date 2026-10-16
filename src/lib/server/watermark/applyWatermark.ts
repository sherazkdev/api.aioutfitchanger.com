import sharp from "sharp";
import { buildWatermarkBadgeSvg } from "./badgeSvg";

const OVERSAMPLE = 3;

/**
 * Post-process AI try-on result: bottom-right pill overlay (does not resize canvas).
 * Badge SVG is rasterized at 3x then downscaled so letters stay crisp.
 */
export async function applyAiResultWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const base = sharp(imageBuffer, { failOn: "none" });
  const meta = await base.metadata();
  const width = meta.width ?? 768;
  const height = meta.height ?? 1024;

  const scale = width / 1080;
  const svg = buildWatermarkBadgeSvg(scale);
  const hiRes = await sharp(Buffer.from(svg), { density: 72 * OVERSAMPLE })
    .png()
    .toBuffer();
  const hiMeta = await sharp(hiRes).metadata();
  const targetW = Math.max(1, Math.round((hiMeta.width ?? OVERSAMPLE) / OVERSAMPLE));
  const badge = await sharp(hiRes)
    .resize({ width: targetW, kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  const badgeMeta = await sharp(badge).metadata();
  const badgeW = badgeMeta.width ?? 280;
  const badgeH = badgeMeta.height ?? 44;

  const margin = Math.max(14, Math.round(Math.min(width, height) * 0.03));
  const left = Math.max(0, width - badgeW - margin);
  const top = Math.max(0, height - badgeH - margin);

  const format = meta.format;
  const pipeline = base.composite([{ input: badge, left, top }]);

  if (format === "png") {
    return pipeline.png({ compressionLevel: 8 }).toBuffer();
  }
  if (format === "webp") {
    return pipeline.webp({ quality: 92 }).toBuffer();
  }
  return pipeline.jpeg({ quality: 93, mozjpeg: true }).toBuffer();
}
