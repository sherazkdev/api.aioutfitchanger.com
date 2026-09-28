import { Suspense } from "react";
import WardrobeFormClient from "../WardrobeFormClient";

export default function AddWardrobeCategoryPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <WardrobeFormClient mode="add" />
    </Suspense>
  );
}
