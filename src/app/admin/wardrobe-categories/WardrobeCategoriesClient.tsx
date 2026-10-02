"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Pencil, Search, Trash2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PremiumImage from "@/components/dashboard/PremiumImage";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type WardrobeRow = {
  id: string;
  category_id: string;
  title: string;
  title_key: string;
  sort_order: number;
  styles_count: number;
  gender_scope: string;
  enabled: boolean;
  preview_image_url?: string;
};

export default function WardrobeCategoriesClient() {
  const [items, setItems] = useState<WardrobeRow[]>([]);
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<{ items: WardrobeRow[] }>("/api/v1/admin/wardrobe/categories").then((res) => {
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
    let rows = items;
    if (gender === "women") rows = rows.filter((r) => r.gender_scope === "women" || r.gender_scope === "both");
    if (gender === "men") rows = rows.filter((r) => r.gender_scope === "men" || r.gender_scope === "both");
    const n = q.trim().toLowerCase();
    if (n) rows = rows.filter((r) => r.title.toLowerCase().includes(n) || r.category_id.toLowerCase().includes(n));
    return rows;
  }, [items, q, gender]);

  async function move(row: WardrobeRow, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === row.id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    await apiFetch("/api/v1/admin/wardrobe/categories", {
      method: "PATCH",
      body: JSON.stringify({ reorder: next.map((s) => s.id) }),
    });
    load();
  }

  async function toggleEnabled(row: WardrobeRow) {
    await apiFetch("/api/v1/admin/wardrobe/categories", {
      method: "PATCH",
      body: JSON.stringify({ toggle_enabled: { id: row.id, enabled: !row.enabled } }),
    });
    load();
  }

  async function remove(row: WardrobeRow) {
    if (!confirm(`Delete wardrobe category "${row.title}"?`)) return;
    await apiFetch("/api/v1/admin/wardrobe/categories", { method: "PATCH", body: JSON.stringify({ delete_id: row.id }) });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Wardrobe Categories"
        actions={[{ label: "+ Add category", href: "/admin/wardrobe-categories/add", variant: "primary" }]}
      />

      <div className="card mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="segmented">
          {[
            { id: "", label: "All" },
            { id: "women", label: "Women" },
            { id: "men", label: "Men" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setGender(t.id)}
              className={cn("segmented-item", gender === t.id && "segmented-item-active")}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex min-w-0 items-center rounded-lg border border-gray-200 bg-[var(--color-card)] px-3 dark:border-gray-700 sm:max-w-xs">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            placeholder="Search categories"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full min-w-[880px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/30 text-left dark:border-gray-800">
              <th className="table-head px-4 py-3">Category</th>
              <th className="table-head px-4 py-3">ID</th>
              <th className="table-head px-4 py-3">Gender</th>
              <th className="table-head px-4 py-3">Styles</th>
              <th className="table-head px-4 py-3">Status</th>
              <th className="table-head px-4 py-3">Order</th>
              <th className="table-head px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">Loading…</td></tr>}
            {error && !loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-red-600">{error}</td></tr>}
            {!loading && !error && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No categories</td></tr>
            )}
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 dark:border-gray-800/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <PremiumImage src={row.preview_image_url} alt="" size="sm" shape="card" />
                    <span className="text-sm font-medium">{row.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.category_id}</td>
                <td className="px-4 py-3 text-sm capitalize">{row.gender_scope}</td>
                <td className="px-4 py-3 text-sm">{row.styles_count}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void toggleEnabled(row)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      row.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {row.enabled ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button type="button" className="rounded p-1 hover:bg-gray-100" onClick={() => void move(row, -1)}><ChevronUp className="h-4 w-4" /></button>
                    <button type="button" className="rounded p-1 hover:bg-gray-100" onClick={() => void move(row, 1)}><ChevronDown className="h-4 w-4" /></button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/wardrobe-categories/edit?id=${row.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
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
