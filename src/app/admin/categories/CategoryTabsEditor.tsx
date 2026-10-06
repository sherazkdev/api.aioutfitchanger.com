"use client";

import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export type CategoryTabDraft = {
  id: string;
  title: string;
  title_key: string;
};

type Props = {
  tabs: CategoryTabDraft[];
  onChange: (tabs: CategoryTabDraft[]) => void;
};

export default function CategoryTabsEditor({ tabs, onChange }: Props) {
  function updateIndex(idx: number, patch: Partial<CategoryTabDraft>) {
    const next = tabs.map((t, i) => (i === idx ? { ...t, ...patch } : t));
    onChange(next);
  }

  function removeIndex(idx: number) {
    onChange(tabs.filter((_, i) => i !== idx));
  }

  function addTab() {
    onChange([...tabs, { id: "", title: "", title_key: "" }]);
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Catalog tabs</h2>
        <p className="mt-1 text-xs text-gray-500">
          Tabs appear in the mobile app for this category (e.g. gym, preset_gym, casual). Styles link to a tab from Style
          Catalog.
        </p>
      </div>
      {tabs.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-500 dark:border-gray-700">
          No tabs yet. Add at least one if the app uses tabbed browsing for this category.
        </p>
      )}
      {tabs.map((tab, idx) => (
        <div
          key={`${idx}-${tab.id}`}
          className="grid gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800 sm:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <Input
            label="Tab ID"
            value={tab.id}
            onChange={(e) => updateIndex(idx, { id: e.target.value })}
            hint="Slug, e.g. preset_gym"
          />
          <Input
            label="Label (EN)"
            value={tab.title}
            onChange={(e) => updateIndex(idx, { title: e.target.value })}
          />
          <Input
            label="Title key"
            value={tab.title_key}
            onChange={(e) => updateIndex(idx, { title_key: e.target.value })}
            hint="Optional i18n key"
          />
          <div className="flex items-end pb-1">
            <button
              type="button"
              onClick={() => removeIndex(idx)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              aria-label="Delete tab"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addTab} className="inline-flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add tab
      </Button>
    </div>
  );
}
