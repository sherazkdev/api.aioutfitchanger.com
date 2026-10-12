/** Trim + lowercase for lookups and Resend delivery. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
