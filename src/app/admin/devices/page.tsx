import { Suspense } from "react";
import DevicesClient from "./DevicesClient";

export default function DevicesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading devices…</p>}>
      <DevicesClient />
    </Suspense>
  );
}
