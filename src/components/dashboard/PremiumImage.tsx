"use client";

import { ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import RemoteImage from "@/components/dashboard/RemoteImage";
import { normalizePublicImageUrl } from "@/lib/content/publicImageUrl";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  xs: "h-8 w-8",
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-[4.5rem] w-[4.5rem]",
  xl: "h-24 w-24",
} as const;

const SHAPE_CLASS = {
  rounded: "rounded-lg",
  circle: "rounded-full",
  card: "rounded-xl shadow-md shadow-gray-200/60 dark:shadow-black/30",
} as const;

export type PremiumImageSize = keyof typeof SIZE_CLASS | "hero";
export type PremiumImageShape = keyof typeof SHAPE_CLASS;

type Props = {
  src?: string | null;
  alt?: string;
  size?: PremiumImageSize;
  shape?: PremiumImageShape;
  className?: string;
  imgClassName?: string;
  sizes?: string;
};

/** Consistent admin thumbnails with frame, fallback, and normalized catalog URLs. */
export default function PremiumImage({
  src,
  alt = "",
  size = "sm",
  shape = "rounded",
  className,
  imgClassName,
  sizes,
}: Props) {
  const [broken, setBroken] = useState(false);
  const resolved = useMemo(() => normalizePublicImageUrl(src), [src]);
  const showImage = Boolean(resolved) && !broken;

  useEffect(() => {
    setBroken(false);
  }, [resolved]);

  const frame = cn(
    "relative shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white ring-1 ring-gray-200/90 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 dark:ring-gray-600/50",
    size === "hero" ? "aspect-[3/4] w-full max-w-[280px]" : SIZE_CLASS[size],
    SHAPE_CLASS[shape],
    className
  );

  const resolvedSizes =
    sizes ?? (size === "hero" || size === "xl" ? "280px" : size === "lg" ? "72px" : size === "md" ? "56px" : "40px");

  if (!showImage) {
    return (
      <div className={cn(frame, "flex items-center justify-center text-gray-400 dark:text-gray-500")} aria-hidden>
        <ImageIcon className={size === "xs" ? "h-3.5 w-3.5" : size === "hero" ? "h-8 w-8" : "h-5 w-5"} />
      </div>
    );
  }

  return (
    <div className={frame}>
      <RemoteImage
        src={resolved}
        alt={alt}
        fill
        sizes={resolvedSizes}
        className={cn("object-cover transition-[transform,opacity] duration-300", imgClassName)}
      />
      {/* Hidden img catches load errors — Next/Image does not expose onError reliably in all modes */}
      <img
        src={resolved}
        alt=""
        className="hidden"
        onError={() => setBroken(true)}
        onLoad={() => setBroken(false)}
      />
    </div>
  );
}

/** Overlapping stack for list previews (home feed sections, etc.) */
export function PremiumImageStack({
  urls,
  max = 3,
  size = "xs",
}: {
  urls: (string | null | undefined)[];
  max?: number;
  size?: PremiumImageSize;
}) {
  const list = urls.map((u) => normalizePublicImageUrl(u)).filter(Boolean).slice(0, max);
  if (list.length === 0) {
    return <PremiumImage size={size} shape="rounded" />;
  }
  if (list.length === 1) {
    return <PremiumImage src={list[0]} size={size} shape="rounded" />;
  }
  return (
    <div className="flex -space-x-2">
      {list.map((url, i) => (
        <PremiumImage
          key={`${url}-${i}`}
          src={url}
          size={size}
          shape="circle"
          className="ring-2 ring-[var(--color-card)]"
        />
      ))}
    </div>
  );
}
