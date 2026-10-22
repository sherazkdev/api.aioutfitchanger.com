import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALG = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_BYTES = 32;

export type SealedGatewayKey = {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: "aes-256-gcm-v1";
};

function decodeMasterKey(raw: string): Buffer {
  const trimmed = raw.trim();
  // Prefer base64url / base64 of 32 bytes; also accept 64-char hex.
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }
  const b64 = Buffer.from(trimmed.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  if (b64.length === KEY_BYTES) return b64;
  // Derive a stable 32-byte key from longer secrets (env often holds a long passphrase).
  return createHash("sha256").update(trimmed, "utf8").digest();
}

export function loadGatewayMasterKey(envValue = process.env.GATEWAY_API_KEY_MASTER_KEY): Buffer {
  const raw = envValue?.trim();
  if (!raw || raw.length < 32) {
    throw new Error("GATEWAY_API_KEY_MASTER_KEY_MISSING");
  }
  return decodeMasterKey(raw);
}

export function sealGatewayApiKey(plaintext: string, masterKey?: Buffer): SealedGatewayKey {
  const key = masterKey ?? loadGatewayMasterKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALG, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: enc.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    version: "aes-256-gcm-v1",
  };
}

export function openGatewayApiKey(
  sealed: { ciphertext: string; iv: string; authTag: string },
  masterKey?: Buffer
): string {
  const key = masterKey ?? loadGatewayMasterKey();
  const decipher = createDecipheriv(ALG, key, Buffer.from(sealed.iv, "base64"));
  decipher.setAuthTag(Buffer.from(sealed.authTag, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(sealed.ciphertext, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export function fingerprintGatewayApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext, "utf8").digest("hex");
}

export function lastFourOfKey(plaintext: string): string {
  const s = plaintext.replace(/\s/g, "");
  return s.length <= 4 ? s : s.slice(-4);
}
