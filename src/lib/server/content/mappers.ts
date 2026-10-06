import type { CatalogCategoryDoc } from "../models/CatalogCategory";
import type { HomeFeedSectionDoc } from "../models/HomeFeedSection";
import type { WardrobeCategoryDoc } from "../models/WardrobeCategory";
import { readLocalized } from "../i18n/localizedString";

function tabTitle(
  tab: {
    id?: string | null;
    titleKey?: string | null;
    titles?: Map<string, string> | Record<string, string>;
  },
  locale: string
) {
  return readLocalized(tab.titles, locale, tab.titleKey ?? undefined, tab.id ?? undefined);
}

/** App UI often sends short tab ids; CSV/seed use prefixed ids for presets. */
const PRESET_TAB_ALIASES: Record<string, string> = {
  interview: "preset_interview",
  gym: "preset_gym",
  wedding_guest: "preset_wedding_guest",
  wedding: "preset_wedding_guest",
  preset_interview: "preset_interview",
  preset_gym: "preset_gym",
  preset_wedding_guest: "preset_wedding_guest",
};

export function normalizeCatalogTab(categoryId: string, tab?: string) {
  if (!tab || tab === "all") return tab;
  if (categoryId === "presets") {
    const key = tab.toLowerCase();
    if (PRESET_TAB_ALIASES[key]) return PRESET_TAB_ALIASES[key];
    if (key.startsWith("preset_")) return key;
    return `preset_${key}`;
  }
  return tab;
}

export function mapCatalog(
  doc: CatalogCategoryDoc,
  locale: string,
  tab?: string,
  gender?: string
) {
  const resolvedTab = normalizeCatalogTab(doc.categoryId, tab);
  let items = [...(doc.items ?? [])].filter((i) => (i as { enabled?: boolean }).enabled !== false);
  if (resolvedTab) items = items.filter((i) => i.tabId === resolvedTab || resolvedTab === "all");
  const genderScope = doc.genderScope ?? "both";
  if (gender && genderScope === "both") {
    items = items.filter(
      (i) => i.gender === gender || i.genderTabId === gender || i.gender === "both"
    );
  }

  return {
    category_id: doc.categoryId,
    title_key: doc.titleKey,
    title: readLocalized(doc.titleLocalized, locale, doc.titleKey),
    gender_scope: doc.genderScope,
    gender_tabs: (doc.genderTabs ?? []).map((t) => ({
      id: t.id,
      title_key: t.titleKey,
      title: tabTitle(t, locale),
    })),
    tabs: (doc.tabs ?? []).map((t) => ({
      id: t.id,
      title_key: t.titleKey,
      title: tabTitle(t, locale),
    })),
    items: items.map((i) => ({
      id: i.id,
      tab_id: i.tabId,
      gender_tab_id: i.genderTabId,
      image_url: i.imageUrl,
      name: readLocalized(i.nameLocalized, locale, undefined, i.id),
      prompt_command: i.promptCommand,
      sort_order: i.sortOrder,
    })),
  };
}

export function mapHomeFeed(sections: HomeFeedSectionDoc[], locale: string, gender?: string) {
  return {
    sections: sections.map((s) => ({
      id: s.sectionId,
      title_key: s.titleKey,
      title: readLocalized(s.titleLocalized, locale, s.titleKey),
      type: s.type,
      category_id: s.categoryId,
      items: (s.items ?? [])
        .filter((item) => !gender || item.genderScope === "both" || item.genderScope === gender)
        .map((item) => ({
          style_id: item.styleId,
          category_id: item.categoryId,
          thumbnail_url: item.thumbnailUrl,
          label_key: item.labelKey,
          label: readLocalized(
            item.labelLocalized,
            locale,
            item.labelKey ?? undefined,
            item.label ?? undefined
          ),
        })),
    })),
  };
}

export function mapWardrobeCategories(docs: WardrobeCategoryDoc[], locale: string, gender?: string) {
  return {
    categories: docs
      .filter((c) => (c as { enabled?: boolean }).enabled !== false)
      .filter((c) => !gender || c.genderScope === "both" || c.genderScope === gender)
      .map((c) => ({
        id: c.categoryId,
        title_key: c.titleKey,
        title: readLocalized(c.titleLocalized, locale, c.titleKey),
        browse_tab_id: c.browseTabId,
        background_token: c.backgroundToken,
        preview_items: (c.previewItems ?? []).map((p) => ({
          style_id: p.styleId,
          thumbnail_url: p.thumbnailUrl,
          gender: p.gender,
        })),
      })),
  };
}
