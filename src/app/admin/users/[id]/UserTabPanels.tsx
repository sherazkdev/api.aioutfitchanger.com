"use client";

import PremiumImage from "@/components/dashboard/PremiumImage";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Heart } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import TablePagination from "@/components/dashboard/TablePagination";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api/client";
import { formatCreatedShort } from "@/lib/format";
import { cn } from "@/lib/utils";

function jobStatusLabel(status: string) {
  if (status === "completed") return "Completed";
  if (status === "failed") return "Failed";
  if (status === "processing" || status === "queued") return "Processing";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function buildPageButtons(totalPages: number): (number | "...")[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  return [1, 2, 3, "...", totalPages];
}

function sessionStatusLabel(status: string) {
  if (status === "active") return "Active";
  if (status === "expired") return "Expired";
  if (status === "revoked") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function UserJobsPanel({ userId, active }: { userId: string; active: boolean }) {
  const [items, setItems] = useState<{ id: string; job_id: string; style: string; status: string; created_at: string | null }[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  const load = useCallback(() => {
    if (!active) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    apiFetch<{ items: typeof items; meta: { total: number } }>(`/api/v1/admin/users/${userId}/jobs?${params}`).then((res) => {
      if (res.error) setError(res.error.message);
      else {
        setError(null);
        setItems(res.data?.items ?? []);
        setTotal(res.data?.meta.total ?? 0);
      }
      setLoading(false);
    });
  }, [userId, page, status, active]);

  useEffect(() => {
    load();
  }, [load]);

  if (!active) return null;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-5 py-3">
        <h3 className="text-sm font-semibold">Try-on jobs</h3>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
            <option value="queued">Queued</option>
          </select>
          <Link href={`/admin/try-on-jobs?user_id=${userId}`} className="text-sm text-blue-600 hover:underline">Open in Try-on Jobs</Link>
        </div>
      </div>
      {error && <p className="px-5 py-2 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="px-5 py-8 text-sm text-gray-500">Loading jobs…</p>
      ) : (
        <>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                <th className="table-head px-4 py-3">Job ID</th>
                <th className="table-head px-4 py-3">Style</th>
                <th className="table-head px-4 py-3">Status</th>
                <th className="table-head px-4 py-3">Created</th>
                <th className="table-head px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No jobs yet</td></tr>
              ) : (
                items.map((j) => (
                  <tr key={j.id} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="px-4 py-3 text-sm font-medium">#{j.job_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{j.style}</td>
                    <td className="px-4 py-3"><StatusBadge status={jobStatusLabel(j.status)} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatCreatedShort(j.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/try-on-jobs/details?id=${j.id}`} className="inline-flex items-center gap-0.5 text-sm text-blue-600 hover:underline">
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <TablePagination
            summary={`${total.toLocaleString()} jobs`}
            pages={buildPageButtons(totalPages)}
            current={page}
            onPage={setPage}
          />
        </>
      )}
    </div>
  );
}

export function UserLooksPanel({ userId, active }: { userId: string; active: boolean }) {
  const [items, setItems] = useState<{ id: string; preview_url: string; style: string; created_at: string | null; is_favorite: boolean }[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const load = useCallback(() => {
    if (!active) return;
    setLoading(true);
    apiFetch<{ items: typeof items; meta: { total: number } }>(
      `/api/v1/admin/users/${userId}/looks?page=${page}&limit=${limit}`
    ).then((res) => {
      setItems(res.data?.items ?? []);
      setTotal(res.data?.meta.total ?? 0);
      setLoading(false);
    });
  }, [userId, page, active]);

  useEffect(() => {
    load();
  }, [load]);

  if (!active) return null;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
        <h3 className="text-sm font-semibold">Looks / history</h3>
        <Link href={`/admin/looks-history?user_id=${userId}`} className="text-sm text-blue-600 hover:underline">View all</Link>
      </div>
      {loading ? (
        <p className="px-5 py-8 text-sm text-gray-500">Loading looks…</p>
      ) : (
        <>
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                <th className="table-head px-4 py-3">Look ID</th>
                <th className="table-head px-4 py-3">Preview</th>
                <th className="table-head px-4 py-3">Style</th>
                <th className="table-head px-4 py-3">Created</th>
                <th className="table-head px-4 py-3">Favorite</th>
                <th className="table-head px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No looks yet</td></tr>
              ) : (
                items.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="px-4 py-3 text-sm font-medium">{l.id.slice(-8)}</td>
                    <td className="px-4 py-3">
                      <PremiumImage src={l.preview_url} alt="" size="sm" shape="card" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{l.style}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatCreatedShort(l.created_at)}</td>
                    <td className="px-4 py-3">
                      <Heart className={cn("h-4 w-4", l.is_favorite ? "fill-red-500 text-red-500" : "text-gray-300")} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/looks-history/details?id=${l.id}`} className="text-sm text-blue-600 hover:underline">Details</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <TablePagination summary={`${total.toLocaleString()} looks`} pages={buildPageButtons(totalPages)} current={page} onPage={setPage} />
        </>
      )}
    </div>
  );
}

export function UserSessionsPanel({ userId, active }: { userId: string; active: boolean }) {
  const [items, setItems] = useState<{
    id: string;
    status: string;
    device_id?: string;
    label: string;
    expires_at: string;
    revoked_at: string | null;
  }[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const load = useCallback(() => {
    if (!active) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    apiFetch<{ items: typeof items; meta: { total: number } }>(`/api/v1/admin/users/${userId}/sessions?${params}`).then((res) => {
      setItems(res.data?.items ?? []);
      setTotal(res.data?.meta.total ?? 0);
      setLoading(false);
    });
  }, [userId, page, status, active]);

  useEffect(() => {
    load();
  }, [load]);

  async function revokeSession(sessionId: string) {
    if (!confirm("Revoke this user session?")) return;
    await apiFetch(`/api/v1/admin/users/${userId}/sessions/${sessionId}`, { method: "DELETE" });
    load();
  }

  if (!active) return null;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-5 py-3">
        <h3 className="text-sm font-semibold">Sessions</h3>
        <select
          className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>
      {loading ? (
        <p className="px-5 py-8 text-sm text-gray-500">Loading sessions…</p>
      ) : (
        <>
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                <th className="table-head px-4 py-3">Session</th>
                <th className="table-head px-4 py-3">Device</th>
                <th className="table-head px-4 py-3">Status</th>
                <th className="table-head px-4 py-3">Expires</th>
                <th className="table-head px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No sessions</td></tr>
              ) : (
                items.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{s.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-sm">{s.label || s.device_id || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={sessionStatusLabel(s.status)} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatCreatedShort(s.expires_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {s.status === "active" && (
                        <Button type="button" variant="outline" size="sm" onClick={() => revokeSession(s.id)}>Revoke</Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <TablePagination summary={`${total.toLocaleString()} sessions`} pages={buildPageButtons(totalPages)} current={page} onPage={setPage} />
        </>
      )}
    </div>
  );
}
