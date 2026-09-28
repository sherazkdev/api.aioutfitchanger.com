"use client";

import { useState } from "react";

type Bucket = { hour: number; completed: number; failed: number; cancelled: number };

const COLORS = { completed: "#3b82f6", failed: "#f87171", cancelled: "#a855f7" };

export default function StackedHourlyChart({ data }: { data: Bucket[] }) {
  const [tip, setTip] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((b) => b.completed + b.failed + b.cancelled));

  return (
    <div className="relative mt-4">
      {tip && (
        <div className="absolute left-2 top-0 z-10 whitespace-pre-line rounded border bg-white px-2 py-1 text-[10px] shadow dark:border-gray-700 dark:bg-gray-900">
          {tip}
        </div>
      )}
      <div className="flex h-44 items-end gap-0.5 border-b border-gray-100 pb-1 dark:border-gray-800">
        {data.map((b) => {
          const total = b.completed + b.failed + b.cancelled;
          const h = (total / max) * 100;
          const cH = total ? (b.completed / total) * h : 0;
          const fH = total ? (b.failed / total) * h : 0;
          const xH = total ? (b.cancelled / total) * h : 0;
          return (
            <div
              key={b.hour}
              className="flex h-full flex-1 cursor-pointer flex-col justify-end"
              onMouseEnter={() =>
                setTip(
                  `${String(b.hour).padStart(2, "0")}:00 UTC\nCompleted: ${b.completed}\nFailed: ${b.failed}\nCancelled: ${b.cancelled}\nTotal: ${total}`
                )
              }
              onMouseLeave={() => setTip(null)}
              title={`${b.hour}:00`}
            >
              <div className="flex w-full flex-col justify-end overflow-hidden rounded-t-sm" style={{ height: `${Math.max(total ? 4 : 0, h)}%` }}>
                {xH > 0 && <div className="w-full" style={{ height: `${xH}%`, background: COLORS.cancelled }} />}
                {fH > 0 && <div className="w-full" style={{ height: `${fH}%`, background: COLORS.failed }} />}
                {cH > 0 && <div className="w-full" style={{ height: `${cH}%`, background: COLORS.completed }} />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        {[0, 4, 8, 12, 16, 20, 23].map((h) => (
          <span key={h}>{String(h).padStart(2, "0")}:00</span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-blue-500" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-red-400" /> Failed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-purple-500" /> Cancelled
        </span>
      </div>
    </div>
  );
}
