import type { CatalogCategoryDoc } from "../models/CatalogCategory";

export type CatalogTabInput = {
  id: string;
  title_key?: string;
  title?: string;
};

export function normalizeCatalogTabId(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function validateCatalogTabInputs(tabs: CatalogTabInput[]): string | null {
  if (!tabs.length) return null;
  const seen = new Set<string>();
  for (const t of tabs) {
    const id = normalizeCatalogTabId(t.id);
    if (!id) return "Each tab needs a valid tab ID (letters, numbers, underscores)";
    if (seen.has(id)) return `Duplicate tab ID: ${id}`;
    seen.add(id);
  }
  return null;
}

type ExistingTab = NonNullable<CatalogCategoryDoc["tabs"]>[number];

export function buildCatalogTabDocuments(
  inputs: CatalogTabInput[],
  existing: ExistingTab[] = []
): ExistingTab[] {
  const byId = new Map(existing.map((t) => [t.id, t]));
  return inputs.map((input) => {
    const id = normalizeCatalogTabId(input.id);
    const prev = byId.get(id);
    const titleKey = input.title_key?.trim() || prev?.titleKey || `tab_${id}`;
    const titles = new Map<string, string>();
    const prevTitles = prev?.titles;
    if (prevTitles) {
      if (prevTitles instanceof Map) {
        for (const [k, v] of prevTitles.entries()) titles.set(k, v);
      } else if (typeof prevTitles === "object") {
        for (const [k, v] of Object.entries(prevTitles as Record<string, string>)) {
          if (v) titles.set(k, v);
        }
      }
    }
    const en = input.title?.trim();
    if (en) titles.set("en", en);
    else if (!titles.has("en")) titles.set("en", id.replace(/_/g, " "));
    return { id, titleKey, titles } as ExistingTab;
  });
}

export function detachRemovedTabIdsFromItems(
  items: CatalogCategoryDoc["items"] | undefined,
  newTabIds: Set<string>
): void {
  for (const item of items ?? []) {
    if (item.tabId && !newTabIds.has(item.tabId)) {
      item.tabId = undefined;
    }
  }
}

export function applyCatalogTabsToCategory(
  cat: { tabs?: ExistingTab[]; items?: CatalogCategoryDoc["items"] },
  tabInputs: CatalogTabInput[] | undefined
): string | null {
  if (tabInputs === undefined) return null;
  const err = validateCatalogTabInputs(tabInputs);
  if (err) return err;
  const built = buildCatalogTabDocuments(tabInputs, cat.tabs ?? []);
  const newIds = new Set(built.map((t) => t.id).filter((id): id is string => Boolean(id)));
  detachRemovedTabIdsFromItems(cat.items, newIds);
  cat.tabs = built;
  return null;
}
