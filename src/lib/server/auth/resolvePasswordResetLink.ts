import { hashResetLinkToken } from "./passwordResetSecrets";
import { PasswordResetToken } from "../models/PasswordResetToken";
import type { PasswordResetTokenDoc } from "../models/PasswordResetToken";

export type PasswordResetLinkErrorCode =
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "TOKEN_ALREADY_USED"
  | "WRONG_PURPOSE";

export type PasswordResetLinkResult =
  | { ok: true; doc: PasswordResetTokenDoc }
  | { ok: false; code: PasswordResetLinkErrorCode; message: string };

export function passwordResetLinkErrorMessage(code: PasswordResetLinkErrorCode): string {
  switch (code) {
    case "TOKEN_EXPIRED":
      return "This reset link has expired. Request a new password reset from the app or forgot-password page.";
    case "TOKEN_ALREADY_USED":
      return "This reset link was already used. Request a new password reset if you still need to change your password.";
    case "WRONG_PURPOSE":
      return "This link is for email verification only. Use forgot-password to get a reset link.";
    default:
      return "Reset link is invalid. Request a new password reset.";
  }
}

export async function resolvePasswordResetLink(rawToken: string): Promise<PasswordResetLinkResult> {
  const token = rawToken.trim();
  if (!token) {
    return { ok: false, code: "INVALID_TOKEN", message: passwordResetLinkErrorMessage("INVALID_TOKEN") };
  }

  const doc = await PasswordResetToken.findOne({ tokenHash: hashResetLinkToken(token) });
  if (!doc) {
    return { ok: false, code: "INVALID_TOKEN", message: passwordResetLinkErrorMessage("INVALID_TOKEN") };
  }

  if (doc.purpose === "email_verify") {
    return { ok: false, code: "WRONG_PURPOSE", message: passwordResetLinkErrorMessage("WRONG_PURPOSE") };
  }

  if (doc.usedAt) {
    return { ok: false, code: "TOKEN_ALREADY_USED", message: passwordResetLinkErrorMessage("TOKEN_ALREADY_USED") };
  }

  if (doc.expiresAt.getTime() < Date.now()) {
    return { ok: false, code: "TOKEN_EXPIRED", message: passwordResetLinkErrorMessage("TOKEN_EXPIRED") };
  }

  return { ok: true, doc };
}
