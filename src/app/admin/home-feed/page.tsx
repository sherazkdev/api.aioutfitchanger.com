import { Suspense } from "react";
import HomeFeedClient from "./HomeFeedClient";

export default function HomeFeedPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading home feed…</p>}>
      <HomeFeedClient />
    </Suspense>
  );
}
