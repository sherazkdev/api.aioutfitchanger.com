import { ensureContentSeed } from "@/lib/server/seed/content";
import { AppLanguage } from "@/lib/server/models/AppLanguage";
import { jsonOkLocalizedCached } from "@/lib/server/http";
import { contentCacheMaxAgeSec, contentCacheTtlMs, getOrSet } from "@/lib/server/cache/ttl";
import { resolveLocale } from "@/lib/server/i18n/locale";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function GET(req: Request) {
  return handleApiRoute(async () => {
    await ensureContentSeed();
    const locale = resolveLocale(req);
    const cacheAge = contentCacheMaxAgeSec();
    const payload = await getOrSet("app:languages", contentCacheTtlMs(), async () => {
      const langs = await AppLanguage.find({ enabled: true }).sort({ sortOrder: 1 }).lean();
      return {
        default_locale: langs.find((l) => l.isDefault)?.languageCode ?? "en",
        languages: langs.map((l) => ({
          id: l.languageId,
          language_code: l.languageCode,
          country_code: l.countryCode,
          native_name: l.nativeName,
          english_name: l.englishName,
          flag_url: l.flagUrl,
          rtl: l.rtl ?? false,
          is_default: l.isDefault ?? false,
        })),
      };
    });
    return jsonOkLocalizedCached(payload, locale, cacheAge);
  });
}
