import { Sparkles } from "lucide-react";

export function BrandLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const icon = size === "sm" ? "h-4 w-4" : "h-4 w-4";

  return (
    <div className={`${box} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm`}>
      <Sparkles className={`${icon} text-white`} strokeWidth={2} />
    </div>
  );
}
