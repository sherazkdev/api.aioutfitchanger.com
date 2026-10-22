import { getServerEnv } from "../env";

export type QuotaPlan = "free" | "premium" | "admin";

export function utcDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function dailyLimitForPlan(plan: QuotaPlan): number {
  if (plan === "admin") return 0; // 0 = unlimited in reservation layer
  const free = Number(process.env.TRY_ON_DAILY_LIMIT_FREE ?? 5);
  const premium = Number(process.env.TRY_ON_DAILY_LIMIT_PREMIUM ?? 50);
  const freeN = Number.isFinite(free) ? Math.max(0, Math.floor(free)) : 5;
  const premiumN = Number.isFinite(premium) ? Math.max(0, Math.floor(premium)) : 50;
  return plan === "premium" ? premiumN : freeN;
}

/** Prefer plan-aware FREE/PREMIUM limits from env (defaults 5/50). */
export function resolveDailyLimit(plan: QuotaPlan): number {
  if (plan === "admin") return 0;
  try {
    const env = getServerEnv();
    if (plan === "premium") return env.TRY_ON_DAILY_LIMIT_PREMIUM;
    // Prefer explicit FREE; legacy flat env only if FREE was never meant — both default to 5.
    return env.TRY_ON_DAILY_LIMIT_FREE ?? env.TRY_ON_DAILY_LIMIT_PER_USER;
  } catch {
    return dailyLimitForPlan(plan);
  }
}
