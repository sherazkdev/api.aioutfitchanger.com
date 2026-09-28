import { applyGlossaryAfter, applyGlossaryBefore } from "./glossary";
import { defaultSourceLocale } from "./locale";

const LIBRE_TO_CODE: Record<string, string> = {
  en: "en",
  ar: "ar",
  zh: "zh",
  de: "de",
  fr: "fr",
  id: "id",
  ja: "ja",
  pt: "pt",
  ru: "ru",
  tr: "tr",
  es: "es",
  ur: "ur",
  hi: "hi",
};

function libreCode(locale: string): string {
  const base = locale.split("-")[0]?.toLowerCase() ?? locale;
  return LIBRE_TO_CODE[base] ?? base;
}

export function isTranslationConfigured(): boolean {
  return Boolean(process.env.LIBRETRANSLATE_URL?.trim());
}

export async function translateText(
  text: string,
  targetLocale: string,
  sourceLocale = defaultSourceLocale()
): Promise<string> {
  const source = libreCode(sourceLocale);
  const target = libreCode(targetLocale);
  if (!text.trim() || source === target) return text;

  const baseUrl = process.env.LIBRETRANSLATE_URL?.replace(/\/$/, "");
  if (!baseUrl) return text;

  const q = applyGlossaryBefore(text);

  try {
    const res = await fetch(`${baseUrl}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q, source, target, format: "text" }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      console.warn(`[translate] LibreTranslate HTTP ${res.status} for ${source}->${target}`);
      return text;
    }

    const json = (await res.json().catch(() => ({}))) as { translatedText?: string };
    const raw = json.translatedText?.trim() ? json.translatedText : text;
    return applyGlossaryAfter(raw);
  } catch (err) {
    console.warn("[translate] request failed, using source text", err);
    return text;
  }
}

/** Fill missing locale keys from source English (or configured source). */
export async function translateToLocales(
  sourceText: string,
  targetLocales: string[],
  sourceLocale = defaultSourceLocale()
): Promise<Record<string, string>> {
  const out: Record<string, string> = { [sourceLocale]: sourceText };
  const source = libreCode(sourceLocale);

  for (const loc of targetLocales) {
    const code = libreCode(loc);
    if (code === source) {
      out[code] = sourceText;
      continue;
    }
    if (!isTranslationConfigured()) {
      out[code] = sourceText;
      continue;
    }
    try {
      out[code] = await translateText(sourceText, code, sourceLocale);
    } catch {
      out[code] = sourceText;
    }
  }

  return out;
}
