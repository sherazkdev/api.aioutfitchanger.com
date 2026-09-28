"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard error</h1>
      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
        This section failed to render. Your session is still active — try reloading this page.
      </p>
      {process.env.NODE_ENV === "development" && error?.message && (
        <p className="max-w-lg rounded-lg bg-red-50 px-3 py-2 text-left text-xs text-red-800">{error.message}</p>
      )}
      {process.env.NODE_ENV === "development" && error?.message && (
        <p className="max-w-lg rounded-lg bg-red-50 px-3 py-2 text-left text-xs text-red-800">{error.message}</p>
      )}
      <div className="flex gap-2">
        <Button type="button" onClick={() => reset()}>Reload section</Button>
        <Button type="button" variant="outline" onClick={() => { window.location.href = "/admin/overview"; }}>
          Go to Overview
        </Button>
      </div>
    </div>
  );
}
