import { connectMongo } from "@/lib/server/db";
import { processDueScheduledCampaigns } from "@/lib/server/broadcast/runCampaign";

const globalKey = "__broadcastSchedulerStarted";

function schedulerStarted(): boolean {
  return Boolean((globalThis as Record<string, unknown>)[globalKey]);
}

function markSchedulerStarted() {
  (globalThis as Record<string, unknown>)[globalKey] = true;
}

async function tick() {
  try {
    await connectMongo();
    await processDueScheduledCampaigns();
  } catch (err) {
    console.error("[broadcast-scheduler]", err);
  }
}

/** Runs due scheduled broadcasts on an interval (no admin GET required). */
export function startBroadcastScheduler() {
  if (schedulerStarted()) return;
  markSchedulerStarted();

  const intervalMs = Math.max(15_000, Number(process.env.BROADCAST_SCHEDULER_INTERVAL_MS ?? 60_000));

  void tick();
  setInterval(() => void tick(), intervalMs);
}
