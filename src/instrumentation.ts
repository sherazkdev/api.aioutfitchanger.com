export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startBroadcastScheduler } = await import("@/lib/server/broadcast/scheduler");
    startBroadcastScheduler();
  }
}
