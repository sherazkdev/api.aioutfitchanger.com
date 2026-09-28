import { verifyAccessToken } from "./tokens";
import { getCachedUserGate, setCachedUserGate } from "./userAuthCache";
import { jsonError } from "../http";
import { connectMongo } from "../db";
import { User } from "../models/User";

export type AuthContext = {
  payload: { userId: string; role: string };
  admin?: { email: string | null; role: string };
};

export async function requireAuth(req: Request, roles?: ("admin" | "user")[]) {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return { error: jsonError("UNAUTHORIZED", "Missing bearer token", 401) };

  try {
    const payload = await verifyAccessToken(token);
    const allowed = roles ?? (["user", "admin"] as const);
    const role = payload.role as "admin" | "user";

    if (!allowed.includes(role)) {
      return { error: jsonError("FORBIDDEN", "Insufficient role", 403) };
    }

    await connectMongo();
    const cached = getCachedUserGate(payload.userId);
    let userRole: string;
    let userStatus: string;
    let userEmail: string | null | undefined = cached?.email;

    if (cached) {
      userRole = cached.role;
      userStatus = cached.status;
    } else {
      const user = await User.findById(payload.userId).select("role status email").lean();
      if (!user || user.status === "disabled") {
        return { error: jsonError("FORBIDDEN", "Account disabled", 403) };
      }
      userRole = user.role;
      userStatus = user.status;
      userEmail = user.email;
      setCachedUserGate(payload.userId, userRole, userStatus, userEmail);
    }

    if (userStatus === "disabled") {
      return { error: jsonError("FORBIDDEN", "Account disabled", 403) };
    }

    if (role === "admin") {
      if (userRole !== "admin") {
        return { error: jsonError("FORBIDDEN", "Admin access required", 403) };
      }
      return {
        payload,
        admin: { email: userEmail ?? null, role: userRole },
      } satisfies AuthContext;
    }

    return { payload } satisfies AuthContext;
  } catch {
    return { error: jsonError("UNAUTHORIZED", "Invalid or expired access token", 401) };
  }
}

export function auditActor(auth: AuthContext): { userId: string; email?: string | null } {
  return { userId: auth.payload.userId, email: auth.admin?.email };
}
