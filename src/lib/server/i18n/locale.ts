const DEFAULT_LOCALE = "en";

/** BCP-47-ish tag → base language code used in Mongo maps. */
export function normalizeLocale(input: string | null | undefined): string {
  if (!input?.trim()) return DEFAULT_LOCALE;
  const tag = input.trim().split(",")[0]?.split(";")[0]?.trim() ?? "";
  const primary = tag.split("-")[0]?.toLowerCase() ?? DEFAULT_LOCALE;
  return primary || DEFAULT_LOCALE;
}

/**
 * Resolve locale for content APIs (professional default):
 * 1) ?locale= query (debug / share links)
 * 2) X-App-Locale header (explicit app choice)
 * 3) Accept-Language (HTTP standard)
 * 4) en
 */
export function resolveLocale(req: Request): string {
  const url = new URL(req.url);
  const query = url.searchParams.get("locale");
  if (query) return normalizeLocale(query);

  const appLocale = req.headers.get("x-app-locale");
  if (appLocale) return normalizeLocale(appLocale);

  const accept = req.headers.get("accept-language");
  if (accept) return normalizeLocale(accept);

  return DEFAULT_LOCALE;
}

export function defaultSourceLocale(): string {
  return process.env.DEFAULT_SOURCE_LOCALE?.trim() || DEFAULT_LOCALE;
}
