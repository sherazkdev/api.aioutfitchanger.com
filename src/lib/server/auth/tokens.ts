import { createHash, randomBytes } from "crypto";
import * as jose from "jose";
import { getServerEnv } from "../env";
import { RefreshToken } from "../models/RefreshToken";
import type { Types } from "mongoose";

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("base64url");
}

export function newRefreshRaw(): string {
  return randomBytes(48).toString("base64url");
}

export function newFamilyId(): string {
  return randomBytes(16).toString("base64url");
}

export async function signAccessToken(userId: string, role: string): Promise<string> {
  const env = getServerEnv();
  const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
  return new jose.SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<{ userId: string; role: string }> {
  const env = getServerEnv();
  const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
  const { payload } = await jose.jwtVerify(token, secret);
  const sub = payload.sub;
  if (!sub || typeof sub !== "string") throw new Error("INVALID_TOKEN");
  const role = typeof payload.role === "string" ? payload.role : "user";
  return { userId: sub, role };
}

export async function issueSession(params: {
  userId: Types.ObjectId;
  familyId?: string;
  userAgent?: string;
  ip?: string;
  deviceId?: string;
  label?: string;
}): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date; familyId: string }> {
  const env = getServerEnv();
  const user = await import("../models/User").then((m) => m.User.findById(params.userId));
  if (!user || user.status === "disabled") throw new Error("USER_DISABLED");

  const refreshToken = newRefreshRaw();
  const familyId = params.familyId ?? newFamilyId();
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_SECONDS * 1000);

  await RefreshToken.create({
    userId: params.userId,
    tokenHash: hashToken(refreshToken),
    familyId,
    expiresAt,
    userAgent: params.userAgent,
    ip: params.ip,
    deviceId: params.deviceId,
    label: params.label,
    useCount: 0,
  });

  const accessToken = await signAccessToken(String(params.userId), user.role);
  return { accessToken, refreshToken, expiresAt, familyId };
}

export async function rotateRefreshToken(params: {
  rawRefresh: string;
  userAgent?: string;
  ip?: string;
}): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const hash = hashToken(params.rawRefresh);
  const doc = await RefreshToken.findOne({ tokenHash: hash });
  if (!doc) throw new Error("INVALID_REFRESH");
  if (doc.revokedAt) {
    await revokeRefreshFamily(doc.familyId);
    throw new Error("REFRESH_REUSE");
  }
  if (doc.expiresAt.getTime() < Date.now()) {
    doc.revokedAt = new Date();
    await doc.save();
    throw new Error("REFRESH_EXPIRED");
  }

  doc.lastUsedAt = new Date();
  doc.useCount += 1;
  doc.revokedAt = new Date();
  await doc.save();

  const { User } = await import("../models/User");
  const user = await User.findById(doc.userId);
  if (!user || user.status === "disabled") throw new Error("USER_DISABLED");

  return issueSession({
    userId: doc.userId,
    familyId: doc.familyId,
    userAgent: params.userAgent ?? doc.userAgent ?? undefined,
    ip: params.ip ?? doc.ip ?? undefined,
    deviceId: doc.deviceId ?? undefined,
    label: doc.label ?? undefined,
  });
}

export async function revokeRefreshFamily(familyId: string): Promise<void> {
  await RefreshToken.updateMany({ familyId, revokedAt: null }, { revokedAt: new Date() });
}

export async function revokeRefreshByHash(rawRefresh: string): Promise<void> {
  const hash = hashToken(rawRefresh);
  const doc = await RefreshToken.findOne({ tokenHash: hash });
  if (!doc) return;
  doc.revokedAt = new Date();
  await doc.save();
}

export async function revokeAllUserSessions(userId: Types.ObjectId): Promise<void> {
  await RefreshToken.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
}
