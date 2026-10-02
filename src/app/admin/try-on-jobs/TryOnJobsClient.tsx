"use client";

import Link from "next/link";
import PremiumImage from "@/components/dashboard/PremiumImage";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, Search, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/dashboard/StatusBadge";
import TablePagination from "@/components/dashboard/TablePagination";
import { apiFetch } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

type JobRow = {
  id: string;
  external_job_id?: string;
  user: { email?: string; display_name?: string } | null;
  style_id?: string;
  category_id?: string;
  status: string;
  result_url?: string | null;
  created_at: string | null;
};

const STATUSES = ["", "queued", "processing", "completed", "failed", "cancelled"] as const;

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function TryOnJobsClient() {
  const sp = useSearchParams();
  const statusParam = sp.get("status") ?? "";
  const [status, setStatus] = useState(
    STATUSES.includes(statusParam as typeof STATUSES[number]) ? statusParam : ""
  );
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<JobRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    apiFetch<{ items: JobRow[]; meta: { total: number; page: number; limit: number } }>(
      `/api/v1/admin/try-on-jobs?${params}`
    ).then((res) => {
      setItems(res.data?.items ?? []);
      setTotal(res.data?.meta.total ?? 0);
      setLoading(false);
    });
  }, [page, status, q]);

  useEffect(() => {
    const t = setTimeout(load, q.trim() ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    setStatus(STATUSES.includes(statusParam as typeof STATUSES[number]) ? statusParam : "");
    setPage(1);
  }, [statusParam]);

  const limit = 20;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 lg:text-[22px]">Try-On Jobs</h1>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="card mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-gray-200 bg-[var(--color-card)] px-3 dark:border-gray-700 sm:max-w-xs">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            placeholder="Search job ID or user"
            className="h-8 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm focus:outline-none"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="filter-chip"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30 text-left dark:border-gray-800">
                <th className="table-head px-5 py-3">Job ID</th>
                <th className="table-head px-5 py-3">User</th>
                <th className="table-head px-5 py-3">Style ID</th>
                <th className="table-head px-5 py-3">Category</th>
                <th className="table-head px-5 py-3">Status</th>
                <th className="table-head px-5 py-3">Result</th>
                <th className="table-head px-5 py-3">Created</th>
                <th className="table-head px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500">No jobs match this filter</td></tr>
              ) : (
                items.map((job) => (
                  <tr key={job.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50 dark:border-gray-800">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{job.external_job_id ?? job.id.slice(0, 8)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{job.user?.email ?? "—"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{job.style_id ?? "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{job.category_id ?? "—"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={statusLabel(job.status)} />
                    </td>
                    <td className="px-5 py-4">
                      {job.result_url ? (
                        <PremiumImage src={job.result_url} alt="" size="sm" shape="circle" />
                      ) : job.status === "failed" ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No result</span>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{formatDateTime(job.created_at)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/try-on-jobs/details?id=${job.id}`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                        View details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          summary={`Showing ${from}–${to} of ${total} jobs`}
          pages={Array.from({ length: Math.min(pages, 6) }, (_, i) => i + 1)}
          current={page}
          onPage={setPage}
        />
      </div>
    </div>
  );
}
