"use client";

import ContentImageField from "@/components/dashboard/ContentImageField";
import type { AdminContentUploadFolder } from "@/lib/admin/contentUploadFolders";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: AdminContentUploadFolder;
  hint?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  /** Compact row layout for dense forms (e.g. home feed item lists). */
  compact?: boolean;
};

export default function ImageUrlOrUpload(props: Props) {
  const { compact, className, ...rest } = props;
  if (compact) {
    return <ContentImageField {...rest} className={className} previewSize="md" />;
  }
  return <ContentImageField {...rest} className={cn(className)} previewSize="hero" />;
}
