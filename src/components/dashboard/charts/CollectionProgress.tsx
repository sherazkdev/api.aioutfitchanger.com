interface Item { name: string; count: number; color: string }

export default function CollectionProgress({ items }: { items: Item[] }) {
  const max = Math.max(...items.map((i) => i.count));

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => {
        const width = Math.max(8, (item.count / max) * 100);
        return (
          <div key={item.name} className="min-w-0">
            <p className="mb-3 min-h-[32px] text-[11px] leading-tight text-gray-600 dark:text-gray-300">{item.name}</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${width}%`, backgroundColor: item.color }}
              />
            </div>
            <p className="mt-2.5 text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">{item.count}</p>
          </div>
        );
      })}
    </div>
  );
}
