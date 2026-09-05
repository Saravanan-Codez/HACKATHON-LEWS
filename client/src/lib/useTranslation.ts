import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import type { NotificationLanguage } from "@/lib/notificationTranslations";

export const TECHNICAL_UNITS = new Set([
  "mm", "mm/hr", "mm/h", "cm", "m", "km", "km/h", "km/hr", "m/s", "m/s²",
  "°", "°c", "°f", "°/hr", "°/h", "deg", "%", "v", "mv", "hpa", "kpa", "pa",
  "bar", "mbar", "x", "s", "sec", "min", "mins", "h", "hr", "hrs", "d", "days",
  "hz", "khz", "mhz", "ghz", "db", "dbm", "bps", "kbps", "mbps",
  "lat", "lng", "lon", "fos", "g", "ms", "bytes", "kb", "mb", "gb",
  "n", "s", "e", "w", "gpio", "i2c", "adc", "adc1", "adc2", "spi", "uart"
]);

/**
 * Checks if a string is strictly a number, coordinate, technical/scientific unit,
 * timestamp, or hardware register code that MUST NOT be translated.
 */
export function isUnitOrNumber(text: string): boolean {
  if (!text) return true;
  const trimmed = text.trim();
  if (!trimmed) return true;

  // Single unit or technical abbreviation (case-insensitive)
  if (TECHNICAL_UNITS.has(trimmed.toLowerCase())) return true;

  // Standalone symbols or punctuation (e.g. "—", "-", "/", ":", "•", "|", "...")
  if (/^[-—–/\\:;,.•|~`'"!?@#$%^&*()_=+<>{}[\]\s]+$/.test(trimmed)) return true;

  // Pure numbers: integer, float, signed, commas e.g. "100", "12.3375", "-0.014", "+1.2", "1,200", "184,520"
  if (/^[+-]?[0-9,]+(?:\.[0-9]+)?$/.test(trimmed)) return true;

  // Ratios / Counts like "16 / 32" or "3 / 32"
  if (/^[0-9,]+\s*\/\s*[0-9,]+$/.test(trimmed)) return true;

  // Numbers combined with technical units (with or without space):
  // Examples: "12.4 mm", "100mm", "0.014°/hr", "94%", "3.28V", "3.12 V", "-88 dBm", "1011.4 hPa", "1.42", "24h", "3x", "1,200 Persons"
  if (/^[+-]?[0-9,]+(?:\.[0-9]+)?\s*(?:mm(?:\/hr|\/h)?|cm|m(?:\/s²?)?|km(?:\/h|\/hr)?|°(?:\/hr|\/h|[CF])?|%|v|mv|hpa|kpa|pa|bar|mbar|x|s|sec|min|mins|h|hr|hrs|d|days|hz|khz|mhz|db|dbm|bps|kbps|mbps|g|ms|bytes|kb|mb|gb|persons?)$/i.test(trimmed)) {
    return true;
  }

  // Geographic coordinates: e.g. "12.3456° N, 75.1234° E", "LAT 12.3375, LNG 75.8062", "12.48°N", "75.82°E", "12.3375, 75.8069"
  if (/^(?:lat(?:itude)?|lng|lon(?:gitude)?|zoom)?\s*[:=]?\s*[+-]?[0-9.]+\s*°?\s*[NSEW]?(?:\s*[,;/&·]\s*(?:lat(?:itude)?|lng|lon(?:gitude)?|zoom)?\s*[:=]?\s*[+-]?[0-9.]+\s*°?\s*[NSEW]?)?$/i.test(trimmed)) {
    return true;
  }

  // Date / Time / ISO strings: "2026-09-05", "14:32:00", "09:41 UTC", "2018-08-14"
  if (/^\d{4}[-/]\d{2}[-/]\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(trimmed)) {
    return true;
  }
  if (/^\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:am|pm|utc|gmt|ist))?$/i.test(trimmed)) {
    return true;
  }

  // Hardware Pins & Spec Codes: "GPIO 4", "GPIO 34 (ADC1)", "I2C (0x76)", "v1.0.0"
  if (/^(?:gpio\s*\d+|i2c\s*(?:\([0-9a-fx]+\))?|spi|uart|0x[0-9a-fA-F]+)$/i.test(trimmed)) {
    return true;
  }

  // Code / Station / System identifiers: "CHK-01", "KDG-03", "WYD-04", "EONET_1234", "v1.0.0"
  if (/^[A-Z]{2,5}-\d{2,4}$/i.test(trimmed) || /^EONET_\d+$/i.test(trimmed) || /^v?\d+\.\d+(?:\.\d+)?$/i.test(trimmed)) {
    return true;
  }

  return false;
}

// Comprehensive built-in dictionary for instant zero-latency UI rendering across Indic & Global languages
export const STATIC_DICTIONARY: Record<string, Record<string, string>> = {
  // Navigation & Top Header
  "OVERVIEW": {
    KN: "ಅವಲೋಕನ", HI: "अवलोकन", TA: "கண்ணோட்டம்", TE: "అవలోకనం", ML: "അവലോകനം",
    ES: "Visión General", FR: "Vue d'ensemble", DE: "Übersicht", JA: "概要", ZH: "概述", AR: "نظرة عامة"
  },
  "LANDSORA": {
    KN: "ಲ್ಯಾಂಡ್‌ಸೋರಾ", HI: "लैंडसोरा", TA: "லேண்ட்சோரா", TE: "లాండ్‌సోరా", ML: "ലാൻഡ്സോറ",
    ES: "Landsora", FR: "Landsora", DE: "Landsora", JA: "ランドソラ", ZH: "Landsora", AR: "لاندسورا"
  },
  "LANDSORA CONSOLE": {
    KN: "ಲ್ಯಾಂಡ್‌ಸೋರಾ ಕನ್ಸೋಲ್", HI: "लैंडसोरा कंसोल", TA: "லேண்ட்சோரா கன்சோல்", TE: "లాండ్‌సోరా కన్సోల్", ML: "ലാൻഡ്സോറ കൺസോൾ",
    ES: "Consola Landsora", FR: "Console Landsora", DE: "Landsora-Konsole", JA: "Landsoraコンソール", ZH: "Landsora控制台", AR: "وحدة تحكم لاندسورا"
  },
  "AI COMPANION": {
    KN: "AI ಸಹಾಯಕ", HI: "AI साथी", TA: "AI துணை", TE: "AI సహచరుడు", ML: "AI സഹായി",
    ES: "Compañero IA", FR: "Compagnon IA", DE: "KI-Begleiter", JA: "AIコンパニオン", ZH: "AI助手", AR: "رفيق الذكاء الاصطناعي"
  },
  "CONNECT": {
    KN: "ಸಂಪರ್ಕಿಸಿ", HI: "कनेक्ट करें", TA: "இணைக்கவும்", TE: "కనెక్ట్ చేయండి", ML: "ബന്ധിപ്പിക്കുക",
    ES: "Conectar", FR: "Connecter", DE: "Verbinden", JA: "接続", ZH: "连接", AR: "اتصال"
  },
  "CONNECT GOOGLE": {
    KN: "ಗೂಗಲ್ ಸಂಪರ್ಕಿಸಿ", HI: "गूगल कनेक्ट करें", TA: "கூகிள் இணைக்கவும்", TE: "గూగుల్ కనెక్ట్ చేయండి", ML: "ഗൂഗിൾ ബന്ധിപ്പിക്കുക",
    ES: "Conectar Google", FR: "Connecter Google", DE: "Google verbinden", JA: "Google接続", ZH: "连接Google", AR: "ربط جوجل"
  },
  "STATIONS": {
    KN: "ನಿಲ್ದಾಣಗಳು", HI: "स्टेशन", TA: "நிலையங்கள்", TE: "స్టేషన్లు", ML: "സ്റ്റേഷനുകൾ",
    ES: "Estaciones", FR: "Stations", DE: "Stationen", JA: "観測局", ZH: "监测站", AR: "محطات"
  },
  "TOOLS": {
    KN: "ಉಪಕರಣಗಳು", HI: "उपकरण", TA: "கருவிகள்", TE: "సాధనాలు", ML: "ഉപകരണങ്ങൾ",
    ES: "Herramientas", FR: "Outils", DE: "Werkzeuge", JA: "ツール", ZH: "工具", AR: "أدوات"
  },
  "SETTINGS": {
    KN: "ಸಂಯೋಜನೆಗಳು", HI: "सेटिंग्स", TA: "அமைப்புகள்", TE: "సెట్టింగ్‌లు", ML: "ക്രമീകരണങ്ങൾ",
    ES: "Configuración", FR: "Paramètres", DE: "Einstellungen", JA: "設定", ZH: "设置", AR: "إعدادات"
  },
  "RADAR": {
    KN: "ರಾಡಾರ್", HI: "रडार", TA: "ரேடார்", TE: "రాడార్", ML: "റഡാർ",
    ES: "Radar", FR: "Radar", DE: "Radar", JA: "レーダー", ZH: "雷达", AR: "رادار"
  },
  "FoS": {
    KN: "ಸುರಕ್ಷತಾ ಅಂಶ (FoS)", HI: "सुरक्षा कारक (FoS)", TA: "பாதுகாப்புக் காரணி (FoS)", TE: "భద్రతా కారకం (FoS)", ML: "സുരക്ഷാ ഘടകം (FoS)",
    ES: "Factor de Seguridad (FoS)", FR: "Facteur de Sécurité (FoS)", DE: "Sicherheitsfaktor (FoS)", JA: "安全率 (FoS)", ZH: "安全系数 (FoS)", AR: "معامل الأمان (FoS)"
  },
  "CONFIDENCE": {
    KN: "ವಿಶ್ವಾಸಾರ್ಹತೆ", HI: "विश्वसनीयता", TA: "நம்பகத்தன்மை", TE: "విశ్వసనీయత", ML: "വിശ്വാസ്യത",
    ES: "Confianza", FR: "Confiance", DE: "Zuverlässigkeit", JA: "信頼度", ZH: "置信度", AR: "ثقة"
  },
  "Network Backhaul": {
    KN: "ನೆಟ್‌ವರ್ಕ್ ಬ್ಯಾಕ್‌ಹಾಲ್", HI: "नेटवर्क बैकहॉल", TA: "நெட்வொர்க் பேக்ஹால்", TE: "నెట్‌వర్క్ బ్యాక్‌హాల్", ML: "നെറ്റ്‌വർക്ക് ബാക്ക്‌ഹോൾ",
    ES: "Enlace de Red", FR: "Réseau Backhaul", DE: "Netzwerk-Backhaul", JA: "ネットワーク回線", ZH: "网络回传", AR: "شبكة الاتصال"
  },
  "ONLINE": {
    KN: "ಆನ್‌ಲೈನ್", HI: "ऑनलाइन", TA: "ஆன்லைன்", TE: "ఆన్‌లైన్", ML: "ഓൺലൈൻ",
    ES: "En Línea", FR: "En Ligne", DE: "Online", JA: "オンライン", ZH: "在线", AR: "متصل"
  },
  "LIMITED NETWORK": {
    KN: "ಸೀಮಿತ ನೆಟ್‌ವರ್ಕ್", HI: "सीमित नेटवर्क", TA: "வரையறுக்கப்பட்ட நெட்வொர்க்", TE: "పరిమిత నెట్‌వర్క్", ML: "പരിമിതമായ നെറ്റ്‌വർക്ക്",
    ES: "Red Limitada", FR: "Réseau Limité", DE: "Eingeschränktes Netzwerk", JA: "制限付き接続", ZH: "受限网络", AR: "شبكة محدودة"
  },
  "OFFLINE MODE": {
    KN: "ಆಫ್‌ಲೈನ್ ಮೋಡ್", HI: "ऑफ़लाइन मोड", TA: "ஆஃப்லைன் பயன்முறை", TE: "ఆఫ్‌లైన్ మోడ్", ML: "ഓഫ്‌ലൈൻ മോഡ്",
    ES: "Modo Fuera de Línea", FR: "Mode Hors Ligne", DE: "Offline-Modus", JA: "オフラインモード", ZH: "离线模式", AR: "وضع عدم الاتصال"
  },
  "ON": {
    KN: "ಆನ್", HI: "चालू", TA: "இயக்கு", TE: "ఆన్", ML: "ഓൺ",
    ES: "Activado", FR: "Activé", DE: "An", JA: "オン", ZH: "开", AR: "تشغيل"
  },
  "OFF": {
    KN: "ಆಫ್", HI: "बंद", TA: "முடக்கு", TE: "ఆఫ్", ML: "ഓഫ്",
    ES: "Desactivado", FR: "Désactivé", DE: "Aus", JA: "オフ", ZH: "关", AR: "إيقاف"
  },

  // Tactical Flight Scenarios
  "SCENARIOS:": {
    KN: "ಸನ್ನಿವೇಶಗಳು:", HI: "परिदृश्य:", TA: "சூழ்நிலைகள்:", TE: "పరిస్థితులు:", ML: "സാഹചര്യങ്ങൾ:",
    ES: "Escenarios:", FR: "Scénarios:", DE: "Szenarien:", JA: "シミュレーション:", ZH: "场景:", AR: "السيناريوهات:"
  },
  "01 NORMAL CONDITIONS (BASELINE)": {
    KN: "01 ಸಾಮಾನ್ಯ ಪರಿಸ್ಥಿತಿಗಳು (ಮೂಲಸ್ಥಿತಿ)", HI: "01 सामान्य स्थितियां (आधार रेखा)", TA: "01 இயல்பு நிலைகள் (அடிப்படை)", TE: "01 సాధారణ పరిస్థితులు (బేస్‌లైన్)", ML: "01 സാധാരണ സാഹചര്യങ്ങൾ (ബേസ്‌ലൈൻ)",
    ES: "01 Condiciones Normales (Línea base)", FR: "01 Conditions Normales (Référence)", DE: "01 Normalbedingungen (Basis)", JA: "01 通常状態 (ベースライン)", ZH: "01 正常情况 (基线)", AR: "01 الظروف العادية (خط الأساس)"
  },
  "02 PERSISTENT MONSOON RAIN": {
    KN: "02 ನಿರಂತರ ಮಾನ್ಸೂನ್ ಮಳೆ", HI: "02 निरंतर मानसून वर्षा", TA: "02 தொடர்ச்சியான பருவமழை", TE: "02 నిరంతర రుతుపవన వర్షం", ML: "02 തുടർച്ചയായ കാലവർഷം",
    ES: "02 Lluvia Monzónica Persistente", FR: "02 Pluie de Mousson Persistante", DE: "02 Anhaltender Monsunregen", JA: "02 継続的なモンスーン豪雨", ZH: "02 持续季风降雨", AR: "02 أمطار موسمية مستمرة"
  },
  "03 EXTREME STORM & TILT SURGE": {
    KN: "03 ತೀವ್ರ ಚಂಡಮಾರುತ ಮತ್ತು ಇಳಿಜಾರು ಏರಿಕೆ", HI: "03 अत्यधिक तूफान और ढलान वृद्धि", TA: "03 தீவிர புயல் மற்றும் சாய்வு அதிகரிப்பு", TE: "03 తీవ్ర తుఫాను మరియు వాలు సర్జ్", ML: "03 തീവ്ര കൊടുങ്കാറ്റും ചരിവ് വ്യതിയാനവും",
    ES: "03 Tormenta Extrema e Inclinación", FR: "03 Tempête Extrême et Inclinaison", DE: "03 Extremer Sturm & Hangbewegung", JA: "03 猛烈な嵐と斜面変動", ZH: "03 极端风暴与倾斜突增", AR: "03 عاصفة شديدة وارتفاع الميل"
  },
  "04 GLITCH TELEMETRY QUARANTINE": {
    KN: "04 ದೋಷಯುಕ್ತ ಟೆಲಿಮೆಟ್ರಿ ಕ್ವಾರಂಟೈನ್", HI: "04 दोषपूर्ण टेलीमेट्री क्वारंटाइन", TA: "04 பிழையான டெலிமெட்ரி தனிமை", TE: "04 లోపభూయిష్ట టెలిమెట్రీ క్వారంటైన్", ML: "04 തകരാറിലായ ടെലിമെട്രി ക്വാറന്റൈൻ",
    ES: "04 Cuarentena de Telemetría Anómala", FR: "04 Quarantaine Télémétrie Défaillante", DE: "04 Quarantäne Fehlerhafte Telemetrie", JA: "04 異常テレメトリの隔離", ZH: "04 异常遥测隔离", AR: "04 عزل القياس عن بُعد غير الموثوق"
  },
  "05 SATELLITE LATENCY & FALLBACK": {
    KN: "05 ಉಪಗ್ರಹ ವಿಳಂಬ ಮತ್ತು ಪರ್ಯಾಯ ವ್ಯವಸ್ಥೆ", HI: "05 उपग्रह विलंब और फॉलबैक", TA: "05 செயற்கைக்கோள் தாமதம் மற்றும் மாற்று", TE: "05 ఉపగ్రహ జాప్యం మరియు ఫాల్‌బ్యాక్", ML: "05 ഉപഗ്രഹ കാലതാമസവും ഫാൽബാക്കും",
    ES: "05 Latencia Satelital y Respaldo", FR: "05 Latence Satellite et Secours", DE: "05 Satellitenlatenz & Fallback", JA: "05 衛星遅延とフォールバック", ZH: "05 卫星延迟与回退", AR: "05 تأخير القمر الصناعي والاحتياطي"
  },
  "06 LOW SOLAR BATTERY DEGRADED": {
    KN: "06 ಕಡಿಮೆ ಸೌರ ಬ್ಯಾಟರಿ ಕಾರ್ಯಕ್ಷಮತೆ ಕುಸಿತ", HI: "06 कम सौर बैटरी ख़राब", TA: "06 குறைந்த சூரிய மின்கல குறைபாடு", TE: "06 తక్కువ సౌర బ్యాటరీ క్షీణత", ML: "06 കുറഞ്ഞ സോളാർ ബാറ്ററി പ്രവർത്തനം",
    ES: "06 Batería Solar Baja Degradada", FR: "06 Batterie Solaire Faible Dégradée", DE: "06 Niedrige Solarbatterie Degradiert", JA: "06 ソーラーバッテリー低下・機能低下", ZH: "06 太阳能电量低降低功耗", AR: "06 بطارية شمسية منخفضة ومتدهورة"
  },
  "07 CRITICAL EVACUATION ESCALATION": {
    KN: "07 ಗಂಭೀರ ಸ್ಥಳಾಂತರ ತುರ್ತು ಪರಿಸ್ಥಿತಿ", HI: "07 गंभीर निकासी आपातकाल", TA: "07 தீவிர வெளியேற்ற அவசரநிலை", TE: "07 అత్యవసర తరలింపు తీవ్రతరం", ML: "07 ഗുരുതര ഒഴിപ്പിക്കൽ മുന്നറിയിപ്പ്",
    ES: "07 Escalada Crítica de Evacuación", FR: "07 Escalade Critique d'Évacuation", DE: "07 Kritische Evakuierungsstufe", JA: "07 緊急避難指示のエスカレーション", ZH: "07 紧急疏散升级", AR: "07 تصعيد الإخلاء الحرج"
  },
  "01 NORMAL": { KN: "01 ಸಾಮಾನ್ಯ", HI: "01 सामान्य", TA: "01 இயல்பு", TE: "01 సాధారణం", ML: "01 സാധാരണ" },
  "02 HEAVY RAIN": { KN: "02 ಭಾರಿ ಮಳೆ", HI: "02 भारी बारिश", TA: "02 கனமழை", TE: "02 భారీ వర్షం", ML: "02 കനത്ത മഴ" },
  "03 EXTREME STORM": { KN: "03 ತೀವ್ರ ಚಂಡಮಾರುತ", HI: "03 भीषण तूफान", TA: "03 தீவிர புயல்", TE: "03 తీవ్ర తుఫాను", ML: "03 തീവ്ര കൊടുങ്കാറ്റ്" },
  "04 TILT QUARANTINE": { KN: "04 ಇಳಿಜಾರು ಕ್ವಾರಂಟೈನ್", HI: "04 झुकाव क्वारंटाइन", TA: "04 சாய்வு தனிமை", TE: "04 వాలు క్వారంటైన్", ML: "04 ചരിവ് ക്വാറന്റൈൻ" },
  "05 API DELAY": { KN: "05 API ವಿಳಂಬ", HI: "05 API विलंब", TA: "05 API தாமதம்", TE: "05 API ఆలస్యం", ML: "05 API കാലതാമസം" },
  "06 LOW BATTERY": { KN: "06 ಕಡಿಮೆ ಬ್ಯಾಟರಿ", HI: "06 कम बैटरी", TA: "06 குறைந்த பேட்டரி", TE: "06 తక్కువ బ్యాటరీ", ML: "06 കുറഞ്ഞ ബാറ്ററി" },
  "07 HAZARD ALERT": { KN: "07 ಅಪಾಯದ ಎಚ್ಚರಿಕೆ", HI: "07 खतरा चेतावनी", TA: "07 ஆபத்து எச்சரிக்கை", TE: "07 ప్రమాద హెచ్చరిక", ML: "07 അപകട മുന്നറിയിപ്പ്" },

  // Tools Menu
  "TACTICAL OPERATIONS SUITE": {
    KN: "ಯುದ್ಧತಂತ್ರದ ಕಾರ್ಯಾಚರಣೆಗಳ ಸೂಟ್", HI: "रणनीतिक संचालन सुइट", TA: "தந்திரோபாய செயல்பாட்டு தொகுப்பு", TE: "వ్యూహాత్మక ఆపరేషన్స్ సూట్", ML: "തന്ത്രപരമായ പ്രവർത്തന സ്യൂട്ട്",
    ES: "Suite de Operaciones Tácticas", FR: "Suite d'Opérations Tactiques", DE: "Taktische Betriebssuite", JA: "戦術作戦スイート", ZH: "战术行动套件", AR: "مجموعة العمليات التكتيكية"
  },
  "⚡ Inject ESP32 Packet": {
    KN: "⚡ ESP32 ಪ್ಯಾಕೆಟ್ ಒಳಸೇರಿಸಿ", HI: "⚡ ESP32 पैकेट इंजेक्ट करें", TA: "⚡ ESP32 பாக்கெட் புகுத்து", TE: "⚡ ESP32 ప్యాకెట్ చొప్పించండి", ML: "⚡ ESP32 പാക്കറ്റ് ഇൻജക്റ്റ് ചെയ്യുക",
    ES: "⚡ Inyectar Paquete ESP32", FR: "⚡ Injecter Paquet ESP32", DE: "⚡ ESP32-Paket injizieren", JA: "⚡ ESP32パケット注入", ZH: "⚡ 注入ESP32数据包", AR: "⚡ حقن حزمة ESP32"
  },
  "Inject ESP32 Packet": {
    KN: "ESP32 ಪ್ಯಾಕೆಟ್ ಒಳಸೇರಿಸಿ", HI: "ESP32 पैकेट इंजेक्ट करें", TA: "ESP32 பாக்கெட் புகுத்து", TE: "ESP32 ప్యాకెట్ చొప్పించండి", ML: "ESP32 പാക്കറ്റ് ഇൻജക്റ്റ് ചെയ്യുക"
  },
  "📄 Export Incident Dossier (.md)": {
    KN: "📄 ಘಟನೆಯ ಡಾಕ್ಯುಮೆಂಟ್ ರಫ್ತು ಮಾಡಿ (.md)", HI: "📄 घटना डोजियर निर्यात करें (.md)", TA: "📄 சம்பவ ஆவணம் ஏற்றுமதி (.md)", TE: "📄 ఘటన డాసియర్ ఎగుమతి (.md)", ML: "📄 സംഭവ രേഖ എക്സ്പോർട്ട് ചെയ്യുക (.md)",
    ES: "📄 Exportar Informe de Incidente (.md)", FR: "📄 Exporter Dossier d'Incident (.md)", DE: "📄 Vorfall-Dossier exportieren (.md)", JA: "📄 事象記録エクスポート (.md)", ZH: "📄 导出事件档案 (.md)", AR: "📄 تصدير ملف الحادث (.md)"
  },
  "Export Incident Dossier (.md)": {
    KN: "ಘಟನೆಯ ಡಾಕ್ಯುಮೆಂಟ್ ರಫ್ತು ಮಾಡಿ (.md)", HI: "घटना डोजियर निर्यात करें (.md)", TA: "சம்பவ ஆவணம் ஏற்றுமதி (.md)", TE: "ఘటన డాసియర్ ఎగుమతి (.md)", ML: "സംഭവ രേഖ എക്സ്പോർട്ട് ചെയ്യുക (.md)"
  },
  "📡 ESP32 Nodes Registry": {
    KN: "📡 ESP32 ನೋಡ್‌ಗಳ ರಿಜಿಸ್ಟ್ರಿ", HI: "📡 ESP32 नोड्स रजिस्ट्री", TA: "📡 ESP32 முனையங்கள் பதிவேடு", TE: "📡 ESP32 నోడ్ల రిజిస్ట్రీ", ML: "📡 ESP32 നോഡുകളുടെ രജിസ്ട്രി",
    ES: "📡 Registro de Nodos ESP32", FR: "📡 Registre des Nœuds ESP32", DE: "📡 ESP32-Knotenregister", JA: "📡 ESP32ノード一覧", ZH: "📡 ESP32节点注册表", AR: "📡 سجل عقد ESP32"
  },
  "ESP32 Nodes Registry": {
    KN: "ESP32 ನೋಡ್‌ಗಳ ರಿಜಿಸ್ಟ್ರಿ", HI: "ESP32 नोड्स रजिस्ट्री", TA: "ESP32 முனையங்கள் பதிவேடு", TE: "ESP32 నోడ్ల రిజిస్ట్రీ", ML: "ESP32 നോഡുകളുടെ രജിസ്ട്രി"
  },
  "🛡️ Quarantined Anomalies": {
    KN: "🛡️ ಕ್ವಾರಂಟೈನ್ ಮಾಡಿದ ವೈಪರೀತ್ಯಗಳು", HI: "🛡️ अलग की गई विसंगतियां", TA: "🛡️ தனிமைப்படுத்தப்பட்ட முரண்பாடுகள்", TE: "🛡️ క్వారంటైన్ చేసిన క్రమరాహిత్యాలు", ML: "🛡️ ക്വാറന്റൈൻ ചെയ്ത വ്യതിയാനങ്ങൾ",
    ES: "🛡️ Anomalías en Cuarentena", FR: "🛡️ Anomalies en Quarantaine", DE: "🛡️ Quarantänisierte Anomalien", JA: "🛡️ 隔離された異常値", ZH: "🛡️ 隔离的异常", AR: "🛡️ الشذوذات المعزولة"
  },
  "Quarantined Anomalies": {
    KN: "ಕ್ವಾರಂಟೈನ್ ಮಾಡಿದ ವೈಪರೀತ್ಯಗಳು", HI: "अलग की गई विसंगतियां", TA: "தனிமைப்படுத்தப்பட்ட முரண்பாடுகள்", TE: "క్వారంటైన్ చేసిన క్రమరాహిత్యాలు", ML: "ക്വാറന്റൈൻ ചെയ്ത വ്യതിയാനങ്ങൾ"
  },
  "Spoken Voice Alerts": {
    KN: "ಧ್ವನಿ ಎಚ್ಚರಿಕೆಗಳು", HI: "ध्वनि चेतावनी", TA: "குரல் எச்சரிக்கைகள்", TE: "వాయిస్ హెచ్చరికలు", ML: "ശബ്ദ മുന്നറിയിപ്പുകൾ",
    ES: "Alertas por Voz", FR: "Alertes Vocales", DE: "Sprachwarnungen", JA: "音声アラート", ZH: "语音警报", AR: "تنبيهات صوتية"
  },
  "Demo Mode": {
    KN: "ಡೆಮೊ ಮೋಡ್", HI: "डेमो मोड", TA: "டெமோ பயன்முறை", TE: "డెమో మోడ్", ML: "ഡെമോ മോഡ്",
    ES: "Modo de Demostración", FR: "Mode Démo", DE: "Demo-Modus", JA: "デモモード", ZH: "演示模式", AR: "وضع العرض التوضيحي"
  },

  // Left Sidebar: Zone Monitor & Stations List
  "ZONE MONITOR": {
    KN: "ವಲಯ ಮಾನಿಟರ್", HI: "ज़ोन मॉनिटर", TA: "மண்டல கண்காணிப்பு", TE: "జోన్ మానిటర్", ML: "മേഖല നിരീക്ഷണം",
    ES: "Monitor de Zona", FR: "Moniteur de Zone", DE: "Zonenmonitor", JA: "ゾーン監視", ZH: "区域监控", AR: "مراقبة المنطقة"
  },
  "ZONE MONITOR / SENSOR STATE": {
    KN: "ವಲಯ ಮಾನಿಟರ್ / ಸಂವೇದಕ ಸ್ಥಿತಿ", HI: "ज़ोन मॉनिटर / सेंसर स्थिति", TA: "மண்டல கண்காணிப்பு / சென்சார் நிலை", TE: "జోన్ మానిటర్ / సెన్సార్ స్థితి", ML: "മേഖല നിരീക്ഷണം / സെൻസർ അവസ്ഥ"
  },
  "Filter 32 world stations...": {
    KN: "32 ಜಾಗತಿಕ ನಿಲ್ದಾಣಗಳನ್ನು ಹುಡುಕಿ...", HI: "32 वैश्विक स्टेशनों को फ़िल्टर करें...", TA: "32 உலக நிலையங்களை வடிகட்டுக...", TE: "32 ప్రపంచ స్టేషన్లను శోధించండి...", ML: "32 ആഗോള സ്റ്റേഷനുകൾ ഫിൽട്ടർ ചെയ്യുക...",
    ES: "Filtrar 32 estaciones mundiales...", FR: "Filtrer 32 stations mondiales...", DE: "32 Weltstationen filtern...", JA: "世界32拠点を検索...", ZH: "筛选全球32个监测站...", AR: "تصفية 32 محطة عالمية..."
  },
  "ALL": {
    KN: "ಎಲ್ಲಾ", HI: "सभी", TA: "அனைத்தும்", TE: "అన్నీ", ML: "എല്ലാം",
    ES: "TODOS", FR: "TOUS", DE: "ALLE", JA: "すべて", ZH: "全部", AR: "الكل"
  },
  "INDIA": {
    KN: "ಭಾರತ", HI: "भारत", TA: "இந்தியா", TE: "భారతదేశం", ML: "ഇന്ത്യ",
    ES: "India", FR: "Inde", DE: "Indien", JA: "インド", ZH: "印度", AR: "الهند"
  },
  "ASIA": {
    KN: "ಏಷ್ಯಾ", HI: "एशिया", TA: "ஆசியா", TE: "ఆసియా", ML: "ഏഷ്യ",
    ES: "Asia", FR: "Asie", DE: "Asien", JA: "アジア", ZH: "亚洲", AR: "آسيا"
  },
  "ALPS": {
    KN: "ಆಲ್ಪ್ಸ್", HI: "आल्प्स", TA: "ஆல்ப்ஸ்", TE: "ఆల్ప్స్", ML: "ആൽപ്സ്",
    ES: "Alpes", FR: "Alpes", DE: "Alpen", JA: "アルプス", ZH: "阿尔卑斯", AR: "الألب"
  },
  "AMERICAS": {
    KN: "ಅಮೆರಿಕ", HI: "अमेरिका", TA: "அமெரிக்கா", TE: "అమెరికా", ML: "അമേരിക്ക",
    ES: "Américas", FR: "Amériques", DE: "Amerika", JA: "南北アメリカ", ZH: "美洲", AR: "الأمريكتان"
  },
  "AMER": {
    KN: "ಅಮೆರಿಕ", HI: "अमेरिका", TA: "அமெரிக்கா", TE: "అమెరికా", ML: "അമേരിക്ക"
  },
  "AFRICA/OCEANIA": {
    KN: "ಆಫ್ರಿಕಾ/ಓಷಿಯಾನಿಯಾ", HI: "अफ्रीका/ओशिनिया", TA: "ஆப்பிரிக்கா/ஓசியானியா", TE: "ఆఫ్రికా/ఓషియానియా", ML: "ആഫ്രിക്ക/ഓഷ്യാനിയ",
    ES: "África/Oceanía", FR: "Afrique/Océanie", DE: "Afrika/Ozeanien", JA: "アフリカ・オセアニア", ZH: "非洲/大洋洲", AR: "إفريقيا/أوقيانوسيا"
  },
  "AF/OC": {
    KN: "ಆಫ್ರಿಕಾ/ಓಷಿಯಾನಿಯಾ", HI: "अफ्रीका/ओशिनिया", TA: "ஆப்பிரிக்கா/ஓசியானியா", TE: "ఆఫ్రికా/ఓషియానియా", ML: "ആഫ്രിക്ക/ഓഷ്യാനിയ"
  },
  "No stations match search criteria.": {
    KN: "ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ನಿಲ್ದಾಣಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.", HI: "खोज मानदंड से कोई स्टेशन मेल नहीं खाता।", TA: "தேடல் நிபந்தனைகளுக்கு எந்த நிலையமும் பொருந்தவில்லை.", TE: "శోధన ప్రమాణాలకు సరిపోలే స్టేషన్లు లేవు.", ML: "തിരയൽ മാനദണ്ഡങ്ങളുമായി പൊരുത്തപ്പെടുന്ന സ്റ്റേഷനുകളില്ല.",
    ES: "Ninguna estación coincide con los criterios de búsqueda.", FR: "Aucune station ne correspond aux critères de recherche.", DE: "Keine Stationen entsprechen den Suchkriterien.", JA: "検索条件に一致する観測局はありません。", ZH: "没有找到符合搜索条件的监测站。", AR: "لا توجد محطات مطابقة لمعايير البحث."
  },
  "NETWORK BACKHAUL": {
    KN: "ನೆಟ್‌ವರ್ಕ್ ಬ್ಯಾಕ್‌ಹಾಲ್", HI: "नेटवर्क बैकहॉल", TA: "நெட்வொர்க் பேக்ஹால்", TE: "నెట్‌వర్క్ బ్యాక్‌హాల్", ML: "നെറ്റ്‌വർക്ക് ബാക്ക്‌ഹോൾ"
  },
  "ACTIVE NODES": {
    KN: "ಸಕ್ರಿಯ ನೋಡ್‌ಗಳು", HI: "सक्रिय नोड्स", TA: "செயலில் உள்ள முனையங்கள்", TE: "క్రియాశీల నోడ్లు", ML: "സജീവ നോഡുകൾ",
    ES: "Nodos Activos", FR: "Nœuds Actifs", DE: "Aktive Knoten", JA: "アクティブノード", ZH: "活动节点", AR: "العقد النشطة"
  },
  "SOLAR BATTERY": {
    KN: "ಸೌರ ಬ್ಯಾಟರಿ", HI: "सौर बैटरी", TA: "சூரிய மின்கலம்", TE: "సౌర బ్యాటరీ", ML: "സോളാർ ബാറ്ററി",
    ES: "Batería Solar", FR: "Batterie Solaire", DE: "Solarbatterie", JA: "ソーラーバッテリー", ZH: "太阳能电池", AR: "بطارية شمسية"
  },
  "RISK TRACE": {
    KN: "ಅಪಾಯದ ಜಾಡು", HI: "जोखिम ट्रेस", TA: "ஆபத்து தடமறிதல்", TE: "ప్రమాద ట్రేస్", ML: "അപകട ഗതി"
  },
  "SENSOR NETWORK": {
    KN: "ಸಂವೇದಕ ಜಾಲ", HI: "सेंसर नेटवर्क", TA: "சென்சார் நெட்வொர்க்", TE: "సెన్సార్ నెట్‌వర్క్", ML: "സെൻസർ ശൃംഖല"
  },
  "CHANNELS ONLINE": {
    KN: "ಚಾನಲ್‌ಗಳು ಆನ್‌ಲೈನ್", HI: "चैनल ऑनलाइन", TA: "சேனல்கள் ஆன்லைனில்", TE: "ఛానెల్‌లు ఆన్‌లైన్", ML: "ചാനലുകൾ ഓൺലൈൻ"
  },
  "DATA LINK": {
    KN: "ಡೇಟಾ ಲಿಂಕ್", HI: "डेटा लिंक", TA: "தரவு இணைப்பு", TE: "డేటా లింక్", ML: "ഡാറ്റ ലിങ്ക്"
  },
  "MQTT LATENCY": {
    KN: "MQTT ಸುಪ್ತತೆ", HI: "MQTT विलंबता", TA: "MQTT தாமதம்", TE: "MQTT జాప్యం", ML: "MQTT ലേറ്റൻസി"
  },
  "NODE BATTERY": {
    KN: "ನೋಡ್ ಬ್ಯಾಟರಿ", HI: "नोड बैटरी", TA: "முனைய பேட்டரி", TE: "నోడ్ బ్యాటరీ", ML: "നോഡ് ബാറ്ററി"
  },

  // Right Sidebar: Zone Intelligence & Details
  "ZONE INTELLIGENCE": {
    KN: "ವಲಯ ಬುದ್ಧಿಮತ್ತೆ", HI: "ज़ोन इंटेलिजेंस", TA: "மண்டல நுண்ணறிவு", TE: "జోన్ ఇంటెలిజెన్స్", ML: "മേഖല വിവരങ്ങൾ",
    ES: "Inteligencia de Zona", FR: "Intelligence de Zone", DE: "Zonen-Intelligenz", JA: "ゾーンインテリジェンス", ZH: "区域智能情报", AR: "استخبارات المنطقة"
  },
  "DETAILS": {
    KN: "ವಿವರಗಳು", HI: "विवरण", TA: "விவரங்கள்", TE: "వివరాలు", ML: "വിശദാംശങ്ങൾ",
    ES: "Detalles", FR: "Détails", DE: "Details", JA: "詳細", ZH: "详情", AR: "تفاصيل"
  },
  "SELECTED NODE": {
    KN: "ಆಯ್ಕೆಮಾಡಿದ ನೋಡ್", HI: "चयनित नोड", TA: "தேர்ந்தெடுக்கப்பட்ட முனையம்", TE: "ఎంచుకున్న నోడ్", ML: "തിരഞ്ഞെടുത്ത നോഡ്"
  },
  "LOCATION TELEMETRY STATUS": {
    KN: "ಸ್ಥಳ ಟೆಲಿಮೆಟ್ರಿ ಸ್ಥಿತಿ", HI: "स्थान टेलीमेट्री स्थिति", TA: "இருப்பிட டெலிமெட்ரி நிலை", TE: "స్థాన టెలిమెట్రీ స్థితి", ML: "ലൊക്കേഷൻ ടെലിമെട്രി നില"
  },
  "DATA CONFIDENCE": {
    KN: "ಡೇಟಾ ವಿಶ್ವಾಸ", HI: "डेटा विश्वास", TA: "தரவு நம்பிக்கை", TE: "డేటా విశ్వాసం", ML: "ഡാറ്റാ വിശ്വാസ്യത"
  },
  "NEAREST REPORTED EVENT": {
    KN: "ಹತ್ತಿರದ ದಾಖಲಾದ ಘಟನೆ", HI: "निकटतम दर्ज घटना", TA: "அருகிலுள்ள பதிவான நிகழ்வு", TE: "సమీపంలోని నమోదైన సంఘటన", ML: "ഏറ്റവും അടുത്ത സംഭവം"
  },
  "ELEVATION": {
    KN: "ಎತ್ತರ", HI: "ऊंचाई", TA: "உயரம்", TE: "ఎత్తు", ML: "ഉയരം",
    ES: "Elevación", FR: "Élévation", DE: "Höhe", JA: "標高", ZH: "海拔", AR: "الارتفاع"
  },
  "BEDROCK LITHOLOGY": {
    KN: "ತಳಪಾಯದ ಶಿಲಾಶಾಸ್ತ್ರ", HI: "आधारशिला भूविज्ञान", TA: "அடித்தள பாறை அமைப்பு", TE: "పునాది శిలాశాస్త్రం", ML: "ശിലാഘടന",
    ES: "Litología del Lecho Rocoso", FR: "Lithologie du Socle", DE: "Grundgebirgs-Lithologie", JA: "基盤岩質", ZH: "基岩岩性", AR: "علم الصخور الأساسية"
  },
  "LANDSORA RISK SCORE": {
    KN: "ಲ್ಯಾಂಡ್‌ಸೋರಾ ಅಪಾಯದ ಅಂಕ", HI: "लैंडसोरा जोखिम स्कोर", TA: "லேண்ட்சோரா ஆபத்து மதிப்பெண்", TE: "లాండ్‌సోరా ప్రమాద స్కోరు", ML: "ലാൻഡ്സോറ അപകട സ്കോർ",
    ES: "Puntuación de Riesgo Landsora", FR: "Score de Risque Landsora", DE: "Landsora-Risikowert", JA: "Landsoraリスクスコア", ZH: "Landsora风险评分", AR: "درجة مخاطر لاندسورا"
  },
  "HAZARD": {
    KN: "ಅಪಾಯ", HI: "खतरा", TA: "ஆபத்து", TE: "ప్రమాదం", ML: "അപകടം",
    ES: "Peligro", FR: "Danger", DE: "Gefahr", JA: "危険", ZH: "危害", AR: "خطر"
  },
  "SLOPE FAILURE RISK": {
    KN: "ಇಳಿಜಾರು ವೈಫಲ್ಯದ ಅಪಾಯ", HI: "ढलान विफलता जोखिम", TA: "சரிவு சரிவு அபாயம்", TE: "కొండచరియల పతనం ప్రమాదం", ML: "ചരിവ് തകർച്ചാ സാധ്യത",
    ES: "Riesgo de Falla de Talud", FR: "Risque de Glissement de Pente", DE: "Hangrutsch-Risiko", JA: "斜面崩壊リスク", ZH: "边坡失稳风险", AR: "خطر انهيار المنحدر"
  },
  "IMMINENT DANGER": {
    KN: "ಆಸನ್ನ ಅಪಾಯ", HI: "आसन्न खतरा", TA: "உடனடி ஆபத்து", TE: "తక్షణ ప్రమాదం", ML: "ആസന്നമായ അപകടം",
    ES: "Peligro Inminente", FR: "Danger Imminent", DE: "Unmittelbare Gefahr", JA: "差し迫った危険", ZH: "迫在眉睫的危险", AR: "خطر وشيك"
  },
  "ACTIVE SURVEILLANCE": {
    KN: "ಸಕ್ರಿಯ ಕಣ್ಗಾವಲು", HI: "सक्रिय निगरानी", TA: "தீவிர கண்காணிப்பு", TE: "క్రియాశీల నిఘా", ML: "സജീവ നിരീക്ഷണം",
    ES: "Vigilancia Activa", FR: "Surveillance Active", DE: "Aktive Überwachung", JA: "警戒監視中", ZH: "严密监控中", AR: "مراقبة نشطة"
  },
  "LOW PROBABILITY": {
    KN: "ಕಡಿಮೆ ಸಂಭವನೀಯತೆ", HI: "कम संभावना", TA: "குறைந்த சாத்தியக்கூறு", TE: "తక్కువ సంభావ్యత", ML: "കുറഞ്ഞ സാധ്യത",
    ES: "Baja Probabilidad", FR: "Faible Probabilité", DE: "Geringe Wahrscheinlichkeit", JA: "低確率", ZH: "低概率", AR: "احتمالية منخفضة"
  },
  "EVACUATION ADVISORY": {
    KN: "ಸ್ಥಳಾಂತರ ಸಲಹೆ", HI: "निकासी परामर्श", TA: "வெளியேற்ற ஆலோசனை", TE: "తరలింపు సలహా", ML: "ഒഴിപ്പിക്കൽ നിർദ്ദേശം",
    ES: "Aviso de Evacuación", FR: "Avis d'Évacuation", DE: "Evakuierungshinweis", JA: "避難勧告", ZH: "疏散警示", AR: "إشعار إخلاء"
  },
  "RAINFALL (24H)": {
    KN: "ಮಳೆ ಪ್ರಮಾಣ (24 ಗಂ)", HI: "वर्षा (24 घंटे)", TA: "மழைப்பொழிவு (24 மணி)", TE: "వర్షపాతం (24 గం)", ML: "മഴയളവ് (24 മ)",
    ES: "Lluvia (24h)", FR: "Pluie (24h)", DE: "Regenfall (24h)", JA: "降雨量 (24時間)", ZH: "降雨量 (24小时)", AR: "هطول الأمطار (24 ساعة)"
  },
  "RAINFALL": {
    KN: "ಮಳೆ ಪ್ರಮಾಣ", HI: "वर्षा", TA: "மழைப்பொழிவு", TE: "వర్షపాతం", ML: "മഴയളവ്",
    ES: "Precipitación", FR: "Précipitation", DE: "Niederschlag", JA: "降水量", ZH: "降水量", AR: "الأمطار"
  },
  "Threshold": {
    KN: "ಮಿತಿ", HI: "सीमा", TA: "வரம்பு", TE: "పరిమితి", ML: "പരിധി",
    ES: "Umbral", FR: "Seuil", DE: "Schwellenwert", JA: "しきい値", ZH: "阈值", AR: "عتبة"
  },
  "PORE SATURATION": {
    KN: "ರಂಧ್ರದ ಶುದ್ಧತ್ವ", HI: "छिद्र संतृप्ति", TA: "துளை நீரின் செறிவு", TE: "రంధ్ర సంతృప్తత", ML: "ജല സാച്ചുറേഷൻ",
    ES: "Saturación Porosa", FR: "Saturation des Pores", DE: "Porensättigung", JA: "間隙飽和度", ZH: "孔隙饱和度", AR: "تشبع المسام"
  },
  "SOIL MOISTURE": {
    KN: "ಮಣ್ಣಿನ ತೇವಾಂಶ", HI: "मृदा नमी", TA: "மண் ஈரப்பதம்", TE: "నేల తేమ", ML: "മണ്ണിലെ ഈർപ്പം",
    ES: "Humedad del Suelo", FR: "Humidité du Sol", DE: "Bodenfeuchte", JA: "土壌水分", ZH: "土壤湿度", AR: "رطوبة التربة"
  },
  "Capacitive probe": {
    KN: "ಕೆಪಾಸಿಟಿವ್ ಪ್ರೋಬ್", HI: "कैपेसिटिव जांच", TA: "கெபாசிட்டிவ் ஆய்வு", TE: "కెపాసిటివ్ ప్రోబ్", ML: "കപ്പാസിറ്റീവ് പ്രോബ്",
    ES: "Sonda capacitiva", FR: "Sonde capacitive", DE: "Kapazitive Sonde", JA: "静電容量プローブ", ZH: "电容式传感器", AR: "مسبار سعوي"
  },
  "SLOPE TILT RATE": {
    KN: "ಇಳಿಜಾರಿನ ಓರೆಯ ದರ", HI: "ढलान झुकाव दर", TA: "சரிவு சாய்வு விகிதம்", TE: "వాలు వంపు రేటు", ML: "ചരിവിന്റെ വ്യതിയാന നിരക്ക്",
    ES: "Tasa de Inclinación de Talud", FR: "Taux d'Inclinaison de Pente", DE: "Hangneigungsrate", JA: "斜面傾斜変化率", ZH: "边坡倾角变化率", AR: "معدل ميل المنحدر"
  },
  "SLOPE TILT": {
    KN: "ಇಳಿಜಾರಿನ ಓರೆ", HI: "ढलान झुकाव", TA: "சரிவு கோணம்", TE: "వాలు వంపు", ML: "ചരിവിന്റെ ചരിവ്",
    ES: "Inclinación de Talud", FR: "Inclinaison", DE: "Hangneigung", JA: "斜面傾斜", ZH: "边坡倾斜", AR: "ميل المنحدر"
  },
  "Biaxial tiltmeter": {
    KN: "ದ್ವಿಯಾಕ್ಷಿಕ ಟಿಲ್ಟ್‌ಮೀಟರ್", HI: "द्विअक्षीय झुकावमापी", TA: "இரு அச்சு சாய்வுமானி", TE: "ద్విఅక్ష టిల్ట్‌మీటర్", ML: "ദ്വിഅക്ഷ ചരിവുമാപിനി",
    ES: "Inclinómetro biaxial", FR: "Inclinomètre biaxial", DE: "Biaxialer Neigungsmesser", JA: "2軸傾斜計", ZH: "双轴倾角仪", AR: "مقياس ميل ثنائي المحور"
  },
  "FACTOR OF SAFETY": {
    KN: "ಸುರಕ್ಷತಾ ಅಂಶ (FoS)", HI: "सुरक्षा का कारक", TA: "பாதுகாப்புக் காரணி", TE: "భద్రతా కారకం", ML: "സുരക്ഷാ ഘടകം",
    ES: "Factor de Seguridad", FR: "Facteur de Sécurité", DE: "Sicherheitsfaktor", JA: "安全率", ZH: "安全系数", AR: "معامل الأمان"
  },
  "Mohr-Coulomb": {
    KN: "ಮೋರ್-ಕೂಲಂಬ್", HI: "मोहर-कूलम्ब", TA: "மோர்-கூலம்ப்", TE: "మోర్-కూలంబ్", ML: "മോർ-കൂളോം",
    ES: "Mohr-Coulomb", FR: "Mohr-Coulomb", DE: "Mohr-Coulomb", JA: "モール・クーロン", ZH: "摩尔-库仑", AR: "مور-كولوم"
  },
  "EXPAND LIVE RADAR & FORECAST": {
    KN: "ಲೈವ್ ರಾಡಾರ್ ಮತ್ತು ಮುನ್ಸೂಚನೆ ವಿಸ್ತರಿಸಿ", HI: "लाइव रडार और पूर्वानुमान विस्तार करें", TA: "நேரலை ரேடார் மற்றும் முன்னறிவிப்பை விரிவாக்கு", TE: "లైవ్ రాడార్ మరియు సూచనను విస్తరించండి", ML: "തത്സമയ റഡാറും പ്രവചനവും വികസിപ്പിക്കുക",
    ES: "Expandir Radar y Pronóstico en Vivo", FR: "Étendre Radar et Prévisions en Direct", DE: "Live-Radar & Vorhersage erweitern", JA: "リアルタイムレーダーと予報を展開", ZH: "展开实时雷达与天气预报", AR: "توسيع الرادار المباشر والتوقعات"
  },
  "MOHR-COULOMB SLOPE SIMULATOR": {
    KN: "ಮೋರ್-ಕೂಲಂಬ್ ಇಳಿಜಾರು ಸಿಮ್ಯುಲೇಟರ್", HI: "मोहर-कूलम्ब ढलान सिम्युलेटर", TA: "மோர்-கூலம்ப் சரிவு சிமுலேட்டர்", TE: "మోర్-కూలంబ్ వాలు సిమ్యులేటర్", ML: "മോർ-കൂളോം ചരിവ് സിമുലേറ്റർ",
    ES: "Simulador de Talud Mohr-Coulomb", FR: "Simulateur de Pente Mohr-Coulomb", DE: "Mohr-Coulomb-Hangsimulator", JA: "モール・クーロン斜面シミュレーター", ZH: "摩尔-库仑边坡模拟器", AR: "محاكي منحدرات مور-كولوم"
  },
  "🌦️ EXPAND LIVE RADAR & FORECAST": {
    KN: "🌦️ ಲೈವ್ ರಾಡಾರ್ ಮತ್ತು ಮುನ್ಸೂಚನೆ ವಿಸ್ತರಿಸಿ", HI: "🌦️ लाइव रडार और पूर्वानुमान विस्तार करें", TA: "🌦️ நேரலை ரேடார் மற்றும் முன்னறிவிப்பை விரிவாக்கு", TE: "🌦️ లైవ్ రాడార్ మరియు సూచనను విస్తరించండి", ML: "🌦️ തത്സമയ റഡാറും പ്രവചനവും വികസിപ്പിക്കുക"
  },
  "⚖️ MOHR-COULOMB SLOPE SIMULATOR": {
    KN: "⚖️ ಮೋರ್-ಕೂಲಂಬ್ ಇಳಿಜಾರು ಸಿಮ್ಯುಲೇಟರ್", HI: "⚖️ मोहर-कूलम्ब ढलान सिम्युलेटर", TA: "⚖️ மோர்-கூலம்ப் சரிவு சிமுலேட்டர்", TE: "⚖️ మోర్-కూలంబ్ వాలు సిమ్యులేటర్", ML: "⚖️ മോർ-കൂളോം ചരിവ് സിമുലേറ്റർ"
  },

  // Advisory Text Statements
  "Stable conditions. Soil moisture and tilt readings are within normal seasonal limits. No movement detected.": {
    KN: "ಸ್ಥಿರ ಪರಿಸ್ಥಿತಿಗಳು. ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಇಳಿಜಾರಿನ ವಾಚನಗಳು ಸಾಮಾನ್ಯ ಕಾಲೋಚಿತ ಮಿತಿಯಲ್ಲಿದೆ. ಯಾವುದೇ ಚಲನೆ ಪತ್ತೆಯಾಗಿಲ್ಲ.",
    HI: "स्थिर स्थिति। मिट्टी की नमी और झुकाव सामान्य मौसमी सीमा में हैं। कोई हलचल नहीं देखी गई।",
    TA: "நிலையான நிலைமைகள். மண் ஈரப்பதம் மற்றும் சாய்வு அளவீடுகள் வழக்கமான பருவகால வரம்புகளுக்குள் உள்ளன. இயக்கம் ஏதுமில்லை.",
    TE: "స్థిరమైన పరిస్థితులు. నేల తేమ మరియు వాలు రీడింగులు సాధారణ పరిమితుల్లో ఉన్నాయి. ఎటువంటి కదలిక కనిపించలేదు.",
    ML: "സുരക്ഷിതമായ അവസ്ഥ. മണ്ണിലെ ഈർപ്പവും ചരിവിന്റെ റീഡിംഗുകളും സാധാരണ പരിധിക്കുള്ളിലാണ്. ചലനങ്ങളൊന്നും കണ്ടെത്തിയിട്ടില്ല.",
    ES: "Condiciones estables. La humedad del suelo y las lecturas de inclinación están dentro de los límites estacionales normales.",
    FR: "Conditions stables. L'humidité du sol et l'inclinaison sont dans les limites saisonnières normales.",
    DE: "Stabile Bedingungen. Bodenfeuchte und Neigungswerte liegen im normalen saisonalen Bereich.",
    JA: "安定した状態です。土壌水分と傾斜計の数値は季節基準値内です。変動は検知されていません。",
    ZH: "情况稳定。土壤湿度和倾斜读数均在正常季节范围内。未检测到位移。",
    AR: "ظروف مستقرة. رطوبة التربة وقراءات الميل ضمن الحدود الموسمية الطبيعية. لم يتم رصد أي حركة."
  },
  "Watch advisory. Soil is nearing saturation and micro-tilt is creeping up. Alert local panchayats and monitor pass roads.": {
    KN: "ಎಚ್ಚರಿಕೆ ಸಲಹೆ. ಮಣ್ಣು ಶುದ್ಧತ್ವವನ್ನು ಸಮೀಪಿಸುತ್ತಿದೆ ಮತ್ತು ಸೂಕ್ಷ್ಮ ಇಳಿಜಾರು ಹೆಚ್ಚುತ್ತಿದೆ. ಸ್ಥಳೀಯ ಪಂಚಾಯಿತಿಗಳನ್ನು ಎಚ್ಚರಿಸಿ ಮತ್ತು ಘಾಟ್ ರಸ್ತೆಗಳನ್ನು ಗಮನಿಸಿ.",
    HI: "निगरानी परामर्श। मिट्टी संतृप्ति के करीब है और सूक्ष्म-झुकाव बढ़ रहा है। स्थानीय पंचायतों को सचेत करें और सड़कों की निगरानी करें।",
    TA: "கண்காணிப்பு ஆலோசனை. மண் நிறைவு நிலையை நெருங்குகிறது, சாய்வு உயர்கிறது. உள்ளாட்சி அமைப்புகளை எச்சரித்து மலைப்பாதைகளை கண்காணிக்கவும்.",
    TE: "నిఘా సలహా. నేల సంతృప్తతకు చేరువవుతోంది మరియు సూక్ష్మ వంపు పెరుగుతోంది. స్థానిక పంచాయతీలను అప్రమత్తం చేసి రహదారులను పర్యవేక్షించండి.",
    ML: "ജാഗ്രതാ നിർദ്ദേശം. മണ്ണ് സാച്ചുറേഷനിലേക്ക് അടുക്കുന്നു, ചെറിയ ചരിവ് മാറ്റം കാണുന്നു. പഞ്ചായത്തുകൾക്ക് മുന്നറിയിപ്പ് നൽകി ചുരം റോഡുകൾ നിരീക്ഷിക്കുക.",
    ES: "Aviso de vigilancia. El suelo se acerca a la saturación y la microinclinación aumenta. Alerte a las autoridades y vigile los pasos.",
    FR: "Avis de vigilance. Le sol approche de la saturation et l'inclinaison augmente. Alertez les autorités et surveillez les routes.",
    DE: "Überwachungshinweis. Der Boden nähert sich der Sättigung und die Mikroneigung steigt. Behörden benachrichtigen und Pässe überwachen.",
    JA: "警戒監視勧告。土壌が飽和状態に近づき微小傾斜が増加しています。関係機関に通報し山岳道路を監視してください。",
    ZH: "警戒提醒。土壤接近饱和，微倾斜在逐渐增加。请提醒相关机构并监控山口通道。",
    AR: "إشعار مراقبة. تقترب التربة من التشبع والميل الطفيف في ازدياد. قم بتنبيه الجهات المعنية ومراقبة الطرق الجبلية."
  },
  "Critical danger. Saturated soil and rapid slope tilt indicate shearing. Evacuate downstream homes and close the pass now.": {
    KN: "ತೀವ್ರ ಅಪಾಯ. ತೇವಾಂಶದಿಂದ ಕೂಡಿದ ಮಣ್ಣು ಮತ್ತು ತ್ವರಿತ ಇಳಿಜಾರು ಭೂಕುಸಿತವನ್ನು ಸೂಚಿಸುತ್ತವೆ. ನದೀಮುಖದ ಮನೆಗಳನ್ನು ತಕ್ಷಣ ತೆರವುಗೊಳಿಸಿ ಮತ್ತು ರಸ್ತೆಯನ್ನು ಮುಚ್ಚಿ.",
    HI: "अत्यधिक खतरा। संतृप्त मिट्टी और तीव्र ढलान विरूपण भूस्खलन का संकेत देते हैं। निचले घरों को तुरंत खाली कराएं और मार्ग बंद करें।",
    TA: "அதிதீவிர அபாயம். மண்ணின் அதிகப்படியான ஈரப்பதம் மற்றும் வேகமான சாய்வு நிலச்சரிவை குறிக்கிறது. உடனடியாக வீடுகளை காலி செய்து சாலையை மூடவும்.",
    TE: "తీవ్ర ప్రమాదం. నేలలో అధిక సంతృప్తత మరియు వేగవంతమైన వాలు కొండచరియల విరుపును సూచిస్తున్నాయి. దిగువ ఇళ్లను వెంటనే ఖాళీ చేయించి మార్గాన్ని మూసివేయండి.",
    ML: "ഗുരുതരമായ അപകടം. മണ്ണിലെ ജലാംശവും വേഗതയേറിയ ചരിവും മണ്ണിടിച്ചിലിനെ സൂചിപ്പിക്കുന്നു. താഴ്ന്ന പ്രദേശങ്ങളിലെ വീടുകൾ ഒഴിപ്പിക്കുകയും റോഡുകൾ അടയ്ക്കുകയും ചെയ്യുക.",
    ES: "Peligro crítico. El suelo saturado y la rápida inclinación indican deslizamiento inminente. Evacúe las viviendas y cierre el paso de inmediato.",
    FR: "Danger critique. Le sol saturé et l'inclinaison rapide indiquent une rupture. Évacuez les habitations et fermez la route immédiatement.",
    DE: "Kritische Gefahr. Gesättigter Boden und rasche Hangneigung deuten auf Scherbrüche hin. Häuser sofort evakuieren und Pass sperren.",
    JA: "極めて危険。土壌の過飽和と急速な傾斜変化が剪断破壊を示しています。直ちに下流の住民を避難させ峠道を閉鎖してください。",
    ZH: "极度危险。饱和土壤和急速倾斜表明发生剪切破坏。请立即疏散下游居民并封锁山口通道。",
    AR: "خطر حرج. التربة المشبعة والميل السريع للمنحدر يشيران إلى انهيار وشيك. قم بإخلاء المنازل وإغلاق الممر الجبلي فوراً."
  },

  // Bottom Center Dock & Drawer
  "SITES": {
    KN: "ತಾಣಗಳು", HI: "साइटें", TA: "தளங்கள்", TE: "సైట్లు", ML: "സൈറ്റുകൾ",
    ES: "SITIOS", FR: "SITES", DE: "STANDORTE", JA: "拠点", ZH: "监测点", AR: "مواقع"
  },
  "CRITICAL": {
    KN: "ಗಂಭೀರ", HI: "गंभीर", TA: "தீவிர", TE: "తీవ్ర", ML: "ഗുരുതരം",
    ES: "CRÍTICO", FR: "CRITIQUE", DE: "KRITISCH", JA: "危機的", ZH: "危险", AR: "حرج"
  },
  "WATCH": {
    KN: "ಎಚ್ಚರಿಕೆ", HI: "निगरानी", TA: "கண்காணிப்பு", TE: "నిఘా", ML: "ജാഗ്രത",
    ES: "VIGILANCIA", FR: "SURVEILLANCE", DE: "BEOBACHTUNG", JA: "警戒", ZH: "关注", AR: "مراقبة"
  },
  "STABLE": {
    KN: "ಸ್ಥಿರ", HI: "स्थिर", TA: "நிலையான", TE: "స్థిరంగా", ML: "സുരക്ഷിതം",
    ES: "ESTABLE", FR: "STABLE", DE: "STABIL", JA: "安定", ZH: "稳定", AR: "مستقر"
  },
  "AVG TILT": {
    KN: "ಸರಾಸರಿ ಓರೆ", HI: "औसत झुकाव", TA: "சராசரி சாய்வு", TE: "సగటు వంపు", ML: "ശരാശരി ചരിവ്",
    ES: "Inclinación Media", FR: "Inclinaison Moyenne", DE: "Durchschnittliche Neigung", JA: "平均傾斜", ZH: "平均倾斜", AR: "متوسط ​​الميل"
  },
  "HIDE TELEMETRY & LOGS ▼": {
    KN: "ಟೆಲಿಮೆಟ್ರಿ ಮತ್ತು ಲಾಗ್‌ಗಳನ್ನು ಮರೆಮಾಡಿ ▼", HI: "टेलीमेट्री और लॉग छुपाएं ▼", TA: "டெலிமெட்ரி மற்றும் பதிவுகளை மறைக்க ▼", TE: "టెలిమెట్రీ & లాగ్‌లను దాచండి ▼", ML: "ടെലിമെട്രിയും ലോഗുകളും മറയ്ക്കുക ▼",
    ES: "Ocultar Telemetría y Registros ▼", FR: "Masquer Télémétrie et Journaux ▼", DE: "Telemetrie & Protokolle verbergen ▼", JA: "テレメトリと記録を隠す ▼", ZH: "隐藏遥测与日志 ▼", AR: "إخفاء القياسات والسجلات ▼"
  },
  "📊 TELEMETRY & FIELD REPORTS ▲": {
    KN: "📊 ಟೆಲಿಮೆಟ್ರಿ ಮತ್ತು ಕ್ಷೇತ್ರ ವರದಿಗಳು ▲", HI: "📊 टेलीमेट्री और फील्ड रिपोर्ट ▲", TA: "📊 டெலிமெட்ரி & கள அறிக்கைகள் ▲", TE: "📊 టెలిమెట్రీ & ఫీల్డ్ నివేదికలు ▲", ML: "📊 ടെലിമെട്രിയും ഫീൽഡ് റിപ്പോർട്ടുകളും ▲",
    ES: "📊 Telemetría e Informes de Campo ▲", FR: "📊 Télémétrie et Rapports de Terrain ▲", DE: "📊 Telemetrie & Feldberichte ▲", JA: "📊 テレメトリと現場報告 ▲", ZH: "📊 遥测与实地现场报告 ▲", AR: "📊 القياسات وتقارير الميدان ▲"
  },
  "ANALYTICS, SENSOR TELEMETRY & FIELD OPERATIONS": {
    KN: "ವಿಶ್ಲೇಷಣೆ, ಸಂವೇದಕ ಟೆಲಿಮೆಟ್ರಿ ಮತ್ತು ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು", HI: "विश्लेषिकी, सेंसर टेलीमेट्री और फील्ड संचालन", TA: "பகுப்பாய்வு, சென்சார் டெலிமெட்ரி & கள செயல்பாடுகள்", TE: "విశ్లేషణలు, సెన్సార్ టెలిమెట్రీ & ఫీల్డ్ ఆపరేషన్స్", ML: "വിശകലനം, സെൻസർ ടെലിമെട്രി & ഫീൽഡ് ഓപ്പറേഷൻസ്",
    ES: "Analítica, Telemetría de Sensores y Operaciones de Campo", FR: "Analytique, Télémétrie des Capteurs et Opérations de Terrain", DE: "Analytik, Sensortelemetrie & Feldeinsätze", JA: "分析・センサーテレメトリ・現場運用", ZH: "分析、传感器遥测与现场作业", AR: "التحليلات وقياسات الاستشعار والعمليات الميدانية"
  },
  "▼ MINIMIZE DOCK": {
    KN: "▼ ಡಾಕ್ ಕನಿಷ್ಠಗೊಳಿಸಿ", HI: "▼ डॉक छोटा करें", TA: "▼ சாளரத்தை சுருக்கு", TE: "▼ డాక్ కనిష్టీకరించు", ML: "▼ വിൻഡോ ചുരുക്കുക",
    ES: "▼ Minimizar Panel", FR: "▼ Réduire le Volet", DE: "▼ Dock minimieren", JA: "▼ パネルを最小化", ZH: "▼ 最小化底栏", AR: "▼ تصغير اللوحة"
  },

  // Analytics Cards
  "RISK SCORE — LAST 16 READINGS": {
    KN: "ಅಪಾಯದ ಅಂಕ — ಕೊನೆಯ 16 ವಾಚನಗಳು", HI: "जोखिम स्कोर — अंतिम 16 रीडिंग", TA: "ஆபத்து மதிப்பெண் — கடைசி 16 அளவீடுகள்", TE: "ప్రమాద స్కోర్ — చివరి 16 రీడింగ్‌లు", ML: "അപകട സ്കോർ — അവസാന 16 റീഡിംഗുകൾ"
  },
  "TREND": {
    KN: "ಪ್ರವೃತ್ತಿ", HI: "रुझान", TA: "போக்கு", TE: "ధోరణి", ML: "പ്രവണത",
    ES: "Tendencia", FR: "Tendance", DE: "Trend", JA: "傾向", ZH: "趋势", AR: "اتجاه"
  },
  "CURRENT": {
    KN: "ಪ್ರಸ್ತುತ", HI: "वर्तमान", TA: "தற்போதைய", TE: "ప్రస్తుత", ML: "നിലവിലെ",
    ES: "Actual", FR: "Actuel", DE: "Aktuell", JA: "現在値", ZH: "当前", AR: "حالي"
  },
  "PREVIOUS": {
    KN: "ಹಿಂದಿನ", HI: "पिछला", TA: "முந்தைய", TE: "మునుపటి", ML: "മുമ്പത്തെ",
    ES: "Anterior", FR: "Précédent", DE: "Vorherig", JA: "前回値", ZH: "之前", AR: "سابق"
  },
  "RECENT HIGH": {
    KN: "ಇತ್ತೀಚಿನ ಗರಿಷ್ಠ", HI: "हालिया उच्च", TA: "சமீபத்திய உச்சம்", TE: "ఇటీవలి గరిష్ట", ML: "സമീപകാല ഉയർന്ന നിരക്ക്",
    ES: "Máximo Reciente", FR: "Plus Haut Récent", DE: "Kürzlicher Höchstwert", JA: "最近の最高値", ZH: "近期最高", AR: "أعلى مستوى حديث"
  },
  "STATUS": {
    KN: "ಸ್ಥಿತಿ", HI: "स्थिति", TA: "நிலை", TE: "స్థితి", ML: "അവസ്ഥ",
    ES: "Estado", FR: "Statut", DE: "Status", JA: "状態", ZH: "状态", AR: "الحالة"
  },
  "WHY THIS SCORE?": {
    KN: "ಈ ಅಂಕ ಏಕೆ?", HI: "यह स्कोर क्यों?", TA: "இந்த மதிப்பெண் ஏன்?", TE: "ఈ స్కోరు ఎందుకు?", ML: "എന്തുകൊണ്ട് ഈ സ്കോർ?",
    ES: "¿Por qué este puntaje?", FR: "Pourquoi ce score ?", DE: "Warum dieser Wert?", JA: "スコアの根拠は？", ZH: "为何是此评分？", AR: "لماذا هذه النتيجة؟"
  },
  "DETERMINISTIC 4-FACTOR BREAKDOWN": {
    KN: "4-ಅಂಶಗಳ ವಿವರಣೆ", HI: "4-कारक विभाजन", TA: "4-காரணி பகுப்பாய்வு", TE: "4-కారకాల విశ్లేషణ", ML: "4-ഘടക വിശകലനം",
    ES: "Desglose Determinista de 4 Factores", FR: "Décomposition Déterministe à 4 Facteurs", DE: "Deterministische 4-Faktoren-Aufschlüsselung", JA: "決定論的4要素分析", ZH: "确定性4因素分解", AR: "تحليل محدد للعوامل الأربعة"
  },
  "RAINFALL INTENSITY": {
    KN: "ಮಳೆಯ ತೀವ್ರತೆ", HI: "वर्षा की तीव्रता", TA: "மழை தீவிரம்", TE: "వర్షపాత తీవ్రత", ML: "മഴയുടെ തീവ്രത",
    ES: "Intensidad de Lluvia", FR: "Intensité des Précipitations", DE: "Regenintensität", JA: "降雨強度", ZH: "降雨强度", AR: "شدة هطول الأمطار"
  },
  "TERRAIN / TILT ACCELERATION": {
    KN: "ಭೂಪ್ರದೇಶ / ಇಳಿಜಾರಿನ ವೇಗವರ್ಧನೆ", HI: "भूभाग / झुकाव त्वरण", TA: "நிலப்பரப்பு / சாய்வு முடுக்கம்", TE: "భూభాగం / వాలు త్వరణం", ML: "ഭൂപ്രകൃതി / ചരിവ് വേഗത",
    ES: "Terreno / Aceleración de Inclinación", FR: "Terrain / Accélération de l'Inclinaison", DE: "Gelände / Neigungsbeschleunigung", JA: "地形・傾斜加速度", ZH: "地形/倾角加速度", AR: "التضاريس / تسارع الميل"
  },
  "GEOLOGICAL BASELINE": {
    KN: "ಭೂವೈಜ್ಞಾನಿಕ ತಳಹದಿ", HI: "भूवैज्ञानिक आधार", TA: "புவியியல் அடிப்படை", TE: "భూగర్భ మూలాధారం", ML: "ഭൂമിശാസ്ത്ര അടിത്തറ",
    ES: "Línea Base Geológica", FR: "Base Géologique", DE: "Geologische Basis", JA: "地質学的ベースライン", ZH: "地质基准", AR: "الأساس الجيولوجي"
  },
  "REGIONAL EVENT CONTEXT": {
    KN: "ಪ್ರಾದೇಶಿಕ ಘಟನೆಯ ಸಂದರ್ಭ", HI: "क्षेत्रीय घटना संदर्भ", TA: "பிராந்திய நிகழ்வு சூழல்", TE: "ప్రాంతీయ సంఘటన సందర్భం", ML: "പ്രാദേശിക സംഭവ പശ്ചാത്തലം",
    ES: "Contexto de Eventos Regionales", FR: "Contexte Régional", DE: "Regionaler Ereigniskontext", JA: "地域災害コンテキスト", ZH: "区域灾害背景", AR: "سياق الأحداث الإقليمية"
  },
  "SENSOR HISTORY LOG": {
    KN: "ಸಂವೇದಕ ಇತಿಹಾಸ ಲಾಗ್", HI: "सेंसर इतिहास लॉग", TA: "சென்சார் வரலாற்று பதிவு", TE: "సెన్సార్ హిస్టరీ లాగ్", ML: "സെൻസർ ചരിത്ര ലോഗ്"
  },
  "LAST 5 READINGS": {
    KN: "ಕೊನೆಯ 5 ವಾಚನಗಳು", HI: "अंतिम 5 रीडिंग", TA: "கடைசி 5 அளவீடுகள்", TE: "చివరి 5 రీడింగ్‌లు", ML: "അവസാന 5 റീഡിംഗുകൾ"
  },
  "TIME": {
    KN: "ಸಮಯ", HI: "समय", TA: "நேரம்", TE: "సమయం", ML: "സമയം",
    ES: "Hora", FR: "Heure", DE: "Zeit", JA: "時刻", ZH: "时间", AR: "الوقت"
  },

  // Field Ops & Impact
  "EXECUTIVE SITUATION SUMMARY": {
    KN: "ಕಾರ್ಯನಿರ್ವಾಹಕ ಪರಿಸ್ಥಿತಿ ಸಾರಾಂಶ", HI: "कार्यकारी स्थिति सारांश", TA: "நிர்வாக நிலை சுருக்கம்", TE: "కార్యనిర్వాహక పరిస్థితి సారాంశం", ML: "എക്സിക്യൂട്ടീവ് സാഹചര്യ സംഗ്രഹം"
  },
  "SELECTED RISK": {
    KN: "ಆಯ್ಕೆಮಾಡಿದ ಅಪಾಯ", HI: "चयनित जोखिम", TA: "தேர்ந்தெடுக்கப்பட்ட ஆபத்து", TE: "ఎంచుకున్న ప్రమాదం", ML: "തിരഞ്ഞെടുത്ത അപകടസാധ്യത"
  },
  "POPULATION EXPOSURE*": {
    KN: "ಜನಸಂಖ್ಯೆಯ ಅಪಾಯದ ಒಡ್ಡುವಿಕೆ*", HI: "जनसंख्या जोखिम*", TA: "மக்கள் தொகை பாதிப்பு*", TE: "ప్రభావిత జనాభా*", ML: "ജനസംഖ്യാ അപകടസാധ്യത*"
  },
  "ROADS TO REVIEW": {
    KN: "ಪರಿಶೀಲಿಸಬೇಕಾದ ರಸ್ತೆಗಳು", HI: "समीक्षा के लिए सड़कें", TA: "ஆய்வுக்குரிய சாலைகள்", TE: "సమీక్షించాల్సిన రోడ్లు", ML: "പരിശോധിക്കേണ്ട റോഡുകൾ"
  },
  "RESPONSE LEVEL": {
    KN: "ಪ್ರತಿಕ್ರಿಯೆಯ ಮಟ್ಟ", HI: "प्रतिक्रिया स्तर", TA: "செயல்பாட்டு நிலை", TE: "ప్రతిస్పందన స్థాయి", ML: "പ്രതികരണ നിലവാരം"
  },
  "VILLAGES POTENTIALLY AFFECTED": {
    KN: "ಬಾಧಿತವಾಗಬಹುದಾದ ಹಳ್ಳಿಗಳು", HI: "संभावित प्रभावित गांव", TA: "பாதிக்கப்படக்கூடிய கிராமங்கள்", TE: "ప్రభావితమయ్యే గ్రామాలు", ML: "ബാധിക്കപ്പെടാൻ സാധ്യതയുള്ള ഗ്രാമങ്ങൾ"
  },
  "EMERGENCY ACCESS": {
    KN: "ತುರ್ತು ಪ್ರವೇಶಾವಕಾಶ", HI: "आपातकालीन पहुंच", TA: "அவசர அணுகல்", TE: "అత్యవసర ప్రవేశం", ML: "അടിയന്തര പ്രവേശനം"
  },
  "ALTERNATIVE ROUTE": {
    KN: "ಪರ್ಯಾಯ ಮಾರ್ಗ", HI: "वैकल्पिक मार्ग", TA: "மாற்றுப்பாதை", TE: "ప్రత్యామ్నాయ మార్గం", ML: "ഇതര വഴി"
  },
  "LIMITED": {
    KN: "ಸೀಮಿತ", HI: "सीमित", TA: "வரையறுக்கப்பட்ட", TE: "పరిమిత", ML: "പരിമിതം"
  },
  "AVAILABLE": {
    KN: "ಲಭ್ಯವಿದೆ", HI: "उपलब्ध", TA: "கிடைக்கக்கூடியது", TE: "అందుబాటులో ఉంది", ML: "ലഭ്യമാണ്"
  },
  "REVIEW REQUIRED": {
    KN: "ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ", HI: "समीक्षा आवश्यक", TA: "ஆய்வு தேவை", TE: "సమీక్ష అవసరం", ML: "പരിശോധന ആവശ്യമാണ്"
  },
  "MOUNTAIN PASS & ROAD STATUS": {
    KN: "ಪರ್ವತ ಘಾಟ್ ಮತ್ತು ರಸ್ತೆ ಸ್ಥಿತಿ", HI: "पर्वतीय दर्रा और सड़क की स्थिति", TA: "மலைப்பாதை மற்றும் சாலை நிலை", TE: "పర్వత మార్గం & రహదారి స్థితి", ML: "ചുരം റോഡ് അവസ്ഥ"
  },
  "FIELD ESTIMATE": {
    KN: "ಕ್ಷೇತ್ರ ಅಂದಾಜು", HI: "फील्ड अनुमान", TA: "கள மதிப்பீடு", TE: "ఫీల్డ్ అంచనా", ML: "ഫീൽഡ് എസ്റ്റിമേറ്റ്"
  },
  "Estimated corridor status based on slope saturation and distance.": {
    KN: "ಇಳಿಜಾರಿನ ತೇವಾಂಶ ಮತ್ತು ದೂರವನ್ನು ಆಧರಿಸಿ ಅಂದಾಜು ಮಾಡಲಾದ ರಸ್ತೆ ಸ್ಥಿತಿ.",
    HI: "ढलान संतृप्ति और दूरी पर आधारित अनुमानित सड़क स्थिति।",
    TA: "சரிவு செறிவு மற்றும் தூரத்தின் அடிப்படையிலான உத்தேச பாதை நிலை.",
    TE: "వాలు సంతృప్తత మరియు దూరం ఆధారంగా అంచనా వేసిన మార్గం స్థితి.",
    ML: "ചരിവിലെ ജലാംശവും ദൂരവും അടിസ്ഥാനമാക്കിയുള്ള കണക്കുകൂട്ടൽ."
  },
  "WEATHER-LINKED RISK FORECAST": {
    KN: "ಹವಾಮಾನ ಆಧಾರಿತ ಅಪಾಯ ಮುನ್ಸೂಚನೆ", HI: "मौसम आधारित जोखिम पूर्वानुमान", TA: "வானிலை சார்ந்த ஆபத்து முன்னறிவிப்பு", TE: "వాతావరణ ఆధారిత ప్రమాద సూచన", ML: "കാലാവസ്ഥാ അടിസ്ഥാനമാക്കിയുള്ള പ്രവചനം"
  },
  "PROTOTYPE": {
    KN: "ಮಾದರಿ", HI: "प्रोटोटाइप", TA: "மாதிரி", TE: "ప్రోటోటైప్", ML: "പ്രോട്ടോടൈപ്പ്"
  },

  // Citizen & Field Database Reporting
  "CITIZEN / FIELD REPORTING": {
    KN: "ಸಾರ್ವಜನಿಕ / ಕ್ಷೇತ್ರ ವರದಿ", HI: "नागरिक / फील्ड रिपोर्टिंग", TA: "பொதுமக்கள் / கள அறிக்கை", TE: "పౌర / ఫీల్డ్ రిపోర్టింగ్", ML: "പൊതുജന / ഫീൽഡ് റിപ്പോർട്ടിംഗ്"
  },
  "ACTIVE IN DATABASE": {
    KN: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿದೆ", HI: "डेटाबेस में सक्रिय", TA: "தரவுத்தளத்தில் செயலில் உள்ளது", TE: "డేటాబేస్‌లో క్రియాశీలంగా ఉంది", ML: "ഡാറ്റാബേസിൽ സജീവമാണ്"
  },
  "ACTIVE DB READY": {
    KN: "ಸಕ್ರಿಯ ಡೇಟಾಬೇಸ್ ಸಿದ್ಧವಾಗಿದೆ", HI: "सक्रिय डीबी तैयार", TA: "செயலில் உள்ள தரவுத்தளம் தயார்", TE: "క్రియాశీల డిబి సిద్ధంగా ఉంది", ML: "ഡാറ്റാബേസ് സജ്ജമാണ്"
  },
  "AUTHENTICATION REQUIRED": {
    KN: "ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ", HI: "प्रमाणीकरण आवश्यक", TA: "உள்நுழைவு தேவை", TE: "ధృవీకరణ అవసరం", ML: "ലോഗിൻ ആവശ്യമാണ്"
  },
  "To submit official landslide observations, slope crack sightings, or road blockages into the database, users must sign in with their Google account.": {
    KN: "ಅಧಿಕೃತ ಭೂಕುಸಿತ ವೀಕ್ಷಣೆಗಳು, ಇಳಿಜಾರಿನ ಬಿರುಕುಗಳು ಅಥವಾ ರಸ್ತೆ ಅಡೆತಡೆಗಳನ್ನು ಡೇಟಾಬೇಸ್‌ಗೆ ಸಲ್ಲಿಸಲು, ಬಳಕೆದಾರರು ತಮ್ಮ ಗೂಗಲ್ ಖಾತೆಯೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಬೇಕು.",
    HI: "डेटाबेस में आधिकारिक भूस्खलन अवलोकन, ढलान दरार या सड़क रुकावट दर्ज करने के लिए उपयोगकर्ताओं को अपने Google खाते से साइन इन करना होगा।",
    TA: "அதிகாரப்பூர்வ நிலச்சரிவு அவதானிப்புகள் அல்லது சாலை அடைப்புகளை தரவுத்தளத்தில் சமர்ப்பிக்க பயனர்கள் கூகிள் கணக்கில் உள்நுழைய வேண்டும்.",
    TE: "అధికారిక కొండచరియల పరిశీలనలు లేదా రోడ్డు అడ్డంకులను నమోదు చేయడానికి వినియోగదారులు Google ఖాతాతో సైన్ ఇన్ చేయాలి.",
    ML: "ഔദ്യോഗിക മണ്ണിടിച്ചിൽ നിരീക്ഷണങ്ങൾ ഡാറ്റാബേസിൽ രേഖപ്പെടുത്താൻ ഗൂഗിൾ അക്കൗണ്ട് ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക."
  },
  "SIGN IN WITH GOOGLE TO REPORT": {
    KN: "ವರದಿ ಮಾಡಲು ಗೂಗಲ್‌ನೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ", HI: "रिपोर्ट करने के लिए Google से साइन इन करें", TA: "அறிக்கையிட Google மூலம் உள்நுழையவும்", TE: "నివేదించడానికి Googleతో సైన్ ఇన్ చేయండి", ML: "റിപ്പോർട്ട് ചെയ്യാൻ ഗൂഗിൾ വഴി ലോഗിൻ ചെയ്യുക"
  },
  "REPORT RECORDED IN DATABASE": {
    KN: "ವರದಿಯು ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ದಾಖಲಾಗಿದೆ", HI: "डेटाबेस में रिपोर्ट दर्ज की गई", TA: "அறிக்கை தரவுத்தளத்தில் பதிவானது", TE: "నివేదిక డేటాబేస్‌లో నమోదు చేయబడింది", ML: "റിപ്പോർട്ട് ഡാറ്റാബേസിൽ രേഖപ്പെടുത്തി"
  },
  "Stored in temporary active database table (24h operational window). Emergency coordinators and response teams can view this active record.": {
    KN: "ತಾತ್ಕಾಲಿಕ ಸಕ್ರಿಯ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ (24 ಗಂಟೆ ಕಾರ್ಯಾಚರಣೆ ಅವಧಿ). ತುರ್ತು ಸಂಯೋಜಕರು ಮತ್ತು ರಕ್ಷಣಾ ತಂಡಗಳು ಇದನ್ನು ವೀಕ್ಷಿಸಬಹುದು.",
    HI: "अस्थायी सक्रिय डेटाबेस तालिका (24 घंटे परिचालन विंडो) में संग्रहीत। आपातकालीन टीमें इस रिकॉर्ड को देख सकती हैं।",
    TA: "செயலில் உள்ள தற்காலிக தரவுத்தளத்தில் சேமிக்கப்பட்டது (24 மணிநேர சாளரம்). அவசர குழுக்கள் இதை பார்வையிடலாம்.",
    TE: "తాత్కాలిక క్రియాశీల డేటాబేస్‌లో నిల్వ చేయబడింది (24 గం ఆపరేషనల్ విండో). అత్యవసర బృందాలు దీనిని చూడవచ్చు.",
    ML: "സജീവ ഡാറ്റാബേസിൽ സൂക്ഷിച്ചിരിക്കുന്നു (24 മണിക്കൂർ). അടിയന്തര പ്രതികരണ സംഘങ്ങൾക്ക് ഇത് കാണാം."
  },
  "FILE ANOTHER REPORT": {
    KN: "ಮತ್ತೊಂದು ವರದಿ ಸಲ್ಲಿಸಿ", HI: "दूसरी रिपोर्ट दर्ज करें", TA: "மற்றொரு அறிக்கையை பதிவு செய்க", TE: "మరొక నివేదికను సమర్పించండి", ML: "മറ്റൊരു റിപ്പോർട്ട് സമർപ്പിക്കുക"
  },
  "REPORTER": {
    KN: "ವರದಿದಾರ", HI: "रिपोर्टर", TA: "அறிக்கையாளர்", TE: "రిపోర్టర్", ML: "റിപ്പോർട്ടർ"
  },
  "VERIFIED ACCOUNT": {
    KN: "ದೃಢೀಕರಿಸಿದ ಖಾತೆ", HI: "सत्यापित खाता", TA: "சரிபார்க்கப்பட்ட கணக்கு", TE: "ధృవీకరించబడిన ఖాతా", ML: "സ്ഥിരീകരിച്ച അക്കൗണ്ട്"
  },
  "Capture slope cracks, movement, landslide activity, or blocked roads directly to the central database.": {
    KN: "ಇಳಿಜಾರಿನ ಬಿರುಕುಗಳು, ಚಲನೆ, ಭೂಕುಸಿತ ಚಟುವಟಿಕೆ ಅಥವಾ ನಿರ್ಬಂಧಿತ ರಸ್ತೆಗಳನ್ನು ನೇರವಾಗಿ ಕೇಂದ್ರ ಡೇಟಾಬೇಸ್‌ಗೆ ದಾಖಲಿಸಿ.",
    HI: "ढलान की दरारें, हलचल, भूस्खलन गतिविधि या अवरुद्ध सड़कों को सीधे केंद्रीय डेटाबेस में दर्ज करें।",
    TA: "சரிவு விரிසல்கள், நிலச்சரிவு அல்லது அடைபட்ட சாலைகளை நேரடியாக மத்திய தரவுத்தளத்தில் பதிவு செய்க.",
    TE: "వాలు పగుళ్లు, కొండచరియల కదలిక లేదా నిరోధించబడిన రోడ్లను నేరుగా కేంద్ర డేటాబేస్‌కు నమోదు చేయండి.",
    ML: "ചരിവിലെ വിള്ളലുകൾ, മണ്ണിടിച്ചിൽ സാധ്യതകൾ എന്നിവ നേരിട്ട് കേന്ദ്ര ഡാറ്റാബേസിൽ രേഖപ്പെടുത്തുക."
  },
  "SLOPE CRACK": {
    KN: "ಇಳಿಜಾರಿನ ಬಿರುಕು", HI: "ढलान दरार", TA: "சரிவு விரிசல்", TE: "వాలు పగులు", ML: "ചരിവിലെ വിള്ളൽ"
  },
  "LANDSLIDE ACTIVITY": {
    KN: "ಭೂಕುಸಿತ ಚಟುವಟಿಕೆ", HI: "भूस्खलन गतिविधि", TA: "நிலச்சரிவு செயல்பாடு", TE: "కొండచరియల చర్య", ML: "മണ്ണിടിച്ചിൽ പ്രവർത്തനം"
  },
  "BLOCKED ROAD": {
    KN: "ರಸ್ತೆ ಅಡಚಣೆ", HI: "अवरुद्ध सड़क", TA: "அடைபட்ட சாலை", TE: "రోడ్డు అడ్డంకి", ML: "റോഡ് തടസ്സം"
  },
  "FLOODING": {
    KN: "ಪ್ರವಾಹ", HI: "बाढ़", TA: "வெள்ளம்", TE: "వరదలు", ML: "വെള്ളപ്പൊക്കം"
  },
  "INFRASTRUCTURE DAMAGE": {
    KN: "ಮೂಲಸೌಕರ್ಯ ಹಾನಿ", HI: "बुनियादी ढांचे की क्षति", TA: "கட்டமைப்பு சேதம்", TE: "మౌలిక సదుపాయాల నష్టం", ML: "അടിസ്ഥാന സൗകര്യ തകരാറ്"
  },
  "LOW": {
    KN: "ಕಡಿಮೆ", HI: "निम्न", TA: "குறைவு", TE: "తక్కువ", ML: "കുറഞ്ഞത്"
  },
  "MEDIUM": {
    KN: "ಮಧ್ಯಮ", HI: "मध्यम", TA: "நடுத்தரம்", TE: "మధ్యస్థం", ML: "ഇടത്തരം"
  },
  "HIGH": {
    KN: "ಹೆಚ್ಚು", HI: "उच्च", TA: "அதிகம்", TE: "అధికం", ML: "ഉയർന്നത്"
  },
  "ATTACH EVIDENCE": {
    KN: "ಸಾಕ್ಷ್ಯವನ್ನು ಲಗತ್ತಿಸಿ", HI: "साक्ष्य संलग्न करें", TA: "சான்றினை இணைக்கவும்", TE: "సాక్ష్యాన్ని జతచేయండి", ML: "തെളിവ് അറ്റാച്ചുചെയ്യുക"
  },
  "USE MY LOCATION": {
    KN: "ನನ್ನ ಸ್ಥಳವನ್ನು ಬಳಸಿ", HI: "मेरे स्थान का उपयोग करें", TA: "என் இருப்பிடத்தை பயன்படுத்து", TE: "నా స్థానాన్ని ఉపయోగించండి", ML: "എന്റെ ലൊക്കേഷൻ ഉപയോഗിക്കുക"
  },
  "LOCATION ATTACHED": {
    KN: "ಸ್ಥಳವನ್ನು ಲಗತ್ತಿಸಲಾಗಿದೆ", HI: "स्थान संलग्न किया गया", TA: "இருப்பிடம் இணைக்கப்பட்டது", TE: "స్థానం జతచేయబడింది", ML: "ലൊക്കേഷൻ ചേർത്തു"
  },
  "Describe observed slope conditions or blockage in detail...": {
    KN: "ವೀಕ್ಷಿಸಿದ ಇಳಿಜಾರಿನ ಪರಿಸ್ಥಿತಿ ಅಥವಾ ರಸ್ತೆ ಅಡಚಣೆಯನ್ನು ವಿವರವಾಗಿ ವಿವರಿಸಿ...",
    HI: "देखी गई ढलान की स्थिति या रुकावट का विस्तार से वर्णन करें...",
    TA: "கண்டறியப்பட்ட சரிவு நிலை அல்லது அடைப்பினை விவரிக்கவும்...",
    TE: "గమనించిన వాలు పరిస్థితులు లేదా అడ్డంకిని వివరంగా వివరించండి...",
    ML: "കണ്ടെത്തിയ ചരിവിന്റെ അവസ്ഥയോ തടസ്സമോ വിശദമായി വിവരിക്കുക..."
  },
  "SUBMIT TO DATABASE": {
    KN: "ಡೇಟಾಬೇಸ್‌ಗೆ ಸಲ್ಲಿಸಿ", HI: "डेटाबेस में जमा करें", TA: "தரவுத்தளத்தில் சமர்ப்பிக்கவும்", TE: "డేటాబేస్‌కు సమర్పించండి", ML: "ഡാറ്റാബേസിലേക്ക് സമർപ്പിക്കുക"
  },
  "SAVING TO DB…": {
    KN: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತಿದೆ…", HI: "डेटाबेस में सहेजा जा रहा है…", TA: "தரவுத்தளத்தில் சேமிக்கப்படுகிறது…", TE: "డేటాబేస్‌లో సేవ్ చేస్తోంది…", ML: "ഡാറ്റാബേസിൽ സേവ് ചെയ്യുന്നു…"
  },
  "ACTIVE INCIDENTS IN DATABASE": {
    KN: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿರುವ ಸಕ್ರಿಯ ಘಟನೆಗಳು", HI: "डेटाबेस में सक्रिय घटनाएं", TA: "தரவுத்தளத்தில் செயலில் உள்ள சம்பவங்கள்", TE: "డేటాబేస్‌లోని క్రియాశీల సంఘటనలు", ML: "ഡാറ്റാബേസിലെ സജീവ സംഭവങ്ങൾ"
  },
  "TEMPORARY ACTIVE (24H)": {
    KN: "ತಾತ್ಕಾಲಿಕ ಸಕ್ರಿಯ (24 ಗಂ)", HI: "अस्थायी सक्रिय (24 घंटे)", TA: "தற்காலிக செயலில் (24 மணி)", TE: "తాత్కాలిక క్రియాశీల (24 గం)", ML: "താൽക്കാലിക സജീവം (24 മ)"
  },
  "ACTIVE": {
    KN: "ಸಕ್ರಿಯ", HI: "सक्रिय", TA: "செயலில்", TE: "క్రియాశీలం", ML: "സജീവം"
  },
  "SYSTEM HEALTH & CONFIGURATION": {
    KN: "ವ್ಯವಸ್ಥೆಯ ಆರೋಗ್ಯ ಮತ್ತು ಸಂರಚನೆ", HI: "सिस्टम स्वास्थ्य और विन्यास", TA: "கணினி நிலை மற்றும் கட்டமைப்பு", TE: "సిస్టమ్ ఆరోగ్యం & ఆకృతీకరణ", ML: "സിസ്റ്റം ആരോഗ്യവും ക്രമീകരണവും"
  },
  "DETERMINISTIC RISK ENGINE": {
    KN: "ನಿರ್ದಿಷ್ಟ ಅಪಾಯ ಎಂಜಿನ್", HI: "नियतात्मक जोखिम इंजन", TA: "துல்லிய ஆபத்து இயந்திரம்", TE: "డిటర్మినిస్టిక్ రిస్క్ ఇంజిన్", ML: "റിസ്ക് എൻജിൻ"
  },
  "OPERATIONAL": {
    KN: "ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ", HI: "परिचालन में", TA: "செயல்பாட்டில்", TE: "కార్యకలాపాలలో ఉంది", ML: "പ്രവർത്തനക്ഷമം"
  },
  "ANOMALY VALIDATION": {
    KN: "ವೈಪರೀತ್ಯ ಮೌಲ್ಯಮಾಪನ", HI: "विसंगति सत्यापन", TA: "முரண்பாடு சரிபார்ப்பு", TE: "క్రమరాహిత్య ధృవీకరణ", ML: "വ്യതിയാന സ്ഥിരീകരണം"
  },
  "NASA EONET v3 FEED": {
    KN: "ನಾಸಾ EONET v3 ಫೀಡ್", HI: "नासा EONET v3 फ़ीड", TA: "நாசா EONET v3 ஊட்டம்", TE: "నాసా EONET v3 ఫీడ్", ML: "നാസ EONET v3 ഫീഡ്"
  },
  "CONNECTED": {
    KN: "ಸಂಪರ್ಕಗೊಂಡಿದೆ", HI: "जुड़ा हुआ", TA: "இணைக்கப்பட்டது", TE: "కనెక్ట్ చేయబడింది", ML: "ബന്ധിപ്പിച്ചു"
  },
  "FALLBACK": {
    KN: "ಪರ್ಯಾಯ", HI: "फॉलबैक", TA: "மாற்று", TE: "ఫాల్‌బ్యాక్", ML: "ഫാൽബാക്ക്"
  },
  "OFFLINE REPORT CACHE": {
    KN: "ಆಫ್‌ಲೈನ್ ವರದಿ ಸಂಗ್ರಹ", HI: "ऑफ़लाइन रिपोर्ट कैश", TA: "ஆஃப்லைன் அறிக்கை இடைசேமிப்பு", TE: "ఆఫ్‌లైన్ నివేదిక కాష్", ML: "ഓഫ്‌ലൈൻ റിപ്പോർട്ട് കാഷെ"
  },
  "READY": {
    KN: "ಸಿದ್ಧವಾಗಿದೆ", HI: "तैयार", TA: "தயார்", TE: "సిద్ధంగా ఉంది", ML: "സജ്ജമാണ്"
  },
  "NOTIFICATION LANGUAGE": {
    KN: "ಅಧಿಸೂಚನೆ ಭಾಷೆ", HI: "अधिसूचना भाषा", TA: "அறிவிப்பு மொழி", TE: "నోటిఫికేషన్ భాష", ML: "അറിയിപ്പ് ഭാഷ"
  },
  "LAST UPDATE": {
    KN: "ಕೊನೆಯ ನವೀಕರಣ", HI: "अंतिम अद्यतन", TA: "கடைசி புதுப்பிப்பு", TE: "చివరి నవీకరణ", ML: "അവസാന അപ്‌ഡേറ്റ്"
  },

  // Interactive GIS Map Layers & Categories
  "SATELLITE": {
    KN: "ಉಪಗ್ರಹ", HI: "उपग्रह", TA: "செயற்கைக்கோள்", TE: "ఉపగ్రహం", ML: "ഉപഗ്രഹം",
    ES: "Satélite", FR: "Satellite", DE: "Satellit", JA: "衛星写真", ZH: "卫星影像", AR: "قمر صناعي"
  },
  "TOPOGRAPHY": {
    KN: "ಸ್ಥಳಾಕೃತಿ", HI: "स्थलाकृति", TA: "நிலப்பரப்பு", TE: "స్థలాకృతి", ML: "ഭൂപ്രകൃതി",
    ES: "Topografía", FR: "Topographie", DE: "Topographie", JA: "地形図", ZH: "地形图", AR: "تضاريس"
  },
  "DARK GIS": {
    KN: "ಡಾರ್ಕ್ ಜಿಐಎಸ್", HI: "डार्क जीआईएस", TA: "டார்க் ஜிஐஎஸ்", TE: "డార్క్ జిఐఎస్", ML: "ഡാർക്ക് ജിഐഎസ്",
    ES: "GIS Oscuro", FR: "SIG Sombre", DE: "Dunkles GIS", JA: "ダークGIS", ZH: "暗色GIS", AR: "نظم المعلومات الجغرافية الداكنة"
  },
  "STREET": {
    KN: "ರಸ್ತೆ", HI: "सड़क", TA: "தெரு", TE: "వీధి", ML: "തെരുവ്",
    ES: "Calle", FR: "Rue", DE: "Straße", JA: "道路地図", ZH: "街道地图", AR: "شوارع"
  },
  "Satellite": {
    KN: "ಉಪಗ್ರಹ", HI: "उपग्रह", TA: "செயற்கைக்கோள்", TE: "ఉపగ్రహం", ML: "ഉപഗ്രഹം"
  },
  "Topography": {
    KN: "ಸ್ಥಳಾಕೃತಿ", HI: "स्थलाकृति", TA: "நிலப்பரப்பு", TE: "స్థలాకృతి", ML: "ഭൂപ്രകൃതി"
  },
  "Dark GIS": {
    KN: "ಡಾರ್ಕ್ ಜಿಐಎಸ್", HI: "डार्क जीआईएस", TA: "டார்க் ஜிಐಎಸ್", TE: "డార్క్ జిఐఎస్", ML: "ഡാർക്ക് ಜಿಐಎಸ್"
  },
  "Street Map": {
    KN: "ರಸ್ತೆ ನಕ್ಷೆ", HI: "सड़क का नक्शा", TA: "தெரு வரைபடம்", TE: "వీధి మ్యాప్", ML: "റോഡ് ഭൂപടം"
  },
  "LAYERS": {
    KN: "ಪದರಗಳು", HI: "परतें", TA: "அடுக்குகள்", TE: "పొరలు", ML: "പാളികൾ",
    ES: "Capas", FR: "Couches", DE: "Ebenen", JA: "レイヤー", ZH: "图层", AR: "طبقات"
  },
  "HAZARD OVERLAYS": {
    KN: "ಅಪಾಯದ ಮೇಲ್ಪದರಗಳು", HI: "खतरा ओवरले", TA: "ஆபத்து மேலடுக்குகள்", TE: "ప్రమాద అతివ్యాప్తులు", ML: "അപകട ഓവർലേകൾ",
    ES: "Capas de Peligro", FR: "Superpositions de Risques", DE: "Gefahrenüberlagerungen", JA: "災害オーバーレイ", ZH: "灾害叠加层", AR: "تراكبات المخاطر"
  },
  "Landslide Susceptibility": {
    KN: "ಭೂಕುಸಿತದ ಸಂವೇದನಶೀಲತೆ", HI: "भूस्खलन संवेदनशीलता", TA: "நிலச்சரிவு பாதிப்புத்தன்மை", TE: "కొండచరియల సున్నితత్వం", ML: "മണ്ണിടിച്ചിൽ സാധ്യത",
    ES: "Susceptibilidad a Deslizamientos", FR: "Susceptibilité aux Glissements", DE: "Hangrutsch-Anfälligkeit", JA: "土砂災害危険度", ZH: "滑坡敏感度", AR: "الحساسية للانهيارات الأرضية"
  },
  "Evacuation Corridors": {
    KN: "ಸ್ಥಳಾಂತರ ಕಾರಿಡಾರ್‌ಗಳು", HI: "निकासी गलियारे", TA: "வெளியேற்ற பாதைகள்", TE: "తరలింపు కారిడార్లు", ML: "ഒഴിപ്പിക്കൽ പാതകൾ",
    ES: "Corredores de Evacuación", FR: "Couloirs d'Évacuation", DE: "Evakuierungskorridore", JA: "避難ルート", ZH: "疏散通道", AR: "ممرات الإخلاء"
  },
  "Slip Surface Profile": {
    KN: "ಜಾರುವ ಮೇಲ್ಮೈ ವಿವರ", HI: "फिसलन सतह प्रोफ़ाइल", TA: "சரிவு மேற்பரப்பு விவரம்", TE: "జారే ఉపరితల ప్రొఫైల్", ML: "സ്ലിപ്പ് പ്രൊഫൈൽ",
    ES: "Perfil de Superficie de Deslizamiento", FR: "Profil de Surface de Glissement", DE: "Gleitflächenprofil", JA: "すべり面断面図", ZH: "滑动面剖面", AR: "ملف سطح الانزلاق"
  },
  "NASA Live Hazards": {
    KN: "ನಾಸಾ ಲೈವ್ ಅಪಾಯಗಳು", HI: "नासा लाइव खतरे", TA: "நாசா நேரலை ஆபத்துகள்", TE: "నాసా లైవ్ ప్రమాదాలు", ML: "നാസ തത്സമയ അപകടങ്ങൾ",
    ES: "Peligros en Vivo de la NASA", FR: "Risques en Direct de la NASA", DE: "NASA Live-Gefahren", JA: "NASAライブハザード", ZH: "NASA实时灾害", AR: "مخاطر ناسا المباشرة"
  },
  "ALL LIVE EVENTS": {
    KN: "ಎಲ್ಲಾ ಲೈವ್ ಘಟನೆಗಳು", HI: "सभी लाइव घटनाएं", TA: "அனைத்து நேரலை நிகழ்வுகள்", TE: "అన్ని లైవ్ సంఘటనలు", ML: "എല്ലാ തത്സമയ സംഭവങ്ങളും",
    ES: "Todos los Eventos en Vivo", FR: "Tous les Événements en Direct", DE: "Alle Live-Ereignisse", JA: "すべてのリアルタイム事象", ZH: "所有实时事件", AR: "جميع الأحداث المباشرة"
  },
  "SEVERE STORMS": {
    KN: "ತೀವ್ರ ಚಂಡಮಾರುತಗಳು", HI: "भीषण तूफान", TA: "கடுமையான புயல்கள்", TE: "తీవ్ర తుఫానులు", ML: "തീവ്ര കൊടുങ്കാറ്റുകൾ",
    ES: "Tormentas Severas", FR: "Tempêtes Majeures", DE: "Schwere Stürme", JA: "激甚暴風雨", ZH: "强风暴", AR: "عواصف شديدة"
  },
  "VOLCANOES": {
    KN: "ಜ್ವಾಲಾಮುಖಿಗಳು", HI: "ज्वालामुखी", TA: "எரிமலைகள்", TE: "అగ్నిపర్వతాలు", ML: "അഗ്നിപർവ്വതങ്ങൾ",
    ES: "Volcanes", FR: "Volcans", DE: "Vulkane", JA: "火山活動", ZH: "火山", AR: "البراكين"
  },
  "LANDSLIDES": {
    KN: "ಭೂಕುಸಿತಗಳು", HI: "भूस्खलन", TA: "நிலச்சரிவுகள்", TE: "కొండచరియలు", ML: "മണ്ണിടിച്ചിലുകൾ",
    ES: "Deslizamientos", FR: "Glissements de Terrain", DE: "Erdrutsche", JA: "地滑り・土砂崩れ", ZH: "滑坡", AR: "الانهيارات الأرضية"
  },
  "FLOODS": {
    KN: "ಪ್ರವಾಹಗಳು", HI: "बाढ़", TA: "வெள்ளப்பெருக்கு", TE: "వరదలు", ML: "പ്രളയങ്ങൾ",
    ES: "Inundaciones", FR: "Inondations", DE: "Überschwemmungen", JA: "洪水・浸水", ZH: "洪水", AR: "الفيضانات"
  },
  "EARTHQUAKES": {
    KN: "ಭೂಕಂಪಗಳು", HI: "भूकंप", TA: "நிலநடுக்கங்கள்", TE: "భూకంపాలు", ML: "ഭൂകമ്പങ്ങൾ",
    ES: "Terremotos", FR: "Séismes", DE: "Erdbeben", JA: "地震活動", ZH: "地震", AR: "الزلازل"
  },
  "SEA ICE & SNOW": {
    KN: "ಸಮುದ್ರದ ಮಂಜುಗಡ್ಡೆ ಮತ್ತು ಹಿಮ", HI: "समुद्री बर्फ और हिम", TA: "கடல் பனி மற்றும் பனிப்பொழிவு", TE: "సముద్రపు మంచు & హిమం", ML: "സമുദ്ര ഹിമവും മഞ്ഞും",
    ES: "Hielo Marino y Nieve", FR: "Glace de Mer et Neige", DE: "Meereis & Schnee", JA: "海氷・降雪", ZH: "海冰与降雪", AR: "جليد البحر والثلج"
  },
  "WILDFIRES": {
    KN: "ಕಾಡ್ಗಿಚ್ಚುಗಳು", HI: "दावानल / जंगल की आग", TA: "காட்டுத்தீ", TE: "కార్చిచ్చులు", ML: "കാട്ടുതീ",
    ES: "Incendios Forestales", FR: "Feux de Forêt", DE: "Waldbrände", JA: "山火事・森林火災", ZH: "森林火灾", AR: "حرائق الغابات"
  },
  "DROUGHT": {
    KN: "ಬರಗಾಲ", HI: "सूखा", TA: "வறட்சி", TE: "కరువు", ML: "വരൾച്ച",
    ES: "Sequía", FR: "Sécheresse", DE: "Dürre", JA: "干ばつ", ZH: "干旱", AR: "جفاف"
  },
  "DUST & HAZE": {
    KN: "ಧೂಳು ಮತ್ತು ಮಬ್ಬು", HI: "धूल और धुंध", TA: "தூசி மற்றும் மூடுபனி", TE: "ధూళి & పొగమంచు", ML: "പൊടിയും മൂടൽമഞ്ഞും",
    ES: "Polvo y Neblina", FR: "Poussière et Brume", DE: "Staub & Dunst", JA: "黄砂・煙霧", ZH: "沙尘与阴霾", AR: "غبار وضباب"
  },

  // Modals
  "ESP32 Field Node Health & Sensor Registry": {
    KN: "ESP32 ಫೀಲ್ಡ್ ನೋಡ್ ಆರೋಗ್ಯ ಮತ್ತು ಸಂವೇದಕ ರಿಜಿಸ್ಟ್ರಿ", HI: "ESP32 फील्ड नोड स्वास्थ्य और सेंसर रजिस्ट्री", TA: "ESP32 முனைய நலம் மற்றும் சென்சார் பதிவேடு", TE: "ESP32 ఫీల్డ్ నోడ్ ఆరోగ్యం & సెన్సార్ రిజిస్ట్రీ", ML: "ESP32 ഫീൽഡ് നോഡ് ആരോഗ്യവും സെൻസർ രജിസ്ട്രിയും"
  },
  "DEVICE ID": {
    KN: "ಸಾಧನದ ಐಡಿ", HI: "डिवाइस आईडी", TA: "சாதன ஐடி", TE: "పరికర ఐడి", ML: "ഡിവൈസ് ഐഡി"
  },
  "BATTERY VOLTAGE": {
    KN: "ಬ್ಯಾಟರಿ ವೋಲ್ಟೇಜ್", HI: "बैटरी वोल्टेज", TA: "மின்கல மின்னழுத்தம்", TE: "బ్యాటరీ వోల్టేజ్", ML: "ബാറ്ററി വോൾട്ടേജ്"
  },
  "WIFI RSSI": {
    KN: "ವೈಫೈ RSSI", HI: "वाईफ़ाई RSSI", TA: "வைஃபை RSSI", TE: "వైఫై RSSI", ML: "വൈഫൈ RSSI"
  },
  "FREE HEAP": {
    KN: "ಮುಕ್ತ ಹೀಪ್", HI: "मुक्त हीप", TA: "இலவச நினைவகம்", TE: "ఉచిత హీప్", ML: "ഫ്രീ ഹീപ്പ്"
  },
  "FIRMWARE": {
    KN: "ಫರ್ಮ್‌ವೇರ್", HI: "फर्मवेयर", TA: "நிலைபொருள்", TE: "ఫర్మ్‌వేర్", ML: "ഫേംവെയർ"
  },
  "ATTACHED SENSOR ARRAY": {
    KN: "ಲಗತ್ತಿಸಲಾದ ಸಂವೇದಕ ಶ್ರೇಣಿ", HI: "संलग्न सेंसर सरणी", TA: "இணைக்கப்பட்ட சென்சார் வரிசை", TE: "జతచేయబడిన సెన్సార్ అర్రే", ML: "ഘടിപ്പിച്ചിട്ടുള്ള സെൻസർ അറേ"
  },
  "Sensor": {
    KN: "ಸಂವೇದಕ", HI: "सेंसर", TA: "சென்சார்", TE: "సెన్సార్", ML: "സെൻസർ"
  },
  "Pin / Interface": {
    KN: "ಪಿನ್ / ಇಂಟರ್ಫೇಸ್", HI: "पिन / इंटरफ़ेस", TA: "முள் / இடைமுகம்", TE: "పిన్ / ఇంటర్‌ఫేస్", ML: "പിൻ / ഇന്റർഫേസ്"
  },
  "Last Sample": {
    KN: "ಕೊನೆಯ ಮಾದರಿ", HI: "अंतिम नमूना", TA: "கடைசி மாதிரி", TE: "చివరి నమూనా", ML: "അവസാന സാമ്പിൾ"
  },
  "Data Validation & Quarantined Anomalies": {
    KN: "ಡೇಟಾ ಮೌಲ್ಯೀಕರಣ ಮತ್ತು ಕ್ವಾರಂಟೈನ್ ಮಾಡಿದ ವೈಪರೀತ್ಯಗಳು", HI: "डेटा सत्यापन और अलग की गई विसंगतियां", TA: "தரவு சரிபார்ப்பு மற்றும் தனிமைப்படுத்தப்பட்ட முரண்பாடுகள்", TE: "డేటా ధృవీకరణ & క్వారంటైన్ క్రమరాహిత్యాలు", ML: "ഡാറ്റാ സ്ഥിരീകരണവും ക്വാറന്റൈൻ ചെയ്ത വ്യതിയാനങ്ങളും"
  },
  "Suspicious, unphysical, or sudden sensor spikes are isolated by the deterministic validation engine to prevent false evacuation alarms.": {
    KN: "ಸುಳ್ಳು ಸ್ಥಳಾಂತರ ಎಚ್ಚರಿಕೆಗಳನ್ನು ತಡೆಗಟ್ಟಲು ಅನುಮಾನಾಸ್ಪದ ಅಥವಾ ಹಠಾತ್ ಸಂವೇದಕ ಸ್ಪೈಕ್‌ಗಳನ್ನು ನಿರ್ದಿಷ್ಟ ಮೌಲ್ಯೀಕರಣ ಎಂಜಿನ್‌ನಿಂದ ಪ್ರತ್ಯೇಕಿಸಲಾಗುತ್ತದೆ.",
    HI: "झूठी निकासी चेतावनियों को रोकने के लिए संदिग्ध या अचानक सेंसर स्पाइक्स को सत्यापन इंजन द्वारा अलग किया जाता है।",
    TA: "தவறான எச்சரிக்கைகளைத் தவிர்க்க சந்தேகத்திற்குரிய சென்சார் மாற்றங்கள் தானாக தனிமைப்படுத்தப்படுகின்றன.",
    TE: "తప్పుడు అలారాలను నివారించడానికి అనుమానాస్పద సెన్సార్ స్పైక్‌లు ప్రత్యేకించబడతాయి.",
    ML: "തെറ്റായ ഒഴിപ്പിക്കൽ മുന്നറിയിപ്പുകൾ ഒഴിവാക്കാൻ ക്രമരഹിതമായ റീഡിംഗുകൾ വേർതിരിക്കുന്നു."
  },
  "No Quarantined Anomalies": {
    KN: "ಯಾವುದೇ ಕ್ವಾರಂಟೈನ್ ಮಾಡಿದ ವೈಪರೀತ್ಯಗಳಿಲ್ಲ", HI: "कोई अलग की गई विसंगति नहीं", TA: "தனிமைப்படுத்தப்பட்ட முரண்பாடுகள் இல்லை", TE: "క్వారంటైన్ చేసిన క్రమరాహిత్యాలు లేవు", ML: "ക്വാറന്റൈൻ ചെയ്ത വ്യതിയാനങ്ങളൊന്നുമില്ല"
  },
  "All incoming sensor telemetry passed Stage 1–5 validation checks.": {
    KN: "ಎಲ್ಲಾ ಒಳಬರುವ ಸಂವೇದಕ ಟೆಲಿಮೆಟ್ರಿಯು ಹಂತ 1–5 ಮೌಲ್ಯೀಕರಣ ತಪಾಸಣೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದೆ.",
    HI: "सभी आने वाली सेंसर टेलीमेट्री चरण 1-5 सत्यापन जांच में खरी उतरी है।",
    TA: "அனைத்து சென்சார் தரவுகளும் நிலை 1-5 சரிபார்ப்பில் தேர்ச்சி பெற்றுள்ளன.",
    TE: "అన్ని ఇన్‌కమింగ్ సెన్సార్ టెలిమెట్రీ 1–5 దశల తనిఖీలను పూర్తి చేసింది.",
    ML: "എല്ലാ സെൻസർ വിവരങ്ങളും 1-5 ഘട്ട സ്ഥിരീകരണ പരിശോധനകളിൽ വിജയിച്ചു."
  },
  "Anomaly Type": {
    KN: "ವೈಪರೀತ್ಯದ ಪ್ರಕಾರ", HI: "विसंगति प्रकार", TA: "முரண்பாட்டின் வகை", TE: "క్రమరాహిత్యం రకం", ML: "വ്യതിയാന തരം"
  },
  "Reason": {
    KN: "ಕಾರಣ", HI: "कारण", TA: "காரணம்", TE: "కారణం", ML: "കാരണം"
  },
  "QUARANTINED": {
    KN: "ಕ್ವಾರಂಟೈನ್ ಮಾಡಲಾಗಿದೆ", HI: "अलग किया गया", TA: "தனிமைப்படுத்தப்பட்டது", TE: "క్వారంటైన్ చేయబడింది", ML: "ക്വാറന്റൈൻ ചെയ്തു"
  },
  "CLEAR QUARANTINE LOGS": {
    KN: "ಕ್ವಾರಂಟೈನ್ ಲಾಗ್‌ಗಳನ್ನು ತೆರವಗೊಳಿಸಿ", HI: "क्वारंटाइन लॉग साफ़ करें", TA: "தனிமைப்படுத்தப்பட்ட பதிவுகளை அழிக்கவும்", TE: "క్వారంటైన్ లాగ్‌లను క్లియర్ చేయండి", ML: "ക്വാറന്റൈൻ ലോഗുകൾ മായ്ക്കുക"
  },
  "Tipping-Bucket Rain Gauge": {
    KN: "ಟಿಪ್ಪಿಂಗ್-ಬಕೆಟ್ ಮಳೆ ಮಾಪಕ", HI: "टिपिंग-बकेट वर्षा मापी", TA: "டிப்பிங்-பக்கெட் மழைமானி", TE: "టిప్పింగ్-బకెట్ వర్ష మాపకం", ML: "ടിപ്പിംഗ്-ബക്കറ്റ് മഴമാപിനി"
  },
  "Capacitive Soil Moisture v1.2": {
    KN: "ಕೆಪಾಸಿಟಿವ್ ಮಣ್ಣಿನ ತೇವಾಂಶ v1.2", HI: "कैपेसिटिव मृदा नमी v1.2", TA: "கெபாசிட்டிவ் மண் ஈரப்பதம் v1.2", TE: "కెపాసిటివ్ నేల తేమ v1.2", ML: "കപ്പാസിറ്റീവ് മണ്ണിലെ ഈർപ്പം v1.2"
  },
  "MPU6050 Dual Inclinometer": {
    KN: "MPU6050 ಡ್ಯುಯಲ್ ಇನ್‌ಕ್ಲಿನೋಮೀಟರ್", HI: "MPU6050 डुअल इनक्लिनोमीटर", TA: "MPU6050 இரட்டை சாய்வுமானி", TE: "MPU6050 డ్యూయల్ ఇంక్లినోమీటర్", ML: "MPU6050 ഡ്യുവൽ ഇൻക്ലിനോമീറ്റർ"
  },
  "BME280 Atmospheric Sensor": {
    KN: "BME280 ವಾತಾವರಣ ಸಂವೇದಕ", HI: "BME280 वायुमंडलीय सेंसर", TA: "BME280 வளிமண்டல சென்சார்", TE: "BME280 వాతావరణ సెన్సార్", ML: "BME280 അന്തരീക്ഷ സെൻസർ"
  },
  "ONLINE (MQTT TLS)": {
    KN: "ಆನ್‌ಲೈನ್ (MQTT TLS)", HI: "ऑनलाइन (MQTT TLS)", TA: "ஆன்லைன் (MQTT TLS)", TE: "ఆన్‌లైన్ (MQTT TLS)", ML: "ഓൺലൈൻ (MQTT TLS)"
  },
  "Good": {
    KN: "ಉತ್ತಮ", HI: "अच्छा", TA: "நன்று", TE: "మంచిది", ML: "നല്ലത്"
  },
  "Emergency Alert Broadcast Simulator": {
    KN: "ತುರ್ತು ಎಚ್ಚರಿಕೆ ಪ್ರಸಾರ ಸಿಮ್ಯುಲೇಟರ್", HI: "आपातकालीन चेतावनी प्रसारण सिम्युलेटर", TA: "அவசர எச்சரிக்கை ஒளிபரப்பு மாதிரி", TE: "అత్యవసర హెచ్చరిక ప్రసార సిమ్యులేటర్", ML: "അടിയന്തര മുന്നറിയിപ്പ് പ്രക്ഷേപണ സിമുലേറ്റർ"
  },
  "Hazard Warning Broadcast Preview": {
    KN: "ಅಪಾಯ ಎಚ್ಚರಿಕೆ ಪ್ರಸಾರ ಪೂರ್ವವೀಕ್ಷಣೆ", HI: "खतरा चेतावनी प्रसारण पूर्वावलोकन", TA: "அபாய எச்சரிக்கை ஒளிபரப்பு முன்னோட்டம்", TE: "ప్రమాద హెచ్చరిక ప్రసార ప్రివ్యూ", ML: "അപകട മുന്നറിയിപ്പ് പ്രക്ഷേപണ പ്രിവ്യൂ"
  },
  "TARGET SECTOR": {
    KN: "ಗುರಿ ವಲಯ", HI: "लक्षित क्षेत्र", TA: "இலக்கு மண்டலம்", TE: "లక్ష్య రంగం", ML: "లక్ష్య മേഖല"
  },
  "Alert Broadcast Dialect": {
    KN: "ಎಚ್ಚರಿಕೆ ಪ್ರಸಾರ ಭಾಷೆ", HI: "चेतावनी प्रसारण भाषा", TA: "எச்சரிக்கை ஒளிபரப்பு மொழி", TE: "హెచ్చరిక ప్రసార భాష", ML: "മുന്നറിയിപ്പ് ప్రക്ഷേపണ ഭാഷ"
  },
  "SIMULATED NOTIFICATION PAYLOAD": {
    KN: "ಅನುಕರಿಸಿದ ಅಧಿಸೂಚನೆ ಡೇಟಾ", HI: "सिम्युलेटेड अधिसूचना पेलोड", TA: "மாதிரி அறிவிப்புத் தரவு", TE: "సిమ్యులేటెడ్ నోటిఫికేషన్ పేలోడ్", ML: "സിമുലേറ്റഡ് അറിയിപ്പ് പേലോഡ്"
  },
  "SIMULATED ALERT DISPATCHED": {
    KN: "ಅನುಕರಿಸಿದ ಎಚ್ಚರಿಕೆಯನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ", HI: "सिम्युलेटेड चेतावनी भेजी गई", TA: "மாதிரி எச்சரிக்கை அனுப்பப்பட்டது", TE: "సిమ్యులేటెడ్ హెచ్చరిక పంపబడింది", ML: "സിമുലേറ്റഡ് മുന്നറിയിപ്പ് അയച്ചു"
  },
  "Dispatched to native browser HTML5 push notifications & local critical risk stream.": {
    KN: "ಬ್ರೌಸರ್ ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಅಪಾಯದ ಸ್ಟ್ರೀಮ್‌ಗೆ ರವಾನಿಸಲಾಗಿದೆ.",
    HI: "ब्राउज़र पुश सूचनाओं और स्थानीय गंभीर जोखिम स्ट्रीम पर भेजा गया।",
    TA: "உலாவி புஷ் அறிவிப்புகள் மற்றும் உள்ளூர் ஆபத்து ஸ்ட்ரீமுக்கு அனுப்பப்பட்டது.",
    TE: "బ్రౌజర్ పుష్ నోటిఫికేషన్‌లు & స్థానిక క్లిష్టమైన రిస్క్ స్ట్రీమ్‌కు పంపబడింది.",
    ML: "ബ്രൗസർ പുഷ് അറിയിപ്പുകളിലേക്കും പ്രാദേശിക റിസ്ക് സ്ട്രീമിലേക്കും അയച്ചു."
  },
  "SIMULATE BROADCAST ALERT": {
    KN: "ಪ್ರಸಾರ ಎಚ್ಚರಿಕೆಯನ್ನು ಅನುಕರಿಸಿ", HI: "प्रसारण चेतावनी का अनुकरण करें", TA: "ஒளிபரப்பு எச்சரிக்கையை உருவகப்படுத்தவும்", TE: "ప్రసార హెచ్చరికను అనుకరించండి", ML: "മുന്നറിയിപ്പ് ప్రക്ഷേപണം അനുകരിക്കുക"
  },
  "DISPATCHING...": {
    KN: "ರವಾನಿಸಲಾಗುತ್ತಿದೆ...", HI: "भेजा जा रहा है...", TA: "அனுப்பப்படுகிறது...", TE: "పంపిణీ చేస్తోంది...", ML: "അയയ്ക്കുന്നു..."
  },
  "CANCEL": {
    KN: "ರದ್ದುಮಾಡಿ", HI: "रद्द करें", TA: "ரத்து செய்", TE: "రద్దు చేయి", ML: "റദ്ദാക്കുക"
  },
  "SEARCH GROUNDING (IMD)": {
    KN: "ಶೋಧನೆ ಗ್ರೌಂಡಿಂಗ್ (IMD)", HI: "खोज ग्राउंडिंग (IMD)", TA: "தேடல் தகவல் (IMD)", TE: "శోధన గ్రౌండింగ్ (IMD)", ML: "തിരച്ചിൽ വിവരങ്ങൾ (IMD)"
  },
  "MAPS GROUNDING (PASSES)": {
    KN: "ಮ್ಯಾಪ್ಸ್ ಗ್ರೌಂಡಿಂಗ್ (ಘಾಟ್‌ಗಳು)", HI: "मैप्स ग्राउंडिंग (दर्रे)", TA: "வரைபட தகவல் (கணவாய்கள்)", TE: "మ్యాప్స్ గ్రౌండిಂಗ್ (ఘಾట్‌లు)", ML: "മാപ്സ് വിവരങ്ങൾ (ചുരങ്ങൾ)"
  },
  "What the sensors are seeing right now": {
    KN: "ಸಂವೇದಕಗಳು ಪ್ರಸ್ತುತ ಏನು ಗ್ರಹಿಸುತ್ತಿವೆ", HI: "सेंसर इस समय क्या देख रहे हैं", TA: "சென்சார்கள் இப்போது என்ன உணர்கின்றன", TE: "సెన్సార్లు ప్రస్తుతం ఏమి గమనిస్తున్నాయి", ML: "സെൻസറുകൾ ഇപ്പോൾ എന്താണ് കണ്ടെത്തുന്നത്"
  },
  "SLOPE STABILITY BREAKDOWN": {
    KN: "ಇಳಿಜಾರು ಸ್ಥಿರತೆಯ ವಿವರ", HI: "ढलान स्थिरता विश्लेषण", TA: "சரிவு நிலைத்தன்மை விவரம்", TE: "వాలు స్థిరత్వ విశ్ಲೇషణ", ML: "ചരിവ് സ്ഥിരത വിശകലനം"
  },
  "SLOPE ANGLE DRIFT": {
    KN: "ಇಳಿಜಾರು ಕೋನದ ಚಲನೆ", HI: "ढलान कोण बदलाव", TA: "சரிவு கோண நகர்வு", TE: "వాలు కోణ మార్ಪು", ML: "ചരിവ് ಕೋನ್ ವ್ಯತಿಯಾನಂ"
  },
  "FIELD ADVISORY FOR PATROLS & DISTRICT CONTROL": {
    KN: "ಗಸ್ತು ಮತ್ತು ಜಿಲ್ಲಾ ನಿಯಂತ್ರಣ ಕೊಠಡಿಗೆ ಕ್ಷೇತ್ರ ಸಲಹೆ", HI: "गश्ती दल और जिला नियंत्रण कक्ष के लिए क्षेत्रीय सलाह", TA: "ரோந்து மற்றும் மாவட்ட கட்டுப்பாட்டுக்கான கள வழிகாட்டுதல்", TE: "పెట్రోలింగ్ మరియు జిల్లా నియంత్రణ కోసం ఫీల్డ్ సలహా", ML: "പട്രോളിംഗിനും ജില്ലാ നിയന്ത്രണത്തിനുമുള്ള ഫീൽഡ് നിർദ്ദേശം"
  },
  "Notify taluk revenue officers immediately. Stop heavy commercial trucks from entering the pass road. Send local emergency teams to check downstream homes and prepare high-ground school buildings for sheltering.": {
    KN: "ತಾಲ್ಲೂಕು ಕಂದಾಯ ಅಧಿಕಾರಿಗಳಿಗೆ ತಕ್ಷಣ ತಿಳಿಸಿ. ಘಾಟ್ ರಸ್ತೆಗೆ ಭಾರಿ ವಾಣಿಜ್ಯ ವಾಹನಗಳ ಪ್ರವೇಶವನ್ನು ತಡೆಯಿರಿ. ನದಿ ತೀರದ ಮನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಮತ್ತು ಆಶ್ರಯಕ್ಕಾಗಿ ಎತ್ತರದ ಶಾಲಾ ಕಟ್ಟಡಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಲು ಸ್ಥಳೀಯ ತುರ್ತು ತಂಡಗಳನ್ನು ಕಳುಹಿಸಿ.",
    HI: "तालुका राजस्व अधिकारियों को तुरंत सूचित करें। घाट मार्ग पर भारी वाणिज्यिक ट्रकों के प्रवेश को रोकें। निचले इलाकों के घरों की जांच करने और आश्रय के लिए ऊंचे स्कूल भवनों को तैयार करने के लिए स्थानीय आपातकालीन दल भेजें।",
    TA: "வட்டார வருவாய்த்துறை அதிகாரிகளுக்கு உடனடியாக தெரிவிக்கவும். மலைப்பாதையில் கனரக சரக்கு வாகனங்கள் செல்வதை நிறுத்தவும். கீழ் பகுதி வீடுகளை ஆய்வு செய்து பள்ளிகளை முகாம்களாக தயார் செய்ய பேரிடர் மீட்புக் குழுவினரை அனுப்பவும்.",
    TE: "తాలూకా రెవెన్యూ అధికారులకు వెంటనే సమాచారం అందించండి. ఘాట్ రోడ్డులోకి భారీ ట్రక్కులు రాకుండా ఆపండి. దిగువ ప్రాంతాల్లోని ఇళ్లను తనిఖీ చేయడానికి మరియు ఎత్తైన పాఠశాల భవనాలను ఆశ్రయాలుగా సిద్ధం చేయడానికి అత్యవసర బృందాలను పంపండి.",
    ML: "താലൂക്ക് റവന്യൂ ഉദ്യോഗസ്ഥരെ ഉടൻ അറിയിക്കുക. ചുരം റോഡിലേക്ക് ഭാരമേറിയ വാഹനങ്ങൾ പ്രവേശിക്കുന്നത് തടയുക. താഴ്ന്ന പ്രദേശങ്ങളിലെ വീടുകൾ പരിശോധിച്ച് സ്കൂളുകൾ ദുരിതാശ്വാസ ക്യാമ്പുകളാക്കാൻ അടിയന്തര രക്ഷാസംഘങ്ങളെ നിയോഗിക്കുക."
  },
  "Threshold: 100mm. Heavy continuous rain is loading water weight onto the hillside.": {
    KN: "ಮಿತಿ: 100mm. ನಿರಂತರ ಭಾರಿ ಮಳೆಯು ಬೆಟ್ಟದ ಇಳಿಜಾರಿನ ಮೇಲೆ ನೀರಿನ ಭಾರವನ್ನು ಹೆಚ್ಚಿಸುತ್ತಿದೆ.",
    HI: "सीमा: 100 मिमी। लगातार भारी बारिश पहाड़ी ढलान पर पानी का भार बढ़ा रही है।",
    TA: "வரம்பு: 100 மிமீ. தொடர் கனமழை மலையடிவாரத்தில் நீர் எடையை ஏற்றுகிறது.",
    TE: "పరిమితి: 100మి.మీ. నిరంతర భారీ వర్షం కొండవాలుపై నీటి బరువును మోపుతోంది.",
    ML: "പരിധി: 100 മിമി. തുടർച്ചയായ കനത്ത മഴ മലഞ്ചെരുവിൽ വെള്ളത്തിന്റെ ഭാരം കൂട്ടുന്നു."
  },
  "Capacitive probe indicates the soil matrix is nearing fluid saturation.": {
    KN: "ಕೆಪಾಸಿಟಿವ್ ತನಿಖೆಯು ಮಣ್ಣಿನ ಸಾಂದ್ರತೆಯು ದ್ರವ ಶುದ್ಧತ್ವವನ್ನು ತಲುಪುತ್ತಿರುವುದನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    HI: "कैपेसिटिव जांच दर्शाती है कि मिट्टी का मैट्रिक्स संतृप्ति के करीब है।",
    TA: "கெபாசிட்டிவ் சென்சார் மண் முழு ஈரப்பதத்தை அடைந்துவிட்டதைக் குறிக்கிறது.",
    TE: "కెపాసిటివ్ ప్రోబ్ నేల మాతృక సంతృప్తతకు చేరువవుతుందని సూచిస్తుంది.",
    ML: "കപ്പാസിറ്റീവ് പ്രോബ് മണ്ണിന്റെ ഘടന പരമാവധി ഈർപ്പത്തിലെത്തിയതായി വ്യക്തമാക്കുന്നു."
  },
  "Biaxial tiltmeter shows continuous micro-shift along the bedrock contact plane.": {
    KN: "ಬಯಾಕ್ಸಿಯಲ್ ಟಿಲ್ಟ್‌ಮೀಟರ್ ತಳಪಾಯದ ಸಂಪರ್ಕ ಸಮತಲದಲ್ಲಿ ನಿರಂತರ ಸೂಕ್ಷ್ಮ ಬದಲಾವಣೆಯನ್ನು ತೋರಿಸುತ್ತದೆ.",
    HI: "द्विअक्षीय झुकावमापी आधारशिला संपर्क तल पर निरंतर सूक्ष्म विस्थापन दिखाता है।",
    TA: "இருமுனை சாய்வுமானி பாறை பரப்பில் தொடர் நுண்ணிய நகர்வைக் காட்டுகிறது.",
    TE: "ద్విఅక్ష ఇంక్లినోమీటర్ బెడ్‌రాక్ కాంటాక్ట్ ప్లేన్ వెంబడి నిరంతర సూక్ష్మ స్థానభ్రంశాన్ని చూపుతుంది.",
    ML: "ദ്വി-അക്ഷ ടിൽറ്റ്മീറ്റർ പാറക്കെട്ടുകളുടെ നിരപ്പിൽ തുടർച്ചയായ സൂക്ഷ്മ ചലനം കാണിക്കുന്നു."
  },
  "Geotechnical Decision Support, IMD Grounding & Evacuation Navigation": {
    KN: "ಭೂತಾಂತ್ರಿಕ ನಿರ್ಧಾರ ಬೆಂಬಲ, IMD ಡೇಟಾ ಮತ್ತು ಸ್ಥಳಾಂತರಿಸುವ ನ್ಯಾವಿಗೇಷನ್",
    HI: "भू-तकनीकी निर्णय समर्थन, आईएमडी ग्राउंडिंग और निकासी नेविगेशन",
    TA: "நிலவியல் முடிவு ஆதரவு, IMD தகவல் & வெளியேற்ற வழிகாட்டல்",
    TE: "జియోటెక్నికల్ నిర్ణయ మద్దతు, IMD గ్రౌండింగ్ & తరలింపు నావిగేషన్",
    ML: "ജിയോടെക്നിക്കൽ തീരുമാന പിന്തുണ, IMD വിവരങ്ങൾ & ഒഴിപ്പിക്കൽ നാവിഗേഷൻ"
  },
  "ACTIVE ZONE": {
    KN: "ಸಕ್ರಿಯ ವಲಯ", HI: "सक्रिय क्षेत्र", TA: "செயலில் உள்ள மண்டலம்", TE: "యాక్టివ్ జోన్", ML: "സജീവ മേഖല"
  },
  "TEST TOAST": {
    KN: "ಪರೀಕ್ಷಾ ಸೂಚನೆ", HI: "टेस्ट अलर्ट", TA: "சோதனை அறிவிப்பு", TE: "టెస్ట్ అలర్ట్", ML: "ടെസ്റ്റ് അലേർട്ട്"
  },
};

/**
 * Universal Real-Time Translation Hook connected to Google Translate API & Local Caching
 * Ensures text is translated according to active language, while excluding units and numbers.
 */
export function useTranslation(language: NotificationLanguage) {
  const [dynamicCache, setDynamicCache] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(`landsora_translations_${language}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const translateMutation = trpc.translate.batch.useMutation();
  const pendingRequestsRef = useRef<Set<string>>(new Set());
  const queueRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced batch queue processor for dynamic runtime translations
  const queueForTranslation = useCallback((text: string) => {
    if (language === "EN" || isUnitOrNumber(text)) return;
    const cacheKey = `${language}:${text}`;
    if (dynamicCache[cacheKey] || (STATIC_DICTIONARY[text] && STATIC_DICTIONARY[text][language])) return;
    if (pendingRequestsRef.current.has(cacheKey)) return;

    queueRef.current.add(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const items = Array.from(queueRef.current).slice(0, 15);
      if (!items.length) return;

      items.forEach(t => {
        queueRef.current.delete(t);
        pendingRequestsRef.current.add(`${language}:${t}`);
      });

      translateMutation.mutate(
        { texts: items, targetLang: language },
        {
          onSuccess: (data) => {
            setDynamicCache((prev) => {
              const next = { ...prev };
              items.forEach((orig, idx) => {
                const trans = data.translations[idx];
                if (trans && !isUnitOrNumber(trans)) {
                  next[`${language}:${orig}`] = trans;
                }
                pendingRequestsRef.current.delete(`${language}:${orig}`);
              });
              try {
                localStorage.setItem(`landsora_translations_${language}`, JSON.stringify(next));
              } catch {}
              return next;
            });
          },
          onError: () => {
            items.forEach(t => pendingRequestsRef.current.delete(`${language}:${t}`));
          }
        }
      );
    }, 150);
  }, [language, dynamicCache, translateMutation]);

  // Synchronous dictionary hit or cache lookup; otherwise returns original text & queues background translation
  const t = useCallback((text: string): string => {
    if (!text || language === "EN") return text;
    if (isUnitOrNumber(text)) return text;

    // 1. Check static dictionary
    if (STATIC_DICTIONARY[text] && STATIC_DICTIONARY[text][language]) {
      return STATIC_DICTIONARY[text][language];
    }

    // 2. Check dynamic runtime cache
    const cacheKey = `${language}:${text}`;
    if (dynamicCache[cacheKey]) {
      return dynamicCache[cacheKey];
    }

    // 3. Queue dynamic translation in background
    queueForTranslation(text);

    return text;
  }, [language, dynamicCache, queueForTranslation]);

  // Batch translate explicit list of strings (e.g. dynamic event titles or notices)
  const translateDynamicBatch = useCallback((texts: string[]) => {
    if (language === "EN" || !texts.length) return;
    texts.forEach(str => {
      if (!isUnitOrNumber(str)) {
        queueForTranslation(str);
      }
    });
  }, [language, queueForTranslation]);

  return { t, translateDynamicBatch, currentLanguage: language, isUnitOrNumber };
}
