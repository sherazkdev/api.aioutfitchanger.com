/**
 * Mirrors production prompt resolution in src/lib/server/bfl/*.ts for audit documentation only.
 * Do not import this from runtime API code.
 */

const OUTFIT_CATEGORY_IDS = new Set([
  "virtual_try_on",
  "outfit_change",
  "wardrobe_browse",
  "occasions",
  "couple_duo",
  "presets",
]);

const META_KEYS = new Set(["style_ref", "category", "pipeline", "tab", "region"]);

export function parseStyleCommand(promptCommand) {
  const trimmed = String(promptCommand ?? "").trim();
  if (!trimmed.startsWith("COMMAND:")) return null;
  const segments = trimmed.slice("COMMAND:".length).trim().split(" | ").map((s) => s.trim());
  const meta = {};
  const actionParts = [];
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

export function shouldUseVtoEngine(promptCommand, categoryId) {
  const raw = String(promptCommand ?? "").trim();
  if (raw.startsWith("COMMAND:")) {
    const parsed = parseStyleCommand(raw);
    if (parsed) return parsed.region === "outfit";
  }
  if (categoryId && OUTFIT_CATEGORY_IDS.has(categoryId)) return true;
  return false;
}

export function buildVtoPrompt(promptCommand, styleId) {
  const parsed = promptCommand ? parseStyleCommand(String(promptCommand).trim()) : null;
  const styleHint = parsed?.styleRef ?? styleId;
  return (
    `TRY-ON: The person of image 1 wearing the garments of image 2. ` +
    `Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. ` +
    `Transfer only the outfit from image 2 (catalog style ${styleHint}). Photorealistic, no text or watermarks.`
  );
}

const IDENTITY_LOCK =
  "TRY-ON EDIT. Photorealistic. Image 1 is the person photo — preserve identity, face, skin tone, body proportions, hands, fingers, pose, camera angle, lighting, shadows, and background.";

const REFERENCE_RULE =
  "Image 2 is the style reference — use it as the single source of truth for the target region or outfit details being transferred.";

const NEGATIVE =
  "Do not add text, watermarks, logos, extra people, duplicated limbs, blur, or cartoon styling.";

function regionEditBlock(region, hasReference) {
  if (!hasReference) return "Apply the instruction to image 1 only.";
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

export function buildFluxPrompt(promptCommand, hasReferenceStyle = true) {
  const hasReference = hasReferenceStyle !== false;
  const parsed = parseStyleCommand(promptCommand);
  if (!parsed) {
    const fallback = String(promptCommand ?? "").trim();
    if (!fallback) return `${IDENTITY_LOCK} ${NEGATIVE}`;
    return `${IDENTITY_LOCK} ${fallback} ${NEGATIVE}`;
  }
  const edit = regionEditBlock(parsed.region, hasReference);
  const action = parsed.action || "";
  return `${IDENTITY_LOCK} ${edit} ${action} ${NEGATIVE}`;
}

export function productionEngineLabel(useVto) {
  return useVto
    ? "BFL Virtual Try-On v2 (`POST /v1/flux-tools/vto-v2` via `bflStartVtoV2`)"
    : "FLUX-2-pro (`POST /v1/flux-2-pro` via `bflStartGeneration`)";
}

export function promptSourceFunction(useVto) {
  return useVto
    ? { file: "src/lib/server/bfl/tryOnEngine.ts", fn: "buildVtoPrompt" }
    : { file: "src/lib/server/bfl/promptBuilder.ts", fn: "buildFluxPrompt (via buildFluxEditPrompt → buildTryOnBflPrompt)" };
}

export function resolveProductionPrompt(storedCommand, styleId, categoryId) {
  const useVto = shouldUseVtoEngine(storedCommand, categoryId);
  const hasRef = true;
  const productionPrompt = useVto
    ? buildVtoPrompt(storedCommand, styleId)
    : buildFluxPrompt(storedCommand, hasRef);
  return { useVto, productionPrompt };
}

/** Template key for grouping (normalize style-specific ids). */
export function promptFamilyKey(productionPrompt, storedCommand, useVto) {
  if (useVto) {
    return "VTO-v2:buildVtoPrompt:{style_ref}";
  }
  return "FLUX:buildFluxPrompt:" + hashStable(storedCommand.trim());
}

function hashStable(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

export function classifyTransformation(row) {
  const { category_id, tab_id, region, gender } = row;
  if (region === "beard") {
    return {
      bucket: "beard",
      intended: "Beard / facial hair style transfer from reference",
      editRegion: "Lower face / jaw / chin facial hair only",
    };
  }
  if (region === "hair_color") {
    return {
      bucket: "hair_color",
      intended: "Hair color recolor from reference swatch/portrait",
      editRegion: "Scalp hair color only",
    };
  }
  if (region === "hair_style") {
    return {
      bucket: "hair_style",
      intended: "Haircut shape/length/volume from reference",
      editRegion: "Scalp hair geometry only",
    };
  }
  if (region === "hijab") {
    return {
      bucket: "hijab",
      intended: "Hijab/headscarf style from reference",
      editRegion: "Head covering / scarf fabric only",
    };
  }

  const tab = tab_id || "";
  if (tab === "tops") {
    return {
      bucket: "upper_body",
      intended: "Upper-body top/tee garment from flat/reference image",
      editRegion: "Torso upper garment (reference typically product/top shot)",
    };
  }
  if (tab === "shirts") {
    return {
      bucket: "upper_body",
      intended: "Shirt / formal blouse garment replacement",
      editRegion: "Torso shirt/blouse",
    };
  }
  if (tab === "bottoms") {
    return {
      bucket: "lower_body",
      intended: "Trousers/pants lower garment replacement",
      editRegion: "Lower body pants/trousers",
    };
  }
  if (tab === "skirts") {
    return {
      bucket: "lower_body",
      intended: "Skirt garment replacement",
      editRegion: "Lower body skirt silhouette",
    };
  }
  if (tab === "jackets") {
    return {
      bucket: "outerwear",
      intended: "Jacket/outerwear layer from reference",
      editRegion: "Outerwear layer over torso",
    };
  }
  if (["chinese", "indian", "arabian", "korean", "pakistani"].includes(tab)) {
    return {
      bucket: "full_outfit",
      intended: "Traditional/regional complete outfit look from reference",
      editRegion: "Full visible outfit ensemble",
    };
  }
  if (category_id === "occasions") {
    return {
      bucket: "full_outfit",
      intended: `Occasion look (${tab || "occasion"}) — coordinated outfit from reference`,
      editRegion: "Full occasion outfit",
    };
  }
  if (category_id === "couple_duo") {
    return {
      bucket: "full_outfit",
      intended: "Coordinated couple/duo outfit styling from reference",
      editRegion: "Full outfit ensemble",
    };
  }
  if (category_id === "presets") {
    return {
      bucket: "full_outfit",
      intended: `AI look preset (${tab || "preset"}) — full styled outfit`,
      editRegion: "Full preset outfit layers",
    };
  }
  if (category_id === "virtual_try_on" || category_id === "outfit_change") {
    return {
      bucket: "full_outfit",
      intended: "Full outfit replacement / virtual try-on ensemble",
      editRegion: "Full outfit on person",
    };
  }
  return {
    bucket: "other",
    intended: "Catalog outfit/edit (unclassified tab)",
    editRegion: "Unspecified — see reference asset",
  };
}

export function assessMismatch(row, classification, useVto, storedCommand) {
  if (!useVto) {
    const b = classification.bucket;
    if (b === "beard" && row.region === "beard") return { flag: "NO", reason: "FLUX beard region lock matches intended edit." };
    if (b === "hair_color" && row.region === "hair_color") return { flag: "NO", reason: "FLUX hair_color region lock matches." };
    if (b === "hair_style" && row.region === "hair_style") return { flag: "NO", reason: "FLUX hair_style region lock matches." };
    if (b === "hijab" && row.region === "hijab") return { flag: "NO", reason: "FLUX hijab region lock matches." };
    return { flag: "NO", reason: "Beauty/localized FLUX path." };
  }

  const singleGarment = ["upper_body", "lower_body", "outerwear"].includes(classification.bucket);
  if (singleGarment) {
    return {
      flag: "YES",
      reason:
        "Reference asset is a single-garment wardrobe tab, but BFL VTO v2 receives only `buildVtoPrompt()` (generic full-outfit transfer). The detailed garment-specific COMMAND text in catalog/DB is not sent to VTO.",
    };
  }
  if (classification.bucket === "full_outfit") {
    return { flag: "NO", reason: "Full-outfit intent aligns with VTO generic outfit transfer prompt." };
  }
  return { flag: "NO", reason: "No obvious mismatch for current engine choice." };
}
