import { BLOCKED_TERMS, normalizeForModeration } from "./blockedTerms";

export type TextModerationResult =
  | { ok: true }
  | { ok: false; code: "MODERATION_BLOCKED"; term: string };

export function moderateText(text: string | null | undefined): TextModerationResult {
  const raw = text?.trim();
  if (!raw) return { ok: true };

  const normalized = normalizeForModeration(raw);
  const padded = ` ${normalized} `;

  for (const term of BLOCKED_TERMS) {
    if (term.length < 3) continue;
    if (padded.includes(` ${term} `) || normalized === term) {
      return { ok: false, code: "MODERATION_BLOCKED", term };
    }
  }

  return { ok: true };
}
