export type AuditCategory = "all" | "token" | "device" | "user" | "broadcast" | "content";

const PREFIX: Record<Exclude<AuditCategory, "all">, string> = {
  token: "token.",
  device: "device.",
  user: "user.",
  broadcast: "broadcast.",
  content: "content.",
};

export function auditCategoryFilter(category: string | null | undefined): Record<string, unknown> | null {
  if (!category || category === "all") return null;
  const key = category as Exclude<AuditCategory, "all">;
  if (!PREFIX[key]) return null;
  return { action: { $regex: `^${PREFIX[key]}` } };
}

export function auditCategoryForAction(action: string): Exclude<AuditCategory, "all"> | "other" {
  for (const [cat, prefix] of Object.entries(PREFIX) as [Exclude<AuditCategory, "all">, string][]) {
    if (action.startsWith(prefix)) return cat;
  }
  return "other";
}

export const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = {
  all: "All events",
  token: "Token actions",
  device: "Device actions",
  user: "User actions",
  broadcast: "Broadcast actions",
  content: "Content / CMS",
};
