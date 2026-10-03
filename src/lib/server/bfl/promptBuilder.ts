/**
 * Expands catalog COMMAND strings into FLUX.2 [pro] edit prompts.
 * Keep in sync with scripts/bfl-prompt-builder.mjs (used to regenerate CSV).
 */

export type ParsedStyleCommand = {
  styleRef: string;
  category: string;
  pipeline: string;
  tab?: string;
  region: string;
  action: string;
  raw: string;
};

export type StylePromptRow = {
  style_id: string;
  category_id: string;
  tab_id?: string;
  gender?: string;
  region: string;
  pipeline?: string;
};

const META_KEYS = new Set(["style_ref", "category", "pipeline", "tab", "region"]);

const TAB_GARMENT: Record<string, string> = {
  pakistani: "traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown)",
  indian: "traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown)",
  arabian: "Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown)",
  chinese: "Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown)",
  korean: "Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown)",
  jackets: "jacket or outerwear layer",
  shirts: "shirt or formal blouse",
  tops: "top, tee, or upper garment",
  bottoms: "trousers, pants, or lower garment",
  skirts: "skirt or skater/midi silhouette",
};

const OCCASION_GARMENT: Record<string, string> = {
  casual: "casual daywear outfit",
  formal: "formal occasion outfit with tailored fit",
  wedding: "wedding or festive occasion outfit with ceremonial details",
};

export function parseStyleCommand(promptCommand: string): ParsedStyleCommand | null {
  const trimmed = promptCommand.trim();
  if (!trimmed.startsWith("COMMAND:")) return null;

  const segments = trimmed.slice("COMMAND:".length).trim().split(" | ").map((s) => s.trim());
  const meta: Record<string, string> = {};
  const actionParts: string[] = [];

  for (const seg of segments) {
    const eq = seg.indexOf("=");
    const key = eq > 0 ? seg.slice(0, eq).trim() : "";
    if (key && META_KEYS.has(key)) {
      meta[key] = seg.slice(eq + 1).trim();
    } else if (seg.length > 0) {
      actionParts.push(seg);
    }
  }

  const styleRef = meta.style_ref;
  const category = meta.category;
  const region = meta.region;
  if (!styleRef || !category || !region) return null;

  return {
    styleRef,
    category,
    pipeline: meta.pipeline ?? "neutral",
    tab: meta.tab,
    region,
    action: actionParts.join(" | ").trim(),
    raw: trimmed,
  };
}

function genderSubject(pipeline: string): string {
  if (pipeline === "women") return "woman";
  if (pipeline === "men") return "man";
  return "person";
}

function genderPossessive(pipeline: string): string {
  if (pipeline === "women") return "woman's";
  if (pipeline === "men") return "man's";
  return "person's";
}

function describeGarment(row: StylePromptRow): string {
  const tab = row.tab_id;
  if (row.category_id === "wardrobe_browse" && tab && TAB_GARMENT[tab]) {
    return `the exact ${TAB_GARMENT[tab]}`;
  }
  if (row.category_id === "occasions" && tab && OCCASION_GARMENT[tab]) {
    return `the exact ${OCCASION_GARMENT[tab]}`;
  }
  if (row.category_id === "couple_duo") {
    return "the exact coordinated couple/duo outfit ensemble";
  }
  if (row.category_id === "presets") {
    return "the exact preset fashion look";
  }
  if (row.category_id === "virtual_try_on") {
    return "the exact full outfit ensemble for virtual try-on";
  }
  if (row.category_id === "outfit_change") {
    return "the exact replacement outfit";
  }
  return "the exact outfit";
}

function styleIndex(styleId: string): string {
  const m = styleId.match(/_(\d+)$/);
  return m ? m[1] : "";
}

export function buildStyleAction(row: StylePromptRow): string {
  const pipeline = row.pipeline ?? row.gender ?? "neutral";
  const who = genderSubject(pipeline);
  const ref = row.style_id;
  const idx = styleIndex(ref);
  const garment = describeGarment(row);

  switch (row.region) {
    case "beard":
      return `Edit image 1: replace ONLY the ${who}'s facial hair and beard with the exact beard style from image 2 (style ${ref}). Match outline, length, density, fade, and color from image 2. Keep scalp hair, eyebrows, ears, skin texture, neck, clothing, pose, and background identical to image 1.`;
    case "hair_color":
      return `Edit image 1: recolor ONLY the ${who}'s hair to the exact shade, highlights, and tone from image 2 (style ${ref}). Preserve hairstyle shape, parting, face, makeup, skin, clothing, pose, and background from image 1.`;
    case "hair_style":
      return `Edit image 1: change ONLY the ${who}'s haircut shape, length, layers, and volume to match image 2 (style ${ref}). Do not change hair color, face, clothing, pose, or background from image 1.`;
    case "hijab":
      return `Edit image 1: change ONLY the woman's hijab/headscarf to match image 2 (style ${ref}) — fabric, fold, drape, color, and coverage. Do not alter face, eyes, makeup, neck jewelry, body, clothing below the scarf, pose, or background.`;
    default:
      break;
  }

  if (row.category_id === "couple_duo") {
    return `The person of image 1, maintaining exactly their face, identity, and pose, wearing ${garment} from image 2 (style ${ref}). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.`;
  }

  if (row.category_id === "occasions" && row.tab_id) {
    return `The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing ${garment} from image 2 (style ${ref}, look #${idx || "?"}). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.`;
  }

  if (row.category_id === "presets") {
    return `The person of image 1, maintaining exactly their face, identity, and pose, wearing ${garment} from image 2 (preset ${ref}). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.`;
  }

  if (row.category_id === "virtual_try_on" || row.category_id === "outfit_change") {
    return `The person of image 1, maintaining exactly their face, identity, and pose, wearing ${garment} from image 2 (style ${ref}). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.`;
  }

  if (row.category_id === "wardrobe_browse") {
    const g = genderPossessive(pipeline);
    const tabLabel = (row.tab_id ?? "wardrobe").replace(/_/g, " ");
    return `The person of image 1, maintaining exactly their face, identity, and pose, wearing ${garment} from image 2 (${g} ${tabLabel} catalog ${ref}, slot ${idx || "?"}). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.`;
  }

  return `The person of image 1, maintaining exactly their face, identity, and pose, wearing ${garment} from image 2 (style ${ref}). Match all visible clothing details exactly.`;
}

export function formatCommandLine(row: StylePromptRow & { pipeline: string }): string {
  const parts = [
    `COMMAND: style_ref=${row.style_id}`,
    `category=${row.category_id}`,
    `pipeline=${row.pipeline}`,
  ];
  if (row.tab_id) parts.push(`tab=${row.tab_id}`);
  parts.push(`region=${row.region}`);
  parts.push(buildStyleAction(row));
  return parts.join(" | ");
}

const IDENTITY_LOCK =
  "TRY-ON EDIT. Photorealistic. Image 1 is the person photo — preserve identity, face, skin tone, body proportions, hands, fingers, pose, camera angle, lighting, shadows, and background.";

const REFERENCE_RULE =
  "Image 2 is the style reference — use it as the single source of truth for the target region or outfit details being transferred.";

const NEGATIVE =
  "Do not add text, watermarks, logos, extra people, duplicated limbs, blur, or cartoon styling.";

function regionEditBlock(region: string, hasReference: boolean): string {
  if (!hasReference) {
    return "Apply the instruction to image 1 only.";
  }
  switch (region) {
    case "beard":
      return "Transfer beard/facial-hair attributes from image 2 only; leave scalp hair, brows, and outfit unchanged.";
    case "hair_color":
      return "Transfer hair color from image 2 only; keep haircut geometry from image 1.";
    case "hair_style":
      return "Transfer haircut geometry from image 2 only; keep hair color from image 1.";
    case "hijab":
      return "Transfer hijab wrap and fabric from image 2 only; keep face and below-neck outfit unchanged.";
    default:
      return REFERENCE_RULE;
  }
}

export function buildFluxPrompt(
  promptCommand: string,
  opts?: { hasReferenceStyle?: boolean }
): string {
  const hasReference = opts?.hasReferenceStyle !== false;
  const parsed = parseStyleCommand(promptCommand);

  if (!parsed) {
    const fallback = promptCommand.trim();
    if (!fallback) return `${IDENTITY_LOCK} ${NEGATIVE}`;
    return `${IDENTITY_LOCK} ${fallback} ${NEGATIVE}`;
  }

  const edit = regionEditBlock(parsed.region, hasReference);
  const action =
    parsed.action ||
    buildStyleAction({
      style_id: parsed.styleRef,
      category_id: parsed.category,
      tab_id: parsed.tab,
      gender: parsed.pipeline === "men" || parsed.pipeline === "women" ? parsed.pipeline : undefined,
      pipeline: parsed.pipeline,
      region: parsed.region,
    });

  return `${IDENTITY_LOCK} ${edit} ${action} ${NEGATIVE}`;
}
