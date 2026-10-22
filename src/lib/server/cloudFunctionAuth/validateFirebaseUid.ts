/**
 * Structural validation only — Cloud Function already verified Firebase Auth.
 * Firebase allows UIDs up to 128 characters; auto-generated are typically ~28 alphanumeric.
 * Do not over-constrain charset beyond rejecting empty, oversized, whitespace, or controls.
 */
const MAX_FIREBASE_UID_LENGTH = 128;

export function normalizeAndValidateFirebaseUid(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const uid = raw.trim();
  if (!uid) return null;
  if (uid.length > MAX_FIREBASE_UID_LENGTH) return null;
  // Reject control characters and any internal whitespace
  if (/[\x00-\x1f\x7f]/.test(uid) || /\s/.test(uid)) return null;
  return uid;
}
