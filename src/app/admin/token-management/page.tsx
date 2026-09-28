import { Suspense } from "react";
import TokenManagementClient from "./TokenManagementClient";

export default function TokenManagementPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading token management…</p>}>
      <TokenManagementClient />
    </Suspense>
  );
}
