"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function JobDetailsClient() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const [job, setJob] = useState<{
    id: string;
    external_job_id: string | null;
    user: { email?: string; display_name?: string } | null;
    style_id: string | null;
    category_id: string | null;
    status: string;
    result_url: string | null;
    error_message: string | null;
    created_at: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<typeof job>(`/api/v1/admin/try-on-jobs/${id}`).then((res) => {
      if (res.error) {
        setError(res.error.message);
        setJob(null);
      } else {
        setError(null);
        setJob(res.data);
      }
    });
  }, [id]);

  if (!id) return <p className="text-sm text-red-600">Missing job id</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!job) return <p className="text-sm text-gray-500">Loading job…</p>;

  const displayId = job.external_job_id ?? job.id;

  return (
    <div>
      <Link href="/admin/try-on-jobs" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to jobs
      </Link>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Job details</h1>
          <p className="mt-0.5 font-mono text-sm text-gray-500">{displayId}</p>
        </div>
        <StatusBadge status={statusLabel(job.status)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="card p-5">
          {job.result_url ? (
            <div className="relative mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-xl border">
              <Image src={job.result_url} alt="Result" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <p className="text-sm text-gray-500">No result image stored for this job.</p>
          )}
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold">Job information</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Job ID</dt>
              <dd className="flex items-center gap-2 font-mono">
                {displayId}
                <button type="button" className="text-gray-400" onClick={() => navigator.clipboard.writeText(displayId)}>
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </dd>
            </div>
            <div><dt className="text-gray-500">User</dt><dd>{job.user?.email ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Category ID</dt><dd className="font-mono text-xs">{job.category_id ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Style ID</dt><dd className="font-mono text-xs">{job.style_id ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Created</dt><dd>{formatDateTime(job.created_at)}</dd></div>
            {job.error_message && <div><dt className="text-gray-500">Error</dt><dd className="text-red-600">{job.error_message}</dd></div>}
          </dl>
        </div>
      </div>
    </div>
  );
}
