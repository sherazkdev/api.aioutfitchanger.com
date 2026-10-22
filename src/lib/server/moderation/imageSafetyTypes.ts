/** Normalized SafeSearch-style likelihood levels (vendor-agnostic). */
export type SafetyLikelihood =
  | "UNKNOWN"
  | "VERY_UNLIKELY"
  | "UNLIKELY"
  | "POSSIBLE"
  | "LIKELY"
  | "VERY_LIKELY";

export type ImageSafetyCategories = {
  adult: SafetyLikelihood;
  racy: SafetyLikelihood;
  violence: SafetyLikelihood;
};

export type ImageSafetyResult = {
  allowed: boolean;
  reason?: string;
  categories: ImageSafetyCategories;
};

export type ImageSafetyProvider = {
  moderate(buffer: Buffer): Promise<ImageSafetyResult>;
};
