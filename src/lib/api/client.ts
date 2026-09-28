import { clearSession, getAccessToken, getRefreshToken, setSession } from "@/lib/auth/session";

type ApiEnvelope<T> = { data: T | null; error: { code: string; message: string } | null };

/** Pass on admin token revoke/export so the API can skip the current session. */
export function adminSessionHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const refresh = getRefreshToken();
  if (refresh) headers["x-refresh-session"] = refresh;
  return headers;
}

async function parseJson<T>(res: Response): Promise<ApiEnvelope<T>> {
  const text = await res.text();
  if (!text) {
    return { data: null, error: { code: "EMPTY_RESPONSE", message: "Empty response from server" } };
  }
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    return {
      data: null,
      error: { code: "INVALID_JSON", message: "Server returned invalid JSON" },
    };
  }
}

async function refreshAccess(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      credentials: "include",
    });

    const json = await parseJson<{
      access_token: string;
      refresh_token: string;
    }>(res);

    if (!res.ok || !json.data) {
      clearSession();
      return null;
    }

    setSession(json.data);
    return json.data.access_token;
  } catch {
    clearSession();
    return null;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  let token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    let res = await fetch(path, { ...init, headers, credentials: "include" });
    let json = await parseJson<T>(res);

    if (res.status === 401 && getRefreshToken()) {
      token = await refreshAccess();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        res = await fetch(path, { ...init, headers, credentials: "include" });
        json = await parseJson<T>(res);
      }
    }

    return json;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network request failed";
    return { data: null, error: { code: "NETWORK_ERROR", message } };
  }
}

export async function adminLogin(email: string, password: string) {
  try {
    const res = await fetch("/api/v1/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const json = await parseJson<{
      access_token: string;
      refresh_token: string;
      user: { id: string; email: string; role: string };
    }>(res);
    if (!res.ok || !json.data) {
      throw new Error(json.error?.message ?? "Login failed");
    }
    setSession(json.data);
    return json.data;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Login failed");
  }
}

export async function adminLogout() {
  const refresh = getRefreshToken();
  try {
    await fetch("/api/v1/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      credentials: "include",
    });
  } catch {
    // still clear local session
  }
  clearSession();
}
