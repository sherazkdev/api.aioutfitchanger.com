import { AppLanguage } from "../models/AppLanguage";

export const LANGUAGE_CATALOG = [
  { languageId: "en_US", languageCode: "en", countryCode: "US", nativeName: "English", englishName: "English", rtl: false, isDefault: true },
  { languageId: "ar_SA", languageCode: "ar", countryCode: "SA", nativeName: "العربية", englishName: "Arabic", rtl: true, isDefault: false },
  { languageId: "zh_CN", languageCode: "zh", countryCode: "CN", nativeName: "中文", englishName: "Chinese", rtl: false, isDefault: false },
  { languageId: "de_DE", languageCode: "de", countryCode: "DE", nativeName: "Deutsch", englishName: "German", rtl: false, isDefault: false },
  { languageId: "fr_FR", languageCode: "fr", countryCode: "FR", nativeName: "Français", englishName: "French", rtl: false, isDefault: false },
  { languageId: "id_ID", languageCode: "id", countryCode: "ID", nativeName: "Bahasa Indonesia", englishName: "Indonesian", rtl: false, isDefault: false },
  { languageId: "ja_JP", languageCode: "ja", countryCode: "JP", nativeName: "日本語", englishName: "Japanese", rtl: false, isDefault: false },
  { languageId: "pt_PT", languageCode: "pt", countryCode: "PT", nativeName: "Português", englishName: "Portuguese", rtl: false, isDefault: false },
  { languageId: "ru_RU", languageCode: "ru", countryCode: "RU", nativeName: "Русский", englishName: "Russian", rtl: false, isDefault: false },
  { languageId: "tr_TR", languageCode: "tr", countryCode: "TR", nativeName: "Türkçe", englishName: "Turkish", rtl: false, isDefault: false },
  { languageId: "es_ES", languageCode: "es", countryCode: "ES", nativeName: "Español", englishName: "Spanish", rtl: false, isDefault: false },
] as const;

export async function ensureLanguageCatalog(): Promise<void> {
  let order = 0;
  for (const row of LANGUAGE_CATALOG) {
    await AppLanguage.updateOne(
      { languageId: row.languageId },
      {
        $set: {
          languageCode: row.languageCode,
          countryCode: row.countryCode,
          nativeName: row.nativeName,
          englishName: row.englishName,
          rtl: row.rtl,
          isDefault: row.isDefault,
          enabled: true,
          sortOrder: order,
        },
      },
      { upsert: true }
    );
    order += 1;
  }
}

export async function getEnabledLocaleCodes(): Promise<string[]> {
  const rows = await AppLanguage.find({ enabled: true }).sort({ sortOrder: 1 }).lean();
  if (rows.length === 0) return ["en"];
  return rows.map((r) => r.languageCode);
}

export async function resolveLanguageCodeFromId(languageId: string): Promise<string> {
  try {
    const row = await AppLanguage.findOne({ languageId }).lean();
    return row?.languageCode ?? "en";
  } catch {
    return "en";
  }
}
