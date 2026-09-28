"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, KeyRound, List, RefreshCw } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StackedHourlyChart from "@/components/dashboard/charts/StackedHourlyChart";
import { apiFetch } from "@/lib/api/client";
import { isAdminDesignPreview } from "@/lib/admin/design-preview";
import { DEMO_SYSTEM_STATUS } from "@/lib/admin/system-demo";
import { formatCampaignSentAt, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type StatusPayload = {
  mongodb: { status: string; latency_ms: number | null };
  fcm: { status: string; configured: boolean; last_send?: string | null };
  google_oauth: { status: string; client_ids_masked: string[] };
  bfl_api: { status: string; last_poll?: string | null };
  environment: { app_url: string | null; node_env: string; mongo_host_masked: string };
  try_on_hourly_24h: { hour: number; completed: number; failed: number; cancelled: number }[];
  operations?: { last_24h: Record<string, number>; last_7d: Record<string, number> };
  incident_log: {
    available: boolean;
    message: string;
    view_all_href?: string;
    items?: { time: string; service: string; level: string; message: string }[];
  };
  checked_at: string;
};

function statusTone(status: string): "ok" | "warn" | "bad" {
  const s = status.toLowerCase();
  if (s.includes("error") || s.includes("not")) return "bad";
  if (s.includes("disconnect")) return "bad";
  return "ok";
}

function ServiceCard({
  title,
  statusLabel,
  tone,
  lines,
}: {
  title: string;
  statusLabel: string;
  tone: "ok" | "warn" | "bad";
  lines: string[];
}) {
  const dot = tone === "ok" ? "bg-green-500" : tone === "warn" ? "bg-amber-500" : "bg-red-500";
  const statusClass =
    tone === "ok" ? "text-green-700 dark:text-green-400" : tone === "warn" ? "text-amber-700" : "text-red-600";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        <button type="button" className="inline-flex items-center text-[11px] font-medium text-gray-400 hover:text-blue-600">
          View details
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className={cn("h-2 w-2 shrink-0 rounded-full ring-2 ring-white dark:ring-gray-900", dot)} />
        <p className={cn("text-sm font-semibold capitalize", statusClass)}>{statusLabel}</p>
      </div>
      <ul className="mt-2 space-y-0.5">
        {lines.filter(Boolean).map((line) => (
          <li key={line} className="text-xs text-gray-500 dark:text-gray-400">{line}</li>
        ))}
      </ul>
    </div>
  );
}

type CardView = { statusLabel: string; tone: "ok" | "warn" | "bad"; lines: string[] };

function mapApiToDisplay(data: StatusPayload): Record<"mongodb" | "fcm" | "google" | "bfl", CardView> {
  return {
    mongodb: {
      statusLabel: data.mongodb.status === "connected" ? "Connected" : data.mongodb.status,
      tone: statusTone(data.mongodb.status),
      lines: [
        data.mongodb.latency_ms != null ? `Latency ${data.mongodb.latency_ms} ms` : "",
        data.mongodb.status === "connected" ? "Connection check passed." : "",
      ],
    },
    fcm: {
      statusLabel: data.fcm.configured ? "Configured" : "Not configured",
      tone: data.fcm.configured ? "ok" : "bad",
      lines: [
        data.fcm.last_send ? `Last send: ${data.fcm.last_send}` : data.fcm.configured ? "No pushes sent yet" : `Status: ${data.fcm.status}`,
      ],
    },
    google: {
      statusLabel: data.google_oauth.status === "configured" ? "Configured" : data.google_oauth.status,
      tone: statusTone(data.google_oauth.status),
      lines: data.google_oauth.client_ids_masked.length ? data.google_oauth.client_ids_masked : ["No client IDs in environment"],
    },
    bfl: {
      statusLabel: data.bfl_api.status === "configured" ? "Configured" : data.bfl_api.status.replace(/_/g, " "),
      tone: statusTone(data.bfl_api.status),
      lines: [
        data.bfl_api.last_poll ? `Last job poll: ${data.bfl_api.last_poll}` : data.bfl_api.status === "configured" ? "No BFL jobs polled yet" : "",
      ],
    },
  };
}

function mapDemoToDisplay(): Record<"mongodb" | "fcm" | "google" | "bfl", CardView> {
  const d = DEMO_SYSTEM_STATUS;
  return {
    mongodb: {
      statusLabel: "Connected",
      tone: "ok" as const,
      lines: [`Latency ${d.mongodb.latency_ms} ms`, d.mongodb.detail],
    },
    fcm: {
      statusLabel: "Configured",
      tone: "ok" as const,
      lines: [d.fcm.detail],
    },
    google: {
      statusLabel: "Configured",
      tone: "ok" as const,
      lines: d.google_oauth.client_ids_masked,
    },
    bfl: {
      statusLabel: "Configured",
      tone: "ok" as const,
      lines: [d.bfl_api.detail],
    },
  };
}

export default function SystemClient() {
  const searchParams = useSearchParams();
  const designPreview = isAdminDesignPreview(searchParams);

  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<StatusPayload>("/api/v1/admin/system-status").then((res) => {
      if (res.error) {
        setError(res.error.message);
        setData(null);
      } else if (res.data) {
        setError(null);
        setData(res.data);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const display = useMemo(() => {
    if (designPreview) {
      return {
        payload: DEMO_SYSTEM_STATUS as StatusPayload,
        cards: mapDemoToDisplay(),
      };
    }
    if (!data) return null;
    return { payload: data, cards: mapApiToDisplay(data) };
  }, [designPreview, data]);

  if (!display && loading) {
    return <p className="text-sm text-gray-500">Loading system status…</p>;
  }

  if (!display) {
    return <p className="text-sm text-red-600">{error ?? "Unable to load system status"}</p>;
  }

  const { payload, cards } = display;
  const checkedLabel = formatCampaignSentAt(payload.checked_at);

  return (
    <div className="space-y-5">
      {designPreview && (
        <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
          Design preview — sample service cards and 24h chart. Enable with{" "}
          <code className="rounded bg-white/70 px-1 dark:bg-gray-900/50">?demo=1</code> or{" "}
          <code className="rounded bg-white/70 px-1 dark:bg-gray-900/50">NEXT_PUBLIC_ADMIN_DESIGN_PREVIEW=1</code>.
        </p>
      )}

      <PageHeader
        title="System Status"
        subtitle="Service health and try-on operations at a glance."
        actions={[{ label: "Refresh", onClick: load, variant: "outline" }]}
      />

      {error && designPreview && (
        <p className="text-xs text-amber-700 dark:text-amber-400">Live API note: {error} (showing preview data).</p>
      )}
      {error && !designPreview && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <ServiceCard title="MongoDB" statusLabel={cards.mongodb.statusLabel} tone={cards.mongodb.tone} lines={cards.mongodb.lines} />
        <ServiceCard title="FCM Admin SDK" statusLabel={cards.fcm.statusLabel} tone={cards.fcm.tone} lines={cards.fcm.lines} />
        <ServiceCard title="Google OAuth" statusLabel={cards.google.statusLabel} tone={cards.google.tone} lines={cards.google.lines} />
        <ServiceCard title="BFL Flux API" statusLabel={cards.bfl.statusLabel} tone={cards.bfl.tone} lines={cards.bfl.lines} />
      </div>

      <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-xs text-gray-700 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-gray-300">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <span>
            <span className="font-medium text-gray-500">APP_URL</span> {payload.environment.app_url ?? "—"}
          </span>
          <span>
            <span className="font-medium text-gray-500">NODE_ENV</span> {payload.environment.node_env}
          </span>
          <span>
            <span className="font-medium text-gray-500">Mongo host</span> {payload.environment.mongo_host_masked}
          </span>
          <span>
            <span className="font-medium text-gray-500">Checked at</span> {checkedLabel || formatDateTime(payload.checked_at)}
          </span>
          <span>
            <span className="font-medium text-gray-500">Auto-refresh</span> 60s
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Try-on outcomes (24h)</h2>
        <p className="mt-0.5 text-xs text-gray-500">By job createdAt (UTC)</p>
        <StackedHourlyChart data={payload.try_on_hourly_24h} />
      </div>

      {payload.operations && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { key: "total", label: "Events (24h)" },
            { key: "token", label: "Token" },
            { key: "device", label: "Device" },
            { key: "user", label: "User" },
            { key: "broadcast", label: "Broadcast" },
            { key: "content", label: "Content" },
          ].map((k) => (
            <div
              key={k.key}
              className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]"
            >
              <p className="text-[11px] font-medium text-gray-400">{k.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{payload.operations!.last_24h[k.key] ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Activity log</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800">Last 20</span>
            {payload.incident_log.view_all_href && (
              <Link href={payload.incident_log.view_all_href} className="text-[11px] font-medium text-blue-600 hover:underline">
                View all
              </Link>
            )}
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-left dark:border-gray-800 dark:bg-gray-900/30">
              <th className="table-head px-5 py-2.5">Time</th>
              <th className="table-head px-5 py-2.5">Service</th>
              <th className="table-head px-5 py-2.5">Level</th>
              <th className="table-head px-5 py-2.5">Message</th>
            </tr>
          </thead>
          <tbody>
            {(payload.incident_log.items ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center">
                  <List className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">{payload.incident_log.message}</p>
                </td>
              </tr>
            ) : (
              (payload.incident_log.items ?? []).map((row, i) => (
                <tr key={`${row.time}-${i}`} className="border-b border-gray-50 dark:border-gray-800/60">
                  <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{row.time}</td>
                  <td className="px-5 py-3 text-xs capitalize text-gray-600">{row.service}</td>
                  <td className="px-5 py-3 text-xs capitalize text-gray-600">{row.level}</td>
                  <td className="px-5 py-3 text-xs text-gray-700 dark:text-gray-300">{row.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/token-management"
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-[var(--color-card)] dark:hover:bg-gray-900/40"
        >
          <span className="inline-flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-gray-400" />
            Open Token management
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>
        <Link
          href="/admin/activity"
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-[var(--color-card)] dark:hover:bg-gray-900/40"
        >
          <span className="inline-flex items-center gap-2">
            <List className="h-4 w-4 text-gray-400" />
            Open activity log
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>
        <Link
          href="/admin/try-on-jobs?status=failed"
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-[var(--color-card)] dark:hover:bg-gray-900/40"
        >
          <span className="inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            Open Try-on Jobs · Failed
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
