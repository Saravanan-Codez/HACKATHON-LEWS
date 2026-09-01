export const notificationLanguageStorageKey = "lews-notification-language";

export const notificationLanguages = [
  { code: "EN", label: "ENGLISH", nativeLabel: "English" },
  { code: "HI", label: "HINDI", nativeLabel: "हिन्दी" },
  { code: "KN", label: "KANNADA", nativeLabel: "ಕನ್ನಡ" },
  { code: "TA", label: "TAMIL", nativeLabel: "தமிழ்" },
  { code: "TE", label: "TELUGU", nativeLabel: "తెలుగు" },
  { code: "ML", label: "MALAYALAM", nativeLabel: "മലയാളം" },
] as const;

export type NotificationLanguage = (typeof notificationLanguages)[number]["code"];
export type NotificationKind =
  | "CRITICAL_WARNING"
  | "LANDSLIDE_WARNING"
  | "ROAD_BLOCKAGE"
  | "EVACUATION"
  | "SAFETY_UPDATE"
  | "COMMUNITY_NOTICE";

type NotificationMessage = { title: string; body: string };
type NotificationContext = { place?: string; road?: string };

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

const languageCodes = new Set<NotificationLanguage>(notificationLanguages.map(({ code }) => code));

const messages: Record<NotificationLanguage, Record<NotificationKind, NotificationMessage>> = {
  EN: {
    CRITICAL_WARNING: {
      title: "CRITICAL LANDSLIDE WARNING",
      body: "Heavy rainfall and dangerous soil conditions have been detected in your area. Please remain alert and follow instructions from local authorities.",
    },
    LANDSLIDE_WARNING: {
      title: "LANDSLIDE WARNING",
      body: "Slope movement indicators are elevated near {place}. Keep away from unstable ground and monitor official updates.",
    },
    ROAD_BLOCKAGE: {
      title: "ROAD BLOCKAGE NOTIFICATION",
      body: "The {road} corridor may be unsafe or obstructed. Avoid the route and follow approved diversion guidance.",
    },
    EVACUATION: {
      title: "EVACUATION INSTRUCTION",
      body: "Move calmly to the designated safe location for {place}. Carry essential medicines and follow local authority instructions.",
    },
    SAFETY_UPDATE: {
      title: "SAFETY UPDATE",
      body: "Monitoring continues for {place}. Stay away from cracks, falling rocks, flooded crossings, and recently disturbed slopes.",
    },
    COMMUNITY_NOTICE: {
      title: "COMMUNITY NOTIFICATION",
      body: "Please share verified safety information with residents near {place}. Do not forward unconfirmed reports.",
    },
  },
  HI: {
    CRITICAL_WARNING: {
      title: "गंभीर भूस्खलन चेतावनी",
      body: "आपके क्षेत्र में अत्यधिक वर्षा और खतरनाक मिट्टी की स्थिति दर्ज की गई है। कृपया सतर्क रहें और स्थानीय प्रशासन के निर्देशों का पालन करें।",
    },
    LANDSLIDE_WARNING: {
      title: "भूस्खलन चेतावनी",
      body: "{place} के पास ढलान संचलन के संकेत बढ़े हैं। अस्थिर भूमि से दूर रहें और आधिकारिक सूचनाओं पर नजर रखें।",
    },
    ROAD_BLOCKAGE: {
      title: "सड़क अवरोध सूचना",
      body: "{road} मार्ग असुरक्षित या बाधित हो सकता है। कृपया इस मार्ग से बचें और वैकल्पिक मार्ग का उपयोग करें।",
    },
    EVACUATION: {
      title: "सुरक्षित निकासी निर्देश",
      body: "{place} के लिए निर्धारित सुरक्षित स्थान पर शांतिपूर्वक जाएं। आवश्यक दवाएं साथ रखें और राहत दल के निर्देशों का पालन करें।",
    },
    SAFETY_UPDATE: {
      title: "सुरक्षा अपडेट",
      body: "{place} क्षेत्र में निरंतर निगरानी जारी है। दरारों, गिरते पत्थरों और हाल ही में खिसकी ढलानों से दूर रहें।",
    },
    COMMUNITY_NOTICE: {
      title: "सामुदायिक सूचना",
      body: "{place} के निवासियों के साथ केवल सत्यापित सुरक्षा जानकारी साझा करें। अपुष्ट अफवाहों पर ध्यान न दें।",
    },
  },
  TA: {
    CRITICAL_WARNING: {
      title: "முக்கிய நிலச்சரிவு எச்சரிக்கை",
      body: "உங்கள் பகுதியில் கனமழை மற்றும் ஆபத்தான நில நிலைமைகள் கண்டறியப்பட்டுள்ளன. தயவுசெய்து எச்சரிக்கையாக இருந்து உள்ளூர் அதிகாரிகளின் அறிவுறுத்தல்களைப் பின்பற்றவும்.",
    },
    LANDSLIDE_WARNING: {
      title: "நிலச்சரிவு எச்சரிக்கை",
      body: "{place} அருகே சரிவு இயக்கத்தின் அறிகுறிகள் அதிகரித்துள்ளன. நிலையற்ற நிலப்பகுதிகளிலிருந்து விலகி அதிகாரப்பூர்வ தகவல்களை கவனிக்கவும்.",
    },
    ROAD_BLOCKAGE: {
      title: "சாலை தடுப்பு அறிவிப்பு",
      body: "{road} சாலைப்பாதை பாதுகாப்பற்றதாக அல்லது தடையடைந்ததாக இருக்கலாம். இந்த வழியைத் தவிர்த்து அங்கீகரிக்கப்பட்ட மாற்றுப்பாதை வழிகாட்டுதலைப் பின்பற்றவும்.",
    },
    EVACUATION: {
      title: "வெளியேற்ற அறிவுறுத்தல்",
      body: "{place} பகுதிக்கான நியமிக்கப்பட்ட பாதுகாப்பான இடத்திற்குச் அமைதியாக செல்லவும். அத்தியாவசிய மருந்துகளை எடுத்துக்கொண்டு உள்ளூர் அதிகாரிகளின் அறிவுறுத்தல்களைப் பின்பற்றவும்.",
    },
    SAFETY_UPDATE: {
      title: "பாதுகாப்பு புதுப்பிப்பு",
      body: "{place} பகுதியில் கண்காணிப்பு தொடர்கிறது. பிளவுகள், விழும் பாறைகள், வெள்ளப்பாதைகள் மற்றும் சமீபத்தில் மாறிய சரிவுகளிலிருந்து விலகி இருங்கள்.",
    },
    COMMUNITY_NOTICE: {
      title: "சமூக அறிவிப்பு",
      body: "{place} அருகிலுள்ள குடியிருப்பாளர்களுடன் சரிபார்க்கப்பட்ட பாதுகாப்புத் தகவல்களைப் பகிரவும். உறுதிப்படுத்தப்படாத செய்திகளை அனுப்ப வேண்டாம்.",
    },
  },
  TE: {
    CRITICAL_WARNING: {
      title: "తీవ్ర కొండచరియల హెచ్చరిక",
      body: "మీ ప్రాంతంలో భారీ వర్షపాతం మరియు ప్రమాదకరమైన నేల పరిస్థితులు గుర్తించబడ్డాయి. అప్రమత్తంగా ఉండి స్థానిక అధికారుల సూచనలను పాటించండి.",
    },
    LANDSLIDE_WARNING: {
      title: "కొండచరియల హెచ్చరిక",
      body: "{place} సమీపంలో వాలు కదలికల సూచనలు పెరిగాయి. అస్థిరమైన నేలకు దూరంగా ఉండి అధికారిక సమాచారాన్ని గమనించండి.",
    },
    ROAD_BLOCKAGE: {
      title: "రోడ్డు నిరోధం నోటిఫికేషన్",
      body: "{road} మార్గం అసురక్షితంగా లేదా నిరోధించబడి ఉండవచ్చు. ఆ మార్గాన్ని తప్పించి ఆమోదించబడిన ప్రత్యామ్నాయ మార్గ సూచనలను పాటించండి.",
    },
    EVACUATION: {
      title: "ఖాళీ చేయించే సూచన",
      body: "{place} కోసం కేటాయించిన సురక్షిత ప్రదేశానికి ప్రశాంతంగా వెళ్లండి. అవసరమైన మందులు తీసుకుని స్థానిక అధికారుల సూచనలను పాటించండి.",
    },
    SAFETY_UPDATE: {
      title: "భద్రతా నవీకరణ",
      body: "{place} ప్రాంతంలో పర్యవేక్షణ కొనసాగుతోంది. పగుళ్లు, పడే రాళ్లు, వరద దాటులు మరియు ఇటీవల మారిన వాలుల నుంచి దూరంగా ఉండండి.",
    },
    COMMUNITY_NOTICE: {
      title: "సమాజ నోటిఫికేషన్",
      body: "{place} సమీపంలోని నివాసితులతో ధృవీకరించిన భద్రతా సమాచారాన్ని పంచుకోండి. నిర్ధారించని వార్తలను పంపవద్దు.",
    },
  },
  KN: {
    CRITICAL_WARNING: {
      title: "ತೀವ್ರ ಭೂಕುಸಿತ ಎಚ್ಚರಿಕೆ",
      body: "ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಭಾರಿ ಮಳೆ ಮತ್ತು ಅಪಾಯಕಾರಿ ಮಣ್ಣಿನ ಪರಿಸ್ಥಿತಿಗಳು ಪತ್ತೆಯಾಗಿವೆ. ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ ಮತ್ತು ಸ್ಥಳೀಯ ಅಧಿಕಾರಿಗಳ ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ.",
    },
    LANDSLIDE_WARNING: {
      title: "ಭೂಕುಸಿತ ಎಚ್ಚರಿಕೆ",
      body: "{place} ಸಮೀಪ ಇಳಿಜಾರು ಚಲನೆಯ ಸೂಚನೆಗಳು ಹೆಚ್ಚಾಗಿವೆ. ಅಸ್ಥಿರ ನೆಲದಿಂದ ದೂರವಿದ್ದು ಅಧಿಕೃತ ಮಾಹಿತಿಯನ್ನು ಗಮನಿಸಿ.",
    },
    ROAD_BLOCKAGE: {
      title: "ರಸ್ತೆ ತಡೆ ಸೂಚನೆ",
      body: "{road} ಮಾರ್ಗವು ಅಪಾಯಕಾರಿಯಾಗಿರಬಹುದು ಅಥವಾ ತಡೆಗಟ್ಟಲ್ಪಟ್ಟಿರಬಹುದು. ಈ ಮಾರ್ಗವನ್ನು ತಪ್ಪಿಸಿ ಅನುಮೋದಿತ ಪರ್ಯಾಯ ಮಾರ್ಗದ ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ.",
    },
    EVACUATION: {
      title: "ಸ್ಥಳಾಂತರ ಸೂಚನೆ",
      body: "{place} ಗಾಗಿ ನಿಗದಿಪಡಿಸಿದ ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ಶಾಂತವಾಗಿ ತೆರಳಿ. ಅಗತ್ಯ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಂಡು ಸ್ಥಳೀಯ ಅಧಿಕಾರಿಗಳ ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ.",
    },
    SAFETY_UPDATE: {
      title: "ಸುರಕ್ಷತಾ ನವೀಕರಣ",
      body: "{place} ಪ್ರದೇಶದಲ್ಲಿ ಮೇಲ್ವಿಚಾರಣೆ ಮುಂದುವರಿದಿದೆ. ಬಿರುಕುಗಳು, ಬೀಳುವ ಬಂಡೆಗಳು, ಪ್ರವಾಹದ ದಾಟುಗಳು ಮತ್ತು ಇತ್ತೀಚೆಗೆ ಬದಲಾಗಿರುವ ಇಳಿಜಾರುಗಳಿಂದ ದೂರವಿರಿ.",
    },
    COMMUNITY_NOTICE: {
      title: "ಸಮುದಾಯ ಸೂಚನೆ",
      body: "{place} ಸಮೀಪದ ನಿವಾಸಿಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿದ ಸುರಕ್ಷತಾ ಮಾಹಿತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ. ದೃಢೀಕರಿಸದ ವರದಿಗಳನ್ನು ಕಳುಹಿಸಬೇಡಿ.",
    },
  },
  ML: {
    CRITICAL_WARNING: {
      title: "ഗുരുതര മണ്ണിടിച്ചിൽ മുന്നറിയിപ്പ്",
      body: "നിങ്ങളുടെ പ്രദേശത്ത് കനത്ത മഴയും അപകടകരമായ മണ്ണിന്റെ അവസ്ഥയും കണ്ടെത്തിയിട്ടുണ്ട്. ജാഗ്രത പാലിക്കുകയും പ്രാദേശിക അധികാരികളുടെ നിർദ്ദേശങ്ങൾ പിന്തുടരുകയും ചെയ്യുക.",
    },
    LANDSLIDE_WARNING: {
      title: "മണ്ണിടിച്ചിൽ മുന്നറിയിപ്പ്",
      body: "{place} സമീപം ചരിവിന്റെ ചലന സൂചനകൾ വർധിച്ചിട്ടുണ്ട്. അസ്ഥിരമായ മണ്ണിൽ നിന്ന് അകന്നു നിൽക്കുകയും ഔദ്യോഗിക വിവരങ്ങൾ ശ്രദ്ധിക്കുകയും ചെയ്യുക.",
    },
    ROAD_BLOCKAGE: {
      title: "റോഡ് തടസ്സ അറിയിപ്പ്",
      body: "{road} പാത സുരക്ഷിതമല്ലാതെയോ തടസ്സപ്പെട്ടതായോ ഇരിക്കാം. ഈ വഴി ഒഴിവാക്കി അംഗീകൃത വഴിതിരിച്ചുവിടൽ നിർദ്ദേശങ്ങൾ പാലിക്കുക.",
    },
    EVACUATION: {
      title: "ഒഴിപ്പിക്കൽ നിർദ്ദേശം",
      body: "{place} നായി നിശ്ചയിച്ച സുരക്ഷിത സ്ഥലത്തേക്ക് ശാന്തമായി നീങ്ങുക. ആവശ്യമായ മരുന്നുകൾ കൈയിൽ കരുതി പ്രാദേശിക അധികാരികളുടെ നിർദ്ദേശങ്ങൾ പാലിക്കുക.",
    },
    SAFETY_UPDATE: {
      title: "സുരക്ഷാ പുതുക്കൽ",
      body: "{place} പ്രദേശത്ത് നിരീക്ഷണം തുടരുന്നു. വിള്ളലുകൾ, വീഴുന്ന പാറകൾ, വെള്ളപ്പൊക്ക പാതകൾ, അടുത്തിടെ മാറിയ ചരിവുകൾ എന്നിവയിൽ നിന്ന് അകന്നു നിൽക്കുക.",
    },
    COMMUNITY_NOTICE: {
      title: "സമൂഹ അറിയിപ്പ്",
      body: "{place} സമീപത്തെ നിവാസികളുമായി സ്ഥിരീകരിച്ച സുരക്ഷാ വിവരങ്ങൾ പങ്കിടുക. സ്ഥിരീകരിക്കാത്ത റിപ്പോർട്ടുകൾ കൈമാറരുത്.",
    },
  },
};

const isNotificationLanguage = (value: string | null): value is NotificationLanguage => Boolean(value && languageCodes.has(value as NotificationLanguage));

export const getStoredNotificationLanguage = (storage?: StorageReader): NotificationLanguage => {
  const source = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
  const stored = source?.getItem(notificationLanguageStorageKey) ?? null;
  return isNotificationLanguage(stored) ? stored : "EN";
};

export const saveNotificationLanguage = (language: NotificationLanguage, storage?: StorageWriter) => {
  const source = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
  source?.setItem(notificationLanguageStorageKey, language);
  return language;
};

export const renderNotification = (kind: NotificationKind, language: NotificationLanguage, context: NotificationContext = {}): NotificationMessage => {
  const message = messages[language][kind];
  const replacements: Record<string, string> = {
    place: context.place ?? "your monitored area",
    road: context.road ?? "the monitored road",
  };
  const fill = (value: string) => value.replace(/\{(place|road)\}/g, (_, key: string) => replacements[key] ?? "");
  return { title: message.title, body: fill(message.body) };
};

/**
 * Automatically detects the native regional language for a given monitored zone.
 */
export const detectLanguageForZone = (zoneIdOrName: string): NotificationLanguage => {
  const normalized = zoneIdOrName.toUpperCase();
  if (
    normalized.includes("KDG") ||
    normalized.includes("KODAGU") ||
    normalized.includes("COORG") ||
    normalized.includes("CHK") ||
    normalized.includes("CHIKKAMAGALURU") ||
    normalized.includes("UKA") ||
    normalized.includes("UTTARA")
  ) {
    return "KN"; // Kannada for Karnataka Western Ghats
  }
  if (
    normalized.includes("WYD") ||
    normalized.includes("WAYANAD") ||
    normalized.includes("IDK") ||
    normalized.includes("IDUKKI") ||
    normalized.includes("MNR") ||
    normalized.includes("MUNNAR") ||
    normalized.includes("KERALA")
  ) {
    return "ML"; // Malayalam for Kerala Hill Tracts
  }
  if (
    normalized.includes("NLG") ||
    normalized.includes("NILGIRIS") ||
    normalized.includes("COONOOR") ||
    normalized.includes("VLP") ||
    normalized.includes("VALPARAI") ||
    normalized.includes("TAMIL")
  ) {
    return "TA"; // Tamil for Tamil Nadu Ghats
  }
  if (
    normalized.includes("ANDHRA") ||
    normalized.includes("TELANGANA") ||
    normalized.includes("VIZAG") ||
    normalized.includes("ARAKU")
  ) {
    return "TE"; // Telugu for Eastern Ghats
  }
  if (
    normalized.includes("SHM") ||
    normalized.includes("SHIMLA") ||
    normalized.includes("CHM") ||
    normalized.includes("CHAMOLI") ||
    normalized.includes("JOSHIMATH") ||
    normalized.includes("MHD") ||
    normalized.includes("MAHAD")
  ) {
    return "HI"; // Hindi for Northern & Central Mountain Belts
  }
  return "EN";
};

/**
 * Automatically detects native regional language from GPS coordinates.
 */
export const detectLanguageFromCoords = (latitude: number, longitude: number): NotificationLanguage => {
  // Northern India / Himalayas (Himachal, Uttarakhand)
  if (latitude >= 28.0 && latitude <= 35.0 && longitude >= 75.0 && longitude <= 82.0) {
    return "HI";
  }
  // Kerala polygon bounds approx (8.2°N - 12.8°N, 75°E - 77.2°E)
  if (latitude >= 8.2 && latitude <= 12.5 && longitude >= 75.0 && longitude <= 77.2) {
    if (latitude < 12.0 && longitude > 75.8) return "ML";
  }
  // Tamil Nadu bounds approx (8.1°N - 13.5°N, 76.5°E - 80.3°E)
  if (latitude >= 8.1 && latitude <= 13.5 && longitude >= 76.5 && longitude <= 80.3) {
    if (latitude < 12.0 && longitude > 76.8) return "TA";
  }
  // Karnataka bounds approx (11.5°N - 18.5°N, 74.0°E - 78.5°E)
  if (latitude >= 11.5 && latitude <= 18.5 && longitude >= 74.0 && longitude <= 78.0) {
    return "KN";
  }
  // Andhra / Telangana
  if (latitude >= 12.5 && latitude <= 19.9 && longitude >= 78.0 && longitude <= 84.8) {
    return "TE";
  }
  return "EN";
};

