import { existsSync, readFileSync } from "fs";
import path from "path";

export type AssetCatalogSeed = {
  catalogCategories: Record<string, unknown>[];
  homeFeedSections: Record<string, unknown>[];
  wardrobeCategories: Record<string, unknown>[];
  onboardingPages: { sortOrder: number; title: string; body: string; imageUrl: string }[];
};

export function loadAssetCatalogSeed(): AssetCatalogSeed | null {
  const jsonPath = path.join(process.cwd(), "src/lib/server/seed/asset-catalog.generated.json");
  if (!existsSync(jsonPath)) return null;
  try {
    return JSON.parse(readFileSync(jsonPath, "utf8")) as AssetCatalogSeed;
  } catch {
    return null;
  }
}
