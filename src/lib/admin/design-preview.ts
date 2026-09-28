/**
 * Admin design preview is disabled by default (production uses live APIs).
 *
 * Enable preview/mock overlays only when:
 * - `NEXT_PUBLIC_ADMIN_DESIGN_PREVIEW=1`, or
 * - URL query `?demo=1`
 */
export function isAdminDesignPreview(searchParams: URLSearchParams | null | undefined): boolean {
  if (process.env.NEXT_PUBLIC_ADMIN_DESIGN_PREVIEW === "1") return true;
  if (searchParams?.get("demo") === "1") return true;
  return false;
}
