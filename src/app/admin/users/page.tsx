"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import RemoteImage from "@/components/dashboard/RemoteImage";
import { RefreshCw, Search, ChevronRight, User } from "lucide-react";
import Button from "@/components/ui/Button";
import TablePagination from "@/components/dashboard/TablePagination";
import { apiFetch } from "@/lib/api/client";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

type UserRow = {
  id: string;
  email?: string;
  display_name?: string;
  photo_url?: string;
  role: string;
  status: string;
  uid?: string;
};

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
          <td colSpan={5} className="px-5 py-4">
            <div className="h-8 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function UsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<{ items: UserRow[]; meta: { total: number; limit: number } }>(
      `/api/v1/admin/users?page=${page}&limit=8${debouncedQ ? `&q=${encodeURIComponent(debouncedQ)}` : ""}`
    );
    if (res.error) {
      setError(res.error.message);
      setItems([]);
      setTotal(0);
    } else if (res.data) {
      setItems(res.data.items ?? []);
      setTotal(res.data.meta?.total ?? 0);
    }
    setLoading(false);
  }, [debouncedQ, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ]);

  useEffect(() => {
    load();
  }, [load]);

  async function disableUser(id: string) {
    await apiFetch(`/api/v1/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "disabled" }),
    });
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / 8));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 lg:text-[22px]">Users</h1>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
          <button type="button" className="ml-3 font-medium underline" onClick={load}>Retry</button>
        </div>
      )}

      <div className="card mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-gray-200 bg-[var(--color-card)] px-3 dark:border-gray-700">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            placeholder="Search name or email"
            className="h-8 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm focus:outline-none"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30 text-left dark:border-gray-800">
                <th className="table-head px-5 py-3">User</th>
                <th className="table-head px-5 py-3">Email</th>
                <th className="table-head px-5 py-3">Role</th>
                <th className="table-head px-5 py-3">Status</th>
                <th className="table-head px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No users found</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {debouncedQ ? "Try a different search term." : "No accounts in the database yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50 dark:border-gray-800">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        {u.photo_url ? (
                          <div className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-gray-100">
                            <RemoteImage src={u.photo_url} alt="" fill className="object-cover" sizes="32px" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.display_name ?? "User"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{u.email ?? "—"}</td>
                    <td className="px-5 py-4 text-sm capitalize">{u.role}</td>
                    <td className="px-5 py-4 text-sm capitalize">{u.status}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {u.status === "active" && (
                          <Button size="sm" variant="outline" onClick={() => disableUser(u.id)}>Disable</Button>
                        )}
                        <Link href={`/admin/users/${u.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600">
                          View
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          summary={`Showing ${total === 0 ? 0 : (page - 1) * 8 + 1}–${Math.min(page * 8, total)} of ${total} users`}
          pages={Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1)}
          current={page}
          onPage={setPage}
        />
      </div>
    </div>
  );
}
