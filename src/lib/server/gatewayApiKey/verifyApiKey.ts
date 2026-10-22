import { connectMongo } from "../db";
import { GatewayApiKey } from "../models/GatewayApiKey";
import { safeEqualString } from "../cloudFunctionAuth/timingSafe";
import { fingerprintGatewayApiKey, openGatewayApiKey } from "./crypto";

export type VerifyGatewayApiKeyResult =
  | { ok: true; keyId: string; status: "active" | "grace" }
  | { ok: false; reason: "MISSING" | "INVALID" | "REVOKED" | "EXPIRED_GRACE" | "NOT_CONFIGURED" };

function touchLastUsed(keyId: string): void {
  void GatewayApiKey.updateOne({ keyId }, { $set: { lastUsedAt: new Date() } }).catch(() => {
    /* non-fatal */
  });
}

/**
 * Validate presented X-API-Key against active + non-expired grace keys.
 * Decrypts in memory; never logs plaintext.
 */
export async function verifyGatewayApiKey(presented: string | null | undefined): Promise<VerifyGatewayApiKeyResult> {
  const raw = presented?.trim() ?? "";
  if (!raw) return { ok: false, reason: "MISSING" };

  if (!process.env.GATEWAY_API_KEY_MASTER_KEY?.trim()) {
    return { ok: false, reason: "NOT_CONFIGURED" };
  }

  await connectMongo();
  const now = new Date();
  const candidates = await GatewayApiKey.find({
    status: { $in: ["active", "grace"] },
  })
    .select("keyId status ciphertext iv authTag graceExpiresAt")
    .lean();

  if (!candidates.length) return { ok: false, reason: "INVALID" };

  for (const doc of candidates) {
    if (doc.status === "grace") {
      if (doc.graceExpiresAt && doc.graceExpiresAt.getTime() <= now.getTime()) {
        continue;
      }
    }
    let plaintext: string;
    try {
      plaintext = openGatewayApiKey({
        ciphertext: doc.ciphertext,
        iv: doc.iv,
        authTag: doc.authTag,
      });
    } catch {
      continue;
    }
    if (safeEqualString(plaintext, raw)) {
      touchLastUsed(doc.keyId);
      return { ok: true, keyId: doc.keyId, status: doc.status as "active" | "grace" };
    }
  }

  // Fingerprint fast-path for revoked detection (optional clarity for clients — still 401).
  const fp = fingerprintGatewayApiKey(raw);
  const revoked = await GatewayApiKey.findOne({ keyFingerprint: fp, status: "revoked" })
    .select("_id")
    .lean();
  if (revoked) return { ok: false, reason: "REVOKED" };

  const expiredGrace = await GatewayApiKey.findOne({
    keyFingerprint: fp,
    status: "grace",
    graceExpiresAt: { $lte: now },
  })
    .select("_id")
    .lean();
  if (expiredGrace) return { ok: false, reason: "EXPIRED_GRACE" };

  return { ok: false, reason: "INVALID" };
}
