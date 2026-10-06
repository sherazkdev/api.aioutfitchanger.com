import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { CatalogCategory } from "@/lib/server/models/CatalogCategory";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { ensureContentSeed } from "@/lib/server/seed/content";
import { invalidatePublicContentCache } from "@/lib/server/cache/invalidate";
import { normalizePublicImageUrl } from "@/lib/content/publicImageUrl";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await ensureContentSeed();
    await connectMongo();
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("category_id");
    const q = url.searchParams.get("q")?.trim().toLowerCase();

    const categories = categoryId
      ? await CatalogCategory.find({ categoryId }).lean()
      : await CatalogCategory.find().lean();

    const items: {
      id: string;
      category_id: string;
      style_id: string;
      name: string;
      image_url: string;
      gender: string;
      sort_order: number;
      enabled: boolean;
      prompt_command: string;
      tab_id: string;
    }[] = [];

    for (const cat of categories) {
      for (const item of cat.items ?? []) {
        const name =
          item.nameLocalized && typeof item.nameLocalized === "object" && "en" in item.nameLocalized
            ? String((item.nameLocalized as { en: string }).en)
            : item.id;
        items.push({
          id: `${cat.categoryId}:${item.id}`,
          category_id: cat.categoryId,
          style_id: item.id,
          name,
          image_url: normalizePublicImageUrl(item.imageUrl),
          gender: item.gender ?? "women",
          sort_order: item.sortOrder ?? 0,
          enabled: (item as { enabled?: boolean }).enabled !== false,
          prompt_command: (item as { promptCommand?: string }).promptCommand ?? "",
          tab_id: item.tabId ?? "",
        });
      }
    }

    let filtered = items.sort((a, b) => a.sort_order - b.sort_order);
    if (q) {
      filtered = filtered.filter(
        (i) => i.name.toLowerCase().includes(q) || i.style_id.toLowerCase().includes(q)
      );
    }

    return jsonOk({ items: filtered });
  });
}

type StyleUpsertBody = {
  category_id: string;
  style_id?: string;
  name: string;
  image_url: string;
  gender?: string;
  tab_id?: string;
  enabled?: boolean;
  prompt_command?: string;
};

export async function PATCH(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await ensureContentSeed();
    await connectMongo();
    const body = (await req.json()) as {
      upsert?: StyleUpsertBody;
      delete?: { category_id: string; style_id: string };
      reorder?: { category_id: string; style_ids: string[] };
      toggle_enabled?: { category_id: string; style_id: string; enabled: boolean };
    };

    if (body.delete) {
      const cat = await CatalogCategory.findOne({ categoryId: body.delete.category_id });
      if (!cat) return jsonError("NOT_FOUND", "Category not found", 404);
      const kept = (cat.items ?? []).filter((i) => i.id !== body.delete!.style_id);
      cat.set("items", kept);
      await cat.save();
      await logAdminAudit(req, auditActor(auth), {
        action: "content.catalog_style",
        resource_type: "catalog_style",
        resource_id: body.delete.style_id,
        meta: { op: "delete", category_id: body.delete.category_id },
      });
      invalidatePublicContentCache();
      return jsonOk({ deleted: body.delete.style_id });
    }

    if (body.reorder) {
      const cat = await CatalogCategory.findOne({ categoryId: body.reorder.category_id });
      if (!cat) return jsonError("NOT_FOUND", "Category not found", 404);
      const orderMap = new Map(body.reorder.style_ids.map((id, idx) => [id, idx]));
      for (const item of cat.items ?? []) {
        const idx = orderMap.get(item.id);
        if (idx !== undefined) item.sortOrder = idx;
      }
      const sorted = [...(cat.items ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      cat.set("items", sorted);
      await cat.save();
      await logAdminAudit(req, auditActor(auth), {
        action: "content.catalog_style",
        resource_type: "catalog_style",
        meta: { op: "reorder", category_id: body.reorder.category_id },
      });
      invalidatePublicContentCache();
      return jsonOk({ reordered: true });
    }

    if (body.toggle_enabled) {
      const cat = await CatalogCategory.findOne({ categoryId: body.toggle_enabled.category_id });
      if (!cat) return jsonError("NOT_FOUND", "Category not found", 404);
      const item = (cat.items ?? []).find((i) => i.id === body.toggle_enabled!.style_id);
      if (!item) return jsonError("NOT_FOUND", "Style not found", 404);
      (item as { enabled?: boolean }).enabled = body.toggle_enabled.enabled;
      await cat.save();
      await logAdminAudit(req, auditActor(auth), {
        action: "content.catalog_style",
        resource_type: "catalog_style",
        resource_id: item.id,
        meta: { op: "toggle_enabled", enabled: body.toggle_enabled.enabled },
      });
      invalidatePublicContentCache();
      return jsonOk({ style_id: item.id, enabled: body.toggle_enabled.enabled });
    }

    if (body.upsert) {
      const u = body.upsert;
      if (!u.category_id?.trim() || !u.name?.trim() || !u.image_url?.trim()) {
        return jsonError("VALIDATION", "category_id, name, and image_url are required", 422);
      }
      const cat = await CatalogCategory.findOne({ categoryId: u.category_id });
      if (!cat) return jsonError("NOT_FOUND", "Category not found", 404);

      const styleId = u.style_id?.trim() || `style_${Date.now()}`;
      const existing = (cat.items ?? []).find((i) => i.id === styleId);
      const gender = u.gender === "men" || u.gender === "women" || u.gender === "both" ? u.gender : "women";

      if (existing) {
        existing.imageUrl = u.image_url;
        existing.gender = gender;
        if (u.tab_id !== undefined) existing.tabId = u.tab_id.trim() || undefined;
        if (u.prompt_command !== undefined) existing.promptCommand = u.prompt_command;
        (existing as { enabled?: boolean }).enabled = u.enabled !== false;
        const map = existing.nameLocalized as Map<string, string> | undefined;
        if (map && typeof map.set === "function") map.set("en", u.name);
        else existing.nameLocalized = new Map([["en", u.name]]) as unknown as typeof existing.nameLocalized;
      } else {
        const maxOrder = (cat.items ?? []).reduce((m, i) => Math.max(m, i.sortOrder ?? 0), -1);
        cat.items = cat.items ?? [];
        cat.items.push({
          id: styleId,
          tabId: u.tab_id,
          imageUrl: u.image_url,
          nameLocalized: new Map([["en", u.name]]) as unknown as (typeof cat.items)[0]["nameLocalized"],
          promptCommand: u.prompt_command,
          sortOrder: maxOrder + 1,
          gender,
          enabled: u.enabled !== false,
        } as (typeof cat.items)[0]);
      }
      await cat.save();
      await logAdminAudit(req, auditActor(auth), {
        action: "content.catalog_style",
        resource_type: "catalog_style",
        resource_id: styleId,
        meta: { op: existing ? "update" : "create", category_id: u.category_id },
      });
      invalidatePublicContentCache();
      return jsonOk({ style_id: styleId, category_id: u.category_id });
    }

    return jsonError("VALIDATION", "No supported patch action", 422);
  });
}
