import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

type Action = { label: string; href?: string; onClick?: () => void; variant?: "primary" | "outline" };

export default function PageHeader({
  title, subtitle, backHref, backLabel, actions,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: Action[];
}) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link href={backHref} className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-800">
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel || "Back"}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 lg:text-[22px]">{title}</h1>
          {subtitle && <p className="mt-1 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((a) =>
              a.onClick ? (
                <Button key={a.label} type="button" variant={a.variant || "outline"} onClick={a.onClick}>
                  {a.label}
                </Button>
              ) : (
                <Link key={a.label} href={a.href || "#"}>
                  <Button variant={a.variant || "outline"}>{a.label}</Button>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
