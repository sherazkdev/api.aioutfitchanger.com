"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Feed = {
  available: boolean;
  notifications?: { id: string; title: string; time: string | null; type: string }[];
  activities?: { id: string; title: string; time: string | null }[];
  message?: string;
};

const styles: Record<string, { icon: typeof AlertCircle; bg: string; color: string }> = {
  error: { icon: AlertCircle, bg: "bg-red-50", color: "text-red-500" },
  user: { icon: UserPlus, bg: "bg-blue-50", color: "text-blue-500" },
  success: { icon: CheckCircle2, bg: "bg-green-50", color: "text-green-500" },
};

export default function RightPanel() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setRefreshing(true);
    apiFetch<{ notifications_feed: Feed }>("/api/v1/admin/overview?days=7").then((res) => {
      if (res.error) {
        setError(res.error.message);
        setFeed(null);
      } else {
        setError(null);
        setFeed(res.data?.notifications_feed ?? null);
      }
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notifications = feed?.notifications ?? [];
  const activities = feed?.activities ?? [];

  return (
    <aside className="hidden w-[var(--panel-width)] shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-card)] xl:flex">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {error && <p className="mb-4 text-xs text-red-600">{error}</p>}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            <button
              type="button"
              onClick={load}
              disabled={refreshing}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-800"
              aria-label="Refresh panel"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-xs text-gray-500">{feed?.message ?? "No recent campaigns"}</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => {
                const s = styles[n.type] ?? styles.success;
                const Icon = s.icon;
                return (
                  <div key={n.id} className="flex gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${s.bg}`}>
                      <Icon className={`h-4 w-4 ${s.color}`} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[13px] font-medium leading-snug text-gray-900 dark:text-gray-100">{n.title}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">{formatRelativeTime(n.time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="mb-6 border-t border-gray-100 dark:border-gray-800" />

        <section>
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Activities</h3>
          {activities.length === 0 ? (
            <p className="text-xs text-gray-500">No recent try-on jobs</p>
          ) : (
            <div className="space-y-4">
              {activities.map((a) => (
                <div key={a.id} className="text-[13px]">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{a.title}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{formatRelativeTime(a.time)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
        <p className="mt-8 text-center text-[11px] text-gray-500">Updates from overview API</p>
      </div>
    </aside>
  );
}
