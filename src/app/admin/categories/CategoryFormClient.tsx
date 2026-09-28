"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api/client";

export default function CategoryFormClient({ mode }: { mode: "add" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("category_id") ?? "";
  const mongoId = searchParams.get("id") ?? "";

  const [recordId, setRecordId] = useState(mongoId);
  const [categoryId, setCategoryId] = useState(categoryIdParam);
  const [titleKey, setTitleKey] = useState("");
  const [title, setTitle] = useState("");
  const [genderScope, setGenderScope] = useState("both");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");

  useEffect(() => {
    if (mode !== "edit" || !categoryIdParam) {
      setLoading(false);
      return;
    }
    apiFetch<{ item: { id: string; category_id: string; title_key: string; title: string; gender_scope: string } }>(
      `/api/v1/admin/catalog/categories?category_id=${encodeURIComponent(categoryIdParam)}`
    ).then((res) => {
      if (res.data?.item) {
        setRecordId(res.data.item.id);
        setCategoryId(res.data.item.category_id);
        setTitleKey(res.data.item.title_key);
        setTitle(res.data.item.title);
        setGenderScope(res.data.item.gender_scope);
      }
      setLoading(false);
    });
  }, [mode, categoryIdParam]);

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await apiFetch("/api/v1/admin/catalog/categories", {
      method: "PATCH",
      body: JSON.stringify({
        upsert: {
          id: mode === "edit" ? recordId : undefined,
          category_id: categoryId,
          title_key: titleKey,
          title,
          gender_scope: genderScope,
        },
      }),
    });
    setSaving(false);
    if (res.error) setMsg(res.error.message);
    else router.push("/admin/categories");
  }

  if (loading) return <p className="text-sm text-gray-500">Loading category…</p>;

  return (
    <div>
      <PageHeader
        title={mode === "add" ? "Add category" : "Edit category"}
        backHref="/admin/categories"
        backLabel="Back to categories"
        actions={[
          { label: "Cancel", href: "/admin/categories", variant: "outline" },
          { label: mode === "add" ? "Create category" : "Save changes", variant: "primary", onClick: save },
        ]}
      />
      {msg && <p className="mb-4 text-sm text-red-600">{msg}</p>}
      <div className="card max-w-2xl space-y-4 p-5">
        <Input label="Category name (EN)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          label="Category ID"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          readOnly={mode === "edit"}
          hint={mode === "edit" ? "ID is fixed after create" : "Unique slug, e.g. hair_styles"}
        />
        <Input label="Title key" value={titleKey} onChange={(e) => setTitleKey(e.target.value)} />
        <Select
          label="Gender scope"
          value={genderScope}
          onChange={(e) => setGenderScope(e.target.value)}
          options={[
            { value: "both", label: "Both" },
            { value: "women", label: "Women" },
            { value: "men", label: "Men" },
          ]}
        />
        <p className="text-xs text-gray-500">Style tabs and items are managed from Style Catalog after the category is created.</p>
        <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  );
}
