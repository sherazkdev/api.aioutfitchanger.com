import { connectMongo } from "../db";
import { AppMetadata } from "../models/AppMetadata";
import { OnboardingPage } from "../models/OnboardingPage";
import { HomeFeedSection } from "../models/HomeFeedSection";
import { CatalogCategory } from "../models/CatalogCategory";
import { WardrobeCategory } from "../models/WardrobeCategory";
import { ensureLanguageCatalog } from "../i18n/languages";
import {
  categories,
  homeFeedSections,
  homeSectionItems,
  styleCatalog,
  wardrobeCategories,
} from "@/lib/mock-data";

let seeded = false;

function enMap(text: string): Record<string, string> {
  return { en: text };
}

export async function ensureContentSeed(): Promise<void> {
  if (process.env.DISABLE_CONTENT_SEED === "1" || process.env.DISABLE_CONTENT_SEED === "true") {
    return;
  }
  try {
    await connectMongo();
    await ensureLanguageCatalog();
  } catch (err) {
    console.error("[ensureContentSeed] connect or language catalog failed", err);
    throw err;
  }
  if (seeded) return;

  if ((await AppMetadata.countDocuments()) === 0) {
    await AppMetadata.create({
      key: "default",
      appName: "AI Wardrobe",
      appNameLocalized: enMap("AI Wardrobe"),
      sourceLocale: "en",
      version: "1.0.0",
      buildNumber: "104",
      supportEmail: "support@outfitchanger.app",
      privacyUrl: "https://outfitchanger.app/privacy",
      termsUrl: "https://outfitchanger.app/terms",
      helpUrl: "https://outfitchanger.app/help",
      featureFlags: { try_on_enabled: true, wardrobe_enabled: true },
    });
  }

  if ((await OnboardingPage.countDocuments()) === 0) {
    const pages = [
      {
        sortOrder: 1,
        title: "Virtual try-on",
        body: "See outfits on your photo in seconds.",
        imageUrl: "/media/outfits/pakistani-01.jpg",
      },
      {
        sortOrder: 2,
        title: "Curated styles",
        body: "Browse traditional and modern looks.",
        imageUrl: "/media/outfits/korean-01.jpg",
      },
      {
        sortOrder: 3,
        title: "Save your looks",
        body: "Keep favorites in your wardrobe.",
        imageUrl: "/media/results/result-01.jpg",
      },
    ];
    await OnboardingPage.insertMany(
      pages.map((p) => ({
        ...p,
        sourceLocale: "en",
        titleLocalized: enMap(p.title),
        bodyLocalized: enMap(p.body),
      }))
    );
  }

  if ((await HomeFeedSection.countDocuments()) === 0) {
    const beautyLab = homeFeedSections.find((s) => s.id === "beauty_lab");
    const couple = homeFeedSections.find((s) => s.id === "couple_duo");

    await HomeFeedSection.insertMany([
      {
        sectionId: "beauty_lab",
        titleKey: "homeBeautyLab",
        titleLocalized: enMap(beautyLab?.name ?? "Beauty Lab"),
        sourceLocale: "en",
        type: "category_cards",
        sortOrder: 1,
        items: categories.slice(0, 4).map((c) => ({
          categoryId: c.id,
          labelKey: c.titleKey,
          label: c.name,
          labelLocalized: enMap(c.name),
          thumbnailUrl: "/media/outfits/chinese-01.jpg",
          genderScope: "both",
        })),
      },
      {
        sectionId: "occasions",
        titleKey: "homeOccasions",
        titleLocalized: enMap("Occasions"),
        sourceLocale: "en",
        type: "image_rail",
        categoryId: "occasions",
        sortOrder: 2,
        items: homeSectionItems.map((item) => ({
          styleId: item.id,
          thumbnailUrl: item.image,
          label: item.label,
          labelLocalized: enMap(item.label),
          genderScope: "women",
        })),
      },
      {
        sectionId: "couple_duo",
        titleKey: "homeCoupleDuo",
        titleLocalized: enMap(couple?.name ?? "Couple / Duo"),
        sourceLocale: "en",
        type: "image_rail",
        categoryId: "couple",
        sortOrder: 3,
        items: [
          {
            styleId: "couple_women_01",
            thumbnailUrl: "/media/outfits/pakistani-02.jpg",
            label: "Couple look",
            labelLocalized: enMap("Couple look"),
            genderScope: "both",
          },
        ],
      },
    ]);
  }

  if ((await CatalogCategory.countDocuments()) === 0) {
    const nameById = new Map(styleCatalog.map((s) => [s.id, s.name]));

    const catalogItems = styleCatalog.map((s, i) => ({
      id: s.id,
      tabId: "tops",
      genderTabId: s.gender.toLowerCase() === "women" ? "women" : "men",
      imageUrl: s.image,
      nameLocalized: enMap(s.name),
      promptCommand: `Wear ${s.name} exactly as shown in the reference.`,
      sortOrder: i,
      gender: s.gender.toLowerCase() as "women" | "men",
    }));

    await CatalogCategory.insertMany(
      categories.map((cat) => {
        const hijabTabs =
          cat.id === "hijab" && "subTabs" in cat && Array.isArray(cat.subTabs)
            ? cat.subTabs.map((t: { id: string; titleKey: string; name: string }) => ({
                id: t.id,
                titleKey: t.titleKey,
                titles: enMap(t.name),
              }))
            : [{ id: "all", titleKey: "tryOnTabAll", titles: enMap("All") }];

        return {
          categoryId: cat.id,
          titleKey: cat.titleKey,
          titleLocalized: enMap(cat.name),
          sourceLocale: "en",
          genderScope: cat.gender === "Both" ? "both" : cat.gender.toLowerCase(),
          genderTabs: [
            { id: "women", titleKey: "styleTabWomen", titles: enMap("Women") },
            { id: "men", titleKey: "styleTabMen", titles: enMap("Men") },
          ],
          tabs: hijabTabs,
          items: catalogItems.map((item) => ({
            ...item,
            nameLocalized: enMap(nameById.get(item.id) ?? item.id),
          })),
        };
      })
    );
  }

  if ((await WardrobeCategory.countDocuments()) === 0) {
    await WardrobeCategory.insertMany(
      wardrobeCategories.map((w, i) => {
        const previews =
          w.previewStyles?.map((p) => ({
            styleId: p.id,
            thumbnailUrl: p.image,
            gender: "women" as const,
          })) ??
          w.previews.map((url, idx) => ({
            styleId: `preview_${w.id}_${idx}`,
            thumbnailUrl: url,
            gender: "women" as const,
          }));

        return {
          categoryId: w.id,
          titleKey: (w as { titleKey?: string }).titleKey ?? `wardrobe_${w.id}`,
          titleLocalized: enMap(w.name),
          sourceLocale: "en",
          browseTabId: w.browseTab,
          backgroundToken: w.bgToken,
          genderScope: "women",
          sortOrder: i,
          previewItems: previews,
        };
      })
    );
  }

  seeded = true;
}
