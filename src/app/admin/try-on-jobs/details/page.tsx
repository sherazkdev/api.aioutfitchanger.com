import { Suspense } from "react";
import JobDetailsClient from "./JobDetailsClient";

export default function JobDetailsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <JobDetailsClient />
    </Suspense>
  );
}
