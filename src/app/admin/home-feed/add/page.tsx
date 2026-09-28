import { Suspense } from "react";
import HomeFeedFormClient from "../HomeFeedFormClient";

export default function AddHomeSectionPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <HomeFeedFormClient mode="add" />
    </Suspense>
  );
}
