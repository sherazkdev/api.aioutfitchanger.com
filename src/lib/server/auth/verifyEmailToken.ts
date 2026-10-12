import { hashResetLinkToken } from "./passwordResetSecrets";
import { PasswordResetToken } from "../models/PasswordResetToken";
import { User } from "../models/User";

export async function verifyEmailWithLinkToken(rawToken: string): Promise<
  | { ok: true; userId: string; alreadyVerified: boolean }
  | { ok: false; code: "INVALID_TOKEN" | "WRONG_PURPOSE" }
> {
  const doc = await PasswordResetToken.findOne({ tokenHash: hashResetLinkToken(rawToken) });
  if (!doc || doc.usedAt || doc.expiresAt.getTime() < Date.now()) {
    return { ok: false, code: "INVALID_TOKEN" };
  }
  if (doc.purpose !== "email_verify") {
    return { ok: false, code: "WRONG_PURPOSE" };
  }

  const user = await User.findById(doc.userId);
  if (!user) return { ok: false, code: "INVALID_TOKEN" };

  const alreadyVerified = Boolean(user.emailVerified);
  if (!alreadyVerified) {
    user.emailVerified = true;
    await user.save();
  }

  doc.usedAt = new Date();
  await doc.save();

  return { ok: true, userId: String(user._id), alreadyVerified };
}
