/** Firebase UID resolution helpers (gateway auth lives under auth/ + gatewayApiKey/). */
export { normalizeAndValidateFirebaseUid } from "./validateFirebaseUid";
export {
  resolveFirebaseUser,
  type ResolveFirebaseUserDeps,
} from "./resolveFirebaseUser";
export { safeEqualString, safeEqualHex } from "./timingSafe";
