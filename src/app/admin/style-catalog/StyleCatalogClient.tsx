"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PremiumImage from "@/components/dashboard/PremiumImage";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Pencil, Search, Trash2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type StyleRow = {
  id: string;
  category_id: string;
  style_id: string;
  name: string;
  image_url: string;
  gender: string;
  sort_order: number;
  enabled: boolean;
};

type CatRow = { category_id: string; title: string };

export default function StyleCatalogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category_id") ?? "";

  const [categories, setCategories] = useState<CatRow[]>([]);
  const [items, setItems] = useState<StyleRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryId) params.set("category_id", categoryId);
    if (q.trim()) params.set("q", q.trim());
    apiFetch<{ items: StyleRow[] }>(`/api/v1/admin/catalog/styles?${params}`).then((res) => {
      if (res.error) {
        setError(res.error.message);
        setItems([]);
      } else {
        setError(null);
        setItems(res.data?.items ?? []);
      }
      setLoading(false);
    });
  }, [categoryId, q]);

  useEffect(() => {
    apiFetch<{ items: { category_id: string; title: string }[] }>("/api/v1/admin/catalog/categories").then((res) => {
      if (res.data) setCategories(res.data.items.map((c) => ({ category_id: c.category_id, title: c.title })));
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const displayItems = useMemo(() => {
    if (!gender) return items;
    return items.filter((i) => i.gender === gender);
  }, [items, gender]);

  async function move(row: StyleRow, dir: -1 | 1) {
    const scoped = items.filter((i) => i.category_id === row.category_id);
    const idx = scoped.findIndex((i) => i.style_id === row.style_id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= scoped.length) return;
    const next = [...scoped];
    [next[idx], next[j]] = [next[j], next[idx]];
    await apiFetch("/api/v1/admin/catalog/styles", {
      method: "PATCH",
      body: JSON.stringify({ reorder: { category_id: row.category_id, style_ids: next.map((s) => s.style_id) } }),
    });
    load();
  }

  async function toggleEnabled(row: StyleRow) {
    await apiFetch("/api/v1/admin/catalog/styles", {
      method: "PATCH",
      body: JSON.stringify({
        toggle_enabled: { category_id: row.category_id, style_id: row.style_id, enabled: !row.enabled },
      }),
    });
    load();
  }

  async function remove(row: StyleRow) {
    if (!confirm(`Delete style "${row.name}"?`)) return;
    await apiFetch("/api/v1/admin/catalog/styles", {
      method: "PATCH",
      body: JSON.stringify({ delete: { category_id: row.category_id, style_id: row.style_id } }),
    });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Style Catalog"
        actions={[
          { label: "Manage categories", href: "/admin/categories", variant: "outline" },
          {
            label: "+ Add style",
            href: categoryId ? `/admin/style-catalog/add?category_id=${categoryId}` : "/admin/style-catalog/add",
            variant: "primary",
          },
        ]}
      />

      <div className="card mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <select
            className="filter-chip appearance-none pr-8"
            value={categoryId}
            onChange={(e) => {
              const v = e.target.value;
              router.push(v ? `/admin/style-catalog?category_id=${v}` : "/admin/style-catalog");
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.title}</option>
            ))}
          </select>
          <select className="filter-chip appearance-none pr-8" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">All genders</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-gray-200 bg-[var(--color-card)] px-3 dark:border-gray-700 sm:max-w-xs">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            placeholder="Search styles"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30 text-left dark:border-gray-800">
                <th className="table-head px-4 py-3">Style</th>
                <th className="table-head px-4 py-3">ID</th>
                <th className="table-head px-4 py-3">Category</th>
                <th className="table-head px-4 py-3">Gender</th>
                <th className="table-head px-4 py-3">Status</th>
                <th className="table-head px-4 py-3">Order</th>
                <th className="table-head px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">Loading styles…</td></tr>
              )}
              {error && !loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-red-600">{error}</td></tr>
              )}
              {!loading && !error && displayItems.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No styles found</td></tr>
              )}
              {displayItems.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 dark:border-gray-800/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <PremiumImage src={row.image_url} alt={row.name} size="sm" shape="card" />
                      <span className="text-sm font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.style_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.category_id}</td>
                  <td className="px-4 py-3 text-sm capitalize">{row.gender}</td>
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
                      <button type="button" className="rounded p-1 hover:bg-gray-100" onClick={() => void move(row, -1)} aria-label="Move up">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button type="button" className="rounded p-1 hover:bg-gray-100" onClick={() => void move(row, 1)} aria-label="Move down">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/style-catalog/edit?style_id=${row.style_id}&category_id=${row.category_id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => void remove(row)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
