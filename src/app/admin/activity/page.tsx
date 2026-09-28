import { Suspense } from "react";
import ActivityLogClient from "./ActivityLogClient";

export default function ActivityLogPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading activity log…</p>}>
      <ActivityLogClient />
    </Suspense>
  );
}
