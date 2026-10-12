/** Lowercase terms blocked in user-supplied try-on text (audit-aligned; extend as needed). */
export const BLOCKED_TERMS: readonly string[] = [
  "lingerie",
  "underwear",
  "panties",
  "thong",
  "bra",
  "bikini",
  "swimsuit",
  "sheer",
  "topless",
  "nude",
  "nudity",
  "nsfw",
  "porn",
  "porno",
  "xxx",
  "sex",
  "sexual",
  "erotic",
  "fetish",
  "stripper",
  "onlyfans",
];

export function normalizeForModeration(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}
