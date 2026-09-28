"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api/client";

export default function WardrobeFormClient({ mode }: { mode: "add" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [categoryId, setCategoryId] = useState("");
  const [titleKey, setTitleKey] = useState("");
  const [title, setTitle] = useState("");
  const [browseTabId, setBrowseTabId] = useState("");
  const [genderScope, setGenderScope] = useState("women");
  const [enabled, setEnabled] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    apiFetch<{ items: { id: string; category_id: string; title_key: string; title: string; gender_scope: string; enabled: boolean }[] }>(
      "/api/v1/admin/wardrobe/categories"
    ).then((res) => {
      const row = res.data?.items.find((c) => c.id === id);
      if (row) {
        setCategoryId(row.category_id);
        setTitleKey(row.title_key);
        setTitle(row.title);
        setGenderScope(row.gender_scope);
        setBrowseTabId(row.category_id);
        setEnabled(row.enabled);
      }
      setLoading(false);
    });
  }, [mode, id]);

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await apiFetch("/api/v1/admin/wardrobe/categories", {
      method: "PATCH",
      body: JSON.stringify({
        upsert: {
          id: mode === "edit" ? id : undefined,
          category_id: categoryId,
          title_key: titleKey,
          title,
          browse_tab_id: browseTabId || categoryId,
          gender_scope: genderScope,
          enabled,
        },
      }),
    });
    setSaving(false);
    if (res.error) setMsg(res.error.message);
    else router.push("/admin/wardrobe-categories");
  }

  if (loading) return <p className="text-sm text-gray-500">Loading category…</p>;

  return (
    <div>
      <PageHeader
        title={mode === "add" ? "Add wardrobe category" : "Edit wardrobe category"}
        backHref="/admin/wardrobe-categories"
        backLabel="Back to wardrobe"
        actions={[
          { label: "Cancel", href: "/admin/wardrobe-categories", variant: "outline" },
          { label: mode === "add" ? "Create category" : "Save changes", variant: "primary", onClick: save },
        ]}
      />
      {msg && <p className="mb-4 text-sm text-red-600">{msg}</p>}
      <div className="card max-w-2xl space-y-4 p-5">
        <Input label="Display name (EN)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Category ID" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} readOnly={mode === "edit"} />
        <Input label="Title key" value={titleKey} onChange={(e) => setTitleKey(e.target.value)} />
        <Input label="Browse tab ID" value={browseTabId} onChange={(e) => setBrowseTabId(e.target.value)} />
        <Select
          label="Gender scope"
          value={genderScope}
          onChange={(e) => setGenderScope(e.target.value)}
          options={[
            { value: "women", label: "Women" },
            { value: "men", label: "Men" },
            { value: "both", label: "Both" },
          ]}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Active in app
        </label>
        <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  );
}
