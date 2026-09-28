"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Request failed");
      if (json.data?.dev_reset_url && typeof window !== "undefined") {
        sessionStorage.setItem("dev_reset_url", json.data.dev_reset_url);
      }
      router.push("/check-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="card bg-gradient-to-b from-slate-50/80 to-white p-8 sm:p-10 dark:from-gray-800/50 dark:to-[var(--color-card)]">
        <Link href="/login" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400">
          <ArrowLeft className="h-3.5 w-3.5" />Back to sign in
        </Link>
        <h1 className="text-xl font-semibold">Forgot password?</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enter your admin email. We&apos;ll send a reset link (dev mode may show link on next screen).
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
