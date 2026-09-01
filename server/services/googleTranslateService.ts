import axios from "axios";

// In-memory LRU/translation cache to ensure sub-millisecond lookups
const translationCache = new Map<string, string>();

const LANG_CODE_MAP: Record<string, string> = {
  EN: "en",
  HI: "hi",
  KN: "kn",
  TA: "ta",
  TE: "te",
  ML: "ml",
};

/**
 * High-speed Google Translate integration for Indic & English translations
 */
export async function translateText(
  text: string,
  targetLang: "EN" | "HI" | "KN" | "TA" | "TE" | "ML" | string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const targetCode = LANG_CODE_MAP[targetLang.toUpperCase()] || targetLang.toLowerCase();
  if (targetCode === "en" && /^[\x00-\x7F]*$/.test(trimmed)) {
    return trimmed;
  }

  const cacheKey = `${targetCode}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;

    const response = await axios.get(url, { timeout: 4000 });
    if (response.data && Array.isArray(response.data[0])) {
      const translated = response.data[0].map((item: any) => item[0]).join("");
      if (translated) {
        translationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch (err: any) {
    console.warn(`[Google Translate Error (${targetCode})]:`, err.message || err);
  }

  // If online lookup fails, return original trimmed string
  return trimmed;
}

/**
 * Batch translation utility for translating multiple sentences or UI elements concurrently
 */
export async function translateBatch(
  texts: string[],
  targetLang: "EN" | "HI" | "KN" | "TA" | "TE" | "ML" | string
): Promise<string[]> {
  return Promise.all(texts.map(t => translateText(t, targetLang)));
}
