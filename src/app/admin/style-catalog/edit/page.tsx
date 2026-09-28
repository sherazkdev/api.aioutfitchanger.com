import { Suspense } from "react";
import StyleCatalogFormClient from "../StyleCatalogFormClient";

export default function EditStylePage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <StyleCatalogFormClient mode="edit" />
    </Suspense>
  );
}
