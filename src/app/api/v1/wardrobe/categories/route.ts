import { ensureContentSeed } from "@/lib/server/seed/content";
import { WardrobeCategory } from "@/lib/server/models/WardrobeCategory";
import { mapWardrobeCategories } from "@/lib/server/content/mappers";
import { jsonOkLocalizedCached } from "@/lib/server/http";
import { contentCacheMaxAgeSec, contentCacheTtlMs, getOrSet } from "@/lib/server/cache/ttl";
import { resolveLocale } from "@/lib/server/i18n/locale";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function GET(req: Request) {
  return handleApiRoute(async () => {
    await ensureContentSeed();
    const locale = resolveLocale(req);
    const gender = new URL(req.url).searchParams.get("gender")?.toLowerCase();
    const g = gender === "men" || gender === "women" ? gender : undefined;

    const cacheAge = contentCacheMaxAgeSec();
    const payload = await getOrSet(`wardrobe:categories:${locale}:${g ?? "all"}`, contentCacheTtlMs(), async () => {
      const docs = await WardrobeCategory.find({ enabled: { $ne: false } }).sort({ sortOrder: 1 }).lean();
      return mapWardrobeCategories(docs as Parameters<typeof mapWardrobeCategories>[0], locale, g);
    });
    return jsonOkLocalizedCached(payload, locale, cacheAge);
  });
}
