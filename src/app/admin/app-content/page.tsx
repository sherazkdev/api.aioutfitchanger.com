import { Suspense } from "react";
import AppContentClient from "./AppContentClient";

export default function AppContentPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading app content…</p>}>
      <AppContentClient />
    </Suspense>
  );
}
