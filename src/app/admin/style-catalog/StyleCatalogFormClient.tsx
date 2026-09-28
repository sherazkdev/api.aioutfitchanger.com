"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api/client";

type Cat = { category_id: string; title: string };

export default function StyleCatalogFormClient({ mode }: { mode: "add" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("category_id") ?? "";
  const styleIdParam = searchParams.get("style_id") ?? "";

  const [categories, setCategories] = useState<Cat[]>([]);
  const [categoryId, setCategoryId] = useState(categoryIdParam);
  const [styleId, setStyleId] = useState(styleIdParam);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [gender, setGender] = useState("women");
  const [prompt, setPrompt] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");

  useEffect(() => {
    apiFetch<{ items: Cat[] }>("/api/v1/admin/catalog/categories").then((res) => {
      if (res.data) setCategories(res.data.items.map((c) => ({ category_id: c.category_id, title: c.title })));
    });
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !styleIdParam || !categoryIdParam) return;
    apiFetch<{ items: { style_id: string; name: string; image_url: string; gender: string; enabled: boolean }[] }>(
      `/api/v1/admin/catalog/styles?category_id=${encodeURIComponent(categoryIdParam)}`
    ).then((res) => {
      const row = res.data?.items.find((i) => i.style_id === styleIdParam);
      if (row) {
        setName(row.name);
        setImageUrl(row.image_url);
        setGender(row.gender);
        setEnabled(row.enabled);
      }
      setLoading(false);
    });
  }, [mode, styleIdParam, categoryIdParam]);

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await apiFetch("/api/v1/admin/catalog/styles", {
      method: "PATCH",
      body: JSON.stringify({
        upsert: {
          category_id: categoryId,
          style_id: mode === "edit" ? styleId : styleId || undefined,
          name,
          image_url: imageUrl,
          gender,
          prompt_command: prompt || undefined,
          enabled,
        },
      }),
    });
    setSaving(false);
    if (res.error) setMsg(res.error.message);
    else router.push(categoryId ? `/admin/style-catalog?category_id=${categoryId}` : "/admin/style-catalog");
  }

  if (loading) return <p className="text-sm text-gray-500">Loading style…</p>;

  return (
    <div>
      <PageHeader
        title={mode === "add" ? "Add style" : "Edit style"}
        backHref="/admin/style-catalog"
        backLabel="Back to catalog"
        actions={[
          { label: "Cancel", href: "/admin/style-catalog", variant: "outline" },
          { label: mode === "add" ? "Create style" : "Save changes", variant: "primary", onClick: save },
        ]}
      />
      {msg && <p className="mb-4 text-sm text-red-600">{msg}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Style details</h2>
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={[{ value: "", label: "Select category" }, ...categories.map((c) => ({ value: c.category_id, label: c.title }))]}
          />
          <Input label="Style name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Style ID"
            value={styleId}
            onChange={(e) => setStyleId(e.target.value)}
            readOnly={mode === "edit"}
            hint={mode === "edit" ? "ID cannot be changed" : "Leave blank to auto-generate"}
          />
          <Input label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { value: "women", label: "Women" },
              { value: "men", label: "Men" },
              { value: "both", label: "Both" },
            ]}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Visible in app catalog
          </label>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold">Prompt command</h2>
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} placeholder="Optional try-on prompt" />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  );
}
