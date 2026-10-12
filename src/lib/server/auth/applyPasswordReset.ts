import type { Types } from "mongoose";
import { invalidatePasswordResetChallenges } from "@/lib/server/auth/passwordResetChallenge";
import { hashPassword } from "@/lib/server/auth/password";
import { revokeAllUserSessions } from "@/lib/server/auth/tokens";
import { User } from "@/lib/server/models/User";

export async function applyNewPassword(userId: Types.ObjectId, newPassword: string): Promise<void> {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) {
    throw new Error("User not found for password reset");
  }
  user.passwordHash = await hashPassword(newPassword);
  user.emailVerified = true;
  await user.save();
  await invalidatePasswordResetChallenges(userId);
  await revokeAllUserSessions(userId);
}
