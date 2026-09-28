import { ensureContentSeed } from "@/lib/server/seed/content";
import { AppMetadata } from "@/lib/server/models/AppMetadata";
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
    const payload = await getOrSet(`app:metadata:${locale}`, contentCacheTtlMs(), async () => {
      const doc = await AppMetadata.findOne({ key: "default" }).lean();
      if (!doc) return {};

      const flags: Record<string, boolean> = {};
      const raw = doc.featureFlags as Record<string, boolean> | undefined;
      if (raw && typeof raw === "object") {
        for (const [k, v] of Object.entries(raw)) {
          flags[k] = Boolean(v);
        }
      }

      return {
        app_name: readLocalized(doc.appNameLocalized, locale, undefined, doc.appName),
        version: doc.version,
        build_number: doc.buildNumber,
        support_email: doc.supportEmail,
        privacy_url: doc.privacyUrl,
        terms_url: doc.termsUrl,
        help_url: doc.helpUrl,
        feature_flags: flags,
      };
    });

    return jsonOkLocalizedCached(payload, locale, cacheAge);
  });
}
