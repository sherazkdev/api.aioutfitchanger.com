import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { CatalogCategory } from "@/lib/server/models/CatalogCategory";
import { jsonError, jsonOk } from "@/lib/server/http";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { ensureContentSeed } from "@/lib/server/seed/content";
import { invalidatePublicContentCache } from "@/lib/server/cache/invalidate";
import { normalizePublicImageUrl } from "@/lib/content/publicImageUrl";
import {
  applyCatalogTabsToCategory,
  type CatalogTabInput,
} from "@/lib/server/admin/catalogCategoryTabs";

function tabTitleEn(tab: {
  titleKey?: string | null;
  titles?: Map<string, string> | Record<string, string>;
}) {
  const titles = tab.titles;
  if (titles instanceof Map && titles.get("en")) return String(titles.get("en"));
  if (titles && typeof titles === "object" && "en" in titles) return String((titles as { en: string }).en);
  return tab.titleKey ?? "";
}

function serializeTabs(doc: {
  tabs?: { id?: string | null; titleKey?: string | null; titles?: Map<string, string> | Record<string, string> }[];
}) {
  return (doc.tabs ?? []).map((t) => ({
    id: t.id ?? "",
    title_key: t.titleKey ?? "",
    title: tabTitleEn(t),
  }));
}

function categoryPreviewImageUrl(doc: { items?: { imageUrl?: string; enabled?: boolean; sortOrder?: number }[] }) {
  const items = [...(doc.items ?? [])].filter((i) => i.enabled !== false);
  items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const first = items.find((i) => i.imageUrl?.trim());
  return first?.imageUrl ? normalizePublicImageUrl(first.imageUrl) : "";
}

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await ensureContentSeed();
    await connectMongo();
    const rows = await CatalogCategory.find().sort({ categoryId: 1 }).lean();

    const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase();

    let items = rows.map((c) => ({
      id: String(c._id),
      category_id: c.categoryId,
      title_key: c.titleKey,
      title:
        c.titleLocalized && typeof c.titleLocalized === "object" && "en" in c.titleLocalized
          ? String((c.titleLocalized as { en: string }).en)
          : c.titleKey,
      gender_scope: c.genderScope,
      items_count: c.items?.length ?? 0,
      tabs_count: c.tabs?.length ?? 0,
      preview_image_url: categoryPreviewImageUrl(c),
    }));

    if (q) {
      items = items.filter(
        (i) => i.category_id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q)
      );
    }

    const singleId = new URL(req.url).searchParams.get("category_id");
    if (singleId) {
      const doc = rows.find((c) => c.categoryId === singleId);
      if (!doc) return jsonError("NOT_FOUND", "Category not found", 404);
      const title =
        doc.titleLocalized && typeof doc.titleLocalized === "object" && "en" in doc.titleLocalized
          ? String((doc.titleLocalized as { en: string }).en)
          : doc.titleKey;
      return jsonOk({
        item: {
          id: String(doc._id),
          category_id: doc.categoryId,
          title_key: doc.titleKey,
          title,
          gender_scope: doc.genderScope,
          tabs: serializeTabs(doc),
        },
      });
    }

    return jsonOk({ items });
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
        gender_scope?: string;
        tabs?: CatalogTabInput[];
      };
      delete_id?: string;
    };

    if (body.delete_id) {
      await CatalogCategory.findByIdAndDelete(body.delete_id);
      await logAdminAudit(req, auditActor(auth), {
        action: "content.catalog_category",
        resource_type: "catalog_category",
        resource_id: body.delete_id,
        meta: { op: "delete" },
      });
      invalidatePublicContentCache();
      return jsonOk({ deleted: body.delete_id });
    }

    if (body.upsert) {
      const u = body.upsert;
      if (!u.category_id?.trim() || !u.title_key?.trim()) {
        return jsonError("VALIDATION", "category_id and title_key required", 422);
      }
      const scope: "men" | "women" | "both" =
        u.gender_scope === "men" || u.gender_scope === "women" || u.gender_scope === "both" ? u.gender_scope : "both";
      const titleMap = new Map<string, string>();
      if (u.title?.trim()) titleMap.set("en", u.title.trim());

      if (u.id) {
        const row = await CatalogCategory.findById(u.id);
        if (!row) return jsonError("NOT_FOUND", "Category not found", 404);
        row.categoryId = u.category_id;
        row.titleKey = u.title_key;
        row.genderScope = scope;
        if (u.title?.trim()) {
          const map = row.titleLocalized as Map<string, string> | undefined;
          if (map && typeof map.set === "function") map.set("en", u.title);
        }
        if (u.tabs !== undefined) {
          const tabErr = applyCatalogTabsToCategory(row, u.tabs);
          if (tabErr) return jsonError("VALIDATION", tabErr, 422);
        }
        await row.save();
        await logAdminAudit(req, auditActor(auth), {
          action: "content.catalog_category",
          resource_type: "catalog_category",
          resource_id: String(row._id),
          meta: { op: "update" },
        });
        invalidatePublicContentCache();
        return jsonOk({ id: String(row._id) });
      }

      const exists = await CatalogCategory.findOne({ categoryId: u.category_id });
      if (exists) return jsonError("VALIDATION", "category_id already exists", 422);

      const createDoc = {
        categoryId: u.category_id,
        titleKey: u.title_key,
        titleLocalized: titleMap,
        genderScope: scope,
        genderTabs: [
          { id: "men", titleKey: "styleTabMen" },
          { id: "women", titleKey: "styleTabWomen" },
        ],
        tabs: [] as { id: string; titleKey: string; titles: Map<string, string> }[],
        items: [],
      };
      const created = await CatalogCategory.create(createDoc);
      const tabErr = applyCatalogTabsToCategory(created, u.tabs);
      if (tabErr) {
        await CatalogCategory.findByIdAndDelete(created._id);
        return jsonError("VALIDATION", tabErr, 422);
      }
      if (u.tabs !== undefined) await created.save();
      await logAdminAudit(req, auditActor(auth), {
        action: "content.catalog_category",
        resource_type: "catalog_category",
        resource_id: String(created._id),
        meta: { op: "create" },
      });
      invalidatePublicContentCache();
      return jsonOk({ id: String(created._id) });
    }

    return jsonError("VALIDATION", "No supported patch action", 422);
  });
}
