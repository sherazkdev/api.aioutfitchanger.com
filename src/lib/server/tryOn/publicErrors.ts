/** Client-safe try-on failure text (no provider paths or env hints). */
export function publicTryOnFailureMessage(internal: string): string {
  const m = internal.trim();
  if (!m) return "Generation failed. Please try again.";
  if (m === "MODERATION_BLOCKED" || m.toLowerCase().includes("moderation")) {
    return "This result could not be generated because it was blocked by content moderation.";
  }
  if (
    m.startsWith("BFL_") ||
    m.startsWith("BYTEPLUS_") ||
    m.includes("api.bfl") ||
    m === "BFL_NOT_CONFIGURED" ||
    m === "BYTEPLUS_NOT_CONFIGURED"
  ) {
    return "Generation failed. Please try again.";
  }
  if (m.startsWith("PERSON_") || m.startsWith("GARMENT_")) {
    return "Invalid image. Please choose another photo.";
  }
  if (m.includes("COUPLE_PERSON_GENDER_REQUIRED")) {
    return "Person gender is required for this style.";
  }
  if (m.includes("GARMENT_NOT_FOUND") || m.includes("GARMENT_FILE_MISSING")) {
    return "Garment reference could not be loaded.";
  }
  return "Generation failed. Please try again.";
}
