export type BadgeVariantId = "current" | "a" | "b" | "c";

export type BadgeMetrics = {
  variant: BadgeVariantId;
  label: string;
  atScale1: {
    heightPx: number;
    radiusPx: number;
    fontSizePx: number;
    iconSizePx: number;
    padLeftPx: number;
    padRightPx: number;
    iconTextGapPx: number;
    pillWidthPx: number;
    background: string;
    textWeight: string;
    marginPercent: string;
    shadow: string;
  };
};

export type VariantStyle = {
  id: BadgeVariantId;
  label: string;
  baseHeight: number;
  fontSize: number;
  iconSize: number;
  padLeft: number;
  padRight: number;
  gap: number;
  fill: string;
  shadow?: string;
  weightLead: number;
  weightBrand: number;
};

export const VARIANT_STYLES: Record<BadgeVariantId, VariantStyle> = {
  current: {
    id: "current",
    label: "Current (production)",
    baseHeight: 44,
    fontSize: 15,
    iconSize: 16,
    padLeft: 14,
    padRight: 16,
    gap: 8,
    fill: "rgba(15,23,42,0.78)",
    weightLead: 600,
    weightBrand: 600,
  },
  a: {
    id: "a",
    label: "Variant A — compact",
    baseHeight: 38,
    fontSize: 14,
    iconSize: 14,
    padLeft: 11,
    padRight: 12,
    gap: 6,
    fill: "rgba(15,23,42,0.76)",
    weightLead: 500,
    weightBrand: 600,
  },
  b: {
    id: "b",
    label: "Variant B — lighter premium",
    baseHeight: 40,
    fontSize: 14,
    iconSize: 14,
    padLeft: 12,
    padRight: 13,
    gap: 7,
    fill: "rgba(30,41,59,0.74)",
    shadow: "0 1px 3px rgba(0,0,0,0.12)",
    weightLead: 500,
    weightBrand: 600,
  },
  c: {
    id: "c",
    label: "Variant C — minimal subtle",
    baseHeight: 36,
    fontSize: 13,
    iconSize: 13,
    padLeft: 10,
    padRight: 11,
    gap: 5,
    fill: "rgba(15,23,42,0.70)",
    weightLead: 500,
    weightBrand: 550,
  },
};

function clampScale(scale: number): number {
  return Math.max(0.55, Math.min(1.35, scale));
}

export function buildVariantBadgeSvg(variant: BadgeVariantId, imageWidth: number): string {
  const v = VARIANT_STYLES[variant];
  const s = clampScale(imageWidth / 1080);
  const height = Math.round(v.baseHeight * s);
  const radius = Math.round(height / 2);
  const fontSize = Math.round(v.fontSize * s);
  const iconSize = Math.round(v.iconSize * s);
  const padLeft = Math.round(v.padLeft * s);
  const gap = Math.round(v.gap * s);
  const padRight = Math.round(v.padRight * s);
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

  const shadowDef = v.shadow
    ? `<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.12"/></filter>`
    : "";

  const shadowAttr = v.shadow ? ` filter="url(#soft)"` : "";

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${shadowDef ? `<defs>${shadowDef}</defs>` : ""}
  <g${shadowAttr}>
    <rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="${v.fill}"/>
    ${sparkle}
    <text x="${textX}" y="${cy + fontSize * 0.35}" fill="#ffffff" font-family="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="${fontSize}" letter-spacing="0.02em">
      <tspan font-weight="${v.weightLead}">${lead}</tspan><tspan font-weight="${v.weightBrand}">${brand}</tspan>
    </text>
  </g>
</svg>`;
}

export function metricsForVariant(variant: BadgeVariantId): BadgeMetrics {
  const v = VARIANT_STYLES[variant];
  const s = 1;
  const height = Math.round(v.baseHeight * s);
  const fontSize = Math.round(v.fontSize * s);
  const iconSize = Math.round(v.iconSize * s);
  const padLeft = Math.round(v.padLeft * s);
  const gap = Math.round(v.gap * s);
  const padRight = Math.round(v.padRight * s);
  const textX = padLeft + iconSize + gap;
  const lead = "AI Generated • ";
  const brand = "Outfit Changer";
  const approxTextWidth = Math.round(
    lead.length * (fontSize * 0.48) + brand.length * (fontSize * 0.52)
  );
  const width = textX + approxTextWidth + padRight;

  return {
    variant,
    label: v.label,
    atScale1: {
      heightPx: height,
      radiusPx: Math.round(height / 2),
      fontSizePx: fontSize,
      iconSizePx: iconSize,
      padLeftPx: padLeft,
      padRightPx: padRight,
      iconTextGapPx: gap,
      pillWidthPx: width,
      background: v.fill,
      textWeight: `${v.weightLead} / ${v.weightBrand} (lead / brand)`,
      marginPercent: "2.8% of min(w,h), min 12px (production)",
      shadow: v.shadow ?? "none",
    },
  };
}

export function marginForImage(width: number, height: number): number {
  return Math.max(12, Math.round(Math.min(width, height) * 0.029));
}
