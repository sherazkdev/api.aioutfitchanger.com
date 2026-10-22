/** Failure reasons for Cloud Function → backend internal auth (Phase 1). */
export type CloudFunctionAuthFailureReason =
  | "MISSING_INTERNAL_AUTH"
  | "INVALID_INTERNAL_API_KEY"
  | "INVALID_FIREBASE_UID"
  | "INVALID_TIMESTAMP"
  | "EXPIRED_TIMESTAMP"
  | "INVALID_SIGNATURE"
  | "INTERNAL_AUTH_NOT_CONFIGURED";

export type CloudFunctionAuthConfig = {
  internalApiKey: string;
  hmacSecret: string;
  maxSkewSeconds: number;
};

export type CloudFunctionAuthSuccess = {
  ok: true;
  firebaseUid: string;
  timestamp: number;
};

export type CloudFunctionAuthFailure = {
  ok: false;
  reason: CloudFunctionAuthFailureReason;
};

export type CloudFunctionAuthResult = CloudFunctionAuthSuccess | CloudFunctionAuthFailure;

/** Header names (HTTP is case-insensitive; use these when setting/sending). */
export const CLOUD_FUNCTION_HEADERS = {
  apiKey: "X-Internal-API-Key",
  firebaseUid: "X-Firebase-Uid",
  timestamp: "X-Timestamp",
  signature: "X-Signature",
} as const;
