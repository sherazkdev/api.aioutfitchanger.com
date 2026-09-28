"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import RemoteImage from "@/components/dashboard/RemoteImage";
import TokenFamilyPanel, { type TokenFamilyData } from "@/components/dashboard/TokenFamilyPanel";
import {
  Users,
  Clock,
  AlertTriangle,
  Copy,
  Search,
  Laptop,
  Smartphone,
  Tablet,
  RefreshCw,
} from "lucide-react";
import { adminSessionHeaders, apiFetch } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/session";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import TablePagination from "@/components/dashboard/TablePagination";
import { formatCreatedShort, formatDateTime, formatExpiresIn, formatRelativeTime } from "@/lib/format";
import { isAdminDesignPreview } from "@/lib/admin/design-preview";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import {
  DEMO_CHART,
  DEMO_DEFAULT_SELECTION,
  DEMO_FAMILY,
  DEMO_FAMILY_ID,
  DEMO_ITEMS,
  DEMO_KPIS,
} from "@/lib/admin/token-management-demo";
import { cn } from "@/lib/utils";

type TokenRow = {
  id: string;
  session_id: string;
  user: { email?: string; display_name?: string; role?: string; photo_url?: string } | null;
  status: string;
  use_count: number;
  expires_at: string;
  expires_in_ms: number;
  family_id: string;
  device_id?: string;
  label?: string;
  ttl_elapsed_percent: number | null;
  ip?: string;
  user_agent?: string;
  created_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  revoke_reason?: string | null;
};

function statusLabel(s: string) {
  if (s === "active") return "Active";
  if (s === "expired") return "Expired";
  if (s === "revoked") return "Revoked";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function sessionLabel(row: TokenRow) {
  const base = row.session_id || row.id.replace(/^demo-rt-/, "");
  return `rt_${base.slice(0, 4)}…`;
}

function uaLabel(ua?: string, existing?: string) {
  if (existing && existing !== "—") return existing;
  if (!ua) return "Web client";
  if (/ipad/i.test(ua)) return "Safari · iPad";
  if (/iphone|ios/i.test(ua)) return "Safari · iPhone";
  if (/android/i.test(ua)) return "Chrome · Android";
  if (/edg/i.test(ua)) return "Edge · Windows";
  if (/windows/i.test(ua)) return "Chrome · Windows";
  if (/mac/i.test(ua)) return "Safari · macOS";
  return "Web client";
}

function enrichTokenRow(t: TokenRow): TokenRow {
  const email = t.user?.email ?? "";
  const nameFromEmail = email
    ? email
        .split("@")[0]
        .split(/[._]/)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ")
    : undefined;
  return {
    ...t,
    label: uaLabel(t.user_agent, t.label),
    user: t.user
      ? {
          ...t.user,
          display_name: t.user.display_name || nameFromEmail,
        }
      : null,
  };
}

function RolePill({ role }: { role?: string }) {
  if (role === "admin") {
    return (
      <span className="inline-flex rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
        Administrator
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
      App
    </span>
  );
}

function DeviceIcon({ label }: { label?: string }) {
  const text = label ?? "";
  if (/ipad|tablet/i.test(text)) return <Tablet className="h-3.5 w-3.5 text-gray-400" />;
  if (/iphone|android|mobile/i.test(text)) return <Smartphone className="h-3.5 w-3.5 text-gray-400" />;
  return <Laptop className="h-3.5 w-3.5 text-gray-400" />;
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  hint?: string;
  icon: ReactNode;
  tone?: "default" | "warn" | "danger";
}) {
  const iconTone =
    tone === "warn" ? "text-orange-500" : tone === "danger" ? "text-red-500" : "text-gray-400";
  const valueTone =
    tone === "warn" ? "text-orange-600" : tone === "danger" ? "text-red-600" : "text-gray-900 dark:text-gray-100";

  return (
    <div className="rounded-xl border border-sky-100/90 bg-white px-4 py-4 shadow-sm dark:border-sky-900/40 dark:bg-[var(--color-card)]">
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50/80 dark:bg-sky-950/30", iconTone)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className={cn("mt-0.5 text-[26px] font-semibold leading-none tabular-nums", valueTone)}>{value.toLocaleString()}</p>
          {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-[120px] flex-col gap-1">
      <span className="text-[11px] font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}

const SELECT_CLASS =
  "h-9 w-full min-w-[130px] rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

function createdRangeParam(range: string): string | undefined {
  if (range === "all") return undefined;
  const days = range === "30d" ? 30 : 7;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function buildPageButtons(totalPages: number): (number | "...")[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  return [1, 2, 3, "...", totalPages];
}

function chartDayLabel(isoDate: string) {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TokenManagementClient() {
  const searchParams = useSearchParams();
  const designPreview = isAdminDesignPreview(searchParams);

  const [items, setItems] = useState<TokenRow[]>([]);
  const [kpis, setKpis] = useState({
    active_sessions: 0,
    expiring_24h: 0,
    expired_sessions: 0,
    revoked_families_reuse: 0,
  });
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [family, setFamily] = useState<TokenFamilyData | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [createdFilter, setCreatedFilter] = useState("7d");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [page, setPage] = useState(1);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [chart, setChart] = useState<{ date: string; count: number }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [liveCount, setLiveCount] = useState(0);

  const load = useCallback(async () => {
    if (designPreview) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ limit: "20", page: String(page) });
    if (statusFilter) params.set("status", statusFilter);
    if (roleFilter) params.set("role", roleFilter);
    if (debouncedSearch) params.set("q", debouncedSearch);
    const from = createdRangeParam(createdFilter);
    if (from) params.set("from", from);
    const res = await apiFetch<{
      items: TokenRow[];
      kpis: typeof kpis;
      sessions_chart?: { date: string; count: number }[];
      meta: { page: number; limit: number; total: number };
    }>(`/api/v1/admin/tokens?${params}`);
    if (res.error) {
      setError(res.error.message);
      setItems([]);
      setLiveCount(0);
    } else {
      setError(null);
      const rows = res.data?.items ?? [];
      setItems(rows);
      setLiveCount(rows.length);
      if (res.data?.kpis) {
        setKpis(res.data.kpis);
        setFiltersApplied(Boolean((res.data.kpis as { filters_applied?: boolean }).filters_applied));
      }
      setChart(res.data?.sessions_chart ?? []);
      if (res.data?.meta) setMeta(res.data.meta);
    }
    setLoading(false);
  }, [designPreview, statusFilter, roleFilter, debouncedSearch, page, createdFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, roleFilter, createdFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (designPreview) {
      setFamilyId(DEMO_FAMILY_ID);
      setFamily(DEMO_FAMILY as TokenFamilyData);
      setSelected(new Set(DEMO_DEFAULT_SELECTION));
    }
  }, [designPreview]);

  const displayKpis = designPreview ? DEMO_KPIS : kpis;
  const displayChart = designPreview ? DEMO_CHART : chart;

  const displayItems = useMemo(() => {
    if (designPreview) {
      let rows = [...DEMO_ITEMS] as TokenRow[];
      if (statusFilter) rows = rows.filter((r) => r.status === statusFilter);
      if (roleFilter) rows = rows.filter((r) => r.user?.role === roleFilter);
      if (search.trim()) {
        const n = search.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.family_id.toLowerCase().includes(n) ||
            r.device_id?.toLowerCase().includes(n) ||
            r.ip?.toLowerCase().includes(n) ||
            r.user?.email?.toLowerCase().includes(n) ||
            r.user?.display_name?.toLowerCase().includes(n)
        );
      }
      return rows;
    }
    return items.map(enrichTokenRow);
  }, [designPreview, items, statusFilter, roleFilter, search]);

  const displayMeta = designPreview ? { page: 1, limit: 5, total: 1568 } : meta;
  const totalPages = Math.max(1, Math.ceil(displayMeta.total / displayMeta.limit));
  const pageButtons = designPreview ? buildPageButtons(314) : buildPageButtons(totalPages);

  async function revoke(id: string) {
    if (designPreview) return;
    if (!confirm("Revoke this session?")) return;
    const res = await apiFetch(`/api/v1/admin/tokens/${id}`, {
      method: "DELETE",
      headers: adminSessionHeaders(),
    });
    if (res.error) setError(res.error.message);
    else load();
  }

  async function revokeSelected() {
    if (designPreview) {
      setSelected(new Set());
      return;
    }
    if (selected.size === 0) return;
    if (!confirm(`Revoke ${selected.size} selected session(s)? This cannot be undone.`)) return;
    const res = await apiFetch<{ revoked: string[]; skipped_current: string[] }>("/api/v1/admin/tokens/bulk-revoke", {
      method: "POST",
      headers: adminSessionHeaders(),
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    if (res.error) setError(res.error.message);
    else if (res.data?.skipped_current?.length) {
      setError("Your current admin session was skipped. Other selected sessions were revoked.");
    }
    setSelected(new Set());
    load();
  }

  async function exportCsv() {
    if (designPreview) return;
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (roleFilter) params.set("role", roleFilter);
    if (debouncedSearch) params.set("q", debouncedSearch);
    const from = createdRangeParam(createdFilter);
    if (from) params.set("from", from);
    const headers = new Headers(adminSessionHeaders());
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`/api/v1/admin/tokens/export?${params}`, { headers, credentials: "include" });
    if (!res.ok) {
      setError("CSV export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `token-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function openFamily(fid: string) {
    setFamilyId(fid);
    if (designPreview && fid === DEMO_FAMILY_ID) {
      setFamily(DEMO_FAMILY as TokenFamilyData);
      return;
    }
    if (designPreview) {
      const row = (DEMO_ITEMS as TokenRow[]).find((r) => r.family_id === fid);
      setFamily({
        family_id: fid,
        reuse_detected: row?.revoke_reason === "reuse_detected",
        revoke_reason: row?.revoke_reason,
        user: row?.user ?? undefined,
        timeline: [{ at: row?.created_at ?? new Date().toISOString(), label: "Token family issued", kind: "issued" }],
        tokens: [{ id: row?.id ?? "tok", status: row?.status ?? "active", use_count: row?.use_count ?? 0 }],
      });
      return;
    }
    const res = await apiFetch<TokenFamilyData>(`/api/v1/admin/tokens/families/${fid}`);
    setFamily(res.data ?? null);
  }

  function closeFamily() {
    setFamilyId(null);
    setFamily(null);
  }

  const from = displayMeta.total ? (displayMeta.page - 1) * displayMeta.limit + 1 : 0;
  const to = Math.min(displayMeta.page * displayMeta.limit, displayMeta.total);

  return (
    <div className="space-y-4">
      {designPreview && (
        <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
          Design preview — sample sessions, KPIs, and family panel match the reference PNG.
          {liveCount > 0 && ` (${liveCount} live sessions loaded from API.)`}
          Add <code className="rounded bg-white/70 px-1 dark:bg-gray-900/50">?demo=1</code> or set{" "}
          <code className="rounded bg-white/70 px-1 dark:bg-gray-900/50">NEXT_PUBLIC_ADMIN_DESIGN_PREVIEW=1</code>.
        </p>
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <PageHeader
            title="Token management"
            subtitle="Refresh sessions across admin and app users"
            actions={[
              { label: "Refresh", onClick: load, variant: "outline" },
              { label: "Export CSV", onClick: exportCsv, variant: "primary" },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active sessions" value={displayKpis.active_sessions} icon={<Users className="h-4 w-4" />} />
            <StatCard label="Expiring in <24h" value={displayKpis.expiring_24h} icon={<Clock className="h-4 w-4" />} tone="warn" />
            <StatCard label="Expired" value={displayKpis.expired_sessions} icon={<Clock className="h-4 w-4" />} />
            <StatCard
              label="Revoked families"
              value={displayKpis.revoked_families_reuse}
              hint="Reuse detection"
              icon={<AlertTriangle className="h-4 w-4" />}
              tone="danger"
            />
          </div>

          {filtersApplied && !designPreview && (
            <p className="text-xs text-gray-500">KPI counts reflect your current filters.</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="relative min-w-0 flex-1">
                <span className="mb-1 block text-[11px] font-medium text-gray-500">Search</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/80 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/5 dark:border-gray-700 dark:bg-gray-900/40"
                    placeholder="Email, family ID, device ID or IP"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setPage(1)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterField label="Status">
                  <select className={SELECT_CLASS} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </FilterField>
                <FilterField label="Role">
                  <select className={SELECT_CLASS} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
                    <option value="">All roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">App user</option>
                  </select>
                </FilterField>
                <FilterField label="Created">
                  <select className={SELECT_CLASS} value={createdFilter} onChange={(e) => { setCreatedFilter(e.target.value); setPage(1); }}>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="all">All time</option>
                  </select>
                </FilterField>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
            {selected.size > 0 && (
              <div className="flex items-center gap-3 border-b border-sky-100 bg-sky-50/90 px-4 py-2.5 text-sm dark:border-sky-900/40 dark:bg-sky-950/20">
                <span className="font-medium text-sky-900 dark:text-sky-200">{selected.size} selected</span>
                <Button size="sm" variant="outline" onClick={revokeSelected}>Revoke selected</Button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left dark:border-gray-800 dark:bg-gray-900/40">
                    <th className="table-head w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all on page"
                        checked={displayItems.length > 0 && displayItems.every((r) => selected.has(r.id))}
                        onChange={(e) => {
                          if (e.target.checked) setSelected(new Set(displayItems.map((r) => r.id)));
                          else setSelected(new Set());
                        }}
                      />
                    </th>
                    <th className="table-head px-3 py-3">Session ID</th>
                    <th className="table-head px-3 py-3">User</th>
                    <th className="table-head px-3 py-3">Status / Expires in</th>
                    <th className="table-head px-3 py-3">Family ID</th>
                    <th className="table-head px-3 py-3">Use count / Last used</th>
                    <th className="table-head px-3 py-3">Created at</th>
                    <th className="table-head px-3 py-3">Expires at</th>
                    <th className="table-head px-3 py-3">Revoked at</th>
                    <th className="table-head px-3 py-3">Device / label</th>
                    <th className="table-head px-3 py-3">User agent / IP</th>
                    <th className="table-head px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !designPreview ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center text-sm text-gray-500">
                        <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-gray-300" />
                        Loading sessions…
                      </td>
                    </tr>
                  ) : displayItems.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-10 text-center text-sm text-gray-500">No sessions found</td>
                    </tr>
                  ) : (
                    displayItems.map((row) => {
                      const isFamilyRow = familyId === row.family_id;
                      return (
                        <tr
                          key={row.id}
                          className={cn(
                            "border-b border-gray-50 transition-colors dark:border-gray-800/60",
                            isFamilyRow ? "bg-sky-50/60 dark:bg-sky-950/20" : "hover:bg-gray-50/60 dark:hover:bg-gray-900/20",
                            selected.has(row.id) && !isFamilyRow && "bg-gray-50/40"
                          )}
                        >
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selected.has(row.id)}
                              onChange={(e) => {
                                const next = new Set(selected);
                                if (e.target.checked) next.add(row.id);
                                else next.delete(row.id);
                                setSelected(next);
                              }}
                            />
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{sessionLabel(row)}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              {row.user?.photo_url ? (
                                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-100">
                                  <RemoteImage src={row.user.photo_url} alt="" fill className="object-cover" sizes="32px" />
                                </div>
                              ) : (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px]">?</span>
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{row.user?.email ?? "—"}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                  <RolePill role={row.user?.role} />
                                  {row.user?.display_name && (
                                    <span className="truncate text-[11px] text-gray-400">{row.user.display_name}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={statusLabel(row.status)} />
                            {row.status === "active" && (
                              <p className="mt-1 text-[11px] font-medium text-gray-600">{formatExpiresIn(row.expires_in_ms)}</p>
                            )}
                            {row.status === "expired" && (
                              <p className="mt-1 text-[11px] text-red-500/80">{formatRelativeTime(row.expires_at)}</p>
                            )}
                            {row.status === "revoked" && row.revoke_reason === "reuse_detected" && (
                              <p className="mt-1 text-[11px] font-medium text-red-600">Reuse detected</p>
                            )}
                            {row.status === "active" && row.ttl_elapsed_percent != null && (
                              <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                                  style={{ width: `${Math.min(100, row.ttl_elapsed_percent)}%` }}
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              className="flex max-w-[132px] items-center gap-1 rounded-md px-1 py-0.5 font-mono text-[11px] text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800"
                              onClick={() => void navigator.clipboard.writeText(row.family_id)}
                            >
                              <span className="truncate">{row.family_id.slice(0, 12)}…</span>
                              <Copy className="h-3 w-3 shrink-0" />
                            </button>
                          </td>
                          <td className="px-3 py-3 text-xs">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{row.use_count}</p>
                            <p className="text-gray-400">{formatCreatedShort(row.last_used_at)}</p>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-500">{formatDateTime(row.created_at)}</td>
                          <td className="px-3 py-3 text-xs text-gray-500">{formatDateTime(row.expires_at)}</td>
                          <td className="px-3 py-3 text-xs text-gray-500">{formatDateTime(row.revoked_at)}</td>
                          <td className="px-3 py-3 text-xs">
                            <div className="flex items-start gap-1.5">
                              <DeviceIcon label={row.label} />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{row.device_id ?? "—"}</p>
                                <p className="text-gray-400">{row.label ?? "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="max-w-[150px] px-3 py-3 text-[10px] leading-snug text-gray-500">
                            <p className="line-clamp-2" title={row.user_agent}>{row.user_agent}</p>
                            <p className="mt-0.5 font-mono text-[10px] text-gray-400">{row.ip}</p>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm">
                            {row.status === "active" && (
                              <button type="button" className="mr-3 font-medium text-red-600 hover:underline" onClick={() => revoke(row.id)}>
                                Revoke
                              </button>
                            )}
                            <button
                              type="button"
                              className={cn("font-medium hover:underline", isFamilyRow ? "text-sky-700" : "text-blue-600")}
                              onClick={() => openFamily(row.family_id)}
                            >
                              View family
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              summary={`Showing ${from}–${to} of ${displayMeta.total.toLocaleString()}`}
              pages={pageButtons}
              current={designPreview ? 1 : page}
              onPage={designPreview ? undefined : setPage}
            />
          </div>

          {(designPreview || displayChart.length > 0) && (
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Sessions created (last 7 days)</h3>
              {!designPreview && displayChart.length === 0 ? (
                <p className="mt-6 py-8 text-center text-sm text-gray-500">No sessions created in the last 7 days.</p>
              ) : (
              <div className="mt-4 flex h-40 items-end gap-1.5 border-b border-gray-100 pb-1 dark:border-gray-800">
                {displayChart.map((c) => {
                  const max = Math.max(...displayChart.map((x) => x.count), 1);
                  const h = Math.max(12, (c.count / max) * 100);
                  return (
                    <div key={c.date} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">{c.count}</span>
                      <div className="flex w-full flex-1 items-end justify-center" style={{ height: "7rem" }}>
                        <div
                          className="w-[72%] max-w-[48px] rounded-t-md bg-gradient-to-t from-sky-500/90 to-sky-300/80 dark:from-sky-600 dark:to-sky-400/70"
                          style={{ height: `${h}%` }}
                          title={`${c.date}: ${c.count}`}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{chartDayLabel(c.date)}</span>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          )}
        </div>

        {familyId && (
          <>
            <div className="hidden w-[min(100%,360px)] shrink-0 xl:block">
              <div className="sticky top-4">
                <TokenFamilyPanel familyId={familyId} family={family} onClose={closeFamily} />
              </div>
            </div>
            <div className="fixed inset-0 z-40 bg-black/40 xl:hidden" onClick={closeFamily} aria-hidden />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm p-3 xl:hidden">
              <TokenFamilyPanel familyId={familyId} family={family} onClose={closeFamily} className="h-full shadow-xl" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
