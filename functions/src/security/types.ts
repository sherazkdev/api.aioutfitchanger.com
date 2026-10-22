/** Header names expected by the Next.js backend (case-insensitive). */
export const BACKEND_AUTH_HEADERS = {
  apiKey: "X-Internal-API-Key",
  firebaseUid: "X-Firebase-Uid",
  timestamp: "X-Timestamp",
  signature: "X-Signature",
} as const;

export type SignBackendRequestInput = {
  method: string;
  /** pathname + search only, e.g. `/api/v1/internal/cloud-function/ping` */
  pathWithQuery: string;
  firebaseUid: string;
  /** Exact raw body text that will be sent. Use "" for empty body. */
  rawBody: string;
  internalApiKey: string;
  hmacSecret: string;
  /** Optional fixed Unix seconds for tests. */
  timestampSeconds?: number;
};

export type SignedBackendRequest = {
  method: string;
  pathWithQuery: string;
  firebaseUid: string;
  /** Unix seconds as decimal digit string — same value placed in X-Timestamp and HMAC. */
  timestamp: string;
  rawBody: string;
  bodySha256Hex: string;
  signature: string;
  headers: Record<string, string>;
};
