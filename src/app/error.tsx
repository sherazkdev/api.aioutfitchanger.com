"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function GlobalError({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-page)] px-6 text-center">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Something went wrong</h1>
      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
        The page could not load. You can try again or go back to the dashboard.
      </p>
      {process.env.NODE_ENV === "development" && error?.message && (
        <p className="max-w-lg rounded-lg bg-red-50 px-3 py-2 text-left text-xs text-red-800">{error.message}</p>
      )}
      {process.env.NODE_ENV === "development" && error?.message && (
        <p className="max-w-lg rounded-lg bg-red-50 px-3 py-2 text-left text-xs text-red-800">{error.message}</p>
      )}
      <div className="flex gap-2">
        <Button type="button" onClick={() => reset()}>Try again</Button>
        <Button type="button" variant="outline" onClick={() => { window.location.href = "/admin/overview"; }}>
          Dashboard
        </Button>
      </div>
    </div>
  );
}
