"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Pencil } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PremiumImage from "@/components/dashboard/PremiumImage";
import { apiFetch } from "@/lib/api/client";

type CatRow = {
  id: string;
  category_id: string;
  title_key: string;
  title: string;
  gender_scope: string;
  items_count: number;
  tabs_count: number;
  preview_image_url?: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CatRow[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = q ? `?q=${encodeURIComponent(q)}` : "";
    apiFetch<{ items: CatRow[] }>(`/api/v1/admin/catalog/categories${params}`).then((res) => {
      if (res.error) {
        setError(res.error.message);
        setCategories([]);
      } else {
        setError(null);
        setCategories(res.data?.items ?? []);
      }
    });
  }, [q]);

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage catalog collections and their tabs."
        actions={[{ label: "+ Add category", href: "/admin/categories/add", variant: "primary" }]}
      />

      <div className="card mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-[var(--color-card)] px-3 sm:max-w-sm">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input placeholder="Search categories" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm focus:outline-none" />
        </div>
        <button type="button" className="filter-chip">
          All genders
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-left">
                <th className="table-head px-5 py-3">Category</th>
                <th className="table-head px-5 py-3">Category ID</th>
                <th className="table-head px-5 py-3">Title key</th>
                <th className="table-head px-5 py-3">Gender scope</th>
                <th className="table-head px-5 py-3">Tabs</th>
                <th className="table-head px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-red-600">{error}</td></tr>
              )}
              {!error && categories.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">No categories in database</td></tr>
              )}
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {cat.preview_image_url ? (
                        <PremiumImage src={cat.preview_image_url} alt="" size="sm" shape="card" />
                      ) : (
                        <PremiumImage size="sm" shape="rounded" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{cat.category_id}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{cat.title_key}</td>
                  <td className="px-5 py-3.5 text-sm capitalize">{cat.gender_scope}</td>
                  <td className="px-5 py-3.5 text-sm">{cat.tabs_count} tabs · {cat.items_count} styles</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/admin/categories/edit?category_id=${cat.category_id}&id=${cat.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <Link href={`/admin/style-catalog?category_id=${cat.category_id}`} className="text-sm text-gray-600 hover:text-gray-900">
                        Styles
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-gray-100 dark:border-gray-800 px-5 py-3 text-sm text-gray-500">{categories.length} categories</p>
      </div>
    </div>
  );
}
