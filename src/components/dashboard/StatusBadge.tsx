import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  Active: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  Current: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  Completed: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  "Partial success": "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  Processing: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  Failed: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  Queued: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Expired: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Revoked: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  Stale: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
};

const dots: Record<string, string> = {
  Active: "bg-green-500",
  Current: "bg-blue-500",
  Completed: "bg-green-500",
  "Partial success": "bg-orange-500",
  Processing: "bg-purple-500",
  Failed: "bg-red-500",
  Queued: "bg-gray-400",
  Cancelled: "bg-gray-400",
  Expired: "bg-gray-400",
  Revoked: "bg-red-500",
  Stale: "bg-amber-500",
};

export function campaignStatusLabel(status: string): string {
  if (status === "completed") return "Completed";
  if (status === "partial") return "Partial success";
  if (status === "failed") return "Failed";
  return status;
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", map[status] || "bg-gray-50 text-gray-700")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[status] || "bg-gray-400")} />
      {status}
    </span>
  );
}
