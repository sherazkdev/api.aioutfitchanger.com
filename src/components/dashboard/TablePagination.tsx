import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TablePagination({
  summary,
  pages,
  current = 1,
  onPage,
}: {
  summary: string;
  pages: (number | "...")[];
  current?: number;
  onPage?: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">{summary}</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!onPage || current <= 1}
          onClick={() => onPage?.(current - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage?.(p)}
              className={cn(
                "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm",
                p === current
                  ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          disabled={!onPage || current >= (pages[pages.length - 1] as number)}
          onClick={() => onPage?.(current + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40 dark:hover:bg-gray-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
