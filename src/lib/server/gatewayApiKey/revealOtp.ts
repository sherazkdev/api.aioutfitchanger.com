import { createHash, randomInt, timingSafeEqual } from "crypto";
import mongoose from "mongoose";
import { connectMongo } from "../db";
import { GatewayRevealChallenge } from "../models/GatewayRevealChallenge";
import { User } from "../models/User";
import { sendAccountSecurityEmail } from "../emails/email.service";
import {
  decryptActiveGatewayApiKeyPlaintext,
  recordGatewayKeyEvent,
} from "./service";

const OTP_LENGTH = 6;
const DEFAULT_TTL_MIN = 10;
const DEFAULT_MAX_ATTEMPTS = 5;

function pepper(): string {
  return (
    process.env.GATEWAY_REVEAL_OTP_PEPPER?.trim() ||
    process.env.RESET_OTP_PEPPER?.trim() ||
    process.env.JWT_REFRESH_SECRET?.trim() ||
    ""
  );
}

function hashRevealOtp(adminUserId: string, otp: string): string {
  const p = pepper();
  if (p.length < 16) throw new Error("OTP_PEPPER_MISSING");
  return createHash("sha256").update(`${p}\0gateway-reveal\0${adminUserId}\0${otp}`).digest("base64url");
}

function ttlMinutes(): number {
  const n = Number(process.env.GATEWAY_REVEAL_OTP_TTL_MINUTES ?? DEFAULT_TTL_MIN);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_TTL_MIN;
  return Math.min(15, Math.max(5, Math.floor(n)));
}

function maxAttempts(): number {
  const n = Number(process.env.GATEWAY_REVEAL_OTP_MAX_ATTEMPTS ?? DEFAULT_MAX_ATTEMPTS);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_MAX_ATTEMPTS;
  return Math.min(10, Math.max(3, Math.floor(n)));
}

function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(OTP_LENGTH, "0");
}

export async function requestGatewayKeyReveal(opts: {
  adminUserId: string;
  adminEmail: string | null | undefined;
  ip?: string | null;
}): Promise<{ challengeId: string; expiresAt: string }> {
  if (!opts.adminEmail?.trim()) throw new Error("ADMIN_EMAIL_REQUIRED");

  await connectMongo();
  const { keyId } = await decryptActiveGatewayApiKeyPlaintext();
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + ttlMinutes() * 60_000);

  await GatewayRevealChallenge.updateMany(
    { adminUserId: opts.adminUserId, usedAt: null },
    { usedAt: new Date() }
  );

  const challenge = await GatewayRevealChallenge.create({
    adminUserId: new mongoose.Types.ObjectId(opts.adminUserId),
    otpHash: hashRevealOtp(opts.adminUserId, otp),
    expiresAt,
    usedAt: null,
    failedAttempts: 0,
    keyId,
  });

  await recordGatewayKeyEvent({
    keyId,
    action: "reveal_requested",
    adminUserId: opts.adminUserId,
    ip: opts.ip,
    metadata: { challenge_id: String(challenge._id) },
  });

  const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const sent = await sendAccountSecurityEmail({
    to: opts.adminEmail,
    kind: "password_reset",
    otp,
    actionUrl: `${appUrl}/admin/gateway-api-key`,
    expiresInMinutes: ttlMinutes(),
  });
  if (!sent.ok) {
    // Still return challenge so local/dev without Resend can be tested with mocked email;
    // production should have Resend configured.
    if (sent.error !== "not_configured") {
      throw new Error("EMAIL_SEND_FAILED");
    }
  }

  return { challengeId: String(challenge._id), expiresAt: expiresAt.toISOString() };
}

export async function confirmGatewayKeyReveal(opts: {
  adminUserId: string;
  challengeId: string;
  otp: string;
  ip?: string | null;
}): Promise<{ keyId: string; plaintext: string }> {
  await connectMongo();
  const digits = opts.otp.replace(/\D/g, "");
  if (digits.length !== OTP_LENGTH) throw new Error("INVALID_OTP");

  const challenge = await GatewayRevealChallenge.findById(opts.challengeId);
  if (!challenge) throw new Error("CHALLENGE_NOT_FOUND");
  if (String(challenge.adminUserId) !== opts.adminUserId) throw new Error("CHALLENGE_FORBIDDEN");
  if (challenge.usedAt) throw new Error("CHALLENGE_USED");
  if (challenge.expiresAt.getTime() <= Date.now()) throw new Error("CHALLENGE_EXPIRED");
  if (challenge.failedAttempts >= maxAttempts()) throw new Error("ATTEMPTS_EXCEEDED");

  const expected = challenge.otpHash;
  const actual = hashRevealOtp(opts.adminUserId, digits);
  let match = false;
  try {
    const a = Buffer.from(actual);
    const b = Buffer.from(expected);
    match = a.length === b.length && timingSafeEqual(a, b);
  } catch {
    match = false;
  }

  if (!match) {
    challenge.failedAttempts += 1;
    await challenge.save();
    await recordGatewayKeyEvent({
      keyId: challenge.keyId,
      action: "reveal_failed",
      adminUserId: opts.adminUserId,
      ip: opts.ip,
      metadata: { reason: "wrong_otp" },
    });
    throw new Error("INVALID_OTP");
  }

  challenge.usedAt = new Date();
  await challenge.save();

  const { keyId, plaintext } = await decryptActiveGatewayApiKeyPlaintext();
  await recordGatewayKeyEvent({
    keyId,
    action: "reveal_success",
    adminUserId: opts.adminUserId,
    ip: opts.ip,
  });

  return { keyId, plaintext };
}

export async function loadAdminEmail(adminUserId: string): Promise<string | null> {
  await connectMongo();
  const u = await User.findById(adminUserId).select("email").lean();
  return u?.email ?? null;
}
