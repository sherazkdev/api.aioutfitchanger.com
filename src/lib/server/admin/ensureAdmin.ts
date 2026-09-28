import { connectMongo } from "../db";
import { getServerEnv } from "../env";
import { hashPassword } from "../auth/password";
import { User } from "../models/User";

/** Creates admin user or sets bcrypt hash from ENV (first-time bootstrap only). */
export async function ensureAdminFromEnv(): Promise<void> {
  const env = getServerEnv();
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;

  await connectMongo();
  const email = env.ADMIN_EMAIL.toLowerCase();
  let user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    await User.create({
      email,
      displayName: "Admin",
      role: "admin",
      passwordHash: await hashPassword(env.ADMIN_PASSWORD),
    });
    return;
  }

  if (!user.passwordHash) {
    user.passwordHash = await hashPassword(env.ADMIN_PASSWORD);
    user.role = "admin";
    await user.save();
  }
}
