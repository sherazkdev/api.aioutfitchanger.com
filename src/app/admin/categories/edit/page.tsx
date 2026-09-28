import { Suspense } from "react";
import CategoryFormClient from "../CategoryFormClient";

export default function EditCategoryPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <CategoryFormClient mode="edit" />
    </Suspense>
  );
}
