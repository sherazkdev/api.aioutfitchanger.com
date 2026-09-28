import { ensureContentSeed } from "@/lib/server/seed/content";
import { CatalogCategory } from "@/lib/server/models/CatalogCategory";
import { mapCatalog } from "@/lib/server/content/mappers";
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
    const tab = url.searchParams.get("tab") ?? undefined;
    const gender = url.searchParams.get("gender")?.toLowerCase() ?? undefined;
    const g = gender === "men" || gender === "women" ? gender : undefined;

    const cacheAge = contentCacheMaxAgeSec();
    const payload = await getOrSet(
      `catalog:${categoryId}:${locale}:${tab ?? ""}:${g ?? "all"}`,
      contentCacheTtlMs(),
      async () => {
        const doc = await CatalogCategory.findOne({ categoryId }).lean();
        if (!doc) return null;
        return mapCatalog(doc as Parameters<typeof mapCatalog>[0], locale, tab, g);
      }
    );
    if (!payload) return jsonError("NOT_FOUND", "Catalog category not found", 404);

    return jsonOkLocalizedCached(payload, locale, cacheAge);
  });
}
