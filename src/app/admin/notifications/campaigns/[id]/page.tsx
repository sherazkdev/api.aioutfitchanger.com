import { Suspense } from "react";
import CampaignDetailsClient from "./CampaignDetailsClient";

export default function CampaignDetailsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading campaign…</p>}>
      <CampaignDetailsClient />
    </Suspense>
  );
}
