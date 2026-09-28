const sparkPaths = [
  "M2,10 L6,6 L10,8 L14,4 L18,7 L22,3",
  "M2,8 L6,10 L10,5 L14,8 L18,4 L22,6",
  "M2,6 L6,8 L10,4 L14,7 L18,5 L22,3",
  "M2,9 L6,7 L10,9 L14,5 L18,8 L22,4",
];

function isTrendChange(change: string) {
  return /^[+\-]?\d/.test(change) || change.includes("%") || change === "New" || change === "—";
}

export default function StatCard({
  label,
  value,
  change,
  index = 0,
}: {
  label: string;
  value: string;
  change: string;
  index?: number;
}) {
  const showTrend = Boolean(change) && isTrendChange(change);
  const showSubtitle = Boolean(change) && !showTrend;

  return (
    <div className="rounded-2xl border border-[var(--color-stat-border)] bg-[var(--color-stat)] p-4 transition-shadow hover:shadow-card">
      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <div className="mt-2.5 flex items-end justify-between gap-2">
        <p className="text-[28px] font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100">{value}</p>
        {showTrend && (
          <div className="flex flex-col items-end gap-0.5">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-green-600">
              <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
                <path d="M5 1.5 L8.5 6 H1.5 Z" fill="currentColor" />
              </svg>
              {change}
            </span>
            <svg viewBox="0 0 24 12" className="h-3 w-12 text-green-500" aria-hidden>
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparkPaths[index % sparkPaths.length]}
              />
            </svg>
          </div>
        )}
        {showSubtitle && <p className="text-[11px] text-gray-500">{change}</p>}
      </div>
    </div>
  );
}
