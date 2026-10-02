"use client";

import Link from "next/link";
import PremiumImage from "@/components/dashboard/PremiumImage";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { RefreshCw, Search, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import TablePagination from "@/components/dashboard/TablePagination";
import { apiFetch } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

type Row = {
  id: string;
  user_email: string;
  image_url: string;
  style_id: string | null;
  is_favorite: boolean;
  created_at: string | null;
};

export default function LooksHistoryClient() {
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    apiFetch<{ items: Row[]; meta: { total: number } }>(`/api/v1/admin/looks-history?${params}`).then((res) => {
      if (res.error) {
        setError(res.error.message);
        setItems([]);
      } else {
        setError(null);
        setItems(res.data?.items ?? []);
        setTotal(res.data?.meta.total ?? 0);
      }
      setLoading(false);
    });
  }, [page, debouncedQ]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ]);

  useEffect(() => {
    load();
  }, [load]);

  const limit = 20;
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Looks history</h1>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="card mb-4 flex items-center gap-2 p-3">
        <Search className="h-4 w-4 text-gray-400" />
        <input className="flex-1 text-sm focus:outline-none" placeholder="Search user or style" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b text-left">
              <th className="table-head px-4 py-3">Preview</th>
              <th className="table-head px-4 py-3">User</th>
              <th className="table-head px-4 py-3">Style</th>
              <th className="table-head px-4 py-3">Favorite</th>
              <th className="table-head px-4 py-3">Created</th>
              <th className="table-head px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No looks found</td></tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="px-4 py-3">
                    <PremiumImage src={row.image_url} alt="" size="sm" shape="card" />
                  </td>
                  <td className="px-4 py-3 text-sm">{row.user_email}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.style_id ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">{row.is_favorite ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(row.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/looks-history/details?id=${row.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600">
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <TablePagination summary={`Showing ${from}–${to} of ${total}`} pages={Array.from({ length: Math.min(pages, 6) }, (_, i) => i + 1)} current={page} onPage={setPage} />
      </div>
    </div>
  );
}
