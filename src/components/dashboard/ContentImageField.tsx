"use client";

import { useRef, useState } from "react";
import { Link2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PremiumImage from "@/components/dashboard/PremiumImage";
import { uploadAdminContentImage } from "@/lib/api/adminUpload";
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
  previewSize?: "md" | "hero";
};

/** Image URL + upload with large premium preview (re-exported as ImageUrlOrUpload). */
export default function ContentImageField({
  label,
  value,
  onChange,
  folder,
  hint,
  placeholder = "https://… or upload below",
  className,
  inputClassName,
  previewSize = "hero",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onFileChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const res = await uploadAdminContentImage(file, folder);
    setUploading(false);
    if (res.error) {
      setUploadError(res.error);
      return;
    }
    if (res.url) onChange(res.url);
  }

  const sourceLabel = value
    ? value.startsWith("/uploads/")
      ? "Hosted on this server"
      : value.startsWith("/media/")
        ? "Catalog / media"
        : "External URL"
    : null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-hidden rounded-xl border border-gray-200/90 bg-gradient-to-br from-gray-50/80 to-white p-4 dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-900/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="mx-auto shrink-0 sm:mx-0">
            <PremiumImage
              src={value}
              size={previewSize}
              shape="card"
              className="mx-auto w-[min(100%,200px)] sm:w-[180px]"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <Input
              label={label}
              hint={hint ?? "Paste a URL or upload an image (saved on this server)."}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={inputClassName}
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  void onFileChange(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Upload image"}
              </Button>
              {sourceLabel ? (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Link2 className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[220px]" title={value}>{sourceLabel}</span>
                </span>
              ) : null}
            </div>
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
