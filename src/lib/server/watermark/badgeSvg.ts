/**
 * Production HUD watermark pill.
 *
 * Sharp rasterizes SVG via librsvg, which collapses tspan whitespace and
 * ignores letter-spacing. Each glyph is therefore placed at an explicit x
 * so "AI Generated · Outfit Changer" stays evenly spaced.
 */

export const WATERMARK_LEAD = "AI Generated";
export const WATERMARK_DOT = "·";
export const WATERMARK_BRAND = "Outfit Changer";
export const WATERMARK_LABEL = `${WATERMARK_LEAD} ${WATERMARK_DOT} ${WATERMARK_BRAND}`;

/** Arial / Liberation Sans advance widths (em). Unknown glyphs use 0.56. */
const GLYPH_ADVANCE: Record<string, number> = {
  " ": 0.3,
  "·": 0.34,
  "•": 0.42,
  A: 0.667,
  C: 0.722,
  G: 0.778,
  I: 0.278,
  O: 0.778,
  a: 0.556,
  d: 0.556,
  e: 0.556,
  f: 0.333,
  g: 0.556,
  h: 0.556,
  i: 0.278,
  n: 0.556,
  r: 0.389,
  t: 0.333,
  u: 0.556,
};

const FONT_STACK = "Arial,Helvetica,'Liberation Sans','DejaVu Sans',sans-serif";

type PlacedGlyph = {
  ch: string;
  x: number;
  weight: number;
  fill: string;
};

function clampScale(scale: number): number {
  return Math.max(0.55, Math.min(1.35, scale));
}

function escapeXml(ch: string): string {
  if (ch === "&") return "&amp;";
  if (ch === "<") return "&lt;";
  if (ch === ">") return "&gt;";
  return ch;
}

function advanceEm(ch: string): number {
  return GLYPH_ADVANCE[ch] ?? 0.56;
}

function layoutLine(
  fontSize: number,
  trackingEm: number
): { glyphs: PlacedGlyph[]; width: number } {
  const segments: { text: string; weight: number; fill: string }[] = [
    { text: WATERMARK_LEAD, weight: 500, fill: "#F8FAFC" },
    { text: ` ${WATERMARK_DOT} `, weight: 500, fill: "rgba(248,250,252,0.72)" },
    { text: WATERMARK_BRAND, weight: 700, fill: "#FFFFFF" },
  ];

  const glyphs: PlacedGlyph[] = [];
  let x = 0;
  for (const seg of segments) {
    for (const ch of seg.text) {
      if (ch !== " ") {
        glyphs.push({ ch, x, weight: seg.weight, fill: seg.fill });
      }
      x += advanceEm(ch) * fontSize;
      if (ch !== " ") x += trackingEm * fontSize;
    }
  }
  return { glyphs, width: x };
}

function sparkleGroup(cx: number, cy: number, size: number): string {
  const outer = size * 0.48;
  const inner = size * 0.15;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(`${(cx + Math.cos(ang) * r).toFixed(2)} ${(cy + Math.sin(ang) * r).toFixed(2)}`);
  }
  const mini = size * 0.22;
  const mx = cx + size * 0.38;
  const my = cy - size * 0.32;
  return `
    <g fill="#FFFFFF">
      <path d="M${pts[0]} ${pts.slice(1).map((p) => `L${p}`).join(" ")} Z"/>
      <path d="M${mx} ${my - mini} L${mx + mini * 0.28} ${my} L${mx} ${my + mini} L${mx - mini * 0.28} ${my} Z" opacity="0.9"/>
    </g>`;
}

export function buildWatermarkBadgeSvg(scale: number): string {
  const s = clampScale(scale);
  const pillH = Math.round(40 * s);
  const radius = Math.round(pillH / 2);
  const fontSize = Math.max(11, Math.round(15 * s));
  const iconSize = Math.max(10, Math.round(13 * s));
  const padLeft = Math.round(13 * s);
  const padRight = Math.round(15 * s);
  const gap = Math.round(8 * s);
  const trackingEm = 0.04;
  const canvasPad = Math.max(3, Math.round(5 * s));

  const { glyphs, width: textW } = layoutLine(fontSize, trackingEm);
  const pillW = Math.ceil(padLeft + iconSize + gap + textW + padRight);
  const canvasW = pillW + canvasPad * 2;
  const canvasH = pillH + canvasPad * 2;

  const pillX = canvasPad;
  const pillY = canvasPad;
  const iconCx = pillX + padLeft + iconSize / 2;
  const iconCy = pillY + pillH / 2;
  const textX0 = pillX + padLeft + iconSize + gap;
  const baseline = pillY + pillH / 2 + fontSize * 0.34;
  const strokeW = Math.max(0.75, Math.round(s * 10) / 10);

  const tspans = glyphs
    .map(
      (g) =>
        `<tspan x="${(textX0 + g.x).toFixed(2)}" y="${baseline.toFixed(2)}" font-weight="${g.weight}" fill="${g.fill}">${escapeXml(g.ch)}</tspan>`
    )
    .join("");

  return `<svg width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
  <!-- ${WATERMARK_LABEL} -->
  <defs>
    <linearGradient id="wmPill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2C3545" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#121826" stop-opacity="0.84"/>
    </linearGradient>
  </defs>
  <rect x="${pillX + 0.5}" y="${pillY + 1.25}" width="${pillW}" height="${pillH}" rx="${radius}" fill="rgba(0,0,0,0.22)"/>
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${radius}" fill="url(#wmPill)" stroke="rgba(255,255,255,0.22)" stroke-width="${strokeW}"/>
  ${sparkleGroup(iconCx, iconCy, iconSize)}
  <text font-family="${FONT_STACK}" font-size="${fontSize}" text-rendering="geometricPrecision">${tspans}</text>
</svg>`;
}
