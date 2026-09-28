export function formatAuditAction(action: string): string {
  const labels: Record<string, string> = {
    "token.export": "Exported token sessions (CSV)",
    "token.revoke": "Revoked token session",
    "token.bulk_revoke": "Bulk revoked token sessions",
    "token.self_revoke": "Revoked own admin session",
    "device.revoke": "Revoked device push token",
    "user.update": "Updated user",
    "user.delete": "Deleted user",
    "user.session_revoke": "Revoked user session",
    "broadcast.send": "Sent push broadcast",
    "broadcast.schedule": "Scheduled push broadcast",
    "broadcast.cancel": "Cancelled scheduled broadcast",
    "content.publish": "Published app content",
    "content.update": "Updated app content",
    "content.catalog_style": "Updated style catalog",
    "content.home_feed": "Updated home feed section",
    "content.wardrobe": "Updated wardrobe category",
  };
  return labels[action] ?? action.replace(/\./g, " · ");
}
