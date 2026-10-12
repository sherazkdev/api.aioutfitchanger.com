/** Renders the approved pill watermark (sparkle + label) at a given scale. */
export function buildWatermarkBadgeSvg(scale: number): string {
  const s = Math.max(0.55, Math.min(1.35, scale));
  const height = Math.round(38 * s);
  const radius = Math.round(height / 2);
  const fontSize = Math.round(14 * s);
  const iconSize = Math.round(14 * s);
  const padLeft = Math.round(11 * s);
  const gap = Math.round(6 * s);
  const padRight = Math.round(12 * s);
  const textX = padLeft + iconSize + gap;
  const lead = "AI Generated • ";
  const brand = "Outfit Changer";
  const approxTextWidth = Math.round(
    lead.length * (fontSize * 0.48) + brand.length * (fontSize * 0.52)
  );
  const width = textX + approxTextWidth + padRight;
  const cy = height / 2;
  const iconCx = padLeft + iconSize / 2;

  const sparkle = `
    <g transform="translate(${iconCx - iconSize / 2}, ${cy - iconSize / 2})" fill="#ffffff" opacity="0.95">
      <path d="M${iconSize * 0.5} ${iconSize * 0.05} L${iconSize * 0.58} ${iconSize * 0.38} L${iconSize * 0.95} ${iconSize * 0.5} L${iconSize * 0.58} ${iconSize * 0.62} L${iconSize * 0.5} ${iconSize * 0.95} L${iconSize * 0.42} ${iconSize * 0.62} L${iconSize * 0.05} ${iconSize * 0.5} L${iconSize * 0.42} ${iconSize * 0.38} Z" />
    </g>`;

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="rgba(30,41,59,0.74)"/>
  ${sparkle}
  <text x="${textX}" y="${cy + fontSize * 0.35}" fill="#ffffff" font-family="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="${fontSize}" letter-spacing="0.02em">
    <tspan font-weight="500">${lead}</tspan><tspan font-weight="600">${brand}</tspan>
  </text>
</svg>`;
}
