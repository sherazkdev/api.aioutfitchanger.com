import mongoose from "mongoose";
import { connectMongo } from "../db";
import { GatewayApiKey } from "../models/GatewayApiKey";
import { GatewayApiKeyEvent, type GatewayApiKeyAction } from "../models/GatewayApiKeyEvent";
import {
  fingerprintGatewayApiKey,
  lastFourOfKey,
  openGatewayApiKey,
  sealGatewayApiKey,
} from "./crypto";
import { generateGatewayApiKeyPlaintext, generateGatewayKeyId } from "./generate";

export function gatewayGraceSeconds(): number {
  const n = Number(process.env.GATEWAY_API_KEY_GRACE_SECONDS ?? 1800);
  if (!Number.isFinite(n) || n < 0) return 1800;
  return Math.min(86_400, Math.floor(n));
}

export async function recordGatewayKeyEvent(opts: {
  keyId: string;
  action: GatewayApiKeyAction;
  adminUserId: string;
  ip?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  await GatewayApiKeyEvent.create({
    keyId: opts.keyId,
    action: opts.action,
    adminUserId: new mongoose.Types.ObjectId(opts.adminUserId),
    ip: opts.ip ?? null,
    createdAt: new Date(),
    metadata: opts.metadata ?? null,
  });
}

export function serializeGatewayKeyStatus(doc: {
  keyId: string;
  lastFour: string;
  keyFingerprint: string;
  status: string;
  createdAt: Date;
  rotatedAt?: Date | null;
  revokedAt?: Date | null;
  graceExpiresAt?: Date | null;
  lastUsedAt?: Date | null;
}) {
  return {
    key_id: doc.keyId,
    status: doc.status,
    last_four: doc.lastFour,
    fingerprint_short: doc.keyFingerprint.slice(0, 12),
    created_at: doc.createdAt.toISOString(),
    rotated_at: doc.rotatedAt ? doc.rotatedAt.toISOString() : null,
    revoked_at: doc.revokedAt ? doc.revokedAt.toISOString() : null,
    grace_expires_at: doc.graceExpiresAt ? doc.graceExpiresAt.toISOString() : null,
    last_used_at: doc.lastUsedAt ? doc.lastUsedAt.toISOString() : null,
  };
}

export async function getGatewayKeyOverview() {
  await connectMongo();
  const keys = await GatewayApiKey.find({ status: { $in: ["active", "grace"] } })
    .sort({ createdAt: -1 })
    .lean();
  const active = keys.find((k) => k.status === "active") ?? null;
  const grace = keys.filter((k) => k.status === "grace");
  return {
    active: active ? serializeGatewayKeyStatus(active) : null,
    grace: grace.map(serializeGatewayKeyStatus),
  };
}

async function encryptAndStoreNewActive(opts: {
  adminUserId: string;
  previousActiveKeyId?: string | null;
}): Promise<{ plaintext: string; keyId: string }> {
  const plaintext = generateGatewayApiKeyPlaintext();
  const sealed = sealGatewayApiKey(plaintext);
  const keyId = generateGatewayKeyId();
  const now = new Date();

  await GatewayApiKey.create({
    keyId,
    ciphertext: sealed.ciphertext,
    iv: sealed.iv,
    authTag: sealed.authTag,
    keyFingerprint: fingerprintGatewayApiKey(plaintext),
    lastFour: lastFourOfKey(plaintext),
    status: "active",
    createdAt: now,
    rotatedAt: opts.previousActiveKeyId ? now : null,
    revokedAt: null,
    graceExpiresAt: null,
    createdByAdminUserId: new mongoose.Types.ObjectId(opts.adminUserId),
    lastUsedAt: null,
    version: sealed.version,
  });

  return { plaintext, keyId };
}

export async function createGatewayApiKey(opts: {
  adminUserId: string;
  ip?: string | null;
}): Promise<{ plaintext: string; keyId: string }> {
  await connectMongo();
  const existing = await GatewayApiKey.findOne({ status: "active" }).select("keyId").lean();
  if (existing) {
    throw new Error("ACTIVE_KEY_EXISTS");
  }
  const created = await encryptAndStoreNewActive({ adminUserId: opts.adminUserId });
  await recordGatewayKeyEvent({
    keyId: created.keyId,
    action: "create",
    adminUserId: opts.adminUserId,
    ip: opts.ip,
  });
  return created;
}

export async function rotateGatewayApiKey(opts: {
  adminUserId: string;
  ip?: string | null;
}): Promise<{ plaintext: string; keyId: string; graceExpiresAt: Date | null }> {
  await connectMongo();
  const active = await GatewayApiKey.findOne({ status: "active" });
  if (!active) {
    throw new Error("NO_ACTIVE_KEY");
  }

  const graceSec = gatewayGraceSeconds();
  const graceExpiresAt = graceSec > 0 ? new Date(Date.now() + graceSec * 1000) : null;

  active.status = "grace";
  active.graceExpiresAt = graceExpiresAt;
  active.rotatedAt = new Date();
  await active.save();

  const created = await encryptAndStoreNewActive({
    adminUserId: opts.adminUserId,
    previousActiveKeyId: active.keyId,
  });

  await recordGatewayKeyEvent({
    keyId: created.keyId,
    action: "rotate",
    adminUserId: opts.adminUserId,
    ip: opts.ip,
    metadata: { previous_key_id: active.keyId, grace_expires_at: graceExpiresAt?.toISOString() ?? null },
  });

  return { ...created, graceExpiresAt };
}

export async function revokeGatewayApiKey(opts: {
  adminUserId: string;
  keyId: string;
  confirmNoActive?: boolean;
  ip?: string | null;
}): Promise<{ revokedKeyId: string }> {
  await connectMongo();
  const doc = await GatewayApiKey.findOne({ keyId: opts.keyId });
  if (!doc) throw new Error("KEY_NOT_FOUND");
  if (doc.status === "revoked") throw new Error("ALREADY_REVOKED");

  if (doc.status === "active" && !opts.confirmNoActive) {
    throw new Error("CONFIRM_REVOKE_ACTIVE_REQUIRED");
  }

  doc.status = "revoked";
  doc.revokedAt = new Date();
  doc.graceExpiresAt = null;
  await doc.save();

  await recordGatewayKeyEvent({
    keyId: doc.keyId,
    action: "revoke",
    adminUserId: opts.adminUserId,
    ip: opts.ip,
  });

  return { revokedKeyId: doc.keyId };
}

export async function decryptActiveGatewayApiKeyPlaintext(): Promise<{ keyId: string; plaintext: string }> {
  await connectMongo();
  const active = await GatewayApiKey.findOne({ status: "active" });
  if (!active) throw new Error("NO_ACTIVE_KEY");
  const plaintext = openGatewayApiKey({
    ciphertext: active.ciphertext,
    iv: active.iv,
    authTag: active.authTag,
  });
  return { keyId: active.keyId, plaintext };
}
