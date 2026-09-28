import { Suspense } from "react";
import TryOnJobsClient from "./TryOnJobsClient";

export default function TryOnJobsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading jobs…</p>}>
      <TryOnJobsClient />
    </Suspense>
  );
}
