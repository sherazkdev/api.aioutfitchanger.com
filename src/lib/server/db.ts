import mongoose from "mongoose";
import { getServerEnv } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const g = globalThis as typeof globalThis & {
  mongooseConn?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!g.mongooseConn) {
  g.mongooseConn = { conn: null, promise: null };
}

function resetMongoCache(): void {
  g.mongooseConn!.conn = null;
  g.mongooseConn!.promise = null;
}

export async function connectMongo(): Promise<typeof mongoose> {
  if (g.mongooseConn!.conn && mongoose.connection.readyState === 1) {
    return g.mongooseConn!.conn;
  }
  if (g.mongooseConn!.conn && mongoose.connection.readyState !== 1) {
    resetMongoCache();
  }

  if (!g.mongooseConn!.promise) {
    const { MONGODB_URI, MONGODB_MAX_POOL_SIZE } = getServerEnv();
    g.mongooseConn!.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: MONGODB_MAX_POOL_SIZE,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 8000,
        maxIdleTimeMS: 30_000,
      })
      .catch((err) => {
        resetMongoCache();
        throw err;
      });
  }

  try {
    g.mongooseConn!.conn = await g.mongooseConn!.promise;
    return g.mongooseConn!.conn;
  } catch (err) {
    resetMongoCache();
    throw err;
  }
}

export function mongoStatus(): "connected" | "disconnected" | "connecting" | "disconnecting" {
  const s = mongoose.connection.readyState;
  if (s === 1) return "connected";
  if (s === 2) return "connecting";
  if (s === 3) return "disconnecting";
  return "disconnected";
}
