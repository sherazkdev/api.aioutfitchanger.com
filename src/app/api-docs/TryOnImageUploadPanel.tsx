"use client";

import { useCallback, useRef, useState } from "react";
import { readTryOnImageFile, setTryOnSourceImageDataUrl } from "./tryOnSwaggerImage";

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

  const onFile = useCallback(
    (file: File | undefined) => {
      setError(null);
      setReady(false);
      void readTryOnImageFile(file).then((r) => {
        if (r.ok) {
          setFileName(r.fileName);
          setSizeKb(r.sizeKb);
          setReady(true);
        } else {
          setFileName(null);
          setSizeKb(null);
          setError(r.error);
          setReady(false);
          if (inputRef.current) inputRef.current.value = "";
        }
      });
    },
    []
  );

  return (
    <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-3">
      <p className="text-sm font-semibold text-emerald-900">Try-on image upload (top bar)</p>
      <p className="mt-0.5 text-xs text-emerald-800">
        Ya <strong>POST /try-on/generate</strong> expand karo — wahan bhi file input hai. Dono same
        image use karte hain.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="mt-2 block w-full max-w-lg text-sm text-emerald-950 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-800"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {ready && fileName && (
        <p className="mt-2 text-xs text-emerald-900">
          Ready: <strong>{fileName}</strong>
          {sizeKb != null ? ` (${sizeKb} KB)` : ""}
          <button type="button" className="ml-3 underline" onClick={clear}>
            Clear
          </button>
        </p>
      )}
      {!ready && !error && (
        <p className="mt-2 text-xs text-amber-900">Pehle image choose karo, phir Execute.</p>
      )}
      {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
