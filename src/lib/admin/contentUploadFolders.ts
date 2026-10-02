export const ADMIN_CONTENT_UPLOAD_FOLDERS = [
  "catalog",
  "home-feed",
  "onboarding",
  "notifications",
] as const;

export type AdminContentUploadFolder = (typeof ADMIN_CONTENT_UPLOAD_FOLDERS)[number];
