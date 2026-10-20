export const USER_GENDERS = ["male", "female"] as const;
export type UserGender = (typeof USER_GENDERS)[number];

export function parseUserGender(input: unknown): UserGender | null {
  if (typeof input !== "string") return null;
  const value = input.trim().toLowerCase();
  if (value === "male" || value === "female") return value;
  return null;
}

export function styleGenderFromUserGender(gender: UserGender): "men" | "women" {
  return gender === "male" ? "men" : "women";
}

export function defaultPreferencesForGender(gender: UserGender) {
  return {
    themeMode: "system" as const,
    notificationsEnabled: true,
    languageId: "en_US",
    styleGenderPreference: styleGenderFromUserGender(gender),
    notifyJobFailures: true,
    notifyNewUsers: false,
  };
}

export function applyUserGender(
  user: {
    gender?: string | null;
    preferences?: { styleGenderPreference?: string } | null;
  },
  gender: UserGender
) {
  const isFirstGender = user.gender !== "male" && user.gender !== "female";
  user.gender = gender;
  if (!isFirstGender) return;

  if (!user.preferences) {
    user.preferences = defaultPreferencesForGender(gender);
  } else {
    user.preferences.styleGenderPreference = styleGenderFromUserGender(gender);
  }
}
