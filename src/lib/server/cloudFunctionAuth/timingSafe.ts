import { timingSafeEqual } from "crypto";

/** Timing-safe equality for UTF-8 / hex strings. Unequal lengths → false (no throw). */
export function safeEqualString(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/** Compare lowercase hex digests without throwing on length mismatch. */
export function safeEqualHex(a: string, b: string): boolean {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(left) || !/^[0-9a-f]+$/.test(right)) return false;
  try {
    const bufA = Buffer.from(left, "hex");
    const bufB = Buffer.from(right, "hex");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
