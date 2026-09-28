"use client";

import { useState } from "react";

interface Props {
  current: number[];
  previous: number[];
  labels: string[];
  currentSeriesName?: string;
  previousSeriesName?: string;
  /** Show every Nth x-axis label (default 1). */
  labelEvery?: number;
  gradientId?: string;
}

function smoothPath(data: number[], w: number, h: number, pad: number, max: number) {
  const cw = w - pad * 2;
  const ch = h - pad * 2;
  const safeMax = max > 0 ? max : 1;
  const pts = data.map((v, i) => ({
    x: pad + (i / Math.max(data.length - 1, 1)) * cw,
    y: pad + ch - (v / safeMax) * ch,
    v,
  }));
  if (pts.length === 0) return { d: "", pts, cw, ch };
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return { d, pts, cw, ch };
}

export default function LineChart({
  current,
  previous,
  labels,
  currentSeriesName = "Current period",
  previousSeriesName = "Previous period",
  labelEvery = 1,
  gradientId = "line-area",
}: Props) {
  const [tip, setTip] = useState<{ left: string; top: string; label: string } | null>(null);

  if (!current?.length || !previous?.length || !labels?.length) {
    return <p className="flex h-full items-center justify-center text-sm text-gray-500">No activity data</p>;
  }

  const w = 480;
  const h = 200;
  const pad = 36;
  const max = Math.max(...current, ...previous, 1);
  const step = Math.max(1, labelEvery);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const cur = smoothPath(current, w, h, pad, max);
  const prev = smoothPath(previous, w, h, pad, max);
  const area = cur.d ? `${cur.d} L ${pad + cur.cw} ${pad + cur.ch} L ${pad} ${pad + cur.ch} Z` : "";

  return (
    <div className="relative h-full w-full">
      {tip && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border bg-white px-2 py-1 text-[10px] shadow dark:bg-gray-900"
          style={{ left: tip.left, top: tip.top, transform: "translate(-50%, -100%)" }}
        >
          {tip.label.split("\n").map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111827" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => {
          const y = pad + cur.ch - (t / max) * cur.ch;
          return (
            <g key={t}>
              <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#f3f4f6" />
              <text x={pad - 8} y={y + 4} textAnchor="end" className="fill-gray-400 text-[9px]">
                {t >= 1000 ? `${(t / 1000).toFixed(t % 1000 === 0 ? 0 : 1)}K` : t}
              </text>
            </g>
          );
        })}
        {area && <path d={area} fill={`url(#${gradientId})`} />}
        {prev.d && <path d={prev.d} fill="none" stroke="#a8c5da" strokeWidth="2" />}
        {cur.d && <path d={cur.d} fill="none" stroke="#111827" strokeWidth="2.5" />}
        {cur.pts.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="8"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() =>
                setTip({
                  left: `${(p.x / w) * 100}%`,
                  top: `${(p.y / h) * 100}%`,
                  label: `${labels[i] ?? ""}\n${currentSeriesName}: ${current[i] ?? 0} jobs\n${previousSeriesName}: ${previous[i] ?? 0} jobs`,
                })
              }
              onMouseLeave={() => setTip(null)}
              onFocus={() =>
                setTip({
                  left: `${(p.x / w) * 100}%`,
                  top: `${(p.y / h) * 100}%`,
                  label: `${labels[i] ?? ""}\n${current[i]} / ${previous[i]} jobs`,
                })
              }
              onBlur={() => setTip(null)}
              tabIndex={0}
            />
            <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke="#111827" strokeWidth="2" pointerEvents="none" />
          </g>
        ))}
        {labels.map((l, i) => {
          const show = i === 0 || i === labels.length - 1 || i % step === 0;
          if (!show) return null;
          return (
            <text
              key={`${l}-${i}`}
              x={pad + (i / Math.max(labels.length - 1, 1)) * cur.cw}
              y={h - 8}
              textAnchor="middle"
              className="fill-gray-400 text-[9px]"
            >
              {l}
            </text>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-[#111827]" /> {currentSeriesName}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-[#a8c5da]" /> {previousSeriesName}
        </span>
      </div>
    </div>
  );
}
