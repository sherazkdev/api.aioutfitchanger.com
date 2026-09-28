import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().min(5).max(100).default(25),
  CONTENT_CACHE_TTL_SECONDS: z.coerce.number().min(5).max(300).default(60),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(600),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().default(30 * 24 * 60 * 60),
  GOOGLE_CLIENT_ID_ANDROID: z.string().optional(),
  GOOGLE_CLIENT_ID_IOS: z.string().optional(),
  GOOGLE_CLIENT_ID_WEB: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  BFL_API_KEY: z.string().optional(),
  BFL_API_BASE: z.string().url().default("https://api.bfl.ai"),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  API_RATE_LIMIT_AUTH_PER_MIN: z.coerce.number().default(20),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid server env: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}

export function googleClientIds(): string[] {
  const e = getServerEnv();
  return [e.GOOGLE_CLIENT_ID_ANDROID, e.GOOGLE_CLIENT_ID_IOS, e.GOOGLE_CLIENT_ID_WEB].filter(
    (id): id is string => Boolean(id)
  );
}
