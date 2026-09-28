"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";

export default function CheckEmailClient() {
  const [devUrl, setDevUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = sessionStorage.getItem("dev_reset_url");
    if (url) {
      setDevUrl(url);
      sessionStorage.removeItem("dev_reset_url");
    }
  }, []);

  return (
    <AuthLayout>
      <div className="card p-8 text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
          <Mail className="h-6 w-6 text-blue-500" />
        </div>
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          If an account exists for this email, you&apos;ll receive a password reset link.
        </p>
        {devUrl && (
          <p className="mt-4 break-all rounded-lg bg-amber-50 p-3 text-left text-xs text-amber-900">
            <strong>Dev only:</strong>{" "}
            <Link href={devUrl} className="underline">{devUrl}</Link>
          </p>
        )}
        <Link href="/login" className="mt-6 block">
          <Button className="w-full" size="lg">Back to sign in</Button>
        </Link>
        <Link href="/forgot-password" className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <ArrowLeft className="h-3.5 w-3.5" />Use a different email
        </Link>
      </div>
    </AuthLayout>
  );
}
