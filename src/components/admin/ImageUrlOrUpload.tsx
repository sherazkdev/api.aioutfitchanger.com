"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
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
};

export default function ImageUrlOrUpload({
  label,
  value,
  onChange,
  folder,
  hint,
  placeholder = "https://… or upload below",
  className,
  inputClassName,
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

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        label={label}
        hint={hint ?? "Paste a URL or upload an image (saved locally on this server)."}
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
        {value ? (
          <span className="text-xs text-gray-500 truncate max-w-[200px]" title={value}>
            {value.startsWith("/uploads/") ? "Local file" : "External URL"}
          </span>
        ) : null}
      </div>
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
      {value ? (
        <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <Image src={value} alt="" fill className="object-cover" unoptimized sizes="64px" />
        </div>
      ) : null}
    </div>
  );
}
