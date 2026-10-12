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
  buildVerifyEmailUrl,
  type SendEmailResult,
} from "../emails/email.service";
import type { AccountSecurityEmailKind } from "../emails/templates/account-security";

export type IssueChallengeResult = {
  emailSent: boolean;
  sendError?: SendEmailResult;
  otpLength: number;
  expiresInSeconds: number;
  devOtp?: string;
  devActionUrl?: string;
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

  const linkPurpose = params.kind === "welcome_verify" ? "email_verify" : "password_reset";
  const actionUrl =
    linkPurpose === "email_verify" ? buildVerifyEmailUrl(rawLink) : buildPasswordResetUrl(rawLink);

  await PasswordResetToken.create({
    userId: params.userId,
    tokenHash: hashResetLinkToken(rawLink),
    purpose: linkPurpose,
    expiresAt: linkExpires,
  });

  const sent = await sendAccountSecurityEmail({
    to,
    kind: params.kind,
    otp,
    actionUrl,
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
    result.devActionUrl = actionUrl;
  }

  return result;
}

export async function notifyGoogleOnlyAccount(email: string): Promise<boolean> {
  const sent = await sendGoogleSignInReminderEmail(normalizeEmail(email));
  return sent.ok;
}
