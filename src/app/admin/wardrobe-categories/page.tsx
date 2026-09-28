import { Suspense } from "react";
import WardrobeCategoriesClient from "./WardrobeCategoriesClient";

export default function WardrobeCategoriesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading wardrobe…</p>}>
      <WardrobeCategoriesClient />
    </Suspense>
  );
}
