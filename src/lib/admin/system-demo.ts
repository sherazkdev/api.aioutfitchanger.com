/** Design-preview payload for System Status (.pending-pages-design e69e57e4). */

function hourly() {
  const pattern = [8, 12, 18, 28, 42, 55, 48, 62, 58, 44, 38, 32, 28, 35, 52, 68, 54, 40, 30, 22, 18, 14, 10, 8];
  return pattern.map((total, hour) => ({
    hour,
    completed: Math.max(0, total - 4 - (hour % 5 === 0 ? 2 : 0)),
    failed: hour % 7 === 3 ? 5 : hour % 11 === 8 ? 4 : 2,
    cancelled: hour % 9 === 2 ? 3 : 1,
  }));
}

export const DEMO_SYSTEM_STATUS = {
  mongodb: {
    status: "connected",
    latency_ms: 24,
    detail: "Connection check passed.",
  },
  fcm: {
    status: "ok",
    configured: true,
    detail: "Last send: OK · 10:28",
  },
  google_oauth: {
    status: "configured",
    client_ids_masked: ["Web: 12847551…", "iOS configured", "Android configured"],
  },
  bfl_api: {
    status: "configured",
    detail: "Last job poll: OK · 10:29",
  },
  environment: {
    app_url: "https://app.example.com",
    node_env: "production",
    mongo_host_masked: "cluster0.*****mongodb.net",
  },
  try_on_hourly_24h: hourly(),
  incident_log: {
    available: false,
    message: "No audit pipeline yet. Incidents will appear here once audit logging is connected.",
  },
  checked_at: "2026-09-24T05:30:00.000Z",
};
