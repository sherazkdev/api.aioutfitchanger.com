import { Suspense } from "react";
import HomeFeedFormClient from "../HomeFeedFormClient";

export default function EditHomeSectionPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <HomeFeedFormClient mode="edit" />
    </Suspense>
  );
}
