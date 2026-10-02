"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api/client";
import { isAdminDesignPreview } from "@/lib/admin/design-preview";
import { formatCampaignSentAt } from "@/lib/format";
import { cn } from "@/lib/utils";
import ImageUrlOrUpload from "@/components/admin/ImageUrlOrUpload";

type TabId = "metadata" | "onboarding" | "languages" | "legal";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sky-100 bg-white px-4 py-3.5 shadow-sm dark:border-sky-900/40 dark:bg-[var(--color-card)]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1.5 text-[15px] font-semibold leading-snug text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

function FieldBlock({
  label,
  fieldKey,
  hint,
  children,
  className,
}: {
  label: string;
  fieldKey?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
        {fieldKey && <span className="ml-1 font-normal text-gray-400">{fieldKey}</span>}
      </p>
      {children}
      {hint && <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  fieldKey,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  fieldKey?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/30 sm:col-span-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
            {fieldKey && <span className="ml-1 font-normal text-gray-400">{fieldKey}</span>}
          </p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
            checked ? "bg-gray-900 dark:bg-gray-100" : "bg-gray-300 dark:bg-gray-600"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform dark:bg-gray-900",
              checked && "translate-x-5"
            )}
          />
        </button>
      </div>
    </div>
  );
}

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/5 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

export default function AppContentClient() {
  const searchParams = useSearchParams();
  const designPreview = isAdminDesignPreview(searchParams);

  const [tab, setTab] = useState<TabId>("metadata");
  const [draft, setDraft] = useState<Record<string, string | boolean>>({});
  const [stats, setStats] = useState<Record<string, string | number | null>>({});
  const [onboarding, setOnboarding] = useState<{ id: string; title: string; sort_order: number; body?: string; image_url?: string }[]>([]);
  const [languages, setLanguages] = useState<{ id: string; name: string; code: string; enabled: boolean; english_name?: string }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [langSearch, setLangSearch] = useState("");
  const [onboardingEdit, setOnboardingEdit] = useState<{ id?: string; title: string; body: string; image_url: string } | null>(null);
  const [savingContent, setSavingContent] = useState(false);

  useEffect(() => {
    apiFetch<{
      stats: Record<string, string | number | null>;
      draft: Record<string, string | boolean>;
      onboarding_pages: { id: string; title: string; sort_order: number; body?: string; image_url?: string }[];
      languages: { id: string; name: string; code: string; enabled: boolean; english_name?: string }[];
    }>("/api/v1/admin/app-content").then((res) => {
      if (res.data) {
        setStats(res.data.stats);
        setDraft(res.data.draft);
        setOnboarding(res.data.onboarding_pages);
        setLanguages(res.data.languages);
      }
      setLoading(false);
    });
  }, []);

  async function save(publish: boolean) {
    setMsg(null);
    const res = await apiFetch("/api/v1/admin/app-content", {
      method: "PATCH",
      body: JSON.stringify({ draft, publish }),
    });
    if (res.error) setMsg(res.error.message);
    else {
      setMsg(publish ? "Published" : "Draft saved");
      const refresh = await apiFetch<{ stats: Record<string, string | number | null> }>("/api/v1/admin/app-content");
      if (refresh.data) setStats(refresh.data.stats);
    }
  }

  const set = (key: string, value: string | boolean) => setDraft((d) => ({ ...d, [key]: value }));

  const val = (key: string, fallback: string) => {
    const raw = String(draft[key] ?? "").trim();
    if (raw) return raw;
    return designPreview ? fallback : "";
  };

  const kpiLast =
    designPreview && (!stats.last_published_at || stats.last_published_at === "—")
      ? "24 Sep 2026, 10:30"
      : formatCampaignSentAt(stats.last_published_at as string);
  const kpiDraft = designPreview ? String(stats.draft_changes ? stats.draft_changes : 3) : String(stats.draft_changes ?? 0);
  const kpiComplete = designPreview
    ? String(stats.completion_percent ?? 82)
    : String(stats.completion_percent ?? 0);
  const kpiLangs = designPreview ? String(stats.languages_count || 8) : String(stats.languages_count ?? 0);
  const kpiOnboarding = designPreview ? String(stats.onboarding_pages_count || 3) : String(stats.onboarding_pages_count ?? 0);

  async function persistOnboarding(patch: Record<string, unknown>) {
    setSavingContent(true);
    setMsg(null);
    const res = await apiFetch("/api/v1/admin/app-content", { method: "PATCH", body: JSON.stringify(patch) });
    if (res.error) setMsg(res.error.message);
    else {
      setMsg("Onboarding updated");
      const refresh = await apiFetch<{ onboarding_pages: typeof onboarding; stats: Record<string, string | number | null> }>("/api/v1/admin/app-content");
      if (refresh.data) {
        setOnboarding(refresh.data.onboarding_pages);
        setStats(refresh.data.stats);
      }
    }
    setSavingContent(false);
  }

  function moveOnboarding(index: number, dir: -1 | 1) {
    const next = [...onboarding];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setOnboarding(next);
    persistOnboarding({ onboarding_reorder: next.map((p) => p.id) });
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "metadata", label: "Metadata" },
    { id: "onboarding", label: "Onboarding" },
    { id: "languages", label: "Languages" },
    { id: "legal", label: "Legal & links" },
  ];

  if (loading) return <p className="text-sm text-gray-500">Loading app content…</p>;

  return (
    <div className="mx-auto max-w-[1120px] space-y-5">
      {designPreview && (
        <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
          Design preview values for empty fields and KPIs. Enable with <code className="rounded bg-white/70 px-1">?demo=1</code>.
        </p>
      )}

      <PageHeader title="App Content" subtitle="Strings and config served to the mobile app via /api/v1/app/*" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Last published" value={kpiLast} />
        <StatCard label="Completion" value={`${kpiComplete}%`} />
        <StatCard label="Draft changes" value={kpiDraft} />
        <StatCard label="Languages" value={kpiLangs} />
        <StatCard label="Onboarding pages" value={kpiOnboarding} />
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)] px-4 pt-2 sm:px-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors sm:px-4",
                tab === t.id
                  ? "border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "metadata" && (
          <>
            <div className="border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">App metadata</h2>
              <p className="mt-0.5 text-xs text-gray-500">Basic information about the app shown in stores and in the app itself.</p>
            </div>
            <div className="grid gap-6 p-5 sm:grid-cols-2">
              <FieldBlock label="App name" fieldKey="(app.name)" hint="Display name shown in the app and store listings.">
                <input className={INPUT_CLASS} value={val("app_name", "AI Wardrobe")} onChange={(e) => set("app_name", e.target.value)} />
              </FieldBlock>
              <FieldBlock label="Support email" fieldKey="(app.support_email)" hint="Contact email shown in the app for support requests.">
                <input className={INPUT_CLASS} value={val("support_email", "support@example.com")} onChange={(e) => set("support_email", e.target.value)} />
              </FieldBlock>
              <FieldBlock
                label="Minimum supported version"
                fieldKey="(app.min_version)"
                hint="Users below these versions may be prompted to update."
                className="sm:col-span-2"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-gray-500">iOS</p>
                    <input className={INPUT_CLASS} value={val("min_version_ios", "1.0.0")} onChange={(e) => set("min_version_ios", e.target.value)} />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-gray-500">Android</p>
                    <input className={INPUT_CLASS} value={val("min_version_android", "1.0.0")} onChange={(e) => set("min_version_android", e.target.value)} />
                  </div>
                </div>
              </FieldBlock>
              <FieldBlock label="Privacy URL" fieldKey="(app.privacy_url)" hint="Link to your privacy policy.">
                <input className={INPUT_CLASS} value={val("privacy_url", "https://example.com/privacy")} onChange={(e) => set("privacy_url", e.target.value)} />
              </FieldBlock>
              <FieldBlock label="Terms URL" fieldKey="(app.terms_url)" hint="Link to your terms of service.">
                <input className={INPUT_CLASS} value={val("terms_url", "https://example.com/terms")} onChange={(e) => set("terms_url", e.target.value)} />
              </FieldBlock>
              <FieldBlock label="App Store URL" fieldKey="(app.store_url_ios)" hint="Apple App Store listing URL.">
                <input className={INPUT_CLASS} value={val("app_store_url_ios", "https://apps.apple.com/…")} onChange={(e) => set("app_store_url_ios", e.target.value)} />
              </FieldBlock>
              <FieldBlock label="Google Play URL" fieldKey="(app.store_url_android)" hint="Google Play listing URL.">
                <input className={INPUT_CLASS} value={val("app_store_url_android", "https://play.google.com/store/apps/…")} onChange={(e) => set("app_store_url_android", e.target.value)} />
              </FieldBlock>
              <ToggleRow
                label="Maintenance mode"
                fieldKey="(app.maintenance_mode)"
                hint="When enabled, the app shows the maintenance message instead of normal content."
                checked={Boolean(draft.maintenance_mode)}
                onChange={(v) => set("maintenance_mode", v)}
              />
              <FieldBlock label="Maintenance message" fieldKey="(app.maintenance_message)" hint="Shown when maintenance mode is enabled." className="sm:col-span-2">
                <textarea
                  className={cn(INPUT_CLASS, "min-h-[88px] py-2.5")}
                  rows={3}
                  placeholder="Enter the message shown while maintenance is enabled."
                  value={String(draft.maintenance_message ?? "")}
                  onChange={(e) => set("maintenance_message", e.target.value)}
                />
              </FieldBlock>
            </div>
          </>
        )}

        {tab === "onboarding" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Onboarding pages</h2>
                <p className="mt-0.5 text-xs text-gray-500">Reorder, add, or edit screens shown before sign-in.</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setOnboardingEdit({ title: "", body: "", image_url: "" })}
              >
                Add page
              </Button>
            </div>
            {onboardingEdit && (
              <div className="space-y-3 border-b border-[var(--color-border)] bg-gray-50/50 px-5 py-4 dark:bg-gray-900/20">
                <input className={INPUT_CLASS} placeholder="Title" value={onboardingEdit.title} onChange={(e) => setOnboardingEdit({ ...onboardingEdit, title: e.target.value })} />
                <textarea className={cn(INPUT_CLASS, "min-h-[72px]")} placeholder="Body" value={onboardingEdit.body} onChange={(e) => setOnboardingEdit({ ...onboardingEdit, body: e.target.value })} />
                <ImageUrlOrUpload
                  label="Page image"
                  folder="onboarding"
                  value={onboardingEdit.image_url}
                  onChange={(url) => setOnboardingEdit({ ...onboardingEdit, image_url: url })}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={savingContent}
                    onClick={() => {
                      persistOnboarding({
                        onboarding_upsert: {
                          id: onboardingEdit.id,
                          title: onboardingEdit.title,
                          body: onboardingEdit.body,
                          image_url: onboardingEdit.image_url,
                        },
                      });
                      setOnboardingEdit(null);
                    }}
                  >
                    Save page
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setOnboardingEdit(null)}>Cancel</Button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left">
                    <th className="table-head px-4 py-3">Order</th>
                    <th className="table-head px-4 py-3">Title</th>
                    <th className="table-head px-4 py-3">Body preview</th>
                    <th className="table-head px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {onboarding.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">No onboarding pages</td></tr>
                  ) : (
                    onboarding.map((p, i) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-900/30">
                        <td className="px-4 py-3 text-sm tabular-nums text-gray-500">{String(p.sort_order).padStart(2, "0")}</td>
                        <td className="px-4 py-3 text-sm font-medium">{p.title}</td>
                        <td className="max-w-md truncate px-4 py-3 text-sm text-gray-500">{p.body ?? "—"}</td>
                        <td className="px-4 py-3 text-right text-xs">
                          <button type="button" className="text-blue-600 hover:underline" onClick={() => setOnboardingEdit({ id: p.id, title: p.title, body: p.body ?? "", image_url: p.image_url ?? "" })}>Edit</button>
                          <span className="mx-1 text-gray-300">|</span>
                          <button type="button" className="text-gray-500 hover:text-gray-800" disabled={i === 0} onClick={() => moveOnboarding(i, -1)}>Up</button>
                          <button type="button" className="ml-1 text-gray-500 hover:text-gray-800" disabled={i === onboarding.length - 1} onClick={() => moveOnboarding(i, 1)}>Down</button>
                          <button type="button" className="ml-2 text-red-600 hover:underline" onClick={() => persistOnboarding({ onboarding_delete_id: p.id })}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "languages" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Languages</h2>
                <p className="mt-0.5 text-xs text-gray-500">Enable locales for the app language picker.</p>
              </div>
              <input
                className={cn(INPUT_CLASS, "max-w-xs")}
                placeholder="Search languages"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left">
                    <th className="table-head px-4 py-3">Code</th>
                    <th className="table-head px-4 py-3">Name</th>
                    <th className="table-head px-4 py-3">English name</th>
                    <th className="table-head px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {languages
                    .filter((l) => {
                      const n = langSearch.trim().toLowerCase();
                      if (!n) return true;
                      return l.name.toLowerCase().includes(n) || l.code.toLowerCase().includes(n) || (l.english_name ?? "").toLowerCase().includes(n);
                    })
                    .map((l) => (
                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800/50">
                      <td className="px-4 py-3 text-sm font-mono uppercase text-gray-600">{l.code}</td>
                      <td className="px-4 py-3 text-sm">{l.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{l.english_name ?? "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          type="button"
                          className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", l.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}
                          onClick={async () => {
                            await apiFetch("/api/v1/admin/app-content", {
                              method: "PATCH",
                              body: JSON.stringify({ language_patch: { id: l.id, enabled: !l.enabled } }),
                            });
                            const refresh = await apiFetch<{ languages: typeof languages; stats: Record<string, string | number | null> }>("/api/v1/admin/app-content");
                            if (refresh.data) {
                              setLanguages(refresh.data.languages);
                              setStats(refresh.data.stats);
                            }
                          }}
                        >
                          {l.enabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "legal" && (
          <div className="space-y-4 p-5">
            <div>
              <h2 className="text-sm font-semibold">Legal &amp; links</h2>
              <p className="mt-1 text-xs text-gray-500">Policy and store URLs (synced with Metadata).</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldBlock label="Privacy URL" fieldKey="(app.privacy_url)" hint="Link to your privacy policy.">
                <input className={INPUT_CLASS} value={val("privacy_url", "https://example.com/privacy")} onChange={(e) => set("privacy_url", e.target.value)} />
              </FieldBlock>
              <FieldBlock label="Terms URL" fieldKey="(app.terms_url)" hint="Link to your terms of service.">
                <input className={INPUT_CLASS} value={val("terms_url", "https://example.com/terms")} onChange={(e) => set("terms_url", e.target.value)} />
              </FieldBlock>
              <FieldBlock label="App Store URL" fieldKey="(app.store_url_ios)" className="sm:col-span-2">
                <input className={INPUT_CLASS} value={val("app_store_url_ios", "https://apps.apple.com/…")} onChange={(e) => set("app_store_url_ios", e.target.value)} />
              </FieldBlock>
              <FieldBlock label="Google Play URL" fieldKey="(app.store_url_android)" className="sm:col-span-2">
                <input className={INPUT_CLASS} value={val("app_store_url_android", "https://play.google.com/store/apps/…")} onChange={(e) => set("app_store_url_android", e.target.value)} />
              </FieldBlock>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] bg-gray-50/50 px-5 py-4 dark:bg-gray-900/20">
          {msg ? <p className="text-sm text-gray-600 dark:text-gray-400">{msg}</p> : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => save(false)}>Save draft</Button>
            <Button onClick={() => save(true)}>Publish</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
