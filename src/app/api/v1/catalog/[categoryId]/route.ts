import { ensureContentSeed } from "@/lib/server/seed/content";
import { CatalogCategory } from "@/lib/server/models/CatalogCategory";
import { mapCatalog, normalizeCatalogTab } from "@/lib/server/content/mappers";
import { shouldServeWardrobeForVirtualTryon } from "@/lib/server/content/virtualTryOnCatalog";
import { readLocalized } from "@/lib/server/i18n/localizedString";
import { jsonError, jsonOkLocalizedCached } from "@/lib/server/http";
import { contentCacheMaxAgeSec, contentCacheTtlMs, getOrSet } from "@/lib/server/cache/ttl";
import { resolveLocale } from "@/lib/server/i18n/locale";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function GET(req: Request, ctx: { params: Promise<{ categoryId: string }> }) {
  return handleApiRoute(async () => {
    await ensureContentSeed();
    const locale = resolveLocale(req);
    const { categoryId } = await ctx.params;
    const url = new URL(req.url);
    const tabRaw = url.searchParams.get("tab") ?? undefined;
    const tabKey = normalizeCatalogTab(categoryId, tabRaw) ?? "";
    const gender = url.searchParams.get("gender")?.toLowerCase() ?? undefined;
    const g = gender === "men" || gender === "women" ? gender : undefined;

    const useWardrobeGrid = shouldServeWardrobeForVirtualTryon(categoryId, tabRaw ?? tabKey, g);
    const lookupCategoryId = useWardrobeGrid ? "wardrobe_browse" : categoryId;

    const cacheAge = contentCacheMaxAgeSec();
    const payload = await getOrSet(
      `catalog:${categoryId}:${locale}:${tabKey}:${g ?? "all"}:${useWardrobeGrid ? "wb" : "cat"}`,
      contentCacheTtlMs(),
      async () => {
        const doc = await CatalogCategory.findOne({ categoryId: lookupCategoryId }).lean();
        if (!doc) return null;
        const mapped = mapCatalog(doc as Parameters<typeof mapCatalog>[0], locale, tabRaw, g);
        if (useWardrobeGrid) {
          const vto = await CatalogCategory.findOne({ categoryId: "virtual_try_on" }).lean();
          return {
            ...mapped,
            category_id: "virtual_try_on",
            title_key: vto?.titleKey ?? "homeVirtualTryOn",
            title: readLocalized(
              vto?.titleLocalized as Parameters<typeof readLocalized>[0],
              locale,
              vto?.titleKey ?? "homeVirtualTryOn"
            ),
          };
        }
        return mapped;
      }
    );
    if (!payload) return jsonError("NOT_FOUND", "Catalog category not found", 404);

    return jsonOkLocalizedCached(payload, locale, cacheAge);
  });
}
