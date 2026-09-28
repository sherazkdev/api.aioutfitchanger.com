import { ensureContentSeed } from "@/lib/server/seed/content";
import { OnboardingPage } from "@/lib/server/models/OnboardingPage";
import { jsonOkLocalizedCached } from "@/lib/server/http";
import { contentCacheMaxAgeSec, contentCacheTtlMs, getOrSet } from "@/lib/server/cache/ttl";
import { resolveLocale } from "@/lib/server/i18n/locale";
import { readLocalized } from "@/lib/server/i18n/localizedString";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function GET(req: Request) {
  return handleApiRoute(async () => {
    await ensureContentSeed();
    const locale = resolveLocale(req);
    const cacheAge = contentCacheMaxAgeSec();
    const payload = await getOrSet(`onboarding:pages:${locale}`, contentCacheTtlMs(), async () => {
      const pages = await OnboardingPage.find().sort({ sortOrder: 1 }).lean();
      return {
        pages: pages.map((p) => ({
          title: readLocalized(p.titleLocalized, locale, undefined, p.title),
          body: readLocalized(p.bodyLocalized, locale, undefined, p.body),
          image_url: p.imageUrl,
          sort_order: p.sortOrder,
        })),
      };
    });
    return jsonOkLocalizedCached(payload, locale, cacheAge);
  });
}
