import { catalogThumbs, jobMedia, lookMedia, pakistaniOutfits } from "./media";

export const overviewStats = [
  { label: "Total Users", value: "12,480", change: "+12.4%" },
  { label: "Try-On Jobs", value: "8,240", change: "+5.8%" },
  { label: "Completed", value: "7,952", change: "+8.1%" },
  { label: "Catalog Styles", value: "528", change: "+2.3%" },
];

export const tryOnActivity = {
  current: [1200, 1800, 1500, 2200, 1900, 2400, 2100],
  previous: [1000, 1400, 1300, 1800, 1600, 2000, 1700],
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export const jobStatus = [
  { label: "Completed", value: 7952, color: "#22c55e" },
  { label: "Processing", value: 164, color: "#a855f7" },
  { label: "Failed", value: 124, color: "#ef4444" },
];

export const recentJobs = [
  { id: "JOB-1048", user: "Ayesha Khan", avatar: "/media/avatars/ayesha.jpg", style: "pakistani_women_01", created: "Today, 10:24", status: "Completed" },
  { id: "JOB-1047", user: "Omar Ali", avatar: "/media/avatars/omar.jpg", style: "hijab_women_03", created: "Today, 09:15", status: "Processing" },
  { id: "JOB-1046", user: "Fatima Noor", avatar: "/media/avatars/fatima.jpg", style: "indian_women_02", created: "Yesterday", status: "Completed" },
  { id: "JOB-1045", user: "Hassan Raza", avatar: "/media/avatars/hassan.jpg", style: "beard_men_01", created: "Yesterday", status: "Failed" },
  { id: "JOB-1044", user: "Sara Malik", avatar: "/media/avatars/sara.jpg", style: "casual_women_04", created: "Mar 20", status: "Completed" },
];

export const catalogCollections = [
  { name: "Virtual Try-On", count: 280, color: "#3b82f6" },
  { name: "Hair Styles", count: 72, color: "#22c55e" },
  { name: "Hair Color", count: 48, color: "#0ea5e9" },
  { name: "Beard Styles", count: 36, color: "#60a5fa" },
  { name: "Hijab", count: 32, color: "#9ca3af" },
  { name: "Occasions", count: 60, color: "#f97316" },
];

export const notifications = [
  { title: "Generation failed", time: "Just now", type: "error" as const },
  { title: "New user registered", time: "59 minutes ago", type: "user" as const },
  { title: "Generation completed", time: "12 hours ago", type: "success" as const },
];

export const activities = [
  { text: "Updated Pakistani Traditional previews", time: "Just now", avatar: "/media/avatars/ayesha.jpg" },
  { text: "JOB-1048 completed for Ayesha Khan", time: "32 minutes ago", avatar: "/media/avatars/ayesha.jpg" },
  { text: "Reordered wardrobe categories", time: "2 hours ago", avatar: "/media/avatars/ayesha.jpg" },
  { text: "Added LOOK-2048 to history", time: "5 hours ago", avatar: "/media/avatars/ayesha.jpg" },
];

const catalogMeta = [
  { order: "01", name: "Emerald Shalwar", id: "pakistani_women_01", type: "Traditional", gender: "Women" },
  { order: "02", name: "Rose Anarkali", id: "pakistani_women_02", type: "Traditional", gender: "Women" },
  { order: "03", name: "Ivory Ensemble", id: "pakistani_women_03", type: "Traditional", gender: "Women" },
  { order: "04", name: "Qipao Classic", id: "chinese_women_01", type: "Traditional", gender: "Women" },
  { order: "05", name: "Hanbok Silk", id: "korean_women_01", type: "Traditional", gender: "Women" },
  { order: "06", name: "Abaya Gold", id: "arabian_women_01", type: "Traditional", gender: "Women" },
  { order: "07", name: "Hijab Formal", id: "hijab_women_03", type: "Hijab", gender: "Women" },
  { order: "08", name: "Casual Street", id: "casual_women_04", type: "Casual", gender: "Women" },
  { order: "09", name: "Indian Saree", id: "indian_women_02", type: "Traditional", gender: "Women" },
  { order: "10", name: "Try-On Result", id: "result_preview_01", type: "Generated", gender: "Women" },
];

export const styleCatalog = catalogMeta.map((row, i) => ({
  ...row,
  image: catalogThumbs[i] ?? catalogThumbs[0],
}));

export const categories = [
  { name: "Virtual Try-On", id: "virtual_try_on", titleKey: "homeVirtualTryOn", gender: "Both", tabs: 5, icon: "shirt" },
  { name: "Hair Styles", id: "hair_styles", titleKey: "homeHairStyles", gender: "Both", tabs: 3, icon: "scissors" },
  { name: "Hair Color", id: "hair_color", titleKey: "homeHairColor", gender: "Both", tabs: 3, icon: "palette" },
  { name: "Beard Styles", id: "beard_styles", titleKey: "homeBeardStyles", gender: "Men", tabs: 4, icon: "user" },
  {
    name: "Hijab", id: "hijab", titleKey: "homeHijab", gender: "Women", tabs: 3, icon: "hijab", expanded: true,
    subTabs: [
      { name: "Everyday", id: "everyday", titleKey: "hijabTabEveryday" },
      { name: "Formal", id: "formal", titleKey: "hijabTabFormal" },
      { name: "Occasion", id: "occasion", titleKey: "hijabTabOccasion" },
    ],
  },
  { name: "Occasions", id: "occasions", titleKey: "homeOccasions", gender: "Both", tabs: 4, icon: "calendar" },
];

export const homeFeedSections = [
  { order: "01", name: "Beauty Lab", id: "beauty_lab", layout: "Category cards", category: "Multiple categories", items: 4, expanded: false },
  {
    order: "02", name: "Occasions", id: "occasions", layout: "Image rail", category: "occasions", items: 6, expanded: true,
    sectionItems: [
      { order: "01", style: "Casual Look", id: "occasions_casual_women_01", label: "Casual", image: catalogThumbs[7] },
      { order: "02", style: "Wedding Look", id: "occasions_wedding_women_01", label: "Wedding", image: catalogThumbs[1] },
      { order: "03", style: "Party Look", id: "occasions_party_women_01", label: "Party", image: catalogThumbs[2] },
      { order: "04", style: "Formal Look", id: "occasions_formal_women_01", label: "Formal", image: catalogThumbs[6] },
    ],
  },
  { order: "03", name: "Couple / Duo", id: "couple_duo", layout: "Image rail", category: "couple", items: 4, expanded: false },
];

export const homeSectionItems = [
  { order: "01", style: "Casual Look", id: "occasions_casual_women_01", label: "Casual", image: catalogThumbs[7] },
  { order: "02", style: "Wedding Look", id: "occasions_wedding_women_01", label: "Wedding", image: catalogThumbs[1] },
  { order: "03", style: "Party Look", id: "occasions_party_women_01", label: "Party", image: catalogThumbs[2] },
  { order: "04", style: "Formal Look", id: "occasions_formal_women_01", label: "Formal", image: catalogThumbs[6] },
];

export const breadcrumbs: Record<string, string[]> = {
  "/admin/overview": ["Dashboard", "Overview"],
  "/admin/style-catalog": ["Dashboard", "Style Catalog"],
  "/admin/style-catalog/add": ["Dashboard", "Style Catalog", "Add Style"],
  "/admin/style-catalog/edit": ["Dashboard", "Style Catalog", "Edit Style"],
  "/admin/categories": ["Dashboard", "Style Catalog", "Categories"],
  "/admin/categories/add": ["Dashboard", "Style Catalog", "Categories", "Add Category"],
  "/admin/categories/edit": ["Dashboard", "Style Catalog", "Categories", "Edit Category"],
  "/admin/home-feed": ["Dashboard", "Home Feed"],
  "/admin/home-feed/add": ["Dashboard", "Home Feed", "Add Section"],
  "/admin/home-feed/edit": ["Dashboard", "Home Feed", "Edit Section"],
  "/admin/wardrobe-categories": ["Dashboard", "Wardrobe Categories"],
  "/admin/wardrobe-categories/add": ["Dashboard", "Wardrobe Categories", "Add category"],
  "/admin/wardrobe-categories/edit": ["Dashboard", "Wardrobe Categories", "Edit category"],
  "/admin/try-on-jobs": ["Dashboard", "Try-On Jobs"],
  "/admin/try-on-jobs/details": ["Dashboard", "Try-On Jobs", "JOB-1048"],
  "/admin/users": ["Dashboard", "Users"],
  "/admin/users/detail": ["Dashboard", "Users", "User details"],
  "/admin/app-content": ["Dashboard", "App Content"],
  "/admin/account": ["Dashboard", "Admin Account"],
  "/admin/token-management": ["Dashboard", "Token management"],
  "/admin/looks-history": ["Dashboard", "Looks / History"],
  "/admin/looks-history/details": ["Dashboard", "Looks / History", "LOOK-2048"],
  "/admin/notifications": ["Dashboard", "Notifications"],
  "/admin/notifications/campaigns/details": ["Dashboard", "Notifications", "Campaign details"],
  "/admin/devices": ["Dashboard", "Notifications", "Device Registry"],
  "/admin/system": ["Dashboard", "System Status"],
};

export const pakistaniPreviewStyles = pakistaniOutfits;

export const wardrobeCategories = [
  {
    name: "Chinese Traditional",
    id: "chinese_traditional",
    browseTab: "chinese",
    previews: ["/media/outfits/chinese-01.jpg", "/media/outfits/pakistani-02.jpg", "/media/outfits/korean-01.jpg"],
    expanded: false,
  },
  {
    name: "Indian Traditional",
    id: "indian_traditional",
    browseTab: "indian",
    previews: ["/media/outfits/pakistani-03.jpg", "/media/outfits/pakistani-01.jpg", "/media/outfits/arabian-01.jpg"],
    expanded: false,
  },
  {
    name: "Korean Traditional",
    id: "korean_traditional",
    browseTab: "korean",
    previews: ["/media/outfits/korean-01.jpg", "/media/outfits/pakistani-02.jpg", "/media/outfits/chinese-01.jpg"],
    expanded: false,
  },
  {
    name: "Arabian Traditional",
    id: "arabian_traditional",
    browseTab: "arabian",
    previews: ["/media/outfits/arabian-01.jpg", "/media/outfits/pakistani-03.jpg", "/media/outfits/pakistani-01.jpg"],
    expanded: false,
  },
  {
    name: "Pakistani Traditional",
    id: "pakistani_traditional",
    browseTab: "pakistani",
    titleKey: "wardrobePakistaniTraditional",
    bgToken: "pakistani_traditional_bg",
    previews: pakistaniOutfits.map((o) => o.image),
    expanded: true,
    previewStyles: pakistaniPreviewStyles,
  },
];

export const tryOnJobsList = [
  { id: "JOB-1048", source: "/media/sources/source-white.jpg", styleId: "pakistani_women_01", category: "Pakistani", status: "Completed", result: "/media/results/result-01.jpg" },
  { id: "JOB-1047", source: "/media/sources/source-04.jpg", styleId: "hijab_women_03", category: "Hijab", status: "Processing", result: null },
  { id: "JOB-1046", source: "/media/sources/source-03.jpg", styleId: "hair_men_02", category: "Hair Style", status: "Completed", result: "/media/results/result-thumb-01.jpg" },
  { id: "JOB-1045", source: "/media/sources/source-05.jpg", styleId: "beard_men_01", category: "Beard", status: "Failed", result: null, failed: true },
  { id: "JOB-1044", source: "/media/avatars/fatima.jpg", styleId: "indian_women_02", category: "Indian", status: "Completed", result: "/media/outfits/pakistani-02.jpg" },
  { id: "JOB-1043", source: "/media/avatars/omar.jpg", styleId: "korean_women_01", category: "Korean", status: "Queued", result: null },
  { id: "JOB-1042", source: "/media/sources/source-02.jpg", styleId: "casual_women_04", category: "Casual", status: "Cancelled", result: null },
  { id: "JOB-1041", source: "/media/avatars/hassan.jpg", styleId: "arabian_women_01", category: "Arabian", status: "Completed", result: "/media/results/result-thumb-02.jpg" },
];

export const jobDetail = {
  id: "JOB-1048",
  status: "Completed",
  category: "Pakistani Traditional",
  categoryId: "pakistani_traditional",
  styleId: "pakistani_women_01",
  sourceImage: jobMedia.source,
  styleImage: jobMedia.style,
  resultImage: jobMedia.result,
  prompt:
    "Dress the person in an emerald green Pakistani shalwar kameez with delicate gold embroidery and a matching dupatta. Preserve the face, pose and background.",
};

export const usersList = [
  { name: "Ayesha Khan", email: "ayesha@example.com", uid: "u_8f2a41", type: "Registered", avatar: "/media/avatars/ayesha.jpg" },
  { name: "Omar Ali", email: "omar@example.com", uid: "u_9c1b22", type: "Registered", avatar: "/media/avatars/omar.jpg" },
  { name: "Guest", email: null, uid: "u_guest_01", type: "Guest", avatar: null },
  { name: "Fatima Noor", email: "fatima@example.com", uid: "u_3d4e55", type: "Registered", avatar: "/media/avatars/fatima.jpg" },
  { name: "Guest", email: null, uid: "u_guest_02", type: "Guest", avatar: null },
  { name: "Hassan Raza", email: "hassan@example.com", uid: "u_7a8b90", type: "Registered", avatar: "/media/avatars/hassan.jpg" },
  { name: "Sara Malik", email: "sara@example.com", uid: "u_1f2c33", type: "Registered", avatar: "/media/avatars/sara.jpg" },
  { name: "Guest", email: null, uid: "u_guest_03", type: "Guest", avatar: null },
];

export const looksHistory = [
  { id: "LOOK-2048", result: "/media/outfits/pakistani-01.jpg", source: "/media/sources/source-white.jpg", styleId: "pakistani_women_01", category: "Pakistani", created: "Sep 23, 2026", favorite: true },
  { id: "LOOK-2047", result: "/media/outfits/pakistani-02.jpg", source: "/media/sources/source-04.jpg", styleId: "hijab_women_03", category: "Hijab", created: "Sep 23, 2026", favorite: false },
  { id: "LOOK-2046", result: "/media/results/result-thumb-01.jpg", source: "/media/sources/source-03.jpg", styleId: "hair_men_02", category: "Hair Style", created: "Sep 22, 2026", favorite: true },
  { id: "LOOK-2045", result: "/media/outfits/pakistani-03.jpg", source: "/media/sources/source-05.jpg", styleId: "beard_men_01", category: "Beard", created: "Sep 22, 2026", favorite: false },
  { id: "LOOK-2044", result: "/media/outfits/pakistani-02.jpg", source: "/media/avatars/fatima.jpg", styleId: "indian_women_02", category: "Indian", created: "Sep 21, 2026", favorite: true },
  { id: "LOOK-2043", result: "/media/outfits/korean-01.jpg", source: "/media/sources/source-02.jpg", styleId: "korean_women_01", category: "Korean", created: "Sep 21, 2026", favorite: false },
  { id: "LOOK-2042", result: "/media/results/result-thumb-02.jpg", source: "/media/avatars/omar.jpg", styleId: "casual_women_04", category: "Casual", created: "Sep 20, 2026", favorite: false },
  { id: "LOOK-2041", result: "/media/outfits/arabian-01.jpg", source: "/media/avatars/hassan.jpg", styleId: "arabian_women_01", category: "Arabian", created: "Sep 20, 2026", favorite: true },
];

export const lookDetail = {
  id: "LOOK-2048",
  created: "Sep 23, 2026",
  category: "Pakistani Traditional",
  categoryId: "pakistani_traditional",
  styleId: "pakistani_women_01",
  favorite: true,
  sourceImage: lookMedia.source,
  resultImage: lookMedia.result,
};
