import { Suspense } from "react";
import StyleCatalogClient from "./StyleCatalogClient";

export default function StyleCatalogPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading catalog…</p>}>
      <StyleCatalogClient />
    </Suspense>
  );
}
