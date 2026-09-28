/**
 * Seed admin user only (no catalog/feed mock data).
 * Reads ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI from .env.local
 *
 *   npm run seed
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROUNDS = 12;

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    val = val.replace(/\\n/g, "\n");
    process.env[key] = val;
  }
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}
if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true, lowercase: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    displayName: { type: String, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    passwordHash: { type: String, select: false },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
  },
  { timestamps: true }
);

const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

async function main() {
  const pool = Math.min(10, Number(process.env.MONGODB_MAX_POOL_SIZE) || 5);
  await mongoose.connect(uri, { maxPoolSize: pool });

  let user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    const passwordHash = await bcrypt.hash(password, ROUNDS);
    user = await User.create({
      email,
      displayName: "Admin",
      role: "admin",
      passwordHash,
    });
    console.log(JSON.stringify({ ok: true, action: "created", email: user.email, role: user.role }));
    return;
  }

  if (!user.passwordHash) {
    user.passwordHash = await bcrypt.hash(password, ROUNDS);
    user.role = "admin";
    await user.save();
    console.log(JSON.stringify({ ok: true, action: "password_set", email: user.email, role: user.role }));
    return;
  }

  console.log(
    JSON.stringify({
      ok: true,
      action: "unchanged",
      email: user.email,
      role: user.role,
      note: "Admin already has a password; login or update password in DB/admin UI.",
    })
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
