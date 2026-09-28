import { Suspense } from "react";
import LookDetailsClient from "./LookDetailsClient";

export default function LookDetailsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <LookDetailsClient />
    </Suspense>
  );
}
