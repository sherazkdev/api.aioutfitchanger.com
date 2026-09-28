"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  current: number[];
  previous: number[];
  labels: string[];
  currentSeriesName: string;
  previousSeriesName: string;
  labelEvery?: number;
};

function chartMax(current: number[], previous: number[]) {
  const peak = Math.max(...current, ...previous, 0);
  if (peak === 0) return 4;
  if (peak <= 4) return 4;
  if (peak <= 10) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(peak)));
  const norm = peak / mag;
  const nice = norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

export default function TryOnActivityChart({
  current,
  previous,
  labels,
  currentSeriesName,
  previousSeriesName,
  labelEvery = 1,
}: Props) {
  const [tip, setTip] = useState<string | null>(null);
  const max = useMemo(() => chartMax(current, previous), [current, previous]);
  const step = Math.max(1, labelEvery);
  const allZero = current.every((v) => v === 0) && previous.every((v) => v === 0);

  if (!current.length || !labels.length) {
    return <p className="flex h-48 items-center justify-center text-sm text-gray-500">No activity data</p>;
  }

  const plotH = "8.5rem";

  return (
    <div className="relative">
      {tip && (
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] shadow-md dark:border-gray-700 dark:bg-gray-900">
          {tip.split("\n").map((line) => (
            <div key={line} className="whitespace-nowrap text-gray-600 dark:text-gray-300">{line}</div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex w-7 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] tabular-nums text-gray-400" style={{ height: plotH }}>
          {[max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0]
            .filter((v, i, arr) => arr.indexOf(v) === i)
            .map((t) => (
              <span key={t}>{t}</span>
            ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="relative flex items-end gap-px border-b border-gray-100 dark:border-gray-800 sm:gap-0.5"
            style={{ height: plotH }}
          >
            {labels.map((label, i) => {
              const cur = current[i] ?? 0;
              const prev = previous[i] ?? 0;
              const curH = max ? Math.max(cur === 0 ? 0 : 6, (cur / max) * 100) : 0;
              const prevH = max ? Math.max(prev === 0 ? 0 : 4, (prev / max) * 100) : 0;
              return (
                <div
                  key={`${label}-${i}`}
                  className="flex min-w-0 flex-1 flex-col items-center justify-end"
                  onMouseEnter={() =>
                    setTip(`${label}\n${currentSeriesName}: ${cur}\n${previousSeriesName}: ${prev}`)
                  }
                  onMouseLeave={() => setTip(null)}
                >
                  <div className="flex h-full w-full items-end justify-center gap-px px-px sm:gap-0.5 sm:px-0.5">
                    <div
                      className="w-[42%] max-w-[14px] rounded-t bg-gray-200/90 transition-all dark:bg-gray-700"
                      style={{ height: `${prevH}%` }}
                      title={`${previousSeriesName}: ${prev}`}
                    />
                    <div
                      className="w-[42%] max-w-[14px] rounded-t bg-blue-500 shadow-sm transition-all dark:bg-blue-500"
                      style={{ height: `${curH}%` }}
                      title={`${currentSeriesName}: ${cur}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex gap-px sm:gap-0.5">
            {labels.map((label, i) => {
              const showLabel = i === 0 || i === labels.length - 1 || i % step === 0;
              return (
                <div key={`x-${label}-${i}`} className="min-w-0 flex-1 text-center">
                  <span className={cn("text-[9px] text-gray-400", !showLabel && "invisible sm:invisible")}>
                    {showLabel ? label : "·"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {allZero && (
        <p className="mt-3 text-center text-xs text-gray-500">
          No try-on jobs in this window yet — bars will fill as jobs are created.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-[11px] text-gray-500">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
          {currentSeriesName}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-gray-200 dark:bg-gray-600" />
          {previousSeriesName}
        </span>
      </div>
    </div>
  );
}
