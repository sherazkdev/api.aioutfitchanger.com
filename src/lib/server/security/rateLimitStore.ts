/**
 * Rate limits: in-memory (single instance) or Redis when REDIS_URL is set (PM2 multi-instance / restart-safe).
 */
type MemoryRow = { count: number; reset: number };

const memory = new Map<string, MemoryRow>();
const MEMORY_MAX_KEYS = 50_000;
let memoryOps = 0;

function memoryConsume(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  memoryOps += 1;
  if (memoryOps % 500 === 0) {
    for (const [k, row] of memory) {
      if (now > row.reset) memory.delete(k);
    }
    if (memory.size > MEMORY_MAX_KEYS) {
      const drop = memory.size - MEMORY_MAX_KEYS;
      let i = 0;
      for (const k of memory.keys()) {
        memory.delete(k);
        if (++i >= drop) break;
      }
    }
  }

  const row = memory.get(key);
  if (!row || now > row.reset) {
    memory.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (row.count >= limit) return false;
  row.count += 1;
  return true;
}

type RedisClient = {
  incr: (key: string) => Promise<number>;
  pexpire: (key: string, ms: number) => Promise<number>;
};

let redisClient: RedisClient | null | undefined;
let redisInitFailed = false;

async function getRedis(): Promise<RedisClient | null> {
  if (redisInitFailed) return null;
  if (redisClient !== undefined) return redisClient;

  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    redisClient = null;
    return null;
  }

  try {
    const { default: Redis } = await import("ioredis");
    const client = new Redis(url, { maxRetriesPerRequest: 1, enableReadyCheck: true });
    await client.ping();
    redisClient = {
      incr: (k) => client.incr(k),
      pexpire: (k, ms) => client.pexpire(k, ms),
    };
    return redisClient;
  } catch (e) {
    redisInitFailed = true;
    console.error("[rate-limit] Redis unavailable, using memory store", e);
    redisClient = null;
    return null;
  }
}

async function redisConsume(key: string, limit: number, windowMs: number): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) return memoryConsume(key, limit, windowMs);

  const redisKey = `rl:v1:${key}`;
  try {
    const count = await redis.incr(redisKey);
    if (count === 1) await redis.pexpire(redisKey, windowMs);
    return count <= limit;
  } catch {
    return memoryConsume(key, limit, windowMs);
  }
}

export async function consumeRateLimit(key: string, limit: number, windowMs = 60_000): Promise<boolean> {
  return redisConsume(key, limit, windowMs);
}

/** Test-only */
export function resetRateLimitMemory(): void {
  memory.clear();
  redisClient = undefined;
  redisInitFailed = false;
}
