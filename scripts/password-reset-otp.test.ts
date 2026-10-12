import assert from "node:assert/strict";
import {
  hashPasswordResetOtp,
  verifyPasswordResetOtpHash,
} from "../src/lib/server/auth/passwordResetSecrets.ts";
import {
  generatePasswordResetOtp,
  normalizeOtpInput,
  PASSWORD_RESET_OTP_LENGTH,
} from "../src/lib/server/auth/passwordResetOtp.ts";

process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-chars!!";

const userId = "507f1f77bcf86cd799439011";

assert.equal(normalizeOtpInput("12"), null);
assert.equal(normalizeOtpInput("1234"), "1234");
assert.equal(normalizeOtpInput(" 12 34 "), "1234");

const otp = generatePasswordResetOtp();
assert.equal(otp.length, PASSWORD_RESET_OTP_LENGTH);
assert.match(otp, /^\d{4}$/);

const hash = hashPasswordResetOtp(userId, otp);
assert.ok(verifyPasswordResetOtpHash(userId, otp, hash));
assert.equal(verifyPasswordResetOtpHash(userId, "0000", hash), false);
assert.equal(verifyPasswordResetOtpHash("other", otp, hash), false);

console.log("password-reset-otp.test.ts: OK");
