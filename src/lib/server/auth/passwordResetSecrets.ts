import { createHash, timingSafeEqual } from "crypto";

function resetPepper(): string {
  const pepper = process.env.RESET_OTP_PEPPER?.trim() || process.env.JWT_REFRESH_SECRET?.trim();
  if (!pepper || pepper.length < 16) {
    throw new Error("RESET_OTP_PEPPER or JWT_REFRESH_SECRET required for password reset");
  }
  return pepper;
}

export function hashResetLinkToken(raw: string): string {
  return createHash("sha256").update(raw).digest("base64url");
}

/** Store only hashed OTP; binds code to user id and pepper. */
export function hashPasswordResetOtp(userId: string, otp: string): string {
  const normalized = otp.replace(/\D/g, "").padStart(4, "0").slice(-4);
  return createHash("sha256")
    .update(`${resetPepper()}\0${userId}\0${normalized}`)
    .digest("base64url");
}

export function verifyPasswordResetOtpHash(
  userId: string,
  otp: string,
  expectedHash: string
): boolean {
  const actual = hashPasswordResetOtp(userId, otp);
  try {
    const a = Buffer.from(actual);
    const b = Buffer.from(expectedHash);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
