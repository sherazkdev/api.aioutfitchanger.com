import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dailyLimitForPlan, resolveDailyLimit, utcDateKey } from "../src/lib/server/tryOn/planQuota";

describe("plan-aware daily quota", () => {
  it("free=5 premium=50 admin unlimited(0)", () => {
    process.env.TRY_ON_DAILY_LIMIT_FREE = "5";
    process.env.TRY_ON_DAILY_LIMIT_PREMIUM = "50";
    assert.equal(dailyLimitForPlan("free"), 5);
    assert.equal(dailyLimitForPlan("premium"), 50);
    assert.equal(dailyLimitForPlan("admin"), 0);
    assert.equal(resolveDailyLimit("free"), 5);
    assert.equal(resolveDailyLimit("premium"), 50);
  });

  it("utcDateKey is YYYY-MM-DD", () => {
    assert.match(utcDateKey(new Date("2026-10-22T23:59:59.000Z")), /^2026-10-22$/);
    assert.match(utcDateKey(new Date("2026-10-23T00:00:00.000Z")), /^2026-10-23$/);
  });
});
