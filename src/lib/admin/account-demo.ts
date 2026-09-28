/** Design-preview payload for Admin Account (matches .pending-pages-design). */

export const DEMO_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face";

export const DEMO_SESSIONS = [
  {
    id: "demo-sess-1",
    is_current: true,
    label: "Chrome · Windows (This device)",
    ip: "203.0.113.24",
    last_used_at: new Date().toISOString(),
    expires_in_ms: 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
    ttl_elapsed_percent: 35,
    status: "active",
  },
  {
    id: "demo-sess-2",
    is_current: false,
    label: "Safari · iPhone",
    ip: "198.51.100.8",
    last_used_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_in_ms: 5 * 24 * 60 * 60 * 1000,
    ttl_elapsed_percent: 48,
    status: "active",
  },
  {
    id: "demo-sess-3",
    is_current: false,
    label: "Firefox · macOS",
    ip: "192.0.2.44",
    last_used_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expires_in_ms: 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000,
    ttl_elapsed_percent: 72,
    status: "active",
  },
];
