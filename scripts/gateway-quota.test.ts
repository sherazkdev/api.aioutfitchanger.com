import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dailyLimitForPlan, resolveDailyLimit, utcDateKey } from "../src/lib/server/tryOn/planQuota";

describe("plan-aware daily quota", () => {
  it("free, premium, and admin are unlimited even if env still says 5/50", () => {
    process.env.TRY_ON_DAILY_LIMIT_FREE = "5";
    process.env.TRY_ON_DAILY_LIMIT_PREMIUM = "50";
    process.env.TRY_ON_DAILY_LIMIT_PER_USER = "5";
    assert.equal(dailyLimitForPlan("free"), 0);
    assert.equal(dailyLimitForPlan("premium"), 0);
    assert.equal(dailyLimitForPlan("admin"), 0);
    assert.equal(resolveDailyLimit("free"), 0);
    assert.equal(resolveDailyLimit("premium"), 0);
    assert.equal(resolveDailyLimit("admin"), 0);
  });

  it("utcDateKey is YYYY-MM-DD", () => {
    assert.match(utcDateKey(new Date("2026-10-22T23:59:59.000Z")), /^2026-10-22$/);
    assert.match(utcDateKey(new Date("2026-10-23T00:00:00.000Z")), /^2026-10-23$/);
  });
});
