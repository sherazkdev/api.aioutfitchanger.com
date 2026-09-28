"use client";

import { useEffect, useMemo, useState } from "react";
import RemoteImage from "@/components/dashboard/RemoteImage";
import Link from "next/link";
import StatCard from "@/components/dashboard/charts/StatCard";
import TryOnActivityChart from "@/components/dashboard/charts/TryOnActivityChart";
import DonutChart from "@/components/dashboard/charts/DonutChart";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api/client";
import { formatCreatedShort } from "@/lib/format";
import { ChevronDown } from "lucide-react";

type OverviewPayload = {
  users: { total: number; change_label: string };
  devices: { registered: number };
  try_on_jobs: { total: number; success_rate: number; change_label: string };
  sessions: { active_tokens: number; expired_tokens: number; revoked_tokens: number };
  activity: {
    current: number[];
    previous: number[];
    labels: string[];
    current_total?: number;
    previous_total?: number;
    current_series_name?: string;
    previous_series_name?: string;
    note?: string;
  };
  job_status: { label: string; value: number; color: string }[];
  recent_jobs: {
    id: string;
    job_id: string;
    user_name: string;
    user_avatar: string | null;
    style: string;
    created_at: string | null;
    status: string;
  }[];
  generated_at: string;
};

function periodDelta(current: number, previous: number): string {
  if (previous === 0 && current === 0) return "0%";
  if (previous === 0) return "New";
  const pct = Math.round(((current - previous) / previous) * 10) / 10;
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function OverviewSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

export default function OverviewClient() {
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const load = (periodDays: number) => {
    setLoading(true);
    setError(null);
    apiFetch<OverviewPayload>(`/api/v1/admin/overview?days=${periodDays}`).then((res) => {
      if (res.error) {
        setError(res.error.message);
        setData(null);
      } else {
        setData(res.data ?? null);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    load(days);
  }, [days]);

  const activityTotals = useMemo(() => {
    if (!data) return { current: 0, previous: 0 };
    const current = data.activity.current_total ?? data.activity.current.reduce((a, b) => a + b, 0);
    const previous = data.activity.previous_total ?? data.activity.previous.reduce((a, b) => a + b, 0);
    return { current, previous };
  }, [data]);

  if (loading && !data) return <OverviewSkeleton />;
  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50/80 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
        <button
          type="button"
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900"
          onClick={() => load(days)}
        >
          Retry
        </button>
      </div>
    );
  }
  if (!data) return <p className="text-sm text-gray-500">No data</p>;

  const maxSession = Math.max(
    data.sessions.active_tokens,
    data.sessions.expired_tokens,
    data.sessions.revoked_tokens,
    1
  );

  const periodChange = periodDelta(activityTotals.current, activityTotals.previous);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 lg:text-[22px]">Overview</h1>
          <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">Users, try-ons, and system activity from your database.</p>
        </div>
        <div className="relative shrink-0 sm:mt-1">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="appearance-none rounded-full border border-blue-200 bg-blue-50 py-2 pl-4 pr-9 text-[13px] font-medium text-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
            aria-label="Activity period"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={data.users.total.toLocaleString()} change={data.users.change_label} index={0} />
        <StatCard label="Registered devices" value={data.devices.registered.toLocaleString()} change="" index={1} />
        <StatCard label="Try-on jobs total" value={data.try_on_jobs.total.toLocaleString()} change={data.try_on_jobs.change_label} index={2} />
        <StatCard label="Success rate" value={`${data.try_on_jobs.success_rate}%`} change="of all jobs" index={3} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)] xl:col-span-8">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Try-on activity</h2>
              <p className="mt-0.5 text-xs text-gray-500">Daily job creations (UTC) — current vs prior period</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/40">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">This period</p>
                <p className="text-lg font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                  {activityTotals.current.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/40">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Prior period</p>
                <p className="text-lg font-semibold tabular-nums text-gray-600 dark:text-gray-300">
                  {activityTotals.previous.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 dark:border-blue-900/40 dark:bg-blue-950/30">
                <p className="text-[10px] font-medium uppercase tracking-wide text-blue-600/80">Change</p>
                <p className="text-lg font-semibold tabular-nums text-blue-700 dark:text-blue-300">{periodChange}</p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <TryOnActivityChart
              current={data.activity.current}
              previous={data.activity.previous}
              labels={data.activity.labels}
              currentSeriesName={data.activity.current_series_name ?? `Last ${days} days`}
              previousSeriesName={data.activity.previous_series_name ?? `Prior ${days} days`}
              labelEvery={days <= 7 ? 1 : days <= 14 ? 2 : 5}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)] xl:col-span-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Job status</h2>
          <p className="mt-0.5 text-xs text-gray-500">All-time breakdown</p>
          <div className="pt-3">
            <DonutChart data={data.job_status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <h2 className="text-sm font-semibold">Recent try-on jobs</h2>
            <Link href="/admin/try-on-jobs" className="text-[13px] font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left dark:border-gray-800 dark:bg-gray-900/20">
                  <th className="table-head px-5 py-2.5">Job ID</th>
                  <th className="table-head px-5 py-2.5">User</th>
                  <th className="table-head px-5 py-2.5">Style</th>
                  <th className="table-head px-5 py-2.5">Created</th>
                  <th className="table-head px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">No jobs yet</td>
                  </tr>
                ) : (
                  data.recent_jobs.map((j) => (
                    <tr key={j.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800/50">
                      <td className="px-5 py-3.5 text-sm font-medium">
                        <Link href={`/admin/try-on-jobs/details?id=${j.id}`} className="text-blue-600 hover:underline">
                          #{j.job_id}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {j.user_avatar ? (
                            <div className="relative h-8 w-8 overflow-hidden rounded-full">
                              <RemoteImage src={j.user_avatar} alt="" fill className="object-cover" sizes="32px" />
                            </div>
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs dark:bg-gray-800">
                              ?
                            </span>
                          )}
                          <span className="text-[13px]">{j.user_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-600">{j.style}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-500">{formatCreatedShort(j.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          status={j.status ? j.status.charAt(0).toUpperCase() + j.status.slice(1) : "Queued"}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Sessions</h2>
            <Link href="/admin/token-management" className="text-[13px] text-blue-600 hover:underline">
              Tokens
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { label: "Active", value: data.sessions.active_tokens, color: "bg-blue-500" },
              { label: "Expired", value: data.sessions.expired_tokens, color: "bg-gray-400" },
              { label: "Revoked", value: data.sessions.revoked_tokens, color: "bg-red-400" },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-medium tabular-nums text-gray-900 dark:text-gray-100">{row.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${(row.value / maxSession) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
