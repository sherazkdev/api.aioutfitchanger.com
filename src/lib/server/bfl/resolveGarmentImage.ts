import { readFile } from "fs/promises";
import path from "path";
import { CatalogCategory } from "@/lib/server/models/CatalogCategory";
import { normalizeImageInput } from "@/lib/server/bfl/normalizeImageInput";
import { isWardrobeGarmentStyleId } from "@/lib/server/content/virtualTryOnCatalog";

export type ResolvedGarment = {
  dataUrl: string;
  source: "client_base64" | "catalog_file" | "catalog_url_fetch";
  styleId: string;
  imagePath?: string;
};

async function findItemInCategory(categoryId: string, styleId: string) {
  const doc = await CatalogCategory.findOne({ categoryId }).lean();
  return doc?.items?.find((i) => i.id === styleId) ?? null;
}

async function resolveCatalogItem(styleId: string, categoryId?: string | null) {
  if (categoryId) {
    const item = await findItemInCategory(categoryId, styleId);
    if (item?.imageUrl) return item;

    if (categoryId === "virtual_try_on" && isWardrobeGarmentStyleId(styleId)) {
      const wardrobe = await findItemInCategory("wardrobe_browse", styleId);
      if (wardrobe?.imageUrl) return wardrobe;
    }
  }
  const hit = await CatalogCategory.findOne({ "items.id": styleId }).lean();
  return hit?.items?.find((i) => i.id === styleId) ?? null;
}

async function readPublicMediaFile(imageUrl: string): Promise<Buffer> {
  const rel = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  const abs = path.join(process.cwd(), "public", rel);
  return readFile(abs);
}

async function fetchRemote(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GARMENT_FETCH_${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function mimeFromPath(p: string): "image/jpeg" | "image/png" | "image/webp" {
  const lower = p.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function resolveGarmentImage(opts: {
  styleId: string;
  categoryId?: string | null;
  styleReferenceBase64?: string | null;
  appOrigin?: string | null;
}): Promise<ResolvedGarment> {
  const ref = opts.styleReferenceBase64?.trim();
  if (ref) {
    const normalized = normalizeImageInput(ref, "GARMENT");
    return { dataUrl: normalized.dataUrl, source: "client_base64", styleId: opts.styleId };
  }

  const item = await resolveCatalogItem(opts.styleId, opts.categoryId);
  if (!item?.imageUrl?.trim()) {
    throw new Error("GARMENT_NOT_FOUND");
  }

  const imageUrl = item.imageUrl.trim();
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    const buf = await fetchRemote(imageUrl);
    const mime = mimeFromPath(imageUrl);
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
    return { dataUrl, source: "catalog_url_fetch", styleId: opts.styleId, imagePath: imageUrl };
  }

  try {
    const buf = await readPublicMediaFile(imageUrl);
    const mime = mimeFromPath(imageUrl);
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
    return {
      dataUrl,
      source: "catalog_file",
      styleId: opts.styleId,
      imagePath: imageUrl,
    };
  } catch {
    const origin = (opts.appOrigin ?? process.env.APP_URL ?? "").replace(/\/$/, "");
    if (!origin) throw new Error("GARMENT_FILE_MISSING");
    const buf = await fetchRemote(`${origin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`);
    const mime = mimeFromPath(imageUrl);
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
    return { dataUrl, source: "catalog_url_fetch", styleId: opts.styleId, imagePath: imageUrl };
  }
}
