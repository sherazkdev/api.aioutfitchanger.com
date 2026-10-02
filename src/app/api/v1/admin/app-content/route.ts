import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { AppMetadata } from "@/lib/server/models/AppMetadata";
import { AppLanguage } from "@/lib/server/models/AppLanguage";
import { OnboardingPage } from "@/lib/server/models/OnboardingPage";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { normalizePublicImageUrl } from "@/lib/content/publicImageUrl";
import { ensureContentSeed } from "@/lib/server/seed/content";
import { computeContentCompletion } from "@/lib/server/admin/contentCompletion";
import { invalidatePublicContentCache } from "@/lib/server/cache/invalidate";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await ensureContentSeed();
    await connectMongo();
    const [meta, languages, onboarding] = await Promise.all([
      AppMetadata.findOne({ key: "default" }),
      AppLanguage.find().sort({ sortOrder: 1 }).lean(),
      OnboardingPage.find().sort({ sortOrder: 1 }).lean(),
    ]);

    if (!meta) return jsonError("NOT_FOUND", "App metadata missing", 404);

    const completion = computeContentCompletion(meta, onboarding, languages);

    const draft = (meta.draftPayload as Record<string, unknown> | null) ?? {};
    const published = {
      app_name: meta.appName,
      support_email: meta.supportEmail,
      min_version_ios: meta.minVersionIos,
      min_version_android: meta.minVersionAndroid,
      privacy_url: meta.privacyUrl,
      terms_url: meta.termsUrl,
      app_store_url_ios: meta.appStoreUrlIos,
      app_store_url_android: meta.appStoreUrlAndroid,
      maintenance_mode: meta.maintenanceMode,
      maintenance_message: meta.maintenanceMessage,
    };

    return jsonOk({
      stats: {
        last_published_at: meta.publishedAt?.toISOString() ?? meta.updatedAt?.toISOString() ?? null,
        draft_changes: completion.draft_changes,
        completion_percent: completion.completion_percent,
        languages_count: languages.filter((l) => l.enabled).length,
        onboarding_pages_count: onboarding.length,
      },
      published,
      draft: { ...published, ...draft },
      onboarding_pages: onboarding.map((p) => ({
        id: String(p._id),
        sort_order: p.sortOrder,
        title: p.title,
        body: p.body,
        image_url: p.imageUrl ? normalizePublicImageUrl(p.imageUrl) : undefined,
      })),
      languages: languages.map((l) => ({
        id: l.languageId,
        code: l.languageCode,
        name: l.nativeName,
        english_name: l.englishName,
        rtl: l.rtl,
        enabled: l.enabled,
      })),
    });
  });
}

export async function PATCH(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    const body = (await req.json()) as {
      draft?: Record<string, unknown>;
      publish?: boolean;
      onboarding_reorder?: string[];
      onboarding_upsert?: {
        id?: string;
        title?: string;
        body?: string;
        image_url?: string;
        sort_order?: number;
      };
      onboarding_delete_id?: string;
      language_patch?: { id: string; enabled?: boolean; native_name?: string; english_name?: string };
      language_create?: {
        language_id: string;
        language_code: string;
        native_name: string;
        english_name: string;
        enabled?: boolean;
      };
    };

    await connectMongo();
    const meta = await AppMetadata.findOne({ key: "default" });
    if (!meta) return jsonError("NOT_FOUND", "App metadata missing", 404);

    if (body.onboarding_delete_id) {
      await OnboardingPage.findByIdAndDelete(body.onboarding_delete_id);
    }

    if (body.onboarding_upsert) {
      const u = body.onboarding_upsert;
      if (!u.title?.trim() || !u.body?.trim()) {
        return jsonError("VALIDATION", "onboarding title and body required", 422);
      }
      if (u.id) {
        const page = await OnboardingPage.findById(u.id);
        if (!page) return jsonError("NOT_FOUND", "Onboarding page not found", 404);
        page.title = u.title;
        page.body = u.body;
        if (u.image_url !== undefined) page.imageUrl = u.image_url;
        if (u.sort_order !== undefined) page.sortOrder = u.sort_order;
        await page.save();
      } else {
        const maxOrder = await OnboardingPage.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
        await OnboardingPage.create({
          title: u.title,
          body: u.body,
          imageUrl: u.image_url,
          sortOrder: u.sort_order ?? (maxOrder?.sortOrder ?? 0) + 1,
        });
      }
    }

    if (body.onboarding_reorder?.length) {
      const ids = body.onboarding_reorder;
      for (let i = 0; i < ids.length; i++) {
        await OnboardingPage.findByIdAndUpdate(ids[i], { sortOrder: i + 1 });
      }
    }

    if (body.language_patch?.id) {
      const lang = await AppLanguage.findOne({ languageId: body.language_patch.id });
      if (!lang) return jsonError("NOT_FOUND", "Language not found", 404);
      if (body.language_patch.enabled !== undefined) lang.enabled = body.language_patch.enabled;
      if (body.language_patch.native_name) lang.nativeName = body.language_patch.native_name;
      if (body.language_patch.english_name) lang.englishName = body.language_patch.english_name;
      await lang.save();
    }

    if (body.language_create) {
      const c = body.language_create;
      if (!c.language_id || !c.language_code || !c.native_name || !c.english_name) {
        return jsonError("VALIDATION", "language_id, language_code, native_name, english_name required", 422);
      }
      const exists = await AppLanguage.findOne({ languageId: c.language_id });
      if (exists) return jsonError("VALIDATION", "Language already exists", 422);
      const maxOrder = await AppLanguage.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
      await AppLanguage.create({
        languageId: c.language_id,
        languageCode: c.language_code,
        nativeName: c.native_name,
        englishName: c.english_name,
        enabled: c.enabled ?? true,
        sortOrder: (maxOrder?.sortOrder ?? 0) + 1,
      });
    }

    if (body.publish) {
      const d = (body.draft ?? meta.draftPayload ?? {}) as Record<string, string>;
      if (d.app_name) meta.appName = d.app_name;
      if (d.support_email) meta.supportEmail = d.support_email;
      if (d.min_version_ios) meta.minVersionIos = d.min_version_ios;
      if (d.min_version_android) meta.minVersionAndroid = d.min_version_android;
      if (d.privacy_url) meta.privacyUrl = d.privacy_url;
      if (d.terms_url) meta.termsUrl = d.terms_url;
      if (d.app_store_url_ios) meta.appStoreUrlIos = d.app_store_url_ios;
      if (d.app_store_url_android) meta.appStoreUrlAndroid = d.app_store_url_android;
      if (d.maintenance_mode !== undefined) meta.maintenanceMode = Boolean(d.maintenance_mode);
      if (d.maintenance_message !== undefined) meta.maintenanceMessage = d.maintenance_message;
      meta.draftPayload = null;
      meta.publishedAt = new Date();
    } else if (body.draft) {
      meta.draftPayload = body.draft;
      meta.draftUpdatedAt = new Date();
    } else if (
      !body.onboarding_reorder &&
      !body.onboarding_upsert &&
      !body.onboarding_delete_id &&
      !body.language_patch &&
      !body.language_create
    ) {
      return jsonError("VALIDATION", "No changes provided", 422);
    }

    await meta.save();
    invalidatePublicContentCache();
    await logAdminAudit(req, auditActor(auth), {
      action: body.publish ? "content.publish" : "content.update",
      resource_type: "app_content",
      meta: {
        publish: Boolean(body.publish),
        onboarding: Boolean(body.onboarding_reorder || body.onboarding_upsert || body.onboarding_delete_id),
        language: Boolean(body.language_patch || body.language_create),
      },
    });
    return jsonOk({ saved: true, published: Boolean(body.publish) });
  });
}
