import { EN_LABELS } from "./enLabels";

export type LocalizedMap = Record<string, string> | Map<string, string> | undefined;

export function toRecord(map: LocalizedMap): Record<string, string> {
  if (!map) return {};
  if (map instanceof Map) return Object.fromEntries(map.entries());
  return map;
}

export function readLocalized(
  map: LocalizedMap,
  locale: string,
  fallbackKey?: string,
  legacyPlain?: string
): string {
  const safeLocale = typeof locale === "string" && locale.trim() ? locale : "en";
  const rec = toRecord(map);
  const base = safeLocale.split("-")[0]?.toLowerCase() ?? "en";

  if (rec[safeLocale]) return rec[safeLocale];
  if (rec[base]) return rec[base];
  if (rec.en) return rec.en;
  if (legacyPlain) return legacyPlain;
  if (fallbackKey && EN_LABELS[fallbackKey]) return EN_LABELS[fallbackKey];
  return fallbackKey ?? "";
}

export function mergeLocalized(
  existing: LocalizedMap,
  locale: string,
  value: string
): Record<string, string> {
  const rec = { ...toRecord(existing) };
  rec[locale] = value;
  return rec;
}
