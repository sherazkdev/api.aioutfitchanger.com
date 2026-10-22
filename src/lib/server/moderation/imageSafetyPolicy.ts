import type { ImageSafetyCategories, ImageSafetyResult, SafetyLikelihood } from "./imageSafetyTypes";

const RANK: Record<SafetyLikelihood, number> = {
  UNKNOWN: 0,
  VERY_UNLIKELY: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  VERY_LIKELY: 5,
};

function atLeast(actual: SafetyLikelihood, threshold: SafetyLikelihood): boolean {
  return RANK[actual] >= RANK[threshold];
}

/**
 * Conservative production SafeSearch policy.
 * Block: adult ≥ LIKELY, racy ≥ VERY_LIKELY, violence ≥ VERY_LIKELY.
 * medical / spoof are ignored.
 */
export function applyImageSafetyPolicy(categories: ImageSafetyCategories): ImageSafetyResult {
  if (atLeast(categories.adult, "LIKELY")) {
    return { allowed: false, reason: "adult", categories };
  }
  if (atLeast(categories.racy, "VERY_LIKELY")) {
    return { allowed: false, reason: "racy", categories };
  }
  if (atLeast(categories.violence, "VERY_LIKELY")) {
    return { allowed: false, reason: "violence", categories };
  }
  return { allowed: true, categories };
}

export function normalizeLikelihood(raw: string | number | null | undefined): SafetyLikelihood {
  if (typeof raw === "number") {
    // Google enum: UNKNOWN=0 … VERY_LIKELY=5
    const map: SafetyLikelihood[] = [
      "UNKNOWN",
      "VERY_UNLIKELY",
      "UNLIKELY",
      "POSSIBLE",
      "LIKELY",
      "VERY_LIKELY",
    ];
    return map[raw] ?? "UNKNOWN";
  }
  const s = String(raw ?? "UNKNOWN").toUpperCase().replace(/^LIKELIHOOD_/, "");
  if (
    s === "UNKNOWN" ||
    s === "VERY_UNLIKELY" ||
    s === "UNLIKELY" ||
    s === "POSSIBLE" ||
    s === "LIKELY" ||
    s === "VERY_LIKELY"
  ) {
    return s;
  }
  return "UNKNOWN";
}
