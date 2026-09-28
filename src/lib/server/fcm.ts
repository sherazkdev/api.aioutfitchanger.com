import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getServerEnv } from "./env";

let initialized = false;

export function initFirebaseAdmin(): boolean {
  if (initialized) return true;
  const env = getServerEnv();
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    return false;
  }
  const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
  initialized = true;
  return true;
}

export function fcmStatus(): "connected" | "not_configured" | "error" {
  try {
    if (!initFirebaseAdmin()) return "not_configured";
    return getApps().length > 0 ? "connected" : "error";
  } catch {
    return "error";
  }
}

export async function sendPushToTokens(
  tokens: string[],
  notification: { title: string; body: string; data?: Record<string, string> }
): Promise<{ success: number; failure: number }> {
  if (!initFirebaseAdmin() || tokens.length === 0) {
    return { success: 0, failure: tokens.length };
  }
  const res = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title: notification.title, body: notification.body },
    data: notification.data,
  });
  return { success: res.successCount, failure: res.failureCount };
}
