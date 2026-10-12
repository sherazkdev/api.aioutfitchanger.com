import { randomBytes } from "crypto";
import type { Types } from "mongoose";
import {
  buildOtpHash,
  generatePasswordResetOtp,
  otpExpiresAt,
  otpTtlMinutes,
  PASSWORD_RESET_OTP_LENGTH,
} from "./passwordResetOtp";
import { hashResetLinkToken } from "./passwordResetSecrets";
import { normalizeEmail } from "./normalizeEmail";
import { PasswordResetOtp } from "../models/PasswordResetOtp";
import { PasswordResetToken } from "../models/PasswordResetToken";
import {
  formatResetTokenExpiresIn,
  sendAccountSecurityEmail,
  sendGoogleSignInReminderEmail,
  buildPasswordResetUrl,
  type SendEmailResult,
} from "../emails/email.service";
import type { AccountSecurityEmailKind } from "../emails/templates/account-security";

export type IssueChallengeResult = {
  emailSent: boolean;
  sendError?: SendEmailResult;
  otpLength: number;
  expiresInSeconds: number;
  devOtp?: string;
  devResetUrl?: string;
};

export async function issuePasswordResetChallenge(params: {
  userId: Types.ObjectId;
  email: string;
  kind: AccountSecurityEmailKind;
}): Promise<IssueChallengeResult> {
  const to = normalizeEmail(params.email);
  const otp = generatePasswordResetOtp();
  const otpExpires = otpExpiresAt();
  const ttlMin = otpTtlMinutes();

  const rawLink = randomBytes(32).toString("base64url");
  const ttlHours = Number(process.env.RESET_TOKEN_TTL_HOURS ?? 1);
  const linkExpires = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  await PasswordResetOtp.updateMany({ userId: params.userId, usedAt: null }, { usedAt: new Date() });
  await PasswordResetToken.updateMany({ userId: params.userId, usedAt: null }, { usedAt: new Date() });

  await PasswordResetOtp.create({
    userId: params.userId,
    otpHash: buildOtpHash(String(params.userId), otp),
    expiresAt: otpExpires,
  });

  await PasswordResetToken.create({
    userId: params.userId,
    tokenHash: hashResetLinkToken(rawLink),
    expiresAt: linkExpires,
  });

  const resetUrl = buildPasswordResetUrl(rawLink);
  const sent = await sendAccountSecurityEmail({
    to,
    kind: params.kind,
    otp,
    resetUrl,
    expiresInMinutes: ttlMin,
    linkExpiresIn: formatResetTokenExpiresIn(ttlHours),
  });

  const result: IssueChallengeResult = {
    emailSent: sent.ok,
    sendError: sent.ok ? undefined : sent,
    otpLength: PASSWORD_RESET_OTP_LENGTH,
    expiresInSeconds: ttlMin * 60,
  };

  if (process.env.NODE_ENV !== "production") {
    result.devOtp = otp;
    result.devResetUrl = resetUrl;
  }

  return result;
}

export async function notifyGoogleOnlyAccount(email: string): Promise<boolean> {
  const sent = await sendGoogleSignInReminderEmail(normalizeEmail(email));
  return sent.ok;
}
