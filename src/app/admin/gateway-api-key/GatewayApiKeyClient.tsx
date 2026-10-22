"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Eye, KeyRound, RefreshCw, Trash2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { apiFetch } from "@/lib/api/client";

type KeyStatus = {
  key_id: string;
  status: string;
  last_four: string;
  fingerprint_short: string;
  created_at: string;
  rotated_at: string | null;
  revoked_at: string | null;
  grace_expires_at: string | null;
  last_used_at: string | null;
};

type Overview = {
  active: KeyStatus | null;
  grace: KeyStatus[];
};

export default function GatewayApiKeyClient() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [showReveal, setShowReveal] = useState(false);

  const clearPlaintext = useCallback(() => {
    setPlaintext(null);
  }, []);

  useEffect(() => {
    return () => {
      setPlaintext(null);
    };
  }, []);

  const load = useCallback(async () => {
    setError(null);
    const res = await apiFetch<Overview>("/api/v1/admin/gateway-api-key");
    if (res.error || !res.data) {
      setError(res.error?.message ?? "Failed to load");
      return;
    }
    setOverview(res.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createKey() {
    setBusy(true);
    setError(null);
    clearPlaintext();
    try {
      const res = await apiFetch<{ api_key: string }>("/api/v1/admin/gateway-api-key/create", {
        method: "POST",
        body: "{}",
      });
      if (res.error || !res.data) {
        setError(res.error?.message ?? "Create failed");
        return;
      }
      setPlaintext(res.data.api_key);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function rotateKey() {
    if (!confirm("Rotate gateway API key? Update the Cloud Function secret before grace expires.")) return;
    setBusy(true);
    setError(null);
    clearPlaintext();
    try {
      const res = await apiFetch<{ api_key: string }>("/api/v1/admin/gateway-api-key/rotate", {
        method: "POST",
        body: "{}",
      });
      if (res.error || !res.data) {
        setError(res.error?.message ?? "Rotate failed");
        return;
      }
      setPlaintext(res.data.api_key);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function revokeKey(keyId: string, isActive: boolean) {
    const msg = isActive
      ? "Revoke ACTIVE key? This leaves no valid key unless you create a new one. Type OK mentally and confirm."
      : "Revoke this grace key?";
    if (!confirm(msg)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch("/api/v1/admin/gateway-api-key/revoke", {
        method: "POST",
        body: JSON.stringify({ key_id: keyId, confirm_revoke_active: isActive }),
      });
      if (res.error) {
        setError(res.error.message);
        return;
      }
      clearPlaintext();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function requestReveal() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<{ challenge_id: string }>(
        "/api/v1/admin/gateway-api-key/reveal/request",
        { method: "POST", body: "{}" }
      );
      if (res.error || !res.data) {
        setError(res.error?.message ?? "Reveal request failed");
        return;
      }
      setChallengeId(res.data.challenge_id);
      setShowReveal(true);
      setOtp("");
    } finally {
      setBusy(false);
    }
  }

  async function confirmReveal() {
    if (!challengeId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<{ api_key: string }>(
        "/api/v1/admin/gateway-api-key/reveal/confirm",
        {
          method: "POST",
          body: JSON.stringify({ challenge_id: challengeId, otp }),
        }
      );
      if (res.error || !res.data) {
        setError(res.error?.message ?? "Reveal failed");
        return;
      }
      setPlaintext(res.data.api_key);
      setShowReveal(false);
      setChallengeId(null);
      setOtp("");
    } finally {
      setBusy(false);
    }
  }

  async function copyPlaintext() {
    if (!plaintext) return;
    await navigator.clipboard.writeText(plaintext);
  }

  const active = overview?.active;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gateway API Key"
        subtitle="Server-to-server key for Firebase Cloud Functions. Never send to Flutter."
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {plaintext && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            One-time plaintext (memory only — copy into Cloud Function secrets)
          </p>
          <code className="mt-2 block break-all rounded bg-white/80 p-3 text-xs dark:bg-black/30">
            {plaintext}
          </code>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyPlaintext()}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-medium text-white"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
            <button
              type="button"
              onClick={clearPlaintext}
              className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs"
            >
              Hide
            </button>
          </div>
          <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
            Update the Firebase Cloud Function secret before grace period expires (after rotate).
          </p>
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold">Active key</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void load()}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            {!active && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void createKey()}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Create
              </button>
            )}
            {active && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void requestReveal()}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" /> Reveal
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void rotateKey()}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void revokeKey(active.key_id, true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Revoke
                </button>
              </>
            )}
          </div>
        </div>

        {active ? (
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium">{active.status}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Key ID</dt>
              <dd className="font-mono text-xs">{active.key_id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last four</dt>
              <dd className="font-mono">…{active.last_four}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Fingerprint</dt>
              <dd className="font-mono text-xs">{active.fingerprint_short}…</dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd>{active.created_at}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Rotated</dt>
              <dd>{active.rotated_at ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last used</dt>
              <dd>{active.last_used_at ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Grace expiry</dt>
              <dd>{active.grace_expires_at ?? "—"}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No active gateway API key.</p>
        )}
      </div>

      {(overview?.grace?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[var(--color-card)]">
          <h2 className="text-base font-semibold">Grace keys</h2>
          <ul className="mt-3 space-y-3">
            {overview!.grace.map((g) => (
              <li
                key={g.key_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 p-3 text-sm"
              >
                <div>
                  <p className="font-mono text-xs">{g.key_id}</p>
                  <p className="text-gray-500">
                    …{g.last_four} · expires {g.grace_expires_at ?? "—"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void revokeKey(g.key_id, false)}
                  className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-700"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showReveal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-[var(--color-card)]">
            <h3 className="text-base font-semibold">Email OTP reveal</h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter the 6-digit code sent to the admin email.
            </p>
            <input
              className="mt-4 w-full rounded-lg border px-3 py-2 font-mono tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              inputMode="numeric"
              placeholder="000000"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-sm"
                onClick={() => {
                  setShowReveal(false);
                  setChallengeId(null);
                  setOtp("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || otp.length < 6}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white"
                onClick={() => void confirmReveal()}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
