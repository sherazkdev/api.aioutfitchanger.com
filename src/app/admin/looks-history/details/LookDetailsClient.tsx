"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

export default function LookDetailsClient() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const [data, setData] = useState<{
    image_url: string;
    source_image_url: string | null;
    user: { email?: string; display_name?: string } | null;
    style_id: string | null;
    category_id: string | null;
    is_favorite: boolean;
    created_at: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<typeof data>(`/api/v1/admin/looks-history/${id}`).then((res) => {
      if (res.error) {
        setError(res.error.message);
        setData(null);
      } else {
        setError(null);
        setData(res.data);
      }
    });
  }, [id]);

  if (!id) return <p className="text-sm text-red-600">Missing look id</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div>
      <Link href="/admin/looks-history" className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to looks
      </Link>
      <h1 className="text-xl font-semibold">Look details</h1>
      <p className="text-sm text-gray-500">{data.user?.email} · {formatDateTime(data.created_at)}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <p className="mb-2 text-sm font-medium">Result</p>
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
            <Image src={data.image_url} alt="" fill className="object-cover" unoptimized />
          </div>
        </div>
        {data.source_image_url && (
          <div className="card p-4">
            <p className="mb-2 text-sm font-medium">Source</p>
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
              <Image src={data.source_image_url} alt="" fill className="object-cover" unoptimized />
            </div>
          </div>
        )}
      </div>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-gray-500">Style ID</dt><dd className="font-mono">{data.style_id ?? "—"}</dd></div>
        <div><dt className="text-gray-500">Category ID</dt><dd className="font-mono">{data.category_id ?? "—"}</dd></div>
        <div><dt className="text-gray-500">Favorite</dt><dd>{data.is_favorite ? "Yes" : "No"}</dd></div>
      </dl>
    </div>
  );
}
