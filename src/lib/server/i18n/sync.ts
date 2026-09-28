import { connectMongo } from "../db";
import { AppMetadata } from "../models/AppMetadata";
import { CatalogCategory } from "../models/CatalogCategory";
import { HomeFeedSection } from "../models/HomeFeedSection";
import { OnboardingPage } from "../models/OnboardingPage";
import { WardrobeCategory } from "../models/WardrobeCategory";
import { toRecord, mergeLocalized, readLocalized } from "./localizedString";
import { defaultSourceLocale } from "./locale";
import { getEnabledLocaleCodes } from "./languages";
import { translateToLocales } from "./translate";

type BackfillStats = {
  catalog_categories: number;
  home_sections: number;
  wardrobe_categories: number;
  onboarding_pages: number;
  metadata: number;
  errors: string[];
};

function toMap(rec: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(rec));
}

async function localizeField(
  existing: Record<string, string>,
  sourceText: string,
  locales: string[],
  sourceLocale: string
): Promise<Record<string, string>> {
  const source = sourceLocale.split("-")[0];
  const missing = locales.filter((l) => !existing[l] && l !== source);
  if (!sourceText.trim()) return existing;

  const base = { ...existing, [source]: sourceText };
  if (missing.length === 0) return base;

  const translated = await translateToLocales(sourceText, [...new Set([...missing, source])], sourceLocale);
  return { ...base, ...translated };
}

export async function backfillAllContentTranslations(): Promise<BackfillStats> {
  await connectMongo();
  const locales = await getEnabledLocaleCodes();
  const sourceLocale = defaultSourceLocale();
  const stats: BackfillStats = {
    catalog_categories: 0,
    home_sections: 0,
    wardrobe_categories: 0,
    onboarding_pages: 0,
    metadata: 0,
    errors: [],
  };

  const catalogs = await CatalogCategory.find();
  for (const doc of catalogs) {
    try {
    const enTitle =
      readLocalized(doc.titleLocalized, sourceLocale, doc.titleKey) ||
      doc.titleKey;
    doc.titleLocalized = toMap(
      await localizeField(toRecord(doc.titleLocalized), enTitle, locales, sourceLocale)
    );

    if (doc.genderTabs?.length) {
      for (const tab of doc.genderTabs) {
        const src =
          readLocalized(tab.titles, sourceLocale, tab.titleKey ?? undefined) ||
          tab.titleKey ||
          tab.id ||
          "";
        tab.titles = toMap(await localizeField(toRecord(tab.titles), src, locales, sourceLocale));
      }
    }
    if (doc.tabs?.length) {
      for (const tab of doc.tabs) {
        const src =
          readLocalized(tab.titles, sourceLocale, tab.titleKey ?? undefined) ||
          tab.titleKey ||
          tab.id ||
          "";
        tab.titles = toMap(await localizeField(toRecord(tab.titles), src, locales, sourceLocale));
      }
    }
    if (doc.items?.length) {
      for (const item of doc.items) {
        const src = readLocalized(item.nameLocalized, sourceLocale, undefined, item.id);
        if (src) {
          item.nameLocalized = toMap(
            await localizeField(toRecord(item.nameLocalized), src, locales, sourceLocale)
          );
        }
      }
    }
    await doc.save();
    stats.catalog_categories += 1;
    } catch (e) {
      stats.errors.push(`catalog:${doc.categoryId}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  const sections = await HomeFeedSection.find();
  for (const doc of sections) {
    try {
    const enTitle = readLocalized(doc.titleLocalized, sourceLocale, doc.titleKey) || doc.titleKey;
    doc.titleLocalized = toMap(
      await localizeField(toRecord(doc.titleLocalized), enTitle, locales, sourceLocale)
    );

    if (doc.items?.length) {
      for (const item of doc.items) {
        const src =
          readLocalized(
            item.labelLocalized,
            sourceLocale,
            item.labelKey ?? undefined,
            item.label ?? undefined
          ) ||
          item.label ||
          item.labelKey ||
          "";
        if (src) {
          item.labelLocalized = toMap(
            await localizeField(toRecord(item.labelLocalized), src, locales, sourceLocale)
          );
        }
      }
    }
    await doc.save();
    stats.home_sections += 1;
    } catch (e) {
      stats.errors.push(`home:${doc.sectionId}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  const wardrobes = await WardrobeCategory.find();
  for (const doc of wardrobes) {
    try {
    const enTitle = readLocalized(doc.titleLocalized, sourceLocale, doc.titleKey) || doc.titleKey;
    doc.titleLocalized = toMap(
      await localizeField(toRecord(doc.titleLocalized), enTitle, locales, sourceLocale)
    );
    await doc.save();
    stats.wardrobe_categories += 1;
    } catch (e) {
      stats.errors.push(`wardrobe:${doc.categoryId}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  const pages = await OnboardingPage.find();
  for (const doc of pages) {
    try {
    const titleSrc = readLocalized(doc.titleLocalized, sourceLocale, undefined, doc.title) || doc.title;
    const bodySrc = readLocalized(doc.bodyLocalized, sourceLocale, undefined, doc.body) || doc.body;
    doc.titleLocalized = toMap(
      await localizeField(toRecord(doc.titleLocalized), titleSrc, locales, sourceLocale)
    );
    doc.bodyLocalized = toMap(
      await localizeField(toRecord(doc.bodyLocalized), bodySrc, locales, sourceLocale)
    );
    await doc.save();
    stats.onboarding_pages += 1;
    } catch (e) {
      stats.errors.push(`onboarding:${doc._id}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  const meta = await AppMetadata.findOne({ key: "default" });
  if (meta) {
    try {
    const nameSrc =
      readLocalized(meta.appNameLocalized, sourceLocale, undefined, meta.appName) || meta.appName;
    meta.appNameLocalized = toMap(
      await localizeField(toRecord(meta.appNameLocalized), nameSrc, locales, sourceLocale)
    );
    await meta.save();
    stats.metadata = 1;
    } catch (e) {
      stats.errors.push(`metadata: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  return stats;
}

/** Use when admin saves CMS content (future CRUD). */
export async function syncLocalizedFields(
  sourceText: string,
  existing?: Record<string, string>
): Promise<Record<string, string>> {
  const locales = await getEnabledLocaleCodes();
  const sourceLocale = defaultSourceLocale();
  const base = mergeLocalized(existing, sourceLocale, sourceText);
  return localizeField(base, sourceText, locales, sourceLocale);
}
