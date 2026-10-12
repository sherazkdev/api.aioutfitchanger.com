import sharp from "sharp";
import { buildWatermarkBadgeSvg } from "./badgeSvg";

/**
 * Post-process AI try-on result: bottom-right pill overlay (does not resize canvas).
 */
export async function applyAiResultWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const base = sharp(imageBuffer, { failOn: "none" });
  const meta = await base.metadata();
  const width = meta.width ?? 768;
  const height = meta.height ?? 1024;

  const scale = width / 1080;
  const svg = buildWatermarkBadgeSvg(scale);
  const badge = await sharp(Buffer.from(svg)).png().toBuffer();
  const badgeMeta = await sharp(badge).metadata();
  const badgeW = badgeMeta.width ?? 280;
  const badgeH = badgeMeta.height ?? 44;

  const margin = Math.max(12, Math.round(Math.min(width, height) * 0.028));
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
  return pipeline.jpeg({ quality: 92, mozjpeg: true }).toBuffer();
}
