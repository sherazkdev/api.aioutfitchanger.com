import mongoose from "mongoose";
import { connectMongo } from "../db";
import { DailyGenerationQuota } from "../models/DailyGenerationQuota";
import { resolveDailyLimit, utcDateKey, type QuotaPlan } from "./planQuota";

export type QuotaReservation = {
  userId: string;
  utcDate: string;
  reserved: true;
};

/**
 * Atomically reserve one generation slot for the UTC day.
 * Parallel requests cannot exceed the plan limit.
 *
 * Consume policy:
 * - Call reserve BEFORE paid provider call.
 * - releaseReservation if failure BEFORE provider charge.
 * - Keep reservation if provider call was made/charged (including provider-side failures after charge).
 */
export async function reserveDailyGeneration(
  userId: string,
  plan: QuotaPlan
): Promise<QuotaReservation> {
  const limit = resolveDailyLimit(plan);
  if (limit <= 0) {
    return { userId, utcDate: utcDateKey(), reserved: true };
  }

  await connectMongo();
  const utcDate = utcDateKey();
  const oid = new mongoose.Types.ObjectId(userId);

  for (let attempt = 0; attempt < 3; attempt++) {
    const updated = await DailyGenerationQuota.findOneAndUpdate(
      { userId: oid, utcDate, used: { $lt: limit } },
      { $inc: { used: 1 } },
      { new: true }
    );

    if (updated) {
      return { userId, utcDate, reserved: true };
    }

    try {
      await DailyGenerationQuota.create({ userId: oid, utcDate, used: 1 });
      return { userId, utcDate, reserved: true };
    } catch (err) {
      const code = (err as { code?: number })?.code;
      if (code !== 11000) throw err;
      // Race: document created by peer — retry update under limit.
    }
  }

  throw new Error("DAILY_LIMIT_EXCEEDED");
}

export async function releaseDailyGenerationReservation(res: QuotaReservation): Promise<void> {
  const limit = resolveDailyLimit("free"); // only need to know if unlimited path
  void limit;
  await connectMongo();
  await DailyGenerationQuota.updateOne(
    { userId: new mongoose.Types.ObjectId(res.userId), utcDate: res.utcDate, used: { $gt: 0 } },
    { $inc: { used: -1 } }
  );
}
