const lastPoll = new Map<string, number>();
let ops = 0;

const MIN_MS = Number(process.env.BFL_POLL_MIN_INTERVAL_MS ?? 1500);

export function shouldSkipBflPoll(jobId: string): boolean {
  const now = Date.now();
  const prev = lastPoll.get(jobId) ?? 0;
  if (now - prev < MIN_MS) return true;
  lastPoll.set(jobId, now);
  ops += 1;
  if (ops % 500 === 0) {
    for (const [id, t] of lastPoll) {
      if (now - t > 60_000) lastPoll.delete(id);
    }
  }
  return false;
}
