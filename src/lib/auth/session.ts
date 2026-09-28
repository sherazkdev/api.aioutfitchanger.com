const ACCESS_KEY = "ai_wardrobe_access_token";
const REFRESH_KEY = "ai_wardrobe_refresh_token";

function safeSessionGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return safeSessionGet(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return safeLocalGet(REFRESH_KEY);
}

export function setSession(tokens: { access_token: string; refresh_token?: string }) {
  try {
    sessionStorage.setItem(ACCESS_KEY, tokens.access_token);
    if (tokens.refresh_token) localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  } catch {
    // storage blocked
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // ignore
  }
}
