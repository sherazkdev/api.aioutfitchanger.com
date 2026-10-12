"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type LinkState = "checking" | "ready" | "blocked";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLinkState("blocked");
      setBlockedMessage("Missing reset token. Open the link from your email.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/v1/auth/reset-password/status?token=${encodeURIComponent(token)}`
        );
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && json.data?.valid) {
          setLinkState("ready");
          return;
        }
        setLinkState("blocked");
        setBlockedMessage(json.error?.message ?? "This reset link cannot be used.");
      } catch {
        if (!cancelled) {
          setLinkState("ready");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (linkState !== "ready") return;
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Missing reset token. Open the link from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        const code = json.error?.code as string | undefined;
        const msg = json.error?.message ?? "Reset failed";
        if (code === "TOKEN_EXPIRED" || code === "TOKEN_ALREADY_USED" || code === "INVALID_TOKEN") {
          setLinkState("blocked");
          setBlockedMessage(msg);
        }
        throw new Error(msg);
      }
      router.push("/reset-success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  const formDisabled = linkState !== "ready" || loading;

  return (
    <AuthLayout>
      <div className="card p-8 sm:p-10">
        <h1 className="text-xl font-semibold">Reset password</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a new password for your account.</p>

        {linkState === "checking" && (
          <p className="mt-4 text-sm text-gray-500">Checking your reset link…</p>
        )}

        {linkState === "blocked" && blockedMessage && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {blockedMessage}
            <Link href="/forgot-password" className="mt-2 block font-medium text-blue-600 hover:underline">
              Request a new reset link
            </Link>
          </div>
        )}

        {linkState === "ready" && (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input
              label="New password"
              type={show1 ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              suffix={
                <button type="button" onClick={() => setShow1(!show1)} className="text-gray-400">
                  {show1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Input
              label="Confirm password"
              type={show2 ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              suffix={
                <button type="button" onClick={() => setShow2(!show2)} className="text-gray-400">
                  {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={formDisabled}>
              {loading ? "Saving…" : "Reset password"}
            </Button>
          </form>
        )}

        <Link href="/login" className="mt-4 inline-block text-sm text-gray-500 dark:text-gray-400">
          ← Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
