import { requireAuth } from "@/lib/server/auth/requireAuth";
import { jsonError, jsonOk } from "@/lib/server/http";
import { backfillAllContentTranslations } from "@/lib/server/i18n/sync";
import { isTranslationConfigured } from "@/lib/server/i18n/translate";
import { invalidatePublicContentCache } from "@/lib/server/cache/invalidate";

/** Machine-translate CMS strings into all enabled languages (LibreTranslate). */
export async function POST(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  if (!isTranslationConfigured()) {
    return jsonError(
      "TRANSLATION_NOT_CONFIGURED",
      "Set LIBRETRANSLATE_URL to run backfill (self-hosted LibreTranslate).",
      503
    );
  }

  try {
    const stats = await backfillAllContentTranslations();
    invalidatePublicContentCache();
    const partial = stats.errors.length > 0;
    return jsonOk({
      stats,
      partial,
      message: partial
        ? `Backfill finished with ${stats.errors.length} item error(s).`
        : "Localization backfill completed.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Backfill failed";
    return jsonError("BACKFILL_FAILED", message, 500);
  }
}
