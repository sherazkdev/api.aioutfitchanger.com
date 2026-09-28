"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Search } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import TablePagination from "@/components/dashboard/TablePagination";
import { apiFetch } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/session";
import { formatCampaignSentAt } from "@/lib/format";
import { formatAuditAction } from "@/lib/admin/audit-display";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

type AuditRow = {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  actor_email: string | null;
  meta: Record<string, unknown>;
  ip: string | null;
  created_at: string | null;
};

type Summary = {
  last_24h: Record<string, number>;
  last_7d: Record<string, number>;
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "token", label: "Tokens" },
  { id: "device", label: "Devices" },
  { id: "user", label: "Users" },
  { id: "broadcast", label: "Broadcast" },
  { id: "content", label: "Content" },
] as const;

export default function ActivityLogClient() {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0 });
  const [summary, setSummary] = useState<Summary | null>(null);
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(() => {
    apiFetch<Summary>("/api/v1/admin/audit-log?summary=1").then((res) => {
      if (res.data) setSummary(res.data);
    });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: "25" });
    if (category !== "all") params.set("category", category);
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    apiFetch<{ items: AuditRow[]; meta: { page: number; limit: number; total: number } }>(
      `/api/v1/admin/audit-log?${params}`
    ).then((res) => {
      if (res.error) {
        setError(res.error.message);
        setItems([]);
      } else {
        setItems(res.data?.items ?? []);
        setMeta(res.data?.meta ?? { page: 1, limit: 25, total: 0 });
      }
      setLoading(false);
    });
  }, [category, debouncedQ, page]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    setPage(1);
  }, [category, debouncedQ]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const pageButtons = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, 2, 3, "...", totalPages] as (number | "...")[];
  }, [totalPages]);

  async function exportCsv() {
    const params = new URLSearchParams({ export: "csv" });
    if (category !== "all") params.set("category", category);
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    const headers = new Headers();
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`/api/v1/admin/audit-log?${params}`, { headers, credentials: "include" });
    if (!res.ok) {
      setError("CSV export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity log"
        subtitle="Admin actions, security events, and operational history."
        actions={[
          { label: "System status", href: "/admin/system", variant: "outline" },
          { label: "Export CSV", onClick: exportCsv, variant: "outline" },
          { label: "Refresh", onClick: () => { loadSummary(); load(); }, variant: "outline" },
        ]}
      />

      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { key: "total", label: "24h total" },
            { key: "token", label: "Tokens" },
            { key: "device", label: "Devices" },
            { key: "user", label: "Users" },
            { key: "broadcast", label: "Broadcast" },
            { key: "content", label: "Content" },
          ].map((k) => (
            <div key={k.key} className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{k.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                {summary.last_24h[k.key] ?? 0}
              </p>
              <p className="mt-0.5 text-[10px] text-gray-400">7d: {summary.last_7d[k.key] ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="segmented flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn("segmented-item", category === c.id && "segmented-item-active")}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex min-w-0 items-center rounded-lg border border-gray-200 bg-[var(--color-card)] px-3 dark:border-gray-700 sm:max-w-xs">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            placeholder="Search action, email, ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30">
          {error}
        </p>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-left dark:border-gray-800">
                <th className="table-head px-4 py-3">Time</th>
                <th className="table-head px-4 py-3">Action</th>
                <th className="table-head px-4 py-3">Actor</th>
                <th className="table-head px-4 py-3">Resource</th>
                <th className="table-head px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-gray-300" />
                    Loading activity…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    No events match your filters. Actions appear here as admins use the dashboard.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 dark:border-gray-800/60">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatCampaignSentAt(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatAuditAction(row.action)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.actor_email ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {row.resource_type}
                      {row.resource_id ? ` · ${row.resource_id.slice(0, 12)}${row.resource_id.length > 12 ? "…" : ""}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{row.ip ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          summary={`Showing ${meta.total ? (meta.page - 1) * meta.limit + 1 : 0}–${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total}`}
          pages={pageButtons}
          current={page}
          onPage={setPage}
        />
      </div>

      <p className="text-xs text-gray-500">
        Tip: open{" "}
        <Link href="/admin/system" className="text-blue-600 hover:underline">System status</Link> for service health and the latest 20 events.
      </p>
    </div>
  );
}
