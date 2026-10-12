import type { NormalizedImageInput } from "../bfl/normalizeImageInput";
import { moderateImageInput } from "./moderateImage";
import { moderateText } from "./moderateText";

export type TryOnModerationFailure = {
  httpStatus: 422;
  code: "MODERATION_BLOCKED" | "VALIDATION";
  message: string;
};

export function moderateTryOnRequest(params: {
  promptTexts: (string | null | undefined)[];
  person: NormalizedImageInput;
  garment?: NormalizedImageInput | null;
}): TryOnModerationFailure | null {
  for (const text of params.promptTexts) {
    const t = moderateText(text);
    if (!t.ok) {
      return {
        httpStatus: 422,
        code: "MODERATION_BLOCKED",
        message: "This request is not allowed under our content policy.",
      };
    }
  }

  const personCheck = moderateImageInput(params.person, "PERSON");
  if (!personCheck.ok) {
    return {
      httpStatus: personCheck.code === "MODERATION_BLOCKED" ? 422 : 422,
      code: personCheck.code,
      message: personCheck.message,
    };
  }

  if (params.garment) {
    const garmentCheck = moderateImageInput(params.garment, "GARMENT");
    if (!garmentCheck.ok) {
      return {
        httpStatus: 422,
        code: garmentCheck.code,
        message: garmentCheck.message,
      };
    }
  }

  return null;
}

export function isProviderModerationFailure(message: string | null | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("request moderated") || m.includes("moderation") || m === "moderation_blocked";
}

export const MODERATION_USER_MESSAGE =
  "This result could not be generated because it was blocked by content moderation.";
