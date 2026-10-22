import { connectMongo } from "../db";
import { User, type UserDoc } from "../models/User";
import { normalizeAndValidateFirebaseUid } from "./validateFirebaseUid";

function isDuplicateKeyError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: number; message?: string };
  if (e.code === 11000) return true;
  return typeof e.message === "string" && e.message.includes("E11000");
}

export type ResolveFirebaseUserDeps = {
  /** Injected for isolated tests — defaults to Mongo upsert. */
  upsertByFirebaseUid?: (firebaseUid: string) => Promise<UserDoc>;
};

async function defaultUpsertByFirebaseUid(firebaseUid: string): Promise<UserDoc> {
  await connectMongo();

  try {
    // Race-safe: unique sparse index + upsert. Only set fields on insert.
    // Prefer schema defaults for role / subscriptionPlan / status.
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      {
        $setOnInsert: {
          firebaseUid,
          // Anonymous Firebase → no email/password; mark guest consistently with schema field.
          isGuest: true,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    if (!user) {
      throw new Error("FIREBASE_USER_UPSERT_FAILED");
    }
    return user;
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      const existing = await User.findOne({ firebaseUid });
      if (existing) return existing;
    }
    throw err;
  }
}

/**
 * Resolve Firebase UID → Mongo User.
 *
 * - Exact `firebaseUid` match only (no email / googleId / device linking in Phase 1).
 * - Existing user: return as-is (preserves Mongo `_id`).
 * - Missing user: create minimal anonymous user; schema defaults apply.
 * - Concurrent creates: unique index + upsert + duplicate-key retry.
 */
export async function resolveFirebaseUser(
  firebaseUidRaw: string,
  deps: ResolveFirebaseUserDeps = {}
): Promise<UserDoc> {
  const firebaseUid = normalizeAndValidateFirebaseUid(firebaseUidRaw);
  if (!firebaseUid) {
    throw new Error("INVALID_FIREBASE_UID");
  }

  const upsert = deps.upsertByFirebaseUid ?? defaultUpsertByFirebaseUid;
  return upsert(firebaseUid);
}
