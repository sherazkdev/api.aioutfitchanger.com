import { Suspense } from "react";
import SystemClient from "./SystemClient";

export default function SystemStatusPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading system status…</p>}>
      <SystemClient />
    </Suspense>
  );
}
