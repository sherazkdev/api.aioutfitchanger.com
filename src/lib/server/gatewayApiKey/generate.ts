import { randomBytes } from "crypto";

const ALPHANUM =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const KEY_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9]{40,}$/;

/** Cryptographically strong gateway API key (never for Flutter). */
export function generateGatewayApiKeyPlaintext(length = 48): string {
  const len = Math.max(40, Math.min(128, Math.floor(length)));
  for (;;) {
    const bytes = randomBytes(len);
    let out = "";
    for (let i = 0; i < len; i++) {
      out += ALPHANUM[bytes[i]! % ALPHANUM.length]!;
    }
    if (KEY_RE.test(out)) return out;
  }
}

export function generateGatewayKeyId(): string {
  return `gak_${randomBytes(12).toString("hex")}`;
}
