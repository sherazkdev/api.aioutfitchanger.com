"use client";

import { useState } from "react";

interface Segment {
  label: string;
  value: number;
  color: string;
}

export default function DonutChart({ data }: { data: Segment[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 88;
  const cy = 88;
  const r = 62;
  const sw = 18;
  const gap = 3;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-sm text-gray-500">
        <svg viewBox="0 0 176 176" className="h-40 w-40 shrink-0">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
          <text x={cx} y={cy} textAnchor="middle" className="fill-gray-400 text-[10px]">No data</text>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative">
        {hover && (
          <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-md border bg-white px-2 py-1 text-[10px] shadow dark:bg-gray-900">
            {hover}
          </div>
        )}
        <svg viewBox="0 0 176 176" className="h-40 w-40 shrink-0">
          {data.map((s) => {
            const dash = (s.value / total) * circ - gap;
            const o = offset;
            offset += (s.value / total) * circ;
            const pct = Math.round((s.value / total) * 100);
            return (
              <circle
                key={s.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-o}
                transform={`rotate(-90 ${cx} ${cy})`}
                className="cursor-pointer"
                onMouseEnter={() => setHover(`${s.label}: ${s.value.toLocaleString()} (${pct}%)`)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(`${s.label}: ${s.value} (${pct}%)`)}
                onBlur={() => setHover(null)}
                tabIndex={0}
              />
            );
          })}
          <text x={cx} y={cy - 2} textAnchor="middle" className="fill-gray-900 text-[11px] font-semibold">
            {total.toLocaleString()}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-400 text-[8px]">total jobs</text>
        </svg>
      </div>
      <div className="w-full space-y-3 sm:flex-1">
        {data.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              <span className="text-gray-600 dark:text-gray-300">{s.label}</span>
            </div>
            <span className="font-semibold tabular-nums">
              {s.value.toLocaleString()}
              <span className="ml-1.5 text-xs font-normal text-gray-400">({Math.round((s.value / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
