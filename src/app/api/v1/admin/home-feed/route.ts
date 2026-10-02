import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { HomeFeedSection } from "@/lib/server/models/HomeFeedSection";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { ensureContentSeed } from "@/lib/server/seed/content";
import { invalidatePublicContentCache } from "@/lib/server/cache/invalidate";
import { normalizePublicImageUrl } from "@/lib/content/publicImageUrl";

function localizedTitle(map: unknown, fallback: string): string {
  if (map && typeof map === "object" && "en" in map && typeof (map as { en: unknown }).en === "string") {
    return (map as { en: string }).en;
  }
  return fallback;
}

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await ensureContentSeed();
    await connectMongo();
    const rows = await HomeFeedSection.find().sort({ sortOrder: 1 }).lean();

    return jsonOk({
      items: rows.map((s) => {
        const thumbUrls = (s.items ?? [])
          .map((it) => normalizePublicImageUrl(it.thumbnailUrl ?? ""))
          .filter(Boolean);
        return {
        id: String(s._id),
        section_id: s.sectionId,
        title: localizedTitle(s.titleLocalized, s.titleKey),
        title_key: s.titleKey,
        sort_order: s.sortOrder,
        items_count: s.items?.length ?? 0,
        type: s.type,
        category_id: s.categoryId ?? null,
        published: (s as { published?: boolean }).published !== false,
        preview_image_url: thumbUrls[0] ?? "",
        preview_thumbnails: thumbUrls.slice(0, 4),
        items: (s.items ?? []).map((it) => ({
          style_id: it.styleId ?? "",
          category_id: it.categoryId ?? null,
          thumbnail_url: normalizePublicImageUrl(it.thumbnailUrl ?? ""),
          label: it.label ?? it.labelKey ?? "",
        })),
      };
      }),
    });
  });
}

export async function PATCH(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await ensureContentSeed();
    await connectMongo();
    const body = (await req.json()) as {
      upsert?: {
        id?: string;
        section_id: string;
        title_key: string;
        title?: string;
        type?: "category_cards" | "image_rail";
        category_id?: string;
        sort_order?: number;
        published?: boolean;
      };
      delete_id?: string;
      reorder?: string[];
      publish?: { id: string; published: boolean };
      set_items?: {
        id: string;
        items: { style_id: string; category_id?: string; thumbnail_url?: string; label?: string }[];
      };
    };

    const audit = (meta: Record<string, unknown>, resourceId?: string) =>
      logAdminAudit(req, auditActor(auth), {
        action: "content.home_feed",
        resource_type: "home_feed_section",
        resource_id: resourceId,
        meta,
      });

    if (body.set_items) {
      const row = await HomeFeedSection.findById(body.set_items.id);
      if (!row) return jsonError("NOT_FOUND", "Section not found", 404);
      row.items = body.set_items.items.map((it) => ({
        styleId: it.style_id,
        categoryId: it.category_id,
        thumbnailUrl: it.thumbnail_url,
        label: it.label,
        labelKey: it.label,
      })) as typeof row.items;
      await row.save();
      await audit({ op: "set_items", count: body.set_items.items.length }, body.set_items.id);
      invalidatePublicContentCache();
      return jsonOk({ id: body.set_items.id, items_count: row.items?.length ?? 0 });
    }

    if (body.delete_id) {
      await HomeFeedSection.findByIdAndDelete(body.delete_id);
      await audit({ op: "delete" }, body.delete_id);
      invalidatePublicContentCache();
      return jsonOk({ deleted: body.delete_id });
    }

    if (body.reorder?.length) {
      const orderMap = new Map(body.reorder.map((id, idx) => [id, idx]));
      const rows = await HomeFeedSection.find({ _id: { $in: body.reorder } });
      for (const row of rows) {
        const idx = orderMap.get(String(row._id));
        if (idx !== undefined) row.sortOrder = idx;
        await row.save();
      }
      await audit({ op: "reorder", count: body.reorder.length });
      invalidatePublicContentCache();
      return jsonOk({ reordered: true });
    }

    if (body.publish) {
      const row = await HomeFeedSection.findById(body.publish.id);
      if (!row) return jsonError("NOT_FOUND", "Section not found", 404);
      (row as { published?: boolean }).published = body.publish.published;
      await row.save();
      await audit({ op: "publish_toggle", published: body.publish.published }, body.publish.id);
      invalidatePublicContentCache();
      return jsonOk({ id: body.publish.id, published: body.publish.published });
    }

    if (body.upsert) {
      const u = body.upsert;
      if (!u.section_id?.trim() || !u.title_key?.trim()) {
        return jsonError("VALIDATION", "section_id and title_key required", 422);
      }
      const type = u.type === "image_rail" ? "image_rail" : "category_cards";
      if (u.id) {
        const row = await HomeFeedSection.findById(u.id);
        if (!row) return jsonError("NOT_FOUND", "Section not found", 404);
        row.sectionId = u.section_id;
        row.titleKey = u.title_key;
        row.type = type;
        if (u.category_id !== undefined) row.categoryId = u.category_id;
        if (u.sort_order !== undefined) row.sortOrder = u.sort_order;
        if (u.published !== undefined) (row as { published?: boolean }).published = u.published;
        if (u.title?.trim()) {
          const map = row.titleLocalized as Map<string, string> | undefined;
          if (map && typeof map.set === "function") map.set("en", u.title);
        }
        await row.save();
        await audit({ op: "update", section_id: u.section_id }, String(row._id));
        invalidatePublicContentCache();
        return jsonOk({ id: String(row._id) });
      }
      const maxOrder = await HomeFeedSection.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
      const titleMap = new Map<string, string>();
      if (u.title?.trim()) titleMap.set("en", u.title);
      const created = await HomeFeedSection.create({
        sectionId: u.section_id,
        titleKey: u.title_key,
        titleLocalized: titleMap,
        type,
        categoryId: u.category_id,
        sortOrder: u.sort_order ?? (maxOrder?.sortOrder ?? 0) + 1,
        published: u.published !== false,
        items: [],
      });
      await audit({ op: "create", section_id: u.section_id }, String(created._id));
      invalidatePublicContentCache();
      return jsonOk({ id: String(created._id) });
    }

    return jsonError("VALIDATION", "No supported patch action", 422);
  });
}
