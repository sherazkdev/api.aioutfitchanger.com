import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { WardrobeCategory } from "@/lib/server/models/WardrobeCategory";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { ensureContentSeed } from "@/lib/server/seed/content";
import { invalidatePublicContentCache } from "@/lib/server/cache/invalidate";

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
    const rows = await WardrobeCategory.find().sort({ sortOrder: 1 }).lean();

    return jsonOk({
      items: rows.map((c) => ({
        id: String(c._id),
        category_id: c.categoryId,
        title: localizedTitle(c.titleLocalized, c.titleKey),
        title_key: c.titleKey,
        sort_order: c.sortOrder,
        styles_count: c.previewItems?.length ?? 0,
        gender_scope: c.genderScope,
        enabled: (c as { enabled?: boolean }).enabled !== false,
      })),
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
        category_id: string;
        title_key: string;
        title?: string;
        browse_tab_id?: string;
        gender_scope?: string;
        sort_order?: number;
        enabled?: boolean;
      };
      delete_id?: string;
      reorder?: string[];
      toggle_enabled?: { id: string; enabled: boolean };
    };

    const audit = (meta: Record<string, unknown>, resourceId?: string) =>
      logAdminAudit(req, auditActor(auth), {
        action: "content.wardrobe",
        resource_type: "wardrobe_category",
        resource_id: resourceId,
        meta,
      });

    if (body.delete_id) {
      await WardrobeCategory.findByIdAndDelete(body.delete_id);
      await audit({ op: "delete" }, body.delete_id);
      invalidatePublicContentCache();
      return jsonOk({ deleted: body.delete_id });
    }

    if (body.reorder?.length) {
      const orderMap = new Map(body.reorder.map((id, idx) => [id, idx]));
      const rows = await WardrobeCategory.find({ _id: { $in: body.reorder } });
      for (const row of rows) {
        const idx = orderMap.get(String(row._id));
        if (idx !== undefined) row.sortOrder = idx;
        await row.save();
      }
      await audit({ op: "reorder", count: body.reorder.length });
      invalidatePublicContentCache();
      return jsonOk({ reordered: true });
    }

    if (body.toggle_enabled) {
      const row = await WardrobeCategory.findById(body.toggle_enabled.id);
      if (!row) return jsonError("NOT_FOUND", "Category not found", 404);
      (row as { enabled?: boolean }).enabled = body.toggle_enabled.enabled;
      await row.save();
      await audit({ op: "toggle_enabled", enabled: body.toggle_enabled.enabled }, body.toggle_enabled.id);
      invalidatePublicContentCache();
      return jsonOk({ id: body.toggle_enabled.id, enabled: body.toggle_enabled.enabled });
    }

    if (body.upsert) {
      const u = body.upsert;
      if (!u.category_id?.trim() || !u.title_key?.trim()) {
        return jsonError("VALIDATION", "category_id and title_key required", 422);
      }
      const scope = u.gender_scope === "men" || u.gender_scope === "women" || u.gender_scope === "both" ? u.gender_scope : "women";
      if (u.id) {
        const row = await WardrobeCategory.findById(u.id);
        if (!row) return jsonError("NOT_FOUND", "Category not found", 404);
        row.categoryId = u.category_id;
        row.titleKey = u.title_key;
        row.genderScope = scope;
        if (u.browse_tab_id) row.browseTabId = u.browse_tab_id;
        if (u.sort_order !== undefined) row.sortOrder = u.sort_order;
        if (u.enabled !== undefined) (row as { enabled?: boolean }).enabled = u.enabled;
        if (u.title?.trim()) {
          const map = row.titleLocalized as Map<string, string> | undefined;
          if (map && typeof map.set === "function") map.set("en", u.title);
        }
        await row.save();
        await audit({ op: "update", category_id: u.category_id }, String(row._id));
        invalidatePublicContentCache();
        return jsonOk({ id: String(row._id) });
      }
      const maxOrder = await WardrobeCategory.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
      const titleMap = new Map<string, string>();
      if (u.title?.trim()) titleMap.set("en", u.title);
      const created = await WardrobeCategory.create({
        categoryId: u.category_id,
        titleKey: u.title_key,
        titleLocalized: titleMap,
        browseTabId: u.browse_tab_id?.trim() || u.category_id,
        genderScope: scope,
        sortOrder: u.sort_order ?? (maxOrder?.sortOrder ?? 0) + 1,
        enabled: u.enabled !== false,
        previewItems: [],
      });
      await audit({ op: "create", category_id: u.category_id }, String(created._id));
      invalidatePublicContentCache();
      return jsonOk({ id: String(created._id) });
    }

    return jsonError("VALIDATION", "No supported patch action", 422);
  });
}
