"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminSessionHeaders, apiFetch } from "@/lib/api/client";
import { clearSession, getAccessToken } from "@/lib/auth/session";

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState<string | null>(null);

  useEffect(() => {
    setReady(false);
    setDenied(null);

    const token = getAccessToken();
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    apiFetch<{ profile: { role: string } }>("/api/v1/admin/me", { headers: adminSessionHeaders() }).then((res) => {
      if (res.error) {
        if (res.error.code === "FORBIDDEN" || res.error.code === "UNAUTHORIZED") {
          clearSession();
          router.replace(`/login?next=${encodeURIComponent(pathname)}&error=admin_required`);
          return;
        }
        setDenied(res.error.message);
        return;
      }
      if (res.data?.profile.role !== "admin") {
        clearSession();
        router.replace(`/login?next=${encodeURIComponent(pathname)}&error=admin_required`);
        return;
      }
      setReady(true);
    });
  }, [pathname, router]);

  if (denied) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-red-600">{denied}</p>
        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:underline"
          onClick={() => {
            clearSession();
            router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          }}
        >
          Sign in again
        </button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        Verifying admin access…
      </div>
    );
  }

  return <>{children}</>;
}
