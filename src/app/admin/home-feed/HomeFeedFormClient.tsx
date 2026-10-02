"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api/client";
import ImageUrlOrUpload from "@/components/admin/ImageUrlOrUpload";

type FeedItem = {
  style_id: string;
  category_id?: string;
  thumbnail_url?: string;
  label?: string;
};

type SectionRow = {
  id: string;
  section_id: string;
  title_key: string;
  title: string;
  type: string;
  category_id: string | null;
  published: boolean;
  items?: FeedItem[];
};

export default function HomeFeedFormClient({ mode }: { mode: "add" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [sectionId, setSectionId] = useState("");
  const [titleKey, setTitleKey] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"category_cards" | "image_rail">("image_rail");
  const [categoryId, setCategoryId] = useState("");
  const [published, setPublished] = useState(true);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [categories, setCategories] = useState<{ category_id: string; title: string }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");

  useEffect(() => {
    apiFetch<{ items: { category_id: string; title: string }[] }>("/api/v1/admin/catalog/categories").then((res) => {
      if (res.data) setCategories(res.data.items);
    });
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    apiFetch<{ items: SectionRow[] }>("/api/v1/admin/home-feed").then((res) => {
      const row = res.data?.items.find((s) => s.id === id);
      if (row) {
        setSectionId(row.section_id);
        setTitleKey(row.title_key);
        setTitle(row.title);
        setType(row.type === "category_cards" ? "category_cards" : "image_rail");
        setCategoryId(row.category_id ?? "");
        setPublished(row.published);
        setItems(row.items ?? []);
      }
      setLoading(false);
    });
  }, [mode, id]);

  function moveItem(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    setItems((prev) => {
      const copy = [...prev];
      const [row] = copy.splice(index, 1);
      copy.splice(next, 0, row);
      return copy;
    });
  }

  function updateItem(index: number, patch: Partial<FeedItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await apiFetch<{ id: string }>("/api/v1/admin/home-feed", {
      method: "PATCH",
      body: JSON.stringify({
        upsert: {
          id: mode === "edit" ? id : undefined,
          section_id: sectionId,
          title_key: titleKey,
          title,
          type,
          category_id: categoryId || undefined,
          published,
        },
      }),
    });
    if (res.error) {
      setSaving(false);
      setMsg(res.error.message);
      return;
    }
    const sectionMongoId = res.data?.id ?? (mode === "edit" ? id : "");
    if (sectionMongoId && type === "image_rail") {
      const itemsRes = await apiFetch("/api/v1/admin/home-feed", {
        method: "PATCH",
        body: JSON.stringify({
          set_items: {
            id: sectionMongoId,
            items: items.map((it) => ({
              style_id: it.style_id.trim(),
              category_id: it.category_id?.trim() || undefined,
              thumbnail_url: it.thumbnail_url?.trim() || undefined,
              label: it.label?.trim() || undefined,
            })),
          },
        }),
      });
      if (itemsRes.error) {
        setSaving(false);
        setMsg(itemsRes.error.message);
        return;
      }
    }
    setSaving(false);
    router.push("/admin/home-feed");
  }

  if (loading) return <p className="text-sm text-gray-500">Loading section…</p>;

  return (
    <div>
      <PageHeader
        title={mode === "add" ? "Add home section" : "Edit home section"}
        backHref="/admin/home-feed"
        backLabel="Back to home feed"
        actions={[
          { label: "Cancel", href: "/admin/home-feed", variant: "outline" },
          { label: mode === "add" ? "Create section" : "Save changes", variant: "primary", onClick: save },
        ]}
      />
      {msg && <p className="mb-4 text-sm text-red-600">{msg}</p>}
      <div className="card max-w-2xl space-y-4 p-5">
        <Input label="Section name (EN)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Section ID" value={sectionId} onChange={(e) => setSectionId(e.target.value)} />
        <Input label="Title key" value={titleKey} onChange={(e) => setTitleKey(e.target.value)} />
        <Select
          label="Layout"
          value={type}
          onChange={(e) => setType(e.target.value as "category_cards" | "image_rail")}
          options={[
            { value: "image_rail", label: "Image rail" },
            { value: "category_cards", label: "Category cards" },
          ]}
        />
        <Select
          label="Linked category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={[{ value: "", label: "None" }, ...categories.map((c) => ({ value: c.category_id, label: c.title }))]}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published (visible in app)
        </label>

        {type === "image_rail" && (
          <div className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Rail items</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems((prev) => [...prev, { style_id: "", label: "", thumbnail_url: "" }])}
              >
                <Plus className="h-3.5 w-3.5" /> Add item
              </Button>
            </div>
            {items.length === 0 ? (
              <p className="text-xs text-gray-500">No items yet. Add styles for this image rail.</p>
            ) : (
              <ul className="space-y-3">
                {items.map((it, index) => (
                  <li key={index} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500">Item {index + 1}</span>
                      <div className="flex gap-1">
                        <button type="button" className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => moveItem(index, -1)} aria-label="Move up">
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        </button>
                        <button type="button" className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => moveItem(index, 1)} aria-label="Move down">
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input label="Style ID" value={it.style_id} onChange={(e) => updateItem(index, { style_id: e.target.value })} />
                      <Input label="Label" value={it.label ?? ""} onChange={(e) => updateItem(index, { label: e.target.value })} />
                      <ImageUrlOrUpload
                        label="Thumbnail"
                        folder="home-feed"
                        value={it.thumbnail_url ?? ""}
                        onChange={(url) => updateItem(index, { thumbnail_url: url })}
                        className="sm:col-span-2"
                      />
                      <Input label="Category ID (optional)" value={it.category_id ?? ""} onChange={(e) => updateItem(index, { category_id: e.target.value })} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  );
}
