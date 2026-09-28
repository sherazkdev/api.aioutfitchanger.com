import { Suspense } from "react";
import AccountClient from "./AccountClient";

export default function AdminAccountPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading account…</p>}>
      <AccountClient />
    </Suspense>
  );
}
