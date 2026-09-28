import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { User } from "@/lib/server/models/User";
import { jsonError, jsonOk } from "@/lib/server/http";
import { resolveLanguageCodeFromId } from "@/lib/server/i18n/languages";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  await connectMongo();
  const user = await User.findById(auth.payload!.userId).lean();
  if (!user) return jsonError("NOT_FOUND", "User not found", 404);

  const languageId = user.preferences?.languageId ?? "en_US";
  const language_code = await resolveLanguageCodeFromId(languageId);

  return jsonOk({
    theme_mode: user.preferences?.themeMode ?? "system",
    notifications_enabled: user.preferences?.notificationsEnabled ?? true,
    language_id: languageId,
    language_code,
    style_gender_preference: user.preferences?.styleGenderPreference ?? "women",
  });
}

export async function PATCH(req: Request) {
  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const body = (await req.json()) as {
    theme_mode?: "system" | "light" | "dark";
    notifications_enabled?: boolean;
    language_id?: string;
    style_gender_preference?: "men" | "women";
  };

  await connectMongo();
  const user = await User.findById(auth.payload!.userId);
  if (!user) return jsonError("NOT_FOUND", "User not found", 404);

  if (!user.preferences) {
    user.preferences = {
      themeMode: "system",
      notificationsEnabled: true,
      languageId: "en_US",
      styleGenderPreference: "women",
      notifyJobFailures: true,
      notifyNewUsers: true,
    };
  }

  if (body.theme_mode) user.preferences.themeMode = body.theme_mode;
  if (body.notifications_enabled !== undefined) user.preferences.notificationsEnabled = body.notifications_enabled;
  if (body.language_id) user.preferences.languageId = body.language_id;
  if (body.style_gender_preference) user.preferences.styleGenderPreference = body.style_gender_preference;

  await user.save();

  const language_code = await resolveLanguageCodeFromId(user.preferences.languageId);

  return jsonOk({
    theme_mode: user.preferences.themeMode,
    notifications_enabled: user.preferences.notificationsEnabled,
    language_id: user.preferences.languageId,
    language_code,
    style_gender_preference: user.preferences.styleGenderPreference,
  });
}
