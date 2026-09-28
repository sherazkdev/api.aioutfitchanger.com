/** Design-preview payload for Device Registry (.pending-pages-design a5c9e45d). */

export const DEMO_KPIS = {
  total_devices: 1248,
  active_7d: 1036,
  stale_30d: 94,
  platform_split: {
    ios: 388,
    android: 860,
    ios_pct: 31.1,
    android_pct: 68.9,
  },
};

const now = Date.now();
const ago = (mins: number) => new Date(now - mins * 60_000).toISOString();
const daysAgo = (d: number, h = 12) => {
  const t = new Date(now);
  t.setDate(t.getDate() - d);
  t.setHours(h, 0, 0, 0);
  return t.toISOString();
};

export const DEMO_ITEMS = [
  {
    id: "demo-dev-1",
    user_email: "sara@example.com",
    platform: "android",
    device_id: "dev_and_01",
    app_version: "1.4.2",
    last_seen_at: ago(5),
    fcm_token_suffix: "a7b2",
    status: "active",
    revoked_at: null,
  },
  {
    id: "demo-dev-2",
    user_email: "ayesha@example.com",
    platform: "ios",
    device_id: "dev_ios_02",
    app_version: "1.4.2",
    last_seen_at: ago(120),
    fcm_token_suffix: "c9f1",
    status: "active",
    revoked_at: null,
  },
  {
    id: "demo-dev-3",
    user_email: "omar@example.com",
    platform: "android",
    device_id: "dev_and_03",
    app_version: "1.4.1",
    last_seen_at: daysAgo(2),
    fcm_token_suffix: "e3d8",
    status: "stale",
    revoked_at: null,
  },
  {
    id: "demo-dev-4",
    user_email: "fatima@example.com",
    platform: "ios",
    device_id: "dev_ios_04",
    app_version: "1.4.0",
    last_seen_at: daysAgo(45),
    fcm_token_suffix: "1a4e",
    status: "revoked",
    revoked_at: daysAgo(40, 9),
  },
  {
    id: "demo-dev-5",
    user_email: "hassan@example.com",
    platform: "android",
    device_id: "dev_and_05",
    app_version: "1.4.2",
    last_seen_at: ago(30),
    fcm_token_suffix: "8b0c",
    status: "active",
    revoked_at: null,
  },
  {
    id: "demo-dev-6",
    user_email: "alex.morgan@aiwardrobe.com",
    platform: "ios",
    device_id: "dev_ios_admin",
    app_version: "1.4.2",
    last_seen_at: ago(15),
    fcm_token_suffix: "f2aa",
    status: "active",
    revoked_at: null,
  },
];

export const DEMO_CHART = [
  { date: "2026-09-11", count: 42 },
  { date: "2026-09-12", count: 58 },
  { date: "2026-09-13", count: 51 },
  { date: "2026-09-14", count: 67 },
  { date: "2026-09-15", count: 72 },
  { date: "2026-09-16", count: 64 },
  { date: "2026-09-17", count: 81 },
  { date: "2026-09-18", count: 76 },
  { date: "2026-09-19", count: 88 },
  { date: "2026-09-20", count: 92 },
  { date: "2026-09-21", count: 85 },
  { date: "2026-09-22", count: 79 },
  { date: "2026-09-23", count: 94 },
  { date: "2026-09-24", count: 86 },
];
