import { OAuth2Client } from "google-auth-library";
import { googleClientIds } from "../env";

export type GoogleProfile = {
  googleId: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
};

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const audiences = googleClientIds();
  if (audiences.length === 0) {
    throw new Error("GOOGLE_CLIENT_IDS_NOT_CONFIGURED");
  }
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: audiences,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub) throw new Error("INVALID_GOOGLE_TOKEN");

  return {
    googleId: payload.sub,
    email: payload.email,
    displayName: payload.name,
    photoUrl: payload.picture,
  };
}
