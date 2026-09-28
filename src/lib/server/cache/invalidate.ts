import { invalidateCacheKeysWithPrefix } from "./ttl";

/** Call after admin CMS writes so mobile/public APIs see fresh content immediately. */
export function invalidatePublicContentCache(): void {
  invalidateCacheKeysWithPrefix("app:");
  invalidateCacheKeysWithPrefix("home:");
  invalidateCacheKeysWithPrefix("catalog:");
  invalidateCacheKeysWithPrefix("wardrobe:");
  invalidateCacheKeysWithPrefix("onboarding:");
}
