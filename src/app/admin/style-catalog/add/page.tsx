import { Suspense } from "react";
import StyleCatalogFormClient from "../StyleCatalogFormClient";

export default function AddStylePage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <StyleCatalogFormClient mode="add" />
    </Suspense>
  );
}
