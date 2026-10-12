import { getClientIp } from "../http";

function allowedIps(): Set<string> {
  const raw = process.env.ADMIN_IP_ALLOWLIST?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export function adminIpRestrictionEnabled(): boolean {
  return allowedIps().size > 0;
}

export function isAdminIpAllowed(req: Request): boolean {
  const list = allowedIps();
  if (list.size === 0) return true;
  const ip = getClientIp(req);
  if (!ip) return false;
  return list.has(ip);
}
