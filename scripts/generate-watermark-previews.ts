import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { applyAiResultWatermark } from "../src/lib/server/watermark/applyWatermark";
import {
  buildVariantBadgeSvg,
  metricsForVariant,
  marginForImage,
  type BadgeVariantId,
} from "./lib/watermark-preview-variants";

const OUT = path.join(process.cwd(), "artifacts", "watermark-preview");

async function gradientCanvas(width: number, height: number): Promise<Buffer> {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d4dce8"/>
        <stop offset="55%" stop-color="#b8c4d4"/>
        <stop offset="100%" stop-color="#9aa8bc"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer();
}

async function applyVariant(
  base: Buffer,
  variant: BadgeVariantId,
  width: number,
  height: number
): Promise<Buffer> {
  const svg = buildVariantBadgeSvg(variant, width);
  const badge = await sharp(Buffer.from(svg)).png().toBuffer();
  const meta = await sharp(badge).metadata();
  const badgeW = meta.width ?? 200;
  const badgeH = meta.height ?? 36;
  const margin = marginForImage(width, height);
  const left = Math.max(0, width - badgeW - margin);
  const top = Math.max(0, height - badgeH - margin);
  return sharp(base)
    .composite([{ input: badge, left, top }])
    .jpeg({ quality: 92 })
    .toBuffer();
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const portrait = { width: 832, height: Math.round(832 * (4 / 3)) };

  for (const id of ["a", "b", "c"] as BadgeVariantId[]) {
    const base = await gradientCanvas(portrait.width, portrait.height);
    const out = await applyVariant(base, id, portrait.width, portrait.height);
    await writeFile(path.join(OUT, `variant-${id}.jpg`), out);
  }

  const sizes = [
    { label: "512w-portrait", width: 512, height: 682 },
    { label: "832w-portrait", width: 832, height: 1109 },
    { label: "1080w-portrait", width: 1080, height: 1440 },
    { label: "landscape", width: 1280, height: 720 },
    { label: "square", width: 1024, height: 1024 },
  ];

  const stripParts: Buffer[] = [];
  let stripW = 0;
  const stripH = 400;
  for (const sz of sizes) {
    const base = await gradientCanvas(sz.width, sz.height);
    const out = await applyVariant(base, "a", sz.width, sz.height);
    const resized = await sharp(out).resize({ height: stripH }).toBuffer();
    const m = await sharp(resized).metadata();
    stripParts.push(resized);
    stripW += m.width ?? 0;
  }

  const composites: { input: Buffer; left: number; top: number }[] = [];
  let x = 0;
  for (const part of stripParts) {
    const m = await sharp(part).metadata();
    composites.push({ input: part, left: x, top: 0 });
    x += m.width ?? 0;
  }
  const strip = await sharp({
    create: { width: stripW, height: stripH, channels: 3, background: { r: 240, g: 242, b: 245 } },
  })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toBuffer();
  await writeFile(path.join(OUT, "size-comparison-variant-a.jpg"), strip);

  const metrics = {
    current: metricsForVariant("current"),
    variantA: metricsForVariant("a"),
    variantB: metricsForVariant("b"),
    variantC: metricsForVariant("c"),
  };
  await writeFile(path.join(OUT, "metrics.json"), JSON.stringify(metrics, null, 2));

  const productionFiles: string[] = [];
  for (const sz of sizes) {
    const base = await gradientCanvas(sz.width, sz.height);
    const out = await applyAiResultWatermark(base);
    const name = `production-${sz.label}.jpg`;
    await writeFile(path.join(OUT, name), out);
    productionFiles.push(name);
  }

  console.log(
    JSON.stringify(
      {
        outDir: OUT,
        files: [
          "variant-a.jpg",
          "variant-b.jpg",
          "variant-c.jpg",
          "size-comparison-variant-a.jpg",
          "metrics.json",
          ...productionFiles,
        ],
        metrics,
        productionNote: "production-*.jpg use badgeSvg.ts (A dims + B background)",
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
