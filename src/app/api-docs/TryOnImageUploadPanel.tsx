"use client";

import { useCallback, useRef, useState } from "react";
import { setTryOnSourceImageDataUrl } from "./tryOnSwaggerImage";

const MAX_MB = 20;

export function TryOnImageUploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sizeKb, setSizeKb] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const clear = useCallback(() => {
    setTryOnSourceImageDataUrl(null);
    setFileName(null);
    setSizeKb(null);
    setError(null);
    setReady(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const onFile = useCallback((file: File | undefined) => {
    setError(null);
    setReady(false);
    if (!file) {
      clear();
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Sirf image file chalegi (JPEG, PNG, WebP).");
      clear();
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File ${MAX_MB}MB se choti honi chahiye.`);
      clear();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result || !result.startsWith("data:image/")) {
        setError("Image read fail — dubara try karo.");
        clear();
        return;
      }
      setTryOnSourceImageDataUrl(result);
      setFileName(file.name);
      setSizeKb(Math.round(file.size / 1024));
      setReady(true);
    };
    reader.onerror = () => {
      setError("File read error.");
      clear();
    };
    reader.readAsDataURL(file);
  }, [clear]);

  return (
    <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-3">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-900">
            Try-on photo upload (base64 automatic)
          </p>
          <p className="mt-0.5 text-xs text-emerald-800">
            Neeche <strong>Try-On → POST /try-on/generate</strong> kholo, body mein sirf{" "}
            <code className="rounded bg-white/80 px-1">style_id</code> /{" "}
            <code className="rounded bg-white/80 px-1">category_id</code> rakho —{" "}
            <code className="rounded bg-white/80 px-1">source_image_base64</code> yahan se{" "}
            <strong>Execute</strong> par khud lag jayega.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            className="cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-800"
          >
            Choose image
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          {ready && (
            <button
              type="button"
              className="rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm text-emerald-900 hover:bg-emerald-100"
              onClick={clear}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {ready && fileName && (
        <p className="mt-2 text-xs text-emerald-900">
          Ready: <strong>{fileName}</strong>
          {sizeKb != null ? ` (${sizeKb} KB)` : ""} — data URL one-line, JSON safe.
        </p>
      )}
      {!ready && !error && (
        <p className="mt-2 text-xs text-amber-900">
          Pehle image choose karo, phir Execute — warna body invalid ho sakti hai.
        </p>
      )}
      {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
