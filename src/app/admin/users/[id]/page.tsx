"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PremiumImage from "@/components/dashboard/PremiumImage";
import { Copy, Smartphone } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api/client";
import { isAdminDesignPreview } from "@/lib/admin/design-preview";
import { formatCampaignSentAt, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { UserJobsPanel, UserLooksPanel, UserSessionsPanel } from "./UserTabPanels";

type UserDetail = {
  profile: {
    display_name?: string;
    email?: string;
    photo_url?: string;
    status: string;
    uid: string;
    role: string;
    created_at: string | null;
    last_active: string | null;
  };
  auth_providers: { email: boolean; google: boolean };
  preferences: Record<string, string>;
  stats: { try_on_jobs: number; completed: number; failed: number; saved_looks: number };
  devices: { id: string; label?: string; platform: string; device_id?: string; last_seen_at: string | null }[];
  recent_jobs: { id: string; style: string; status: string; created_at: string | null }[];
  recent_looks: { id: string; preview_url: string; style: string; created_at: string | null; is_favorite: boolean }[];
  sessions: { id: string; status: string; expires_at: string; device_id?: string }[];
  _demo?: boolean;
};

type TabId = "activity" | "jobs" | "looks" | "sessions";

function platformLabel(p: string) {
  if (p === "ios") return "iOS";
  if (p === "android") return "Android";
  return p;
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-100 py-2.5 last:border-0 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 sm:text-right">{value}</span>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<UserDetail | null>(null);
  const [tab, setTab] = useState<TabId>("activity");
  const [copied, setCopied] = useState(false);

  const useDemo = isAdminDesignPreview(searchParams);

  const load = useCallback(async () => {
    const q = useDemo ? "?demo=1" : "";
    const res = await apiFetch<UserDetail>(`/api/v1/admin/users/${id}/detail${q}`);
    return res.data ?? null;
  }, [id, useDemo]);

  useEffect(() => {
    load().then(setData);
  }, [load]);

  async function toggleStatus() {
    if (!data) return;
    const next = data.profile.status === "active" ? "disabled" : "active";
    await apiFetch(`/api/v1/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
    load().then(setData);
  }

  async function deleteUser() {
    if (!confirm(`Permanently delete ${data?.profile.email ?? "this user"}? All jobs, looks, and sessions will be removed.`)) return;
    const res = await apiFetch(`/api/v1/admin/users/${id}`, { method: "DELETE" });
    if (!res.error) router.push("/admin/users");
  }

  function copyUid() {
    if (!data) return;
    navigator.clipboard.writeText(data.profile.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!data) return <p className="text-sm text-gray-500">Loading user…</p>;

  const name = data.profile.display_name ?? data.profile.email ?? "User";
  const isActive = data.profile.status === "active";
  const showActivity = tab === "activity";

  const activityTimeline = useMemo(() => {
    const jobs = data.recent_jobs.map((j) => ({
      id: `job-${j.id}`,
      kind: "job" as const,
      title: j.style,
      status: j.status,
      at: j.created_at,
    }));
    const looks = data.recent_looks.map((l) => ({
      id: `look-${l.id}`,
      kind: "look" as const,
      title: l.style,
      preview_url: l.preview_url,
      favorite: l.is_favorite,
      at: l.created_at,
    }));
    return [...jobs, ...looks]
      .sort((a, b) => {
        const ta = a.at ? Date.parse(a.at) : 0;
        const tb = b.at ? Date.parse(b.at) : 0;
        return tb - ta;
      })
      .slice(0, 40);
  }, [data]);

  return (
    <div className="space-y-5">
      {data._demo && (
        <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          Design preview user profile. Enable with <code className="rounded bg-white/60 px-1">?demo=1</code>.
        </p>
      )}

      <PageHeader
        backHref="/admin/users"
        backLabel="Back to users"
        title={name}
        subtitle={data.profile.email}
        actions={[
          { label: isActive ? "Disable user" : "Enable user", variant: "outline", onClick: toggleStatus },
          { label: "Delete", variant: "outline", onClick: deleteUser },
        ]}
      />

      <div className="flex items-center gap-4">
        <PremiumImage src={data.profile.photo_url} alt="" size="md" shape="circle" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">{name}</span>
            <StatusBadge status={isActive ? "Active" : "Failed"} />
          </div>
          <p className="text-sm text-gray-500">{data.profile.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Try-on jobs", value: data.stats.try_on_jobs },
          { label: "Completed", value: data.stats.completed },
          { label: "Failed", value: data.stats.failed },
          { label: "Saved looks", value: data.stats.saved_looks },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <InfoCard title="Profile">
          <InfoRow label="Display name" value={data.profile.display_name ?? "—"} />
          <InfoRow label="Email" value={data.profile.email ?? "—"} />
          <InfoRow
            label="UID"
            value={
              <span className="inline-flex items-center gap-2 font-mono text-xs">
                {data.profile.uid}
                <button type="button" onClick={copyUid} className="text-gray-400 hover:text-gray-700" aria-label="Copy UID">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {copied && <span className="text-green-600">Copied</span>}
              </span>
            }
          />
          <InfoRow label="Role" value={data.profile.role === "admin" ? "Admin" : "App user"} />
          <InfoRow label="Created at" value={formatCampaignSentAt(data.profile.created_at)} />
          <InfoRow label="Last active" value={formatCampaignSentAt(data.profile.last_active)} />
        </InfoCard>
        <InfoCard title="Auth providers">
          <div className="flex flex-wrap gap-2 pt-1">
            {data.auth_providers.email && (
              <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium dark:border-gray-700">Email</span>
            )}
            {data.auth_providers.google && (
              <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium dark:border-gray-700">Google</span>
            )}
            {!data.auth_providers.email && !data.auth_providers.google && <span className="text-sm text-gray-500">None</span>}
          </div>
        </InfoCard>
        <InfoCard title="Preferences">
          <InfoRow label="Language" value={data.preferences.language ?? "—"} />
          <InfoRow label="Theme" value={data.preferences.theme ?? "—"} />
          <InfoRow label="Gender" value={data.preferences.gender ?? "—"} />
          <InfoRow label="Notifications" value={data.preferences.notifications ?? "—"} />
        </InfoCard>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Devices ({data.devices.length})</h2>
          <Link href={`/admin/devices?user_id=${id}`} className="text-sm font-medium text-blue-600 hover:underline">
            View all devices
          </Link>
        </div>
        {data.devices.length === 0 ? (
          <p className="text-sm text-gray-500">No devices registered</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.devices.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-gray-800">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{d.label ?? d.device_id ?? d.id}</p>
                    <p className="text-xs text-gray-500">{platformLabel(d.platform)}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{formatRelativeTime(d.last_seen_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-0">
        {(
          [
            { id: "activity" as TabId, label: "Activity" },
            { id: "jobs" as TabId, label: "Jobs" },
            { id: "looks" as TabId, label: "Looks" },
            { id: "sessions" as TabId, label: "Sessions" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
              tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showActivity && (
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Recent activity</h2>
          {activityTimeline.length === 0 ? (
            <p className="text-sm text-gray-500">No try-on jobs or saved looks yet.</p>
          ) : (
            <ul className="space-y-3">
              {activityTimeline.map((ev) => (
                <li key={ev.id} className="flex gap-3 border-b border-gray-50 pb-3 last:border-0 dark:border-gray-800/60">
                  {ev.kind === "look" ? (
                    <PremiumImage src={ev.preview_url} alt="" size="sm" shape="card" />
                  ) : (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {ev.kind === "job" ? "Try-on" : "Saved look"}
                      <span className="font-normal text-gray-500"> · {ev.title}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatRelativeTime(ev.at)}
                      {ev.kind === "job" ? ` · ${ev.status}` : ev.favorite ? " · Favorite" : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-gray-500">
            Showing the latest items from the profile API. Use Jobs, Looks, and Sessions for full paginated history.
          </p>
        </div>
      )}

      <UserJobsPanel userId={id} active={tab === "jobs"} />
      <UserLooksPanel userId={id} active={tab === "looks"} />
      <UserSessionsPanel userId={id} active={tab === "sessions"} />
    </div>
  );
}
