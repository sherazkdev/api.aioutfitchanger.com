export const USER_GENDERS = ["male", "female"] as const;
export type UserGender = (typeof USER_GENDERS)[number];

export function parseUserGender(input: unknown): UserGender | null {
  if (typeof input !== "string") return null;
  const value = input.trim().toLowerCase();
  if (value === "male" || value === "female") return value;
  return null;
}

/** Google id_token, People API, or app-sent Google profile object. */
export function extractGenderFromGoogleProfile(input: unknown): UserGender | null {
  const direct = parseUserGender(input);
  if (direct) return direct;
  if (!input || typeof input !== "object") return null;

  const obj = input as Record<string, unknown>;
  const fromField =
    parseUserGender(obj.gender) ??
    parseUserGender(obj.gender_type) ??
    parseUserGender(obj.sex);
  if (fromField) return fromField;

  if (Array.isArray(obj.genders) && obj.genders.length > 0) {
    const first = obj.genders[0];
    if (typeof first === "string") return parseUserGender(first);
    if (first && typeof first === "object") {
      const gender = first as Record<string, unknown>;
      return parseUserGender(gender.value) ?? parseUserGender(gender.formattedValue);
    }
  }

  if (obj.profile && typeof obj.profile === "object") {
    return extractGenderFromGoogleProfile(obj.profile);
  }
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
