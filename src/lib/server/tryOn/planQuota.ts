export type QuotaPlan = "free" | "premium" | "admin";

export function utcDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Daily try-on cap is off for every plan.
 * 0 means unlimited in the reservation layer, so a leftover
 * TRY_ON_DAILY_LIMIT_* value on the server cannot re-apply the old cap.
 */
export function dailyLimitForPlan(_plan: QuotaPlan): number {
  return 0;
}

export function resolveDailyLimit(_plan: QuotaPlan): number {
  return 0;
}
