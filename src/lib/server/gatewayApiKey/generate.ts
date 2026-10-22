import { randomBytes } from "crypto";

/** Cryptographically strong gateway API key (never for Flutter). */
export function generateGatewayApiKeyPlaintext(): string {
  return randomBytes(32).toString("base64url");
}

export function generateGatewayKeyId(): string {
  return `gak_${randomBytes(12).toString("hex")}`;
}
