/** Normalize catalog/content image paths for admin + API clients. */
export function normalizePublicImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const u = new URL(trimmed);
      if (u.pathname.startsWith("/media/") || u.pathname.startsWith("/uploads/")) {
        trimmed = `${u.pathname}${u.search}`;
      }
    }
  } catch {
    /* ignore malformed URL */
  }

  if (trimmed.startsWith("/media/catalog/") && /\.webp$/i.test(trimmed)) {
    return trimmed.replace(/\.webp$/i, ".png");
  }

  return trimmed;
}
