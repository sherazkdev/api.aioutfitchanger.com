"use client";

import PremiumImage from "@/components/dashboard/PremiumImage";
import { Copy, X } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TokenFamilyData = {
  family_id: string;
  reuse_detected?: boolean;
  revoke_reason?: string | null;
  user?: { email?: string; display_name?: string; photo_url?: string; role?: string };
  timeline?: { at: string; label: string; kind: string }[];
  tokens?: { id: string; status: string; use_count: number; label?: string }[];
};

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

function tokenShortId(id: string) {
  const raw = id.replace(/^demo-rt-/, "").replace(/^tok-/, "");
  return `rt_${raw.slice(0, 4)}…`;
}

export default function TokenFamilyPanel({
  familyId,
  family,
  onClose,
  className,
}: {
  familyId: string;
  family: TokenFamilyData | null;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 px-4 py-3.5 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Token family</h3>
          <p className="mt-0.5 text-xs text-gray-500">Refresh rotation &amp; reuse audit</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Family details</p>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/40">
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-gray-700 dark:text-gray-300">{familyId}</span>
          <button
            type="button"
            className="shrink-0 text-gray-400 hover:text-blue-600"
            onClick={() => void navigator.clipboard.writeText(familyId)}
            aria-label="Copy family ID"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>

        {family?.reuse_detected && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <span className="font-semibold">Token reuse detected.</span> This family has been revoked.
          </div>
        )}

        {family?.user && (
          <>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-gray-400">Account</p>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-900/30">
              <PremiumImage
                src={family.user.photo_url}
                alt=""
                size="md"
                shape="circle"
                className="ring-2 ring-white dark:ring-gray-800"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {family.user.display_name ?? family.user.email}
                </p>
                <p className="truncate text-xs text-gray-500">{family.user.email}</p>
                <div className="mt-1">
                  <RolePill role={family.user.role} />
                </div>
              </div>
            </div>
          </>
        )}

        <p className="mt-5 text-[11px] font-medium uppercase tracking-wide text-gray-400">Family activity</p>
        <ul className="relative mt-3 space-y-0">
          {(family?.timeline ?? []).map((ev, i) => (
            <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
              {i < (family?.timeline?.length ?? 0) - 1 && (
                <span className="absolute left-[5px] top-3 h-[calc(100%-4px)] w-px bg-gray-200 dark:bg-gray-700" />
              )}
              <span
                className={cn(
                  "relative z-[1] mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-gray-900",
                  ev.kind === "reuse" ? "bg-red-500" : "bg-blue-500"
                )}
              />
              <div className="min-w-0 text-xs">
                <p className="font-medium text-gray-800 dark:text-gray-200">{ev.label}</p>
                <p className="text-gray-400">{formatDateTime(ev.at)}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[11px] font-medium uppercase tracking-wide text-gray-400">Tokens in family</p>
        <ul className="mt-2 space-y-1.5">
          {(family?.tokens ?? []).map((tok) => {
            const pill =
              tok.label ??
              (tok.status === "revoked" ? "Revoked" : tok.status === "active" ? "Active" : tok.status);
            const pillClass =
              pill === "Revoked"
                ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                : pill === "Rotated"
                  ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400";
            return (
              <li
                key={tok.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-xs dark:border-gray-800"
              >
                <span className="font-mono text-gray-600 dark:text-gray-400">{tokenShortId(tok.id)}</span>
                <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-medium", pillClass)}>{pill}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 space-y-1.5 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-3 py-3 text-[11px] leading-relaxed text-gray-500 dark:border-gray-700 dark:bg-gray-900/20">
          {family?.revoke_reason && (
            <p>
              Reason: <span className="font-mono text-gray-700 dark:text-gray-300">{family.revoke_reason}</span>
            </p>
          )}
          <p>Access JWT lifetime: <span className="font-medium text-gray-700 dark:text-gray-300">10 minutes</span></p>
          <p>Refresh tokens rotate after each successful use.</p>
        </div>
      </div>
    </div>
  );
}
