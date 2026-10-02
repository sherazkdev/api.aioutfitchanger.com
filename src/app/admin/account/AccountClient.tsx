"use client";

import { useEffect, useMemo, useState } from "react";
import PremiumImage from "@/components/dashboard/PremiumImage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Laptop, Lock, Smartphone } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api/client";
import { getRefreshToken } from "@/lib/auth/session";
import { isAdminDesignPreview } from "@/lib/admin/design-preview";
import { DEMO_AVATAR, DEMO_SESSIONS } from "@/lib/admin/account-demo";
import { formatCampaignSentAt, formatExpiresIn, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type SessionRow = {
  id: string;
  is_current?: boolean;
  label: string;
  ip?: string;
  last_used_at?: string | null;
  status: string;
  expires_in_ms: number;
  ttl_elapsed_percent: number | null;
};

function passwordStrength(pw: string) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", pct: 25, tone: "bg-red-500" };
  if (score === 2) return { label: "Fair", pct: 50, tone: "bg-orange-400" };
  if (score === 3) return { label: "Good", pct: 75, tone: "bg-blue-500" };
  return { label: "Strong", pct: 100, tone: "bg-green-500" };
}

function SessionIcon({ label }: { label: string }) {
  const mobile = /iphone|android|mobile|ipad/i.test(label);
  return mobile ? <Smartphone className="h-4 w-4 text-gray-400" /> : <Laptop className="h-4 w-4 text-gray-400" />;
}

function ThemeSegment({
  value,
  onChange,
}: {
  value: "system" | "light" | "dark";
  onChange: (v: "system" | "light" | "dark") => void;
}) {
  const opts: { id: "system" | "light" | "dark"; label: string }[] = [
    { id: "system", label: "System" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
  ];
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900/40">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            value === o.id ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100" : "text-gray-500 hover:text-gray-800"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NotifyToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/30">
      <span className="text-sm text-gray-800 dark:text-gray-200">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-gray-900 dark:bg-gray-100" : "bg-gray-300")}
      >
        <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform dark:bg-gray-900", checked && "translate-x-5")} />
      </button>
    </label>
  );
}

export default function AccountClient() {
  const searchParams = useSearchParams();
  const designPreview = isAdminDesignPreview(searchParams);

  const [profile, setProfile] = useState({ display_name: "", email: "", photo_url: "" });
  const [prefs, setPrefs] = useState({ theme_mode: "system" as "system" | "light" | "dark", notify_job_failures: true, notify_new_users: false });
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [pwd, setPwd] = useState({ current: "", new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [meta, setMeta] = useState({ last_login_at: "", created_at: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const meHeaders = (): HeadersInit => {
    const refresh = getRefreshToken();
    return refresh ? { "X-Refresh-Session": refresh } : {};
  };

  const strength = useMemo(() => passwordStrength(pwd.new), [pwd.new]);

  function applyDemo(
    p: { display_name: string; email: string; photo_url: string },
    m: { last_login_at: string; created_at: string },
    s: SessionRow[]
  ) {
    if (!designPreview) return { profile: p, meta: m, sessions: s };
    return {
      profile: {
        ...p,
        display_name: p.display_name?.trim() || "Alex Morgan",
        photo_url: p.photo_url || DEMO_AVATAR,
      },
      meta: {
        last_login_at: m.last_login_at || new Date().toISOString(),
        created_at: m.created_at || new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString(),
      },
      sessions: DEMO_SESSIONS,
    };
  }

  function load() {
    return apiFetch<{
      profile: { display_name?: string; email?: string; photo_url?: string; last_login_at: string; created_at: string };
      preferences: typeof prefs;
      sessions: SessionRow[];
    }>("/api/v1/admin/me", { headers: meHeaders() }).then((res) => {
      if (!res.data) return;
      const p = {
        display_name: res.data.profile.display_name ?? "",
        email: res.data.profile.email ?? "",
        photo_url: res.data.profile.photo_url ?? "",
      };
      const m = { last_login_at: res.data.profile.last_login_at ?? "", created_at: res.data.profile.created_at ?? "" };
      const merged = applyDemo(p, m, res.data.sessions);
      setProfile(merged.profile);
      setMeta(merged.meta);
      setSessions(merged.sessions);
      setPrefs(res.data.preferences);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, [designPreview]);

  async function saveProfile() {
    setMsg(null);
    const res = await apiFetch("/api/v1/admin/me", {
      method: "PATCH",
      body: JSON.stringify({ display_name: profile.display_name, photo_url: profile.photo_url, ...prefs }),
      headers: meHeaders(),
    });
    setMsg(res.error ? res.error.message : "Profile saved");
  }

  async function savePassword() {
    if (pwd.new !== pwd.confirm) {
      setMsg("Passwords do not match");
      return;
    }
    setMsg(null);
    const res = await apiFetch("/api/v1/admin/me", {
      method: "PATCH",
      body: JSON.stringify({ current_password: pwd.current, new_password: pwd.new }),
      headers: meHeaders(),
    });
    if (res.error) setMsg(res.error.message);
    else {
      setMsg("Password updated");
      setPwd({ current: "", new: "", confirm: "" });
    }
  }

  async function revokeSession(id: string) {
    if (id.startsWith("demo-")) return;
    await apiFetch("/api/v1/admin/me", { method: "PATCH", body: JSON.stringify({ revoke_session_id: id }), headers: meHeaders() });
    load();
  }

  async function revokeOthers() {
    await apiFetch("/api/v1/admin/me", { method: "PATCH", body: JSON.stringify({ revoke_other_sessions: true }), headers: meHeaders() });
    load();
  }

  function onAvatarPick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setAvatarUploading(true);
      setMsg(null);
      const form = new FormData();
      form.append("avatar", file);
      try {
        const token = (await import("@/lib/auth/session")).getAccessToken();
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch("/api/v1/users/me/avatar", { method: "POST", headers, body: form, credentials: "include" });
        const json = (await res.json()) as { data?: { photo_url: string }; error?: { message: string } };
        if (!res.ok || !json.data?.photo_url) {
          setMsg(json.error?.message ?? "Avatar upload failed");
        } else {
          setProfile((p) => ({ ...p, photo_url: json.data!.photo_url }));
          setMsg("Avatar updated");
        }
      } catch {
        setMsg("Avatar upload failed");
      }
      setAvatarUploading(false);
    };
    input.click();
  }

  const lastLogin = designPreview && !meta.last_login_at ? "24 Sep 2026, 10:30" : formatCampaignSentAt(meta.last_login_at);
  const createdAt = designPreview && !meta.created_at ? "12 Aug 2026" : formatCampaignSentAt(meta.created_at).split(",")[0];

  if (loading) return <p className="text-sm text-gray-500">Loading account…</p>;

  return (
    <div className="mx-auto max-w-[1120px] space-y-5">
      {designPreview && (
        <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
          Design preview values for empty fields and sample sessions. Enable with <code className="rounded bg-white/70 px-1">?demo=1</code>.
        </p>
      )}

      <PageHeader title="Admin Account" subtitle="Manage your profile, password and session security." />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <PremiumImage src={profile.photo_url} alt="" size="lg" shape="circle" className="ring-2 ring-white" />
              <Button type="button" variant="outline" size="sm" onClick={onAvatarPick} disabled={avatarUploading}>
                {avatarUploading ? "Uploading…" : "Upload avatar"}
              </Button>
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">Administrator</span>
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <Input label="Display name" value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
              <Input
                label="Email"
                value={profile.email}
                disabled
                readOnly
                suffix={<Lock className="h-3.5 w-3.5 text-gray-400" />}
              />
              <p className="text-xs text-gray-500">
                Last login: <span className="text-gray-700 dark:text-gray-300">{lastLogin}</span>
                <span className="mx-2">·</span>
                Created at: <span className="text-gray-700 dark:text-gray-300">{createdAt}</span>
              </p>
              <Button variant="outline" onClick={saveProfile}>Save profile</Button>
            </div>
          </div>
        </div>

        <div className="card flex flex-col p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Change password</h2>
          <div className="mt-4 flex flex-1 flex-col gap-4">
            <Input
              label="Current password"
              type={showPwd.current ? "text" : "password"}
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              suffix={
                <button type="button" onClick={() => setShowPwd((s) => ({ ...s, current: !s.current }))} className="text-gray-400 hover:text-gray-600">
                  {showPwd.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <div>
              <Input
                label="New password"
                type={showPwd.new ? "text" : "password"}
                value={pwd.new}
                onChange={(e) => setPwd({ ...pwd, new: e.target.value })}
                suffix={
                  <button type="button" onClick={() => setShowPwd((s) => ({ ...s, new: !s.new }))} className="text-gray-400 hover:text-gray-600">
                    {showPwd.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className={cn("h-full rounded-full transition-all", strength.tone)} style={{ width: `${strength.pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-medium text-green-700 dark:text-green-400">{strength.label}</span> — Use a mix of letters, numbers and symbols.
                  </p>
                </div>
              )}
            </div>
            <Input
              label="Confirm new password"
              type={showPwd.confirm ? "text" : "password"}
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              suffix={
                <button type="button" onClick={() => setShowPwd((s) => ({ ...s, confirm: !s.confirm }))} className="text-gray-400 hover:text-gray-600">
                  {showPwd.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={savePassword}>Save</Button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-sm font-semibold">Active sessions</h2>
          <Button size="sm" variant="outline" onClick={revokeOthers}>Sign out all other sessions</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                <th className="table-head px-4 py-3">Device / label</th>
                <th className="table-head px-4 py-3">IP address</th>
                <th className="table-head px-4 py-3">Last used</th>
                <th className="table-head px-4 py-3">Expires in</th>
                <th className="table-head px-4 py-3">Status</th>
                <th className="table-head px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <SessionIcon label={s.label} />
                      <span>{s.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.ip ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.last_used_at ? formatRelativeTime(s.last_used_at) : "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    {s.status === "active" && s.expires_in_ms > 0 ? (
                      <div className="min-w-[120px]">
                        <span className="text-gray-700 dark:text-gray-300">{formatExpiresIn(s.expires_in_ms)}</span>
                        {s.ttl_elapsed_percent != null && (
                          <div className="mt-1.5 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, s.ttl_elapsed_percent)}%` }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.is_current ? <StatusBadge status="Current" /> : s.status === "active" ? <StatusBadge status="Active" /> : <StatusBadge status="Expired" />}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.status === "active" && !s.is_current && (
                      <button type="button" onClick={() => revokeSession(s.id)} className="text-sm font-medium text-blue-600 hover:underline">
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preferences</h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Default theme</p>
            <ThemeSegment value={prefs.theme_mode} onChange={(v) => setPrefs({ ...prefs, theme_mode: v })} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Email notifications</p>
            <NotifyToggle label="Job failures" checked={prefs.notify_job_failures} onChange={(v) => setPrefs({ ...prefs, notify_job_failures: v })} />
            <NotifyToggle label="New users" checked={prefs.notify_new_users} onChange={(v) => setPrefs({ ...prefs, notify_new_users: v })} />
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          App user accounts are managed under{" "}
          <Link href="/admin/users" className="text-blue-600 hover:underline">Users</Link>.
        </p>
      </div>

      {msg && <p className="text-sm text-gray-600 dark:text-gray-400">{msg}</p>}
    </div>
  );
}
