/**
 * Build experimental hijab-only references (no production overwrite).
 * Masks central face + softens shoulders; keeps hijab wrap/drape visible.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const PROD_DIR = path.join(ROOT, "public", "media", "catalog", "hijab_styles");
const OUT_DIR = path.join(HERE, "refs", "clean");

const STYLES = [
  "women_hijab_01",
  "women_hijab_02",
  "women_hijab_04",
  "women_hijab_05",
  "women_hijab_08",
];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.join(HERE, "refs", "original"), { recursive: true });

/** SVG mask: white = keep, black = hide (face + lower shirt). */
function buildMaskSvg(w, h) {
  const cx = w * 0.5;
  const cy = h * 0.36;
  const rx = w * 0.22;
  const ry = h * 0.2;
  const shirtY = h * 0.72;
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="black"/>
      <rect x="0" y="${shirtY}" width="${w}" height="${h - shirtY}" fill="black"/>
    </svg>`
  );
}

async function buildCleanRef(styleId) {
  const srcPath = path.join(PROD_DIR, `${styleId}.png`);
  const meta = await sharp(srcPath).metadata();
  const w = meta.width ?? 768;
  const h = meta.height ?? 1024;

  const origCopy = path.join(HERE, "refs", "original", `${styleId}.png`);
  if (!fs.existsSync(origCopy)) fs.copyFileSync(srcPath, origCopy);

  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // Sample hijab color from side strips (avoid center face).
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const channels = info.channels;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (x > info.width * 0.08 && x < info.width * 0.92) continue;
      if (y < info.height * 0.12 || y > info.height * 0.55) continue;
      const i = (y * info.width + x) * channels;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  r = Math.round(r / Math.max(n, 1));
  g = Math.round(g / Math.max(n, 1));
  b = Math.round(b / Math.max(n, 1));

  const maskSvg = buildMaskSvg(w, h);
  const masked = await sharp(srcPath)
    .composite([
      {
        input: await sharp(maskSvg).png().toBuffer(),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const outPath = path.join(OUT_DIR, `${styleId}.png`);
  await sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: { r, g, b },
    },
  })
    .composite([{ input: masked, blend: "over" }])
    .png()
    .toFile(outPath);

  return { styleId, w, h, fill: { r, g, b }, outPath };
}

const summary = [];
for (const id of STYLES) {
  summary.push(await buildCleanRef(id));
}
fs.writeFileSync(
  path.join(HERE, "refs", "clean-manifest.json"),
  JSON.stringify(summary, null, 2)
);
console.log(JSON.stringify(summary, null, 2));
