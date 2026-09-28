"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Pencil, Search, Trash2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type SectionRow = {
  id: string;
  section_id: string;
  title: string;
  title_key: string;
  sort_order: number;
  items_count: number;
  type: string;
  category_id: string | null;
  published: boolean;
};

export default function HomeFeedClient() {
  const [items, setItems] = useState<SectionRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<{ items: SectionRow[] }>("/api/v1/admin/home-feed").then((res) => {
      if (res.error) {
        setError(res.error.message);
        setItems([]);
      } else {
        setError(null);
        setItems(res.data?.items ?? []);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return items;
    return items.filter((s) => s.title.toLowerCase().includes(n) || s.section_id.toLowerCase().includes(n));
  }, [items, q]);

  async function move(row: SectionRow, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === row.id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    await apiFetch("/api/v1/admin/home-feed", {
      method: "PATCH",
      body: JSON.stringify({ reorder: next.map((s) => s.id) }),
    });
    load();
  }

  async function togglePublish(row: SectionRow) {
    await apiFetch("/api/v1/admin/home-feed", {
      method: "PATCH",
      body: JSON.stringify({ publish: { id: row.id, published: !row.published } }),
    });
    load();
  }

  async function remove(row: SectionRow) {
    if (!confirm(`Delete section "${row.title}"?`)) return;
    await apiFetch("/api/v1/admin/home-feed", { method: "PATCH", body: JSON.stringify({ delete_id: row.id }) });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Home feed"
        subtitle="Manage the sections shown on the app home screen."
        actions={[{ label: "+ Add section", href: "/admin/home-feed/add", variant: "primary" }]}
      />

      <div className="card mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center rounded-lg border border-gray-200 bg-[var(--color-card)] px-3 dark:border-gray-700 sm:max-w-xs">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            placeholder="Search sections"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-left dark:border-gray-800">
              <th className="table-head px-4 py-3">Order</th>
              <th className="table-head px-4 py-3">Section</th>
              <th className="table-head px-4 py-3">Layout</th>
              <th className="table-head px-4 py-3">Linked category</th>
              <th className="table-head px-4 py-3">Items</th>
              <th className="table-head px-4 py-3">Published</th>
              <th className="table-head px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">Loading…</td></tr>}
            {error && !loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-red-600">{error}</td></tr>}
            {!loading && !error && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No sections</td></tr>
            )}
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 dark:border-gray-800/60">
                <td className="px-4 py-3 text-sm tabular-nums">{row.sort_order + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{row.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.type.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.category_id ?? "—"}</td>
                <td className="px-4 py-3 text-sm">{row.items_count}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void togglePublish(row)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      row.published ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {row.published ? "Live" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button type="button" className="rounded p-1 hover:bg-gray-100" onClick={() => void move(row, -1)}><ChevronUp className="h-4 w-4" /></button>
                    <button type="button" className="rounded p-1 hover:bg-gray-100" onClick={() => void move(row, 1)}><ChevronDown className="h-4 w-4" /></button>
                    <Link href={`/admin/home-feed/edit?id=${row.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                    <button type="button" onClick={() => void remove(row)} className="text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
