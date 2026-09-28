"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, RefreshCw, Search, Smartphone, Tablet } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/dashboard/StatusBadge";
import TablePagination from "@/components/dashboard/TablePagination";
import { apiFetch } from "@/lib/api/client";
import { isAdminDesignPreview } from "@/lib/admin/design-preview";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { DEMO_CHART, DEMO_ITEMS, DEMO_KPIS } from "@/lib/admin/devices-demo";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type DeviceRow = {
  id: string;
  user_email: string;
  platform: string;
  device_id: string;
  app_version: string;
  last_seen_at: string | null;
  fcm_token_suffix: string;
  status: string;
  revoked_at: string | null;
};

type Kpis = {
  total_devices: number;
  active_7d: number;
  stale_30d: number;
  platform_split?: { ios: number; android: number; ios_pct: number; android_pct: number };
};

const SELECT_CLASS =
  "h-9 w-full min-w-[120px] rounded-lg border border-gray-200 bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-900";

function deviceStatusLabel(s: string) {
  if (s === "active") return "Active";
  if (s === "stale") return "Stale";
  if (s === "revoked") return "Revoked";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PlatformBadge({ platform }: { platform: string }) {
  const ios = platform === "ios";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
        ios ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
      )}
    >
      {ios ? <Smartphone className="h-3 w-3" /> : <Tablet className="h-3 w-3" />}
      {platform}
    </span>
  );
}

function MetricCard({
  label,
  value,
  tone = "sky",
}: {
  label: string;
  value: number;
  tone?: "sky" | "amber" | "white";
}) {
  const shell =
    tone === "amber"
      ? "border-amber-100/90 bg-amber-50/70 dark:border-amber-900/30 dark:bg-amber-950/20"
      : tone === "white"
        ? "border-gray-100 bg-white dark:border-gray-800 dark:bg-[var(--color-card)]"
        : "border-sky-100/90 bg-sky-50/60 dark:border-sky-900/35 dark:bg-sky-950/15";
  const valueClass = tone === "amber" ? "text-amber-700 dark:text-amber-400" : "text-gray-900 dark:text-gray-100";

  return (
    <div className={cn("rounded-xl border px-4 py-3.5 shadow-sm", shell)}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={cn("mt-1 text-[28px] font-semibold leading-none tabular-nums tracking-tight", valueClass)}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function PlatformSplitCard({
  ios,
  android,
  iosPct,
  androidPct,
}: {
  ios: number;
  android: number;
  iosPct: number;
  androidPct: number;
}) {
  const total = ios + android;
  const iosShare = total ? ios / total : 0;
  const r = 28;
  const c = 2 * Math.PI * r;
  const iosLen = c * iosShare;
  const andLen = c - iosLen;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Platform split</p>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 72 72" className="h-[72px] w-[72px] shrink-0" aria-hidden>
          <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:stroke-gray-700" />
          {total > 0 && (
            <>
              <circle
                cx="36"
                cy="36"
                r={r}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${iosLen} ${c}`}
                transform="rotate(-90 36 36)"
              />
              <circle
                cx="36"
                cy="36"
                r={r}
                fill="none"
                stroke="#22c55e"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${andLen} ${c}`}
                strokeDashoffset={-iosLen}
                transform="rotate(-90 36 36)"
              />
            </>
          )}
        </svg>
        <div className="min-w-0 flex-1 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              iOS
            </span>
            <span className="tabular-nums text-gray-900 dark:text-gray-100">
              {ios.toLocaleString()}
              <span className="ml-1.5 font-normal text-gray-400">{iosPct}%</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Android
            </span>
            <span className="tabular-nums text-gray-900 dark:text-gray-100">
              {android.toLocaleString()}
              <span className="ml-1.5 font-normal text-gray-400">{androidPct}%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function chartDayLabel(isoDate: string) {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function DevicesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designPreview = isAdminDesignPreview(searchParams);
  const userId = searchParams.get("user_id") ?? searchParams.get("user");

  const [items, setItems] = useState<DeviceRow[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [chart, setChart] = useState<{ date: string; count: number }[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [platform, setPlatform] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (designPreview) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ limit: "20", page: String(page) });
    if (userId) params.set("user_id", userId);
    if (debouncedQ) params.set("q", debouncedQ);
    if (platform) params.set("platform", platform);
    if (appVersion) params.set("app_version", appVersion);
    if (lastSeen) params.set("last_seen", lastSeen);
    apiFetch<{ items: DeviceRow[]; kpis: Kpis; registrations_chart?: { date: string; count: number }[]; meta: { page: number; limit: number; total: number } }>(
      `/api/v1/admin/devices?${params}`
    ).then((res) => {
      if (res.data) {
        setItems(res.data.items);
        setKpis(res.data.kpis);
        setFiltersApplied(Boolean((res.data.kpis as { filters_applied?: boolean }).filters_applied));
        setChart(res.data.registrations_chart ?? []);
        setMeta(res.data.meta);
      }
      setLoading(false);
    });
  }, [debouncedQ, userId, platform, appVersion, lastSeen, page, designPreview]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, platform, appVersion, lastSeen]);

  useEffect(() => {
    load();
  }, [load]);

  const displayKpis = designPreview ? DEMO_KPIS : kpis;
  const displayChart = designPreview ? DEMO_CHART : chart;

  const displayItems = useMemo(() => {
    if (!designPreview) return items;
    let rows = [...DEMO_ITEMS] as DeviceRow[];
    if (platform) rows = rows.filter((r) => r.platform === platform);
    if (appVersion) rows = rows.filter((r) => r.app_version === appVersion);
    if (lastSeen === "7d") rows = rows.filter((r) => r.status === "active");
    if (lastSeen === "stale") rows = rows.filter((r) => r.status === "stale");
    if (q.trim()) {
      const n = q.toLowerCase();
      rows = rows.filter((r) => r.user_email.toLowerCase().includes(n) || r.device_id.toLowerCase().includes(n));
    }
    return rows;
  }, [designPreview, items, platform, appVersion, lastSeen, q]);

  const displayMeta = designPreview ? { page: 1, limit: 6, total: 1248 } : meta;
  const appVersions = useMemo(() => {
    const src = designPreview ? (DEMO_ITEMS as DeviceRow[]) : items;
    return Array.from(new Set(src.map((d) => d.app_version).filter((v) => v && v !== "—"))).sort();
  }, [designPreview, items]);

  async function revoke(id: string) {
    if (designPreview) return;
    await apiFetch(`/api/v1/admin/devices/${id}`, { method: "DELETE" });
    load();
  }

  function copySuffix(suffix: string) {
    if (!suffix || suffix === "—") return;
    void navigator.clipboard.writeText(suffix);
  }

  const from = displayMeta.total ? (displayMeta.page - 1) * displayMeta.limit + 1 : 0;
  const to = Math.min(displayMeta.page * displayMeta.limit, displayMeta.total);
  const totalPages = Math.max(1, Math.ceil(displayMeta.total / displayMeta.limit));
  const pageButtons: (number | "...")[] =
    totalPages <= 5 ? Array.from({ length: totalPages }, (_, i) => i + 1) : [1, 2, 3, "...", totalPages];

  return (
    <div className="space-y-5">
      {designPreview && (
        <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
          Design preview — sample devices, KPIs, and registration chart. Enable with{" "}
          <code className="rounded bg-white/70 px-1 dark:bg-gray-900/50">?demo=1</code> or{" "}
          <code className="rounded bg-white/70 px-1 dark:bg-gray-900/50">NEXT_PUBLIC_ADMIN_DESIGN_PREVIEW=1</code>.
        </p>
      )}

      <PageHeader
        title="Device Registry"
        subtitle="FCM tokens registered to user devices."
        actions={[
          { label: "Sample data", variant: "outline", onClick: () => router.push("/admin/devices") },
          { label: "Refresh", variant: "outline", onClick: load },
        ]}
      />

      {userId && (
        <p className="text-sm text-gray-500">
          Filtered by user.{" "}
          <Link href="/admin/devices" className="text-blue-600 hover:underline">Clear filter</Link>
        </p>
      )}

      {filtersApplied && !designPreview && (
        <p className="text-xs text-gray-500">KPI counts reflect your current filters.</p>
      )}
      {displayKpis && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total devices" value={displayKpis.total_devices} tone="sky" />
          <MetricCard label="Active (last 7d)" value={displayKpis.active_7d} tone="sky" />
          {displayKpis.platform_split ? (
            <PlatformSplitCard
              ios={displayKpis.platform_split.ios}
              android={displayKpis.platform_split.android}
              iosPct={displayKpis.platform_split.ios_pct}
              androidPct={displayKpis.platform_split.android_pct}
            />
          ) : (
            <MetricCard label="Platform split" value={0} tone="white" />
          )}
          <MetricCard label="Stale tokens (>30d)" value={displayKpis.stale_30d} tone="amber" />
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative min-w-0 flex-1">
            <span className="mb-1 block text-[11px] font-medium text-gray-500">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/80 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/5 dark:border-gray-700 dark:bg-gray-900/40"
                placeholder="Search user email…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                onKeyDown={(e) => e.key === "Enter" && load()}
              />
            </div>
          </div>
          <label className="flex min-w-[120px] flex-col gap-1">
            <span className="text-[11px] font-medium text-gray-500">Platform</span>
            <select className={SELECT_CLASS} value={platform} onChange={(e) => { setPlatform(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </label>
          <label className="flex min-w-[120px] flex-col gap-1">
            <span className="text-[11px] font-medium text-gray-500">App version</span>
            <select className={SELECT_CLASS} value={appVersion} onChange={(e) => { setAppVersion(e.target.value); setPage(1); }}>
              <option value="">All</option>
              {appVersions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[130px] flex-col gap-1">
            <span className="text-[11px] font-medium text-gray-500">Last seen</span>
            <select className={SELECT_CLASS} value={lastSeen} onChange={(e) => { setLastSeen(e.target.value); setPage(1); }}>
              <option value="">Any time</option>
              <option value="7d">Active (7d)</option>
              <option value="stale">Stale (&gt;30d)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-left dark:border-gray-800 dark:bg-gray-900/40">
                <th className="table-head px-5 py-3">User email</th>
                <th className="table-head px-5 py-3">Platform</th>
                <th className="table-head px-5 py-3">Device ID</th>
                <th className="table-head px-5 py-3">App version</th>
                <th className="table-head px-5 py-3">Last seen</th>
                <th className="table-head px-5 py-3">FCM token</th>
                <th className="table-head px-5 py-3">Status / Revoked at</th>
                <th className="table-head px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && !designPreview ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-gray-300" />
                    Loading devices…
                  </td>
                </tr>
              ) : displayItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">No devices found</td>
                </tr>
              ) : (
                displayItems.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/60 dark:border-gray-800/60 dark:hover:bg-gray-900/20">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-100">{d.user_email}</td>
                    <td className="px-5 py-3.5">
                      <PlatformBadge platform={d.platform} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{d.device_id}</td>
                    <td className="px-5 py-3.5 text-sm tabular-nums text-gray-700">{d.app_version}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{formatRelativeTime(d.last_seen_at)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 font-mono text-xs text-blue-600 hover:underline"
                        title="Copies last 4 characters only"
                        onClick={() => copySuffix(d.fcm_token_suffix)}
                      >
                        ••••{d.fcm_token_suffix}
                        <Copy className="h-3 w-3 opacity-60" />
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={deviceStatusLabel(d.status)} />
                      {d.status === "revoked" && d.revoked_at && (
                        <p className="mt-1 text-[11px] text-gray-400">{formatDateTime(d.revoked_at)}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {d.status !== "revoked" ? (
                        <button type="button" className="text-sm font-medium text-red-600 hover:underline" onClick={() => revoke(d.id)}>
                          Revoke push
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          summary={`Showing ${from}–${to} of ${displayMeta.total.toLocaleString()}`}
          pages={pageButtons}
          current={designPreview ? 1 : page}
          onPage={designPreview ? undefined : setPage}
        />
        {designPreview && (
          <p className="border-t border-gray-100 px-5 py-2.5 text-[11px] text-gray-400 dark:border-gray-800">
            Preview only — revoke actions are disabled. Use live mode (default) for real data.
          </p>
        )}
      </div>

      {(designPreview || displayChart.length > 0) && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Registrations per day</h3>
            <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-500 dark:border-gray-700 dark:bg-gray-900/40">
              Last 14 days
            </span>
          </div>
          {!designPreview && displayChart.length === 0 ? (
            <p className="mt-6 py-8 text-center text-sm text-gray-500">No device registrations in the last 14 days.</p>
          ) : (
          <div className="mt-4 flex h-44 items-end gap-1 border-b border-gray-100 pb-1 dark:border-gray-800">
            {displayChart.map((c) => {
              const max = Math.max(...displayChart.map((x) => x.count), 1);
              const h = Math.max(8, (c.count / max) * 100);
              return (
                <div key={c.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] font-medium text-gray-500">{c.count}</span>
                  <div className="flex w-full flex-1 items-end justify-center" style={{ height: "7rem" }}>
                    <div
                      className="w-[70%] max-w-[28px] rounded-t bg-sky-400/85 dark:bg-sky-500"
                      style={{ height: `${h}%` }}
                      title={`${c.date}: ${c.count}`}
                    />
                  </div>
                  <span className="text-[8px] text-gray-400">{chartDayLabel(c.date)}</span>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
