import RemoteImage from "@/components/dashboard/RemoteImage";
import { HangerIcon } from "@/components/icons/HangerIcon";
import { cn } from "@/lib/utils";

export default function PhoneNotificationPreview({
  title,
  body,
  imageUrl,
  compact = false,
}: {
  title: string;
  body: string;
  imageUrl?: string;
  compact?: boolean;
}) {
  const displayTitle = title.trim() || "Your next look is waiting";
  const displayBody = body.trim() || "Explore fresh styles and create your next look with AI Wardrobe.";
  const hasImage = Boolean(imageUrl?.trim());

  return (
    <div className={cn("mx-auto w-full", compact ? "max-w-[220px]" : "max-w-[272px]")}>
      <div className="rounded-[2.25rem] border-[7px] border-gray-900 bg-gray-900 p-1 shadow-xl dark:border-gray-600">
        <div className="overflow-hidden rounded-[1.55rem] bg-gradient-to-b from-sky-200/80 via-sky-100 to-sky-50 px-3 pb-7 pt-9 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
          <div className="mx-auto mb-5 h-1.5 w-[4.5rem] rounded-full bg-gray-900/25 dark:bg-white/20" />
          <div className="rounded-2xl bg-white/95 p-3 shadow-md ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/95 dark:ring-white/10">
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-blue-50 text-blue-600 dark:bg-blue-950/50">
                <HangerIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-400">
                  <span className="uppercase tracking-wide">AI Wardrobe</span>
                  <span className="normal-case"> · now</span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 dark:text-gray-100">
                  {displayTitle}
                </p>
                <p className="mt-0.5 line-clamp-3 text-[11px] leading-snug text-gray-600 dark:text-gray-400">{displayBody}</p>
              </div>
              {hasImage && (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <RemoteImage src={imageUrl!.trim()} alt="" fill className="object-cover" sizes="40px" />
                </div>
              )}
            </div>
          </div>
          <p className="mt-8 text-center text-[11px] font-medium text-gray-500/90">9:41</p>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-gray-400">Appearance may vary by device.</p>
    </div>
  );
}
