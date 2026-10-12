import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildAccountSecurityHtml,
  buildAccountSecurityPlainText,
  accountSecuritySubject,
} from "../src/lib/server/emails/templates/account-security";

test("welcome_verify email includes OTP and verify link", () => {
  const content = {
    kind: "welcome_verify" as const,
    otp: "4821",
    actionUrl: "https://app.example.com/verify-email?token=abc",
    expiresInMinutes: 10,
    linkExpiresIn: "1 hour",
  };

  assert.match(accountSecuritySubject("welcome_verify"), /verify your email/i);

  const plain = buildAccountSecurityPlainText(content);
  assert.match(plain, /4821/);
  assert.match(plain, /4-digit code/i);
  assert.match(plain, /verify-email\?token=abc/);

  const html = buildAccountSecurityHtml(content);
  assert.match(html, /4821/);
  assert.match(html, /Verify account/);
  assert.match(html, /verify-email\?token=abc/);
});

test("password_reset email still includes OTP and reset link", () => {
  const content = {
    kind: "password_reset" as const,
    otp: "9912",
    actionUrl: "https://app.example.com/reset-password?token=xyz",
    expiresInMinutes: 10,
  };
  const plain = buildAccountSecurityPlainText(content);
  assert.match(plain, /9912/);
  assert.match(plain, /reset-password\?token=xyz/);
});
