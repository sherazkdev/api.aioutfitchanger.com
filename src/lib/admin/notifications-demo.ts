/** Design-preview payload for Notifications (.pending-pages-design cf284174 / ffe401f4). */

export const DEMO_COMPOSE = {
  title: "Your next look is waiting",
  body: "Explore fresh styles and create your next look with AI Wardrobe.",
  image_url: "",
  deep_link: "home/try-on",
};

export const DEMO_SEND_RESULT = {
  targeted_devices: 1248,
  push_success: 1231,
  push_failure: 17,
  status: "partial",
};

export const DEMO_CAMPAIGNS = [
  {
    id: "demo-campaign-1",
    title: "Your next look is waiting",
    audience: "all",
    targeted_devices: 1248,
    push_success: 1231,
    push_failure: 17,
    status: "partial",
    sent_at: "2026-09-24T05:30:00.000Z",
  },
  {
    id: "demo-campaign-2",
    title: "New styles added to Beauty Lab",
    audience: "android",
    targeted_devices: 892,
    push_success: 892,
    push_failure: 0,
    status: "completed",
    sent_at: "2026-09-22T14:15:00.000Z",
  },
  {
    id: "demo-campaign-3",
    title: "Weekend try-on reminder",
    audience: "ios",
    targeted_devices: 356,
    push_success: 351,
    push_failure: 5,
    status: "partial",
    sent_at: "2026-09-20T09:00:00.000Z",
  },
  {
    id: "demo-campaign-4",
    title: "Beauty Lab — new hair color styles",
    audience: "all",
    targeted_devices: 2104,
    push_success: 2104,
    push_failure: 0,
    status: "completed",
    sent_at: "2026-09-18T11:20:00.000Z",
  },
];

export const DEMO_CAMPAIGN_DETAIL = {
  id: "demo-campaign-1",
  title: DEMO_COMPOSE.title,
  body: DEMO_COMPOSE.body,
  image_url: null as string | null,
  deep_link: DEMO_COMPOSE.deep_link,
  audience: "all",
  targeted_devices: 1248,
  push_success: 1231,
  push_failure: 17,
  status: "partial",
  sent_at: "2026-09-24T05:30:00.000Z",
};

export function isDemoCampaignId(id: string) {
  return id.startsWith("demo-campaign-");
}
