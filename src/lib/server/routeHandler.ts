import { jsonError } from "./http";

export async function handleApiRoute(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (err) {
    console.error("[api]", err);
    const message = err instanceof Error ? err.message : "Unexpected server error";
    const lower = message.toLowerCase();
    if (
      lower.includes("mongoserverselectionerror") ||
      lower.includes("failed to connect") ||
      lower.includes("server environment not configured")
    ) {
      return jsonError("SERVICE_UNAVAILABLE", "Database or server configuration unavailable.", 503);
    }
    return jsonError("INTERNAL_ERROR", message, 500);
  }
}
