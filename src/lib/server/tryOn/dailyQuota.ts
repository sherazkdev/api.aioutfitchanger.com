import { TryOnJob } from "../models/TryOnJob";

export function utcDayStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

export async function countTryOnJobsToday(userId: string): Promise<number> {
  const from = utcDayStart();
  return TryOnJob.countDocuments({
    userId,
    createdAt: { $gte: from },
    status: { $nin: ["cancelled"] },
  });
}

export async function assertTryOnDailyQuota(userId: string, dailyLimit: number): Promise<void> {
  if (dailyLimit <= 0) return;
  const used = await countTryOnJobsToday(userId);
  if (used >= dailyLimit) {
    throw new Error("DAILY_LIMIT_EXCEEDED");
  }
}
