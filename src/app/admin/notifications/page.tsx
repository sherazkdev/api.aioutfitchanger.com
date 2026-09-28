import { Suspense } from "react";
import NotificationsClient from "./NotificationsClient";

export default function NotificationsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading notifications…</p>}>
      <NotificationsClient />
    </Suspense>
  );
}
