/** Rich preview payload for user detail design QA (matches .pending-pages-design user detail PNG). */

type Profile = {
  id: string;
  display_name?: string | null;
  email?: string | null;
  photo_url?: string | null;
  uid: string;
  role: string;
  status: string;
  created_at: string | null;
  last_active: string | null;
  is_guest?: boolean;
};

export function buildUserDetailDemo(profile: Profile) {
  const now = Date.now();
  const iso = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();
  const day = (d: number, h = 10, m = 0) => {
    const t = new Date();
    t.setDate(t.getDate() - d);
    t.setHours(h, m, 0, 0);
    return t.toISOString();
  };

  return {
    profile: {
      ...profile,
      display_name: "Ayesha Khan",
      email: "ayesha@example.com",
      photo_url: profile.photo_url || "/media/avatars/ayesha.jpg",
      uid: profile.uid,
      role: "user",
      status: profile.status === "disabled" ? "disabled" : "active",
      created_at: profile.created_at ?? day(12, 9, 18),
      last_active: profile.last_active ?? iso(12),
    },
    auth_providers: { email: true, google: true },
    preferences: {
      language: "English",
      theme: "System",
      gender: "Women",
      notifications: "Enabled",
    },
    stats: {
      try_on_jobs: 128,
      completed: 116,
      failed: 12,
      saved_looks: 42,
    },
    devices: [
      { id: "dev-1", label: "iPhone 15 Pro", platform: "ios", device_id: "ios_a1b2c3", last_seen_at: iso(12) },
      { id: "dev-2", label: "Pixel 8", platform: "android", device_id: "and_d4e5f6", last_seen_at: iso(180) },
      { id: "dev-3", label: "iPad Air", platform: "ios", device_id: "ios_g7h8i9", last_seen_at: day(1, 14, 22) },
      { id: "dev-4", label: "Samsung S24", platform: "android", device_id: "and_j0k1l2", last_seen_at: day(3, 8, 5) },
      { id: "dev-5", label: "iPhone 13", platform: "ios", device_id: "ios_m3n4o5", last_seen_at: day(8, 19, 40) },
    ],
    recent_jobs: [
      { id: "JOB-1048", style: "pakistani_women_01", status: "completed", created_at: iso(45) },
      { id: "JOB-1047", style: "hijab_women_03", status: "completed", created_at: iso(120) },
      { id: "JOB-1046", style: "indian_women_02", status: "failed", created_at: day(1, 11, 30) },
      { id: "JOB-1045", style: "casual_women_04", status: "completed", created_at: day(2, 16, 12) },
      { id: "JOB-1044", style: "occasions_wedding_women_01", status: "completed", created_at: day(4, 9, 8) },
    ],
    recent_looks: [
      { id: "LOOK-2048", preview_url: "/media/results/result-thumb-01.jpg", style: "pakistani_women_01", created_at: iso(50), is_favorite: true },
      { id: "LOOK-2047", preview_url: "/media/results/result-thumb-02.jpg", style: "hijab_women_03", created_at: iso(200), is_favorite: false },
      { id: "LOOK-2046", preview_url: "/media/outfits/pakistani-02.jpg", style: "indian_women_02", created_at: day(1, 12, 0), is_favorite: true },
      { id: "LOOK-2045", preview_url: "/media/outfits/style-green.jpg", style: "casual_women_04", created_at: day(3, 10, 15), is_favorite: false },
    ],
    sessions: [
      { id: "sess-1", status: "active", expires_at: iso(-60 * 24 * 7), device_id: "ios_a1b2c3" },
      { id: "sess-2", status: "active", expires_at: iso(-60 * 24 * 3), device_id: "and_d4e5f6" },
      { id: "sess-3", status: "expired", expires_at: iso(60 * 24 * 2), device_id: "ios_g7h8i9" },
    ],
    _demo: true as const,
  };
}
