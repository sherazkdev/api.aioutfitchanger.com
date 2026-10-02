import { OAuth2Client } from "google-auth-library";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { googleClientIds } from "../env";
import { initFirebaseAdmin } from "../fcm";

export type GoogleProfile = {
  googleId: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
};

function profileFromGoogleOAuth(payload: {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
}): GoogleProfile {
  if (!payload.sub) throw new Error("INVALID_GOOGLE_TOKEN");
  return {
    googleId: payload.sub,
    email: payload.email,
    displayName: payload.name,
    photoUrl: payload.picture,
  };
}

function profileFromFirebaseIdToken(decoded: DecodedIdToken): GoogleProfile {
  const provider = decoded.firebase?.sign_in_provider;
  if (provider !== "google.com") {
    throw new Error("INVALID_GOOGLE_TOKEN");
  }
  const googleIdentities = decoded.firebase?.identities?.["google.com"];
  const googleId =
    Array.isArray(googleIdentities) && typeof googleIdentities[0] === "string"
      ? googleIdentities[0]
      : decoded.sub;

  return {
    googleId,
    email: decoded.email,
    displayName: decoded.name,
    photoUrl: decoded.picture,
  };
}

async function verifyWithGoogleOAuth(idToken: string): Promise<GoogleProfile> {
  const audiences = googleClientIds();
  if (audiences.length === 0) {
    throw new Error("GOOGLE_CLIENT_IDS_NOT_CONFIGURED");
  }
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: audiences,
  });
  return profileFromGoogleOAuth(ticket.getPayload() ?? {});
}

async function verifyWithFirebase(idToken: string): Promise<GoogleProfile> {
  if (!initFirebaseAdmin()) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }
  const decoded = await getAuth().verifyIdToken(idToken);
  return profileFromFirebaseIdToken(decoded);
}

/**
 * Accepts either a native Google Sign-In id_token (OAuth client audience)
 * or a Firebase Auth id_token from Google sign-in (securetoken.google.com).
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const audiences = googleClientIds();
  const oauthConfigured = audiences.length > 0;

  if (oauthConfigured) {
    try {
      return await verifyWithGoogleOAuth(idToken);
    } catch {
      // Firebase Google sign-in issues JWTs verified by Admin SDK, not OAuth audiences.
    }
  }

  try {
    return await verifyWithFirebase(idToken);
  } catch {
    if (!oauthConfigured) {
      throw new Error("GOOGLE_CLIENT_IDS_NOT_CONFIGURED");
    }
    throw new Error("INVALID_GOOGLE_TOKEN");
  }
}
