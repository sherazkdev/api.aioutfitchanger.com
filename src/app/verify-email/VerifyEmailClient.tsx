"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";

type Status = "loading" | "success" | "error";

export default function VerifyEmailClient({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token. Open the full link from your email.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(json.error?.message ?? "Verification failed");
          return;
        }
        setStatus("success");
        setMessage(
          json.data?.already_verified
            ? "Your email was already verified. You can return to the app."
            : "Your email is verified. Return to the Outfit Changer app to continue."
        );
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Network error. Try again or verify with the 4-digit code in the app.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthLayout>
      <div className="card p-8 sm:p-10 text-center">
        <h1 className="text-xl font-semibold">Verify email</h1>
        {status === "loading" && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Verifying your account…</p>
        )}
        {status !== "loading" && (
          <p
            className={`mt-4 text-sm ${status === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600"}`}
          >
            {message}
          </p>
        )}
        {status === "success" && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            In the app: refresh your profile or open home — <code className="text-xs">email_verified</code> should be
            true.
          </p>
        )}
        <div className="mt-8">
          <Link href="/login">
            <Button type="button" variant="outline">Back to sign in</Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
