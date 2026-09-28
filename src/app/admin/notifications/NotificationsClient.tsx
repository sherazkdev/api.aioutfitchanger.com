"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RefreshCw, X } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PhoneNotificationPreview from "@/components/dashboard/PhoneNotificationPreview";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api/client";
import { formatCampaignSentAt } from "@/lib/format";
import StatusBadge, { campaignStatusLabel } from "@/components/dashboard/StatusBadge";
import { isAdminDesignPreview } from "@/lib/admin/design-preview";
import {
  DEMO_CAMPAIGNS,
  DEMO_COMPOSE,
  DEMO_SEND_RESULT,
} from "@/lib/admin/notifications-demo";
import { cn } from "@/lib/utils";

type Campaign = {
  id: string;
  title: string;
  audience: string;
  targeted_devices: number;
  push_success: number;
  push_failure: number;
  status: string;
  sent_at: string | null;
};

type SendResult = {
  targeted_devices: number;
  push_success: number;
  push_failure: number;
  status: string;
};

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/5 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

const TEXTAREA_CLASS =
  "min-h-[104px] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/5 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

function audienceLabel(a: string) {
  if (a === "all") return "All";
  if (a === "ios") return "iOS";
  if (a === "android") return "Android";
  return a;
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{children}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function SegmentTabs({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string; disabled?: boolean }[];
}) {
  return (
    <div className="flex w-full flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50/90 p-1 dark:border-gray-700 dark:bg-gray-900/40">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={opt.disabled}
          onClick={() => !opt.disabled && onChange(opt.id)}
          className={cn(
            "min-w-[4.5rem] flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:px-3",
            opt.disabled && "cursor-not-allowed opacity-40",
            value === opt.id
              ? "bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-900"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function BroadcastBanner({ result, onDismiss }: { result: SendResult; onDismiss: () => void }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200/90 bg-gradient-to-r from-green-50/95 to-white px-4 py-2.5 shadow-sm dark:border-green-900/40 dark:from-green-950/30 dark:to-[var(--color-card)]"
      role="status"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-800 dark:text-gray-100">
        <span className="inline-flex items-center gap-2 font-semibold text-green-900 dark:text-green-200">
          <span className="h-2 w-2 shrink-0 rounded-full bg-green-500 ring-2 ring-green-200 dark:ring-green-900" />
          Broadcast processed
        </span>
        <span className="hidden h-4 w-px bg-green-200 sm:inline dark:bg-green-800" />
        <span>
          Targeted devices{" "}
          <strong className="font-semibold tabular-nums text-gray-900 dark:text-gray-100">
            {result.targeted_devices.toLocaleString()}
          </strong>
        </span>
        <span className="hidden h-4 w-px bg-green-200 sm:inline dark:bg-green-800" />
        <span>
          Success{" "}
          <strong className="font-semibold tabular-nums text-green-700 dark:text-green-400">
            {result.push_success.toLocaleString()}
          </strong>
        </span>
        <span className="hidden h-4 w-px bg-green-200 sm:inline dark:bg-green-800" />
        <span>
          Failure{" "}
          <strong
            className={cn(
              "font-semibold tabular-nums",
              result.push_failure > 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
            )}
          >
            {result.push_failure.toLocaleString()}
          </strong>
        </span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function NotificationsClient() {
  const searchParams = useSearchParams();
  const designPreview = isAdminDesignPreview(searchParams);

  const [title, setTitle] = useState(designPreview ? DEMO_COMPOSE.title : "");
  const [body, setBody] = useState(designPreview ? DEMO_COMPOSE.body : "");
  const [imageUrl, setImageUrl] = useState(designPreview ? DEMO_COMPOSE.image_url : "");
  const [deepLink, setDeepLink] = useState(designPreview ? DEMO_COMPOSE.deep_link : "home/try-on");
  const [audienceTab, setAudienceTab] = useState<"all" | "platform">("all");
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [scheduleTab, setScheduleTab] = useState<"now" | "later">("now");
  const [scheduleAt, setScheduleAt] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [result, setResult] = useState<SendResult | null>(null);
  const [previewBanner, setPreviewBanner] = useState(designPreview);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  const audience: "all" | "ios" | "android" = audienceTab === "all" ? "all" : platform;
  const bodyChars = body.length;

  const loadCampaigns = useCallback(() => {
    setTableLoading(true);
    apiFetch<{ items: Campaign[] }>("/api/v1/admin/broadcast?limit=20").then((res) => {
      if (res.data) setCampaigns(res.data.items);
      setTableLoading(false);
    });
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    if (!designPreview) return;
    setTitle(DEMO_COMPOSE.title);
    setBody(DEMO_COMPOSE.body);
    setImageUrl(DEMO_COMPOSE.image_url);
    setDeepLink(DEMO_COMPOSE.deep_link);
    setPreviewBanner(true);
  }, [designPreview]);

  const displayCampaigns = useMemo(() => {
    if (!designPreview) return campaigns;
    const liveIds = new Set(campaigns.map((c) => c.id));
    const demoOnly = DEMO_CAMPAIGNS.filter((d) => !liveIds.has(d.id));
    return [...demoOnly, ...campaigns];
  }, [designPreview, campaigns]);

  const bannerResult = result ?? (designPreview && previewBanner ? DEMO_SEND_RESULT : null);

  async function send() {
    setLoading(true);
    setError(null);
    setResult(null);
    setPreviewBanner(false);
    const scheduleIso =
      scheduleTab === "later" && scheduleAt ? new Date(scheduleAt).toISOString() : undefined;
    if (scheduleTab === "later" && !scheduleIso) {
      setError("Choose a future date and time to schedule.");
      setLoading(false);
      return;
    }
    const res = await apiFetch<SendResult>("/api/v1/admin/broadcast", {
      method: "POST",
      body: JSON.stringify({
        title,
        body,
        image_url: imageUrl || undefined,
        deep_link: deepLink,
        audience,
        app_version: appVersion.trim() || undefined,
        schedule_at: scheduleIso,
        send_now: scheduleTab === "now",
      }),
    });
    if (res.error) setError(res.error.message);
    else if (res.data) {
      setResult(res.data);
      loadCampaigns();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {designPreview && (
        <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
          Design preview — sample compose fields and demo campaigns. Enable with{" "}
          <code className="rounded bg-white/70 px-1 dark:bg-gray-900/50">?demo=1</code>.
        </p>
      )}

      <PageHeader title="Notifications" subtitle="Send push notifications and review delivery results." />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
        <div className="grid xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
          <div className="p-5 sm:p-6 xl:border-r xl:border-gray-100 dark:xl:border-gray-800">
            <div className="mb-5 border-b border-gray-100 pb-4 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Compose notification</h2>
              <p className="mt-0.5 text-xs text-gray-500">Title and body are required. Image URL is optional.</p>
            </div>
            <div className="space-y-4">
              <div>
                <FieldLabel>Title</FieldLabel>
                <input
                  className={INPUT_CLASS}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your next look is waiting"
                />
              </div>
              <div>
                <FieldLabel hint="Shown in the push notification body.">Body</FieldLabel>
                <textarea
                  className={TEXTAREA_CLASS}
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Explore fresh styles and create your next look with AI Wardrobe."
                />
                <p className="mt-1 text-right text-[11px] text-gray-400">{bodyChars} characters</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Image URL (optional)</FieldLabel>
                  <input
                    className={INPUT_CLASS}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://cdn.example.com/promo.jpg"
                  />
                </div>
                <div>
                  <FieldLabel hint="Opened when the user taps the notification.">Deep link route</FieldLabel>
                  <input
                    className={INPUT_CLASS}
                    value={deepLink}
                    onChange={(e) => setDeepLink(e.target.value)}
                    placeholder="home/try-on"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel>Audience</FieldLabel>
                <SegmentTabs
                  value={audienceTab}
                  onChange={(v) => setAudienceTab(v as "all" | "platform")}
                  options={[
                    { id: "all", label: "All users" },
                    { id: "platform", label: "By platform" },
                  ]}
                />
                <select
                  className={cn(INPUT_CLASS, "mt-2 max-w-sm", audienceTab === "all" && "text-gray-500")}
                  disabled={audienceTab === "all"}
                  value={audienceTab === "all" ? "both" : platform}
                  onChange={(e) => setPlatform(e.target.value as "ios" | "android")}
                >
                  {audienceTab === "all" ? (
                    <option value="both">iOS / Android</option>
                  ) : (
                    <>
                      <option value="ios">iOS</option>
                      <option value="android">Android</option>
                    </>
                  )}
                </select>
                <input
                  className={cn(INPUT_CLASS, "mt-2 max-w-sm")}
                  placeholder="App version filter (optional, e.g. 1.2.0)"
                  value={appVersion}
                  onChange={(e) => setAppVersion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Schedule</FieldLabel>
                <SegmentTabs
                  value={scheduleTab}
                  onChange={(v) => setScheduleTab(v as "now" | "later")}
                  options={[
                    { id: "now", label: "Now" },
                    { id: "later", label: "Later" },
                  ]}
                />
                {scheduleTab === "later" && (
                  <input
                    type="datetime-local"
                    className={cn(INPUT_CLASS, "mt-2 max-w-sm")}
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                  />
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
              <Button
                onClick={send}
                disabled={loading || !title.trim() || !body.trim() || (scheduleTab === "later" && !scheduleAt)}
              >
                {loading ? "Saving…" : scheduleTab === "later" ? "Schedule notification" : "Send notification"}
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-b from-sky-50/40 to-white px-5 py-6 sm:px-6 dark:from-sky-950/15 dark:to-[var(--color-card)]">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preview</h2>
            <p className="mt-0.5 text-xs text-gray-500">Example device preview</p>
            <div className="mt-6 flex justify-center pb-2 pt-2">
              <PhoneNotificationPreview title={title} body={body} imageUrl={imageUrl} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {bannerResult && (
        <BroadcastBanner
          result={bannerResult}
          onDismiss={() => {
            setResult(null);
            setPreviewBanner(false);
          }}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent campaigns</h2>
            <p className="mt-0.5 text-xs text-gray-500">Delivery results from FCM broadcast sends.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={loadCampaigns}>
            <RefreshCw className={cn("h-3.5 w-3.5", tableLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-left dark:border-gray-800 dark:bg-gray-900/40">
                <th className="table-head px-5 py-3">Sent at</th>
                <th className="table-head px-5 py-3">Title</th>
                <th className="table-head px-5 py-3">Audience</th>
                <th className="table-head px-5 py-3">Targeted</th>
                <th className="table-head px-5 py-3">Success</th>
                <th className="table-head px-5 py-3">Failure</th>
                <th className="table-head px-5 py-3">Status</th>
                <th className="table-head px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableLoading && displayCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">Loading campaigns…</td>
                </tr>
              ) : displayCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">No campaigns sent yet</td>
                </tr>
              ) : (
                displayCampaigns.map((c, i) => (
                  <tr
                    key={c.id}
                    className={cn(
                      "border-b border-gray-50 transition-colors dark:border-gray-800/60",
                      i === 0 && designPreview && "bg-sky-50/50 dark:bg-sky-950/15",
                      "hover:bg-gray-50/70 dark:hover:bg-gray-900/25"
                    )}
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                      {formatCampaignSentAt(c.sent_at)}
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {c.title}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{audienceLabel(c.audience)}</td>
                    <td className="px-5 py-3.5 text-sm tabular-nums text-gray-800 dark:text-gray-200">
                      {c.targeted_devices.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold tabular-nums text-green-700 dark:text-green-400">
                      {c.push_success.toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-3.5 text-sm tabular-nums",
                        c.push_failure > 0 ? "font-semibold text-red-600 dark:text-red-400" : "text-gray-500"
                      )}
                    >
                      {c.push_failure.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={campaignStatusLabel(c.status)} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/notifications/campaigns/${c.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t border-gray-100 px-5 py-3 text-[11px] text-gray-400 dark:border-gray-800">
          Success counts reflect FCM acceptance, not guaranteed on-device delivery.
        </p>
      </div>
    </div>
  );
}
