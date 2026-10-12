import { randomInt } from "crypto";
import { hashPasswordResetOtp } from "./passwordResetSecrets";

export const PASSWORD_RESET_OTP_LENGTH = 4;

export function otpTtlMinutes(): number {
  const n = Number(process.env.RESET_OTP_TTL_MINUTES ?? 10);
  if (!Number.isFinite(n) || n < 1) return 10;
  return Math.min(60, Math.max(1, Math.floor(n)));
}

export function otpMaxAttempts(): number {
  const n = Number(process.env.RESET_OTP_MAX_ATTEMPTS ?? 5);
  if (!Number.isFinite(n) || n < 1) return 5;
  return Math.min(10, Math.max(3, Math.floor(n)));
}

export function generatePasswordResetOtp(): string {
  return String(randomInt(0, 10_000)).padStart(PASSWORD_RESET_OTP_LENGTH, "0");
}

export function normalizeOtpInput(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== PASSWORD_RESET_OTP_LENGTH) return null;
  return digits;
}

export function buildOtpHash(userId: string, otp: string): string {
  return hashPasswordResetOtp(userId, otp);
}

export function otpExpiresAt(now = Date.now()): Date {
  return new Date(now + otpTtlMinutes() * 60 * 1000);
}
