import { ensureContentSeed } from "@/lib/server/seed/content";
import { HomeFeedSection } from "@/lib/server/models/HomeFeedSection";
import { mapHomeFeed } from "@/lib/server/content/mappers";
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
    const payload = await getOrSet(`home:feed:${locale}:${g ?? "all"}`, contentCacheTtlMs(), async () => {
      const sections = await HomeFeedSection.find({ published: { $ne: false } }).sort({ sortOrder: 1 }).lean();
      return mapHomeFeed(sections as Parameters<typeof mapHomeFeed>[0], locale, g);
    });
    return jsonOkLocalizedCached(payload, locale, cacheAge);
  });
}
