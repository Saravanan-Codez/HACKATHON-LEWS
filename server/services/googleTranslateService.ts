import axios from "axios";

// In-memory LRU/translation cache to ensure sub-millisecond lookups
const translationCache = new Map<string, string>();

const LANG_CODE_MAP: Record<string, string> = {
  // Indian & Regional Languages
  EN: "en",
  HI: "hi",
  KN: "kn",
  TA: "ta",
  TE: "te",
  ML: "ml",
  BN: "bn",
  MR: "mr",
  GU: "gu",
  PA: "pa",
  OR: "or",
  UR: "ur",
  NE: "ne",

  // Global & World Languages
  ES: "es", // Spanish
  FR: "fr", // French
  DE: "de", // German
  JA: "ja", // Japanese
  ZH: "zh-CN", // Mandarin Chinese
  AR: "ar", // Arabic
  PT: "pt", // Portuguese
  RU: "ru", // Russian
  IT: "it", // Italian
  ID: "id", // Indonesian
  KO: "ko", // Korean
  TR: "tr", // Turkish
  VI: "vi", // Vietnamese
  TH: "th", // Thai
  SW: "sw", // Swahili
  NL: "nl", // Dutch
  PL: "pl", // Polish
  EL: "el", // Greek
  HE: "he", // Hebrew
  UK: "uk", // Ukrainian
};

// Fallback dictionary for common emergency & test phrases to guard against Google 429 rate limits
const FALLBACK_SERVER_DICT: Record<string, Record<string, string>> = {
  "Evacuate immediately": {
    ta: "உடனடியாக வெளியேறவும்",
    hi: "तुरंत बाहर निकलें",
    kn: "ತಕ್ಷಣ ತೆರವುಗೊಳಿಸಿ",
    te: "వెంటనే ఖాళీ చేయండి",
    ml: "ഉടൻ ഒഴിഞ്ഞുപോകുക",
  },
  "Road corridor blocked": {
    ta: "சாலை வழித்தடம் அடைக்கப்பட்டுள்ளது",
    hi: "सड़क गलियारा अवरुद्ध",
    kn: "ರಸ್ತೆ ಕಾರಿಡಾರ್ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",
    te: "రహదారి కారిడార్ బ్లాక్ చేయబడింది",
    ml: "റോഡ് തടസ്സപ്പെട്ടിരിക്കുന്നു",
  },
  "Safe shelter location": {
    ta: "பாதுகாப்பான தங்குமிடம் இடம்",
    hi: "सुरक्षित आश्रय स्थान",
    kn: "ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಸ್ಥಳ",
    te: "సురక్షిత ఆశ్రయ స్థానం",
    ml: "സുരക്ഷിത അഭയകേന്ദ്രം",
  },
  "Landslide warning: High slope saturation": {
    kn: "ಭೂಕುಸಿತ ಎಚ್ಚರಿಕೆ: ಹೆಚ್ಚಿನ ಇಳಿಜಾರು ಶುದ್ಧತ್ವ",
    hi: "भूस्खलन चेतावनी: उच्च ढलान संतृप्ति",
    ta: "நிலச்சரிவு எச்சரிக்கை: அதிக சரிவு செறிவு",
  },
  "Heavy rainfall detected": {
    hi: "भारी वर्षा का पता चला",
    kn: "ಭಾರಿ ಮಳೆ ಪತ್ತೆಯಾಗಿದೆ",
    ta: "கனமழை கண்டறியப்பட்டது",
  },
};

const TECHNICAL_UNITS = new Set([
  "mm", "mm/hr", "mm/h", "cm", "m", "km", "km/h", "km/hr", "m/s", "m/s²",
  "°", "°c", "°f", "°/hr", "°/h", "deg", "%", "v", "mv", "hpa", "kpa", "pa",
  "bar", "mbar", "x", "s", "sec", "min", "mins", "h", "hr", "hrs", "d", "days",
  "hz", "khz", "mhz", "ghz", "db", "dbm", "bps", "kbps", "mbps",
  "lat", "lng", "lon", "fos", "g", "ms", "bytes", "kb", "mb", "gb"
]);

function isUnitOrNumber(text: string): boolean {
  if (!text) return true;
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (TECHNICAL_UNITS.has(trimmed.toLowerCase())) return true;
  if (/^[+-]?[0-9,]+(?:\.[0-9]+)?$/.test(trimmed)) return true;
  if (/^[+-]?[0-9,]+(?:\.[0-9]+)?\s*(?:mm(?:\/hr|\/h)?|cm|m(?:\/s²?)?|km(?:\/h|\/hr)?|°(?:\/hr|\/h|[CF])?|%|v|mv|hpa|kpa|pa|bar|mbar|x|s|sec|min|mins|h|hr|hrs|d|days|hz|khz|mhz|db|dbm|bps|kbps|mbps|g|ms|bytes|kb|mb|gb)$/i.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * High-speed Google Translate integration for Indic & English translations
 */
export async function translateText(
  text: string,
  targetLang: "EN" | "HI" | "KN" | "TA" | "TE" | "ML" | string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  // Never translate units or numbers
  if (isUnitOrNumber(trimmed)) {
    return trimmed;
  }

  const targetCode = (LANG_CODE_MAP[targetLang.toUpperCase()] || targetLang.toLowerCase()).toLowerCase();
  if (targetCode === "en" && /^[\x00-\x7F]*$/.test(trimmed)) {
    return trimmed;
  }

  const cacheKey = `${targetCode}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Check fallback server dictionary
  if (FALLBACK_SERVER_DICT[trimmed] && FALLBACK_SERVER_DICT[trimmed][targetCode]) {
    const cached = FALLBACK_SERVER_DICT[trimmed][targetCode];
    translationCache.set(cacheKey, cached);
    return cached;
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
    // Return cached fallback dictionary if available
    if (FALLBACK_SERVER_DICT[trimmed] && FALLBACK_SERVER_DICT[trimmed][targetCode]) {
      return FALLBACK_SERVER_DICT[trimmed][targetCode];
    }
    // Only warn if not a common 429
    if (err.response?.status !== 429) {
      console.warn(`[Google Translate Error (${targetCode})]:`, err.message || err);
    }
  }

  // If online lookup fails, return fallback or original trimmed string
  return FALLBACK_SERVER_DICT[trimmed]?.[targetCode] || trimmed;
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
