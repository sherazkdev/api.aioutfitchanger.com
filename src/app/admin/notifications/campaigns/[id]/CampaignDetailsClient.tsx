"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PhoneNotificationPreview from "@/components/dashboard/PhoneNotificationPreview";
import StatusBadge, { campaignStatusLabel } from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api/client";
import { formatCampaignSentAt } from "@/lib/format";
import { isAdminDesignPreview } from "@/lib/admin/design-preview";
import { DEMO_CAMPAIGN_DETAIL, DEMO_CAMPAIGNS, isDemoCampaignId } from "@/lib/admin/notifications-demo";
import { cn } from "@/lib/utils";

type CampaignDetail = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  deep_link: string | null;
  audience: string;
  targeted_devices: number;
  push_success: number;
  push_failure: number;
  status: string;
  sent_at: string | null;
};

function audienceLabel(a: string) {
  if (a === "all") return "All";
  if (a === "ios") return "iOS";
  if (a === "android") return "Android";
  return a;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 py-3.5 last:border-0 dark:border-gray-800 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 sm:max-w-[65%] sm:text-right">{value}</span>
    </div>
  );
}

function KpiCard({ label, value, tone }: { label: string; value: number; tone?: "default" | "success" | "danger" }) {
  const valueClass =
    tone === "success"
      ? "text-green-700 dark:text-green-400"
      : tone === "danger"
        ? "text-red-600 dark:text-red-400"
        : "text-gray-900 dark:text-gray-100";
  return (
    <div className="rounded-xl border border-sky-100 bg-white px-4 py-4 shadow-sm dark:border-sky-900/40 dark:bg-[var(--color-card)]">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn("mt-1 text-[26px] font-semibold leading-none tabular-nums", valueClass)}>{value.toLocaleString()}</p>
    </div>
  );
}

export default function CampaignDetailsClient() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const designPreview = isAdminDesignPreview(searchParams);

  const [data, setData] = useState<CampaignDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    if (designPreview && isDemoCampaignId(id)) {
      const demo = DEMO_CAMPAIGNS.find((c) => c.id === id);
      const detail = demo
        ? {
            ...DEMO_CAMPAIGN_DETAIL,
            id: demo.id,
            title: demo.title,
            audience: demo.audience,
            targeted_devices: demo.targeted_devices,
            push_success: demo.push_success,
            push_failure: demo.push_failure,
            status: demo.status,
            sent_at: demo.sent_at,
            body: demo.id === "demo-campaign-1" ? DEMO_CAMPAIGN_DETAIL.body : `${demo.title} — campaign body.`,
          }
        : DEMO_CAMPAIGN_DETAIL;
      setData(detail);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch<CampaignDetail>(`/api/v1/admin/broadcast/${id}`).then((res) => {
      if (res.error) {
        if (designPreview) {
          setData({ ...DEMO_CAMPAIGN_DETAIL, id });
          setError(null);
        } else setError(res.error.message);
      } else setData(res.data ?? null);
      setLoading(false);
    });
  }, [id, designPreview]);

  if (loading) return <p className="text-sm text-gray-500">Loading campaign…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-gray-500">Campaign not found</p>;

  const statusLabel = campaignStatusLabel(data.status);

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      {designPreview && isDemoCampaignId(data.id) && (
        <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
          Design preview campaign. Use a real campaign ID in live mode (default).
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          backHref="/admin/notifications"
          backLabel="Back to notifications"
          title="Campaign details"
          subtitle={data.title}
        />
        <StatusBadge status={statusLabel} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Targeted devices" value={data.targeted_devices} />
        <KpiCard label="Success" value={data.push_success} tone="success" />
        <KpiCard label="Failure" value={data.push_failure} tone={data.push_failure > 0 ? "danger" : "default"} />
      </div>
      <p className="text-xs text-gray-500">Success indicates acceptance by FCM, not confirmed device delivery.</p>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,1fr)]">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
            <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Notification content</h2>
            <DetailRow label="Title" value={data.title} />
            <DetailRow label="Body" value={data.body} />
            <DetailRow
              label="Image URL"
              value={data.image_url || <span className="font-normal italic text-gray-400">Not provided</span>}
            />
            <DetailRow label="Deep link route" value={data.deep_link || "—"} />
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
            <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Campaign information</h2>
            <DetailRow label="Audience" value={audienceLabel(data.audience)} />
            <DetailRow label="Sent at" value={formatCampaignSentAt(data.sent_at)} />
            <DetailRow label="Status" value={<StatusBadge status={statusLabel} />} />
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preview</h2>
          <p className="mt-0.5 text-xs text-gray-500">Example device preview</p>
          <div className="mt-8 flex justify-center">
            <PhoneNotificationPreview title={data.title} body={data.body} imageUrl={data.image_url ?? undefined} />
          </div>
        </div>
      </div>

      {data.push_failure > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-l-4 border-amber-300 border-amber-200/80 bg-amber-50 px-4 py-3.5 text-sm text-amber-950 dark:border-amber-800 dark:border-l-amber-500 dark:bg-amber-950/30 dark:text-amber-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>
            {data.push_failure.toLocaleString()} device{data.push_failure === 1 ? "" : "s"} could not be sent{" "}
            <span className="font-medium underline decoration-amber-600/40 underline-offset-2">this notification</span>.
          </p>
        </div>
      )}
    </div>
  );
}
