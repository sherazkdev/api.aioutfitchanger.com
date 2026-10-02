import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { normalizePublicImageUrl } from "@/lib/content/publicImageUrl";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(_req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;

  return handleApiRoute(async () => {
    await connectMongo();
    const job = await TryOnJob.findById(id).populate("userId", "email displayName photoUrl").lean();
    if (!job) return jsonError("NOT_FOUND", "Job not found", 404);

    const user = job.userId as {
      _id?: { toString(): string };
      email?: string;
      displayName?: string;
      photoUrl?: string;
    } | null;

    return jsonOk({
      id: String(job._id),
      external_job_id: job.externalJobId ?? null,
      user: user
        ? {
            id: user._id ? String(user._id) : null,
            email: user.email,
            display_name: user.displayName,
            photo_url: user.photoUrl,
          }
        : null,
      style_id: job.styleId ?? null,
      category_id: job.categoryId ?? null,
      status: job.status,
      result_url: job.resultUrl ? normalizePublicImageUrl(job.resultUrl) : null,
      error_message: job.errorMessage ?? null,
      polling_url: job.pollingUrl ?? null,
      created_at: job.createdAt ? new Date(job.createdAt).toISOString() : null,
      updated_at: job.updatedAt ? new Date(job.updatedAt).toISOString() : null,
    });
  });
}
