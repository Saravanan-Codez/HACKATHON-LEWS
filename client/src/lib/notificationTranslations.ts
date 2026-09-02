export const notificationLanguageStorageKey = "lews-notification-language";

export const notificationLanguages = [
  // Regional & Indian Languages
  { code: "EN", label: "ENGLISH", nativeLabel: "English", flag: "🇬🇧", group: "Indian & Asian" },
  { code: "KN", label: "KANNADA", nativeLabel: "ಕನ್ನಡ", flag: "🇮🇳", group: "Indian & Asian" },
  { code: "HI", label: "HINDI", nativeLabel: "हिन्दी", flag: "🇮🇳", group: "Indian & Asian" },
  { code: "TA", label: "TAMIL", nativeLabel: "தமிழ்", flag: "🇮🇳", group: "Indian & Asian" },
  { code: "TE", label: "TELUGU", nativeLabel: "తెలుగు", flag: "🇮🇳", group: "Indian & Asian" },
  { code: "ML", label: "MALAYALAM", nativeLabel: "മലയാളം", flag: "🇮🇳", group: "Indian & Asian" },
  { code: "BN", label: "BENGALI", nativeLabel: "বাংলা", flag: "🇮🇳", group: "Indian & Asian" },
  { code: "MR", label: "MARATHI", nativeLabel: "मराठी", flag: "🇮🇳", group: "Indian & Asian" },
  { code: "GU", label: "GUJARATI", nativeLabel: "ગુજરાતી", flag: "🇮🇳", group: "Indian & Asian" },
  { code: "PA", label: "PUNJABI", nativeLabel: "ਪੰਜਾਬੀ", flag: "🇮🇳", group: "Indian & Asian" },
  { code: "OR", label: "ODIA", nativeLabel: "ଓଡ଼ିଆ", flag: "🇮🇳", group: "Indian & Asian" },
  { code: "UR", label: "URDU", nativeLabel: "اردو", flag: "🇵🇰", group: "Indian & Asian" },
  { code: "NE", label: "NEPALI", nativeLabel: "नेपाली", flag: "🇳🇵", group: "Indian & Asian" },

  // Global & World Languages
  { code: "ES", label: "SPANISH", nativeLabel: "Español", flag: "🇪🇸", group: "Global & European" },
  { code: "FR", label: "FRENCH", nativeLabel: "Français", flag: "🇫🇷", group: "Global & European" },
  { code: "DE", label: "GERMAN", nativeLabel: "Deutsch", flag: "🇩🇪", group: "Global & European" },
  { code: "JA", label: "JAPANESE", nativeLabel: "日本語", flag: "🇯🇵", group: "Global & European" },
  { code: "ZH", label: "CHINESE", nativeLabel: "中文", flag: "🇨🇳", group: "Global & European" },
  { code: "AR", label: "ARABIC", nativeLabel: "العربية", flag: "🇸🇦", group: "Global & European" },
  { code: "PT", label: "PORTUGUESE", nativeLabel: "Português", flag: "🇧🇷", group: "Global & European" },
  { code: "RU", label: "RUSSIAN", nativeLabel: "Русский", flag: "🇷🇺", group: "Global & European" },
  { code: "IT", label: "ITALIAN", nativeLabel: "Italiano", flag: "🇮🇹", group: "Global & European" },
  { code: "ID", label: "INDONESIAN", nativeLabel: "Bahasa Indonesia", flag: "🇮🇩", group: "Global & European" },
  { code: "KO", label: "KOREAN", nativeLabel: "한국어", flag: "🇰🇷", group: "Global & European" },
  { code: "TR", label: "TURKISH", nativeLabel: "Türkçe", flag: "🇹🇷", group: "Global & European" },
  { code: "VI", label: "VIETNAMESE", nativeLabel: "Tiếng Việt", flag: "🇻🇳", group: "Global & European" },
  { code: "TH", label: "THAI", nativeLabel: "ไทย", flag: "🇹🇭", group: "Global & European" },
  { code: "SW", label: "SWAHILI", nativeLabel: "Kiswahili", flag: "🇰🇪", group: "Global & European" },
  { code: "NL", label: "DUTCH", nativeLabel: "Nederlands", flag: "🇳🇱", group: "Global & European" },
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

const languageCodes = new Set<string>(notificationLanguages.map(({ code }) => code));

const messages: Record<NotificationLanguage, Record<NotificationKind, NotificationMessage>> = {
  EN: {
    CRITICAL_WARNING: { title: "CRITICAL LANDSLIDE WARNING", body: "Heavy rainfall and dangerous soil conditions have been detected in your area. Please remain alert and follow instructions from local authorities." },
    LANDSLIDE_WARNING: { title: "LANDSLIDE WARNING", body: "Slope movement indicators are elevated near {place}. Keep away from unstable ground and monitor official updates." },
    ROAD_BLOCKAGE: { title: "ROAD BLOCKAGE NOTIFICATION", body: "The {road} corridor may be unsafe or obstructed. Avoid the route and follow approved diversion guidance." },
    EVACUATION: { title: "EVACUATION INSTRUCTION", body: "Move calmly to the designated safe location for {place}. Carry essential medicines and follow local authority instructions." },
    SAFETY_UPDATE: { title: "SAFETY UPDATE", body: "Monitoring continues for {place}. Stay away from cracks, falling rocks, flooded crossings, and recently disturbed slopes." },
    COMMUNITY_NOTICE: { title: "COMMUNITY NOTIFICATION", body: "Please share verified safety information with residents near {place}. Do not forward unconfirmed reports." },
  },
  HI: {
    CRITICAL_WARNING: { title: "गंभीर भूस्खलन चेतावनी", body: "आपके क्षेत्र में अत्यधिक वर्षा और खतरनाक मिट्टी की स्थिति दर्ज की गई है। कृपया सतर्क रहें और स्थानीय प्रशासन के निर्देशों का पालन करें।" },
    LANDSLIDE_WARNING: { title: "भूस्खलन चेतावनी", body: "{place} के पास ढलान की गति बढ़ी हुई है। अस्थिर जमीन से दूर रहें।" },
    ROAD_BLOCKAGE: { title: "सड़क अवरोध सूचना", body: "{road} मार्ग असुरक्षित या अवरुद्ध हो सकता है। वैकल्पिक मार्ग का पालन करें।" },
    EVACUATION: { title: "निकासी निर्देश", body: "{place} के लिए निर्धारित सुरक्षित स्थान पर शांतिपूर्वक जाएं।" },
    SAFETY_UPDATE: { title: "सुरक्षा अपडेट", body: "{place} के लिए निगरानी जारी है। दरारों और गिरते पत्थरों से दूर रहें।" },
    COMMUNITY_NOTICE: { title: "सामुदायिक सूचना", body: "{place} के निवासियों के साथ सत्यापित जानकारी साझा करें।" },
  },
  KN: {
    CRITICAL_WARNING: { title: "ತೀವ್ರ ಭೂಕುಸಿತ ಎಚ್ಚರಿಕೆ", body: "ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಭಾರಿ ಮಳೆ ಮತ್ತು ಅಪಾಯಕಾರಿ ಮಣ್ಣಿನ ಸ್ಥಿತಿ ಪತ್ತೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಜಾಗರೂಕರಾಗಿರಿ ಮತ್ತು ಸ್ಥಳೀಯ ಅಧಿಕಾರಿಗಳ ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ." },
    LANDSLIDE_WARNING: { title: "ಭೂಕುಸಿತ ಎಚ್ಚರಿಕೆ", body: "{place} ಬಳಿ ಇಳಿಜಾರಿನ ಚಲನೆ ಹೆಚ್ಚಾಗಿದೆ. ಅಸ್ಥಿರ ಭೂಮಿಯಿಂದ ದೂರವಿರಿ." },
    ROAD_BLOCKAGE: { title: "ರಸ್ತೆ ತಡೆ ಅಧಿಸೂಚನೆ", body: "{road} ಕಾರಿಡಾರ್ ಅಸುರಕ್ಷಿತವಾಗಿರಬಹುದು ಅಥವಾ ಅಡಚಣೆಯಾಗಿರಬಹುದು." },
    EVACUATION: { title: "ಸ್ಥಳಾಂತರ ಸೂಚನೆ", body: "{place} ಗಾಗಿ ಗೊತ್ತುಪಡಿಸಿದ ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ಶಾಂತವಾಗಿ ತೆರಳಿ." },
    SAFETY_UPDATE: { title: "ಸುರಕ್ಷತಾ ನವೀಕರಣ", body: "{place} ಗಾಗಿ ನಿರಂತರ ನಿಗಾ ಮುಂದುವರಿದಿದೆ. ಬಿರುಕುಗಳಿಂದ ದೂರವಿರಿ." },
    COMMUNITY_NOTICE: { title: "ಸಮುದಾಯ ಅಧಿಸೂಚನೆ", body: "{place} ಸಮೀಪದ ನಿವಾಸಿಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ." },
  },
  TA: {
    CRITICAL_WARNING: { title: "தீவிர நிலச்சரிவு எச்சரிக்கை", body: "உங்கள் பகுதியில் கனமழை மற்றும் ஆபத்தான மண் நிலைமைகள் கண்டறியப்பட்டுள்ளன. எச்சரிக்கையாக இருங்கள் மற்றும் அதிகாரிகளின் வழிகாட்டுதலைப் பின்பற்றவும்." },
    LANDSLIDE_WARNING: { title: "நிலச்சரிவு எச்சரிக்கை", body: "{place} அருகே சரிவு நகர்வு அதிகரித்துள்ளது. உறுதியற்ற பகுதியிலிருந்து விலகி இருங்கள்." },
    ROAD_BLOCKAGE: { title: "சாலை அடைப்பு அறிவிப்பு", body: "{road} பாதை பாதுகாப்பற்றதாக இருக்கலாம். மாற்றுப்பாதையைப் பயன்படுத்தவும்." },
    EVACUATION: { title: "வெளியேற்ற அறிவுறுத்தல்", body: "{place} பகுதிக்கு ஒதுக்கப்பட்ட பாதுகாப்பான இடத்திற்கு அமைதியாக செல்லுங்கள்." },
    SAFETY_UPDATE: { title: "பாதுகாப்பு தகவல்", body: "{place} பகுதிக்கான கண்காணிப்பு தொடர்கிறது." },
    COMMUNITY_NOTICE: { title: "சமூக அறிவிப்பு", body: "{place} அருகே உள்ள மக்களுடன் உறுதிப்படுத்தப்பட்ட தகவலை பகிரவும்." },
  },
  TE: {
    CRITICAL_WARNING: { title: "తీవ్ర కొండచరియల విరిగిపాటు హెచ్చరిక", body: "మీ ప్రాంతంలో భారీ వర్షపాతం మరియు ప్రమాదకర నేల పరిస్థితులు గుర్తించబడ్డాయి. అప్రమత్తంగా ఉండండి మరియు అధికారిక సూచనలు పాటించండి." },
    LANDSLIDE_WARNING: { title: "కొండచరియల హెచ్చరిక", body: "{place} సమీపంలో వాలు కదలికలు పెరిగాయి. అస్థిరమైన నేల నుండి దూరంగా ఉండండి." },
    ROAD_BLOCKAGE: { title: "రహదారి అడ్డంకి నోటిఫికేషన్", body: "{road} మార్గం అసురక్షితంగా లేదా అడ్డంకిగా ఉండవచ్చు." },
    EVACUATION: { title: "తరలింపు సూచన", body: "{place} కోసం నిర్దేశించిన సురక్షిత ప్రాంతానికి ప్రశాంతంగా తరలివెళ్లండి." },
    SAFETY_UPDATE: { title: "భద్రతా నవీకరణ", body: "{place} కోసం పర్యవేక్షణ కొనసాగుతోంది." },
    COMMUNITY_NOTICE: { title: "కమ్యూనిటీ నోటీసు", body: "{place} సమీప నివాసితులతో ధృవీకరించిన సమాచారాన్ని పంచుకోండి." },
  },
  ML: {
    CRITICAL_WARNING: { title: "തീവ്ര മണ്ണിടിച്ചിൽ മുന്നറിയിപ്പ്", body: "നിങ്ങളുടെ പ്രദേശത്ത് കനത്ത മഴയും അപകടകരമായ മണ്ണ് അവസ്ഥയും രേഖപ്പെടുത്തിയിട്ടുണ്ട്. ജാഗ്രത പാലിക്കുകയും പ്രാദേശിക അധികാരികളുടെ നിർദ്ദേശങ്ങൾ അനുസരിക്കുകയും ചെയ്യുക." },
    LANDSLIDE_WARNING: { title: "മണ്ണിടിച്ചിൽ മുന്നറിയിപ്പ്", body: "{place} സമീപം ചരിവ് ചലന സൂചകങ്ങൾ ഉയർന്ന നിലയിലാണ്." },
    ROAD_BLOCKAGE: { title: "റോഡ് തടസ്സ അറിയിപ്പ്", body: "{road} പാത സുരക്ഷിതമല്ലാത്തതോ തടസ്സപ്പെട്ടതോ ആകാം." },
    EVACUATION: { title: "ഒഴിപ്പിക്കൽ നിർദ്ദേശം", body: "{place} നായി നിശ്ചയിച്ച സുരക്ഷിത സ്ഥലത്തേക്ക് ശാന്തമായി നീങ്ങുക." },
    SAFETY_UPDATE: { title: "സുരക്ഷാ പുതുക്കൽ", body: "{place} പ്രദേശത്ത് നിരീക്ഷണം തുടരുന്നു." },
    COMMUNITY_NOTICE: { title: "സമൂഹ അറിയിപ്പ്", body: "{place} സമീപത്തെ നിവാസികളുമായി സ്ഥിരീകരിച്ച സുരക്ഷാ വിവരങ്ങൾ പങ്കിടുക." },
  },
  BN: {
    CRITICAL_WARNING: { title: "গুরুতর ভূমিধস সতর্কতা", body: "আপনার এলাকায় অতিভারী বৃষ্টিপাত এবং বিপজ্জনক মাটির অবস্থা সনাক্ত হয়েছে। সতর্ক থাকুন এবং স্থানীয় কর্তৃপক্ষের নির্দেশাবলী অনুসরণ করুন।" },
    LANDSLIDE_WARNING: { title: "ভূমিধস সতর্কতা", body: "{place} এর কাছাকাছি মাটির স্থানচ্যুতি বৃদ্ধি পেয়েছে।" },
    ROAD_BLOCKAGE: { title: "সড়ক অবরোধ বিজ্ঞপ্তি", body: "{road} করিডোর অনিরাপদ বা অবরুদ্ধ হতে পারে।" },
    EVACUATION: { title: "স্থানান্তরের নির্দেশ", body: "{place} এর জন্য নির্ধারিত নিরাপদ আশ্রয়ে শান্তভাবে যান।" },
    SAFETY_UPDATE: { title: "সুরক্ষা আপডেট", body: "{place} অঞ্চলে পর্যবেক্ষণ অব্যাহত রয়েছে।" },
    COMMUNITY_NOTICE: { title: "সম্প্রদায় বিজ্ঞপ্তি", body: "{place} এর বাসিন্দাদের সাথে যাচাইকৃত তথ্য শেয়ার করুন।" },
  },
  MR: {
    CRITICAL_WARNING: { title: "गंभीर भूस्खलन इशारा", body: "तुमच्या भागात मुसळधार पाऊस आणि धोकादायक जमिनीची स्थिती नोंदवली गेली आहे. कृपया सतर्क राहा आणि स्थानिक प्रशासनाचे ऐका." },
    LANDSLIDE_WARNING: { title: "भूस्खलन चेतावणी", body: "{place} जवळ तीव्र उतार हालचाल आढळली आहे." },
    ROAD_BLOCKAGE: { title: "रस्ता बंद सूचना", body: "{road} मार्ग असुरक्षित किंवा अडथळा निर्माण झालेला असू शकतो." },
    EVACUATION: { title: "स्थलांतर सूचना", body: "{place} साठी नियुक्त सुरक्षित ठिकाणी शांतपणे जा." },
    SAFETY_UPDATE: { title: "सुरक्षा अपडेट", body: "{place} परिसरात सतत देखरेख सुरू आहे." },
    COMMUNITY_NOTICE: { title: "समुदाय सूचना", body: "{place} मधील रहिवाशांना सत्यापित माहिती द्या." },
  },
  GU: {
    CRITICAL_WARNING: { title: "ગંભીર ભૂસ્ખલન ચેતવણી", body: "તમારા વિસ્તારમાં ભારે વરસાદ અને જોખમી જમીનની સ્થિતિ નોંધાઈ છે. કૃપા કરીને સાવધ રહો અને નિયમોનું પાલન કરો." },
    LANDSLIDE_WARNING: { title: "ભૂસ્ખલન ચેતવણી", body: "{place} નજીક જમીનનું સ્ખલન વધ્યું છે." },
    ROAD_BLOCKAGE: { title: "રસ્તો બંધ સૂચના", body: "{road} માર્ગ અસુરક્ષિત હોઈ શકે છે." },
    EVACUATION: { title: "સ્થળાંતર સૂચના", body: "{place} માટે નિર્ધારિત સુરક્ષિત સ્થળે શાંતિથી ખસી જાઓ." },
    SAFETY_UPDATE: { title: "સુરક્ષા અપડેટ", body: "{place} માં સતત નિરીક્ષણ ચાલુ છે." },
    COMMUNITY_NOTICE: { title: "સમુદાય સૂચના", body: "{place} ના રહેવાસીઓ સાથે પ્રમાણિત માહિતી શેર કરો." },
  },
  PA: {
    CRITICAL_WARNING: { title: "ਗੰਭੀਰ ਜ਼ਮੀਨ ਖਿਸਕਣ ਦੀ ਚੇਤਾਵਨੀ", body: "ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਭਾਰੀ ਮੀਂਹ ਅਤੇ ਖ਼ਤਰਨਾਕ ਮਿੱਟੀ ਦੀ ਸਥਿਤੀ ਦਰਜ ਕੀਤੀ ਗਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਚੌਕਸ ਰਹੋ ਅਤੇ ਹਦਾਇਤਾਂ ਦੀ ਪਾਲਣਾ ਕਰੋ।" },
    LANDSLIDE_WARNING: { title: "ਜ਼ਮੀਨ ਖਿਸਕਣ ਦੀ ਚੇਤਾਵਨੀ", body: "{place} ਦੇ ਨੇੜੇ ਢਲਾਨ ਦੀ ਹਿੱਲਜੁੱਲ ਵਧ ਗਈ ਹੈ।" },
    ROAD_BLOCKAGE: { title: "ਸੜਕ ਰੁਕਾਵਟ ਸੂਚਨਾ", body: "{road} ਰਸਤਾ ਅਸੁਰੱਖਿਅਤ ਜਾਂ ਬੰਦ ਹੋ ਸਕਦਾ ਹੈ।" },
    EVACUATION: { title: "ਨਿਕਾਸੀ ਨਿਰਦੇਸ਼", body: "{place} ਲਈ ਨਿਰਧਾਰਤ ਸੁਰੱਖਿਅਤ ਸਥਾਨ ਤੇ ਸ਼ਾਂਤੀ ਨਾਲ ਜਾਓ।" },
    SAFETY_UPDATE: { title: "ਸੁਰੱਖਿਆ ਅੱਪਡੇਟ", body: "{place} ਲਈ ਨਿਗਰਾਨੀ ਜਾਰੀ ਹੈ।" },
    COMMUNITY_NOTICE: { title: "ਭਾਈਚਾਰਕ ਸੂਚਨਾ", body: "{place} ਦੇ ਵਸਨੀਕਾਂ ਨਾਲ ਤਸਦੀਕਸ਼ੁਦਾ ਜਾਣਕਾਰੀ ਸਾਂਝੀ ਕਰੋ।" },
  },
  OR: {
    CRITICAL_WARNING: { title: "ଗମ୍ଭୀର ଭୂସ୍ଖଳନ ଚେତାବନୀ", body: "ଆପଣଙ୍କ ଅଞ୍ଚଳରେ ପ୍ରବଳ ବର୍ଷା ଏବଂ ବିପଜ୍ଜନକ ମାଟିର ସ୍ଥିତି ଦେଖାଦେଇଛି। ଦୟାକରି ସତର୍କ ରୁହନ୍ତୁ ଏବଂ ପ୍ରଶାସନର ନିର୍ଦ୍ଦେଶ ମାନନ୍ତୁ।" },
    LANDSLIDE_WARNING: { title: "ଭୂସ୍ଖଳନ ଚେତାବନୀ", body: "{place} ନିକଟରେ ଭୂମି ସ୍ଥାନାନ୍ତରଣ ବୃଦ୍ଧି ପାଇଛି।" },
    ROAD_BLOCKAGE: { title: "ରାସ୍ତା ଅବରୋଧ ସୂଚନା", body: "{road} ମାର୍ଗ ଅସୁରକ୍ଷିତ କିମ୍ବା ବନ୍ଦ ହୋଇପାରେ।" },
    EVACUATION: { title: "ସ୍ଥାନାନ୍ତରଣ ନିର୍ଦ୍ଦେଶ", body: "{place} ପାଇଁ ନିର୍ଦ୍ଦିଷ୍ଟ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଶାନ୍ତ ଭାବରେ ଯାଆନ୍ତୁ।" },
    SAFETY_UPDATE: { title: "ସୁରକ୍ଷା ଅଦ୍ୟତନ", body: "{place} ଅଞ୍ଚଳରେ ନିରନ୍ତର ନଜର ରଖାଯାଇଛି।" },
    COMMUNITY_NOTICE: { title: "ସମ୍ପ୍ରଦାୟ ସୂଚନା", body: "{place} ନିକଟବର୍ତ୍ତୀ ବାସିନ୍ଦାଙ୍କ ସହିତ ଯାଞ୍ଚ ହୋଇଥିବା ତଥ୍ୟ ବାଣ୍ଟନ୍ତୁ।" },
  },
  UR: {
    CRITICAL_WARNING: { title: "شدید لینڈ سلائیڈنگ وارننگ", body: "آپ کے علاقے میں شدید بارش اور خطرناک مٹی کی حالت کا پتہ چلا ہے۔ برائے مہربانی چوکس رہیں اور ہدایات پر عمل کریں۔" },
    LANDSLIDE_WARNING: { title: "لینڈ سلائیڈنگ الرٹ", body: "{place} کے قریب ڈھلوان کی غیر مستحکم حرکت بڑھ گئی ہے۔" },
    ROAD_BLOCKAGE: { title: "راستہ بند ہونے کی اطلاع", body: "{road} کوریڈور غیر محفوظ یا بند ہو سکتا ہے۔" },
    EVACUATION: { title: "انخلاء کی ہدایات", body: "{place} کے لیے مخصوص محفوظ مقام پر سکون سے منتقل ہوں۔" },
    SAFETY_UPDATE: { title: "حفاظتی اپ ڈیٹ", body: "{place} پر مسلسل نگرانی جاری ہے۔" },
    COMMUNITY_NOTICE: { title: "عوامی اطلاع", body: "{place} کے مکینوں کے ساتھ تصدیق شدہ معلومات شیئر کریں۔" },
  },
  NE: {
    CRITICAL_WARNING: { title: "गम्भीर पहिरो चेतावनी", body: "तपाईंको क्षेत्रमा अत्यधिक वर्षा र जोखिमपूर्ण माटोको अवस्था देखिएको छ। कृपया सतर्क रहनुहोस् र निर्देशनहरू पालना गर्नुहोस्।" },
    LANDSLIDE_WARNING: { title: "पहिरो चेतावनी", body: "{place} नजिक भिरालो जमिन हल्लिएको पाइएको छ।" },
    ROAD_BLOCKAGE: { title: "सडक अवरोध सूचना", body: "{road} मार्ग असुरक्षित वा बन्द हुन सक्छ।" },
    EVACUATION: { title: "सुरक्षित स्थानान्तरण निर्देशन", body: "{place} को लागि तोकिएको सुरक्षित स्थानमा सर्नुहोस्।" },
    SAFETY_UPDATE: { title: "सुरक्षा अपडेट", body: "{place} मा लगातार निगरानी जारी छ।" },
    COMMUNITY_NOTICE: { title: "सामुदायिक सूचना", body: "{place} का बासिन्दाहरूलाई प्रमाणित जानकारी मात्र दिनुहोस्।" },
  },
  ES: {
    CRITICAL_WARNING: { title: "ADVERTENCIA CRÍTICA DE DESLIZAMIENTO", body: "Se han detectado lluvias torrenciales y condiciones críticas del suelo en su área. Manténgase alerta y siga las instrucciones oficiales." },
    LANDSLIDE_WARNING: { title: "ADVERTENCIA DE DESLIZAMIENTO", body: "Los indicadores de movimiento de ladera están elevados cerca de {place}." },
    ROAD_BLOCKAGE: { title: "AVISO DE BLOQUEO DE CARRETERA", body: "El corredor {road} puede estar obstruido o ser peligroso." },
    EVACUATION: { title: "INSTRUCCIÓN DE EVACUACIÓN", body: "Trasládese con calma al refugio seguro designado para {place}." },
    SAFETY_UPDATE: { title: "ACTUALIZACIÓN DE SEGURIDAD", body: "Continúa el monitoreo geológico en {place}." },
    COMMUNITY_NOTICE: { title: "AVISO COMUNITARIO", body: "Comparta solo información verificada con los vecinos de {place}." },
  },
  FR: {
    CRITICAL_WARNING: { title: "ALERTE CRITIQUE DE GLISSEMENT DE TERRAIN", body: "De fortes précipitations et un sol instable ont été détectés dans votre zone. Restez vigilant et suivez les consignes officielles." },
    LANDSLIDE_WARNING: { title: "AVERTISSEMENT DE GLISSEMENT", body: "Des mouvements de pente anormaux sont signalés près de {place}." },
    ROAD_BLOCKAGE: { title: "NOTIFICATION DE ROUTE BLOQUÉE", body: "L’axe routier {road} peut être impraticable ou dangereux." },
    EVACUATION: { title: "ORDRE D’ÉVACUATION", body: "Rejoignez calmement le refuge sécurisé désigné pour {place}." },
    SAFETY_UPDATE: { title: "POINT DE SÉCURITÉ", body: "La surveillance géotechnique se poursuit pour {place}." },
    COMMUNITY_NOTICE: { title: "AVIS COMMUNAUTAIRE", body: "Partagez uniquement des alertes vérifiées avec les résidents de {place}." },
  },
  DE: {
    CRITICAL_WARNING: { title: "KRITISCHE ERDRUTSCHWARNUNG", body: "Starke Regenfälle und instabile Bodenverhältnisse wurden in Ihrem Gebiet gemessen. Bitte bleiben Sie wachsam und befolgen Sie behördliche Anweisungen." },
    LANDSLIDE_WARNING: { title: "ERDRUTSCH-WARNUNG", body: "Erhöhte Hangbewegungsindikatoren in der Nähe von {place} festgestellt." },
    ROAD_BLOCKAGE: { title: "STRASSENSPERRUNGS-HINWEIS", body: "Der Straßenkorridor {road} ist möglicherweise blockiert." },
    EVACUATION: { title: "EVAKUIERUNGSANWEISUNG", body: "Begeben Sie sich ruhig zur ausgewiesenen Schutzzone für {place}." },
    SAFETY_UPDATE: { title: "SICHERHEITS-UPDATE", body: "Die Hangüberwachung für {place} wird fortgesetzt." },
    COMMUNITY_NOTICE: { title: "GEMEINDEHINWEIS", body: "Teilen Sie geprüfte Sicherheitsinformationen mit Anwohnern in {place}." },
  },
  JA: {
    CRITICAL_WARNING: { title: "緊急土砂災害警戒情報", body: "お住まいの地域で記録的な集中豪雨と危険な斜面土壌水分が検知されました。自治体の避難指示に従ってください。" },
    LANDSLIDE_WARNING: { title: "土砂災害警報", body: "{place} 付近で斜面変位が急増しています。" },
    ROAD_BLOCKAGE: { title: "道路通行止め通知", body: "{road} 区間は土砂崩れにより通行不能の恐れがあります。" },
    EVACUATION: { title: "避難勧告・指示", body: "{place} の指定避難所へ速やかに避難してください。" },
    SAFETY_UPDATE: { title: "安全情報更新", body: "{place} のリアルタイム監視を継続しています。" },
    COMMUNITY_NOTICE: { title: "地域安全通知", body: "{place} 周辺の住民へ正確な避難情報を共有してください。" },
  },
  ZH: {
    CRITICAL_WARNING: { title: "山体滑坡红色警戒", body: "监测到您所在区域出现极端降雨及严重土壤孔隙水压异常。请保持警惕并听从应急管理部门防灾指引。" },
    LANDSLIDE_WARNING: { title: "滑坡灾害预警", body: "{place} 附近坡度位移指标急剧升高。" },
    ROAD_BLOCKAGE: { title: "道路阻断通知", body: "{road} 路段可能已发生落石或坍塌，请绕行。" },
    EVACUATION: { title: "紧急疏散指令", body: "请平静前往为 {place} 指定的高地应急避难场所。" },
    SAFETY_UPDATE: { title: "地质安全快讯", body: "对 {place} 区域的边坡位移监测仍在持续。" },
    COMMUNITY_NOTICE: { title: "社区防灾通报", body: "请向 {place} 附近居民传达经核实的官方通报。" },
  },
  AR: {
    CRITICAL_WARNING: { title: "تحذير حرج من انهيار أرضي", body: "تم رصد أمطار غزيرة وظروف تربة خطيرة في منطقتك. يرجى توخي أقصى درجات الحذر واتباع تعليمات السلطات المختصة فوراً." },
    LANDSLIDE_WARNING: { title: "تحذير من انزلاق التربة", body: "مؤشرات حركة المنحدرات مرتفعة بالقرب من {place}." },
    ROAD_BLOCKAGE: { title: "إشعار إغلاق الطريق", body: "قد يكون ممر {road} غير آمن أو مغلقاً بسبب الانهيارات." },
    EVACUATION: { title: "تعليمات الإخلاء الفوري", body: "توجه بهدوء إلى موقع الإيواء الآمن المخصص لمنطقة {place}." },
    SAFETY_UPDATE: { title: "تحديث السلامة الجيولوجية", body: "تستمر المراقبة الميدانية لمنطقة {place}." },
    COMMUNITY_NOTICE: { title: "إشعار المجتمع", body: "يرجى مشاركة المعلومات الموثوقة مع سكان {place}." },
  },
  PT: {
    CRITICAL_WARNING: { title: "ALERTA CRÍTICO DE DESLIZAMENTO", body: "Fortes chuvas e instabilidade crítica do solo foram detectadas na sua área. Fique em alerta máximo e siga as orientações da Defesa Civil." },
    LANDSLIDE_WARNING: { title: "AVISO DE DESLIZAMENTO DE TERRA", body: "Movimento de encosta elevado detectado próximo a {place}." },
    ROAD_BLOCKAGE: { title: "AVISO DE BLOQUEIO DE VIA", body: "O corredor {road} pode estar obstruído ou perigoso." },
    EVACUATION: { title: "INSTRUÇÃO DE EVACUAÇÃO", body: "Desloque-se com calma para o abrigo seguro designado para {place}." },
    SAFETY_UPDATE: { title: "ATUALIZAÇÃO DE SEGURANÇA", body: "O monitoramento geotécnico continua em {place}." },
    COMMUNITY_NOTICE: { title: "COMUNICADO COMUNITÁRIO", body: "Compartilhe apenas informações verificadas com moradores de {place}." },
  },
  RU: {
    CRITICAL_WARNING: { title: "КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ ОБ ОПОЛЗНЕ", body: "В вашем районе зафиксированы экстремальные осадки и опасное насыщение грунта. Соблюдайте предельную бдительность." },
    LANDSLIDE_WARNING: { title: "ПРЕДУПРЕЖДЕНИЕ ОБ ОПОЛЗНЕВОЙ ОПАСНОСТИ", body: "Повышенная активность смещения склона вблизи {place}." },
    ROAD_BLOCKAGE: { title: "УВЕДОМЛЕНИЕ О ПЕРЕКРЫТИИ ДОРОГИ", body: "Участок дороги {road} может быть заблокирован." },
    EVACUATION: { title: "УКАЗАНИЕ ПО ЭВАКУАЦИИ", body: "Спокойно проследуйте в назначенный безопасный пункт для {place}." },
    SAFETY_UPDATE: { title: "СВОДКА БЕЗОПАСНОСТИ", body: "Мониторинг стабильности склонов в {place} продолжается." },
    COMMUNITY_NOTICE: { title: "ОБЩЕСТВЕННОЕ УВЕДОМЛЕНИЕ", body: "Делитесь только проверенной информацией с жителями {place}." },
  },
  IT: {
    CRITICAL_WARNING: { title: "ALLERTA CRITICA FRANA", body: "Rilevate forti precipitazioni e condizioni di terreno pericolose nella tua area. Mantieni la massima cautela e segui la Protezione Civile." },
    LANDSLIDE_WARNING: { title: "AVVISO DI FRANA", body: "Movimento del versante in aumento vicino a {place}." },
    ROAD_BLOCKAGE: { title: "NOTIFICA CHIUSURA STRADA", body: "Il corridoio stradale {road} potrebbe essere ostruito o insicuro." },
    EVACUATION: { title: "ORDINE DI EVACUAZIONE", body: "Raggiungi con calma il punto di raccolta sicuro per {place}." },
    SAFETY_UPDATE: { title: "AGGIORNAMENTO SICUREZZA", body: "Prosegue il monitoraggio continuo per {place}." },
    COMMUNITY_NOTICE: { title: "AVVISO ALLA COMUNITÀ", body: "Condividi informazioni verificate con i residenti di {place}." },
  },
  ID: {
    CRITICAL_WARNING: { title: "PERINGATAN KRITIS TANAH LONGSOR", body: "Curah hujan tinggi dan kondisi tanah berbahaya terdeteksi di area Anda. Harap waspada dan ikuti arahan petugas BPBD setempat." },
    LANDSLIDE_WARNING: { title: "PERINGATAN LONGSOR", body: "Pergerakan lereng meningkat di dekat {place}." },
    ROAD_BLOCKAGE: { title: "PEMBERITAHUAN JALAN TERPUTUS", body: "Jalur {road} mungkin tertutup atau tidak aman dilalui." },
    EVACUATION: { title: "PETUNJUK EVAKUASI", body: "Segera menuju lokasi evakuasi aman yang ditentukan untuk {place}." },
    SAFETY_UPDATE: { title: "PEMBARUAN KESELAMATAN", body: "Pemantauan sensor berlanjut untuk {place}." },
    COMMUNITY_NOTICE: { title: "PEMBERITAHUAN WARGA", body: "Bagikan informasi resmi terverifikasi kepada warga {place}." },
  },
  KO: {
    CRITICAL_WARNING: { title: "산사태 긴급 대피 경보", body: "귀하의 지역에서 집중호우와 심각한 지반 불안정이 감지되었습니다. 즉시 안전에 유의하시고 재난안전대책본부 지침을 따르십시오." },
    LANDSLIDE_WARNING: { title: "산사태 주의보", body: "{place} 인근 사면 변위 지표가 급격히 상승했습니다." },
    ROAD_BLOCKAGE: { title: "도로 통제 알림", body: "{road} 구간이 낙석 또는 붕괴로 인해 통제될 수 있습니다." },
    EVACUATION: { title: "대피 명령 안내", body: "{place} 주민은 지정된 안전 대피소로 침착하게 이동하십시오." },
    SAFETY_UPDATE: { title: "안전 정보 업데이트", body: "{place} 지역에 대한 실시간 지반 감시가 지속 중입니다." },
    COMMUNITY_NOTICE: { title: "지역사회 안전 공지", body: "{place} 인근 주민들과 검증된 안전 정보만 공유하십시오." },
  },
  TR: {
    CRITICAL_WARNING: { title: "KRİTİK HEYELAN UYARISI", body: "Bölgenizde şiddetli yağış ve tehlikeli zemin doygunluğu tespit edildi. Lütfen dikkatli olun ve resmi tahliye uyarılarını takip edin." },
    LANDSLIDE_WARNING: { title: "HEYELAN UYARISI", body: "{place} yakınlarında yamaç hareketliliği arttı." },
    ROAD_BLOCKAGE: { title: "YOL KAPANMA BİLDİRİMİ", body: "{road} güzergahı heyelan nedeniyle kapalı olabilir." },
    EVACUATION: { title: "TAHLİYE TALİMATI", body: "{place} için belirlenen güvenli toplanma alanına geçin." },
    SAFETY_UPDATE: { title: "GÜVENLİK GÜNCELLEMESİ", body: "{place} için zemin izleme çalışmaları devam ediyor." },
    COMMUNITY_NOTICE: { title: "TOPLUM DUYURUSU", body: "{place} sakinleriyle yalnızca doğrulanmış bilgileri paylaşın." },
  },
  VI: {
    CRITICAL_WARNING: { title: "CẢNH BÁO SẠT LỞ ĐẤT NGUY HIỂM", body: "Mưa đặc biệt lớn và độ bão hòa đất nguy hiểm đã được phát hiện trong khu vực. Đề nghị người dân theo dõi sát hướng dẫn của chính quyền." },
    LANDSLIDE_WARNING: { title: "CẢNH BÁO SẠT LỞ", body: "Độ dịch chuyển sườn dốc tăng cao gần {place}." },
    ROAD_BLOCKAGE: { title: "THÔNG BÁO TẮC ĐƯỜNG", body: "Tuyến đường {road} có thể bị chia cắt do đất đá tràn xuống." },
    EVACUATION: { title: "HƯỚNG DẪN SƠ TÁN", body: "Bình tĩnh di chuyển đến địa điểm sơ tán an toàn cho {place}." },
    SAFETY_UPDATE: { title: "CẬP NHẬT AN TOÀN", body: "Hệ thống tiếp tục theo dõi biến dạng đất tại {place}." },
    COMMUNITY_NOTICE: { title: "THÔNG BÁO CỘNG ĐỒNG", body: "Chia sẻ thông tin đã xác minh cho người dân gần {place}." },
  },
  TH: {
    CRITICAL_WARNING: { title: "เตือนภัยดินโคลนถล่มขั้นวิกฤต", body: "ตรวจพบปริมาณน้ำฝนสะสมสูงมากและดินอิ่มตัวระดับอันตรายในพื้นที่ของท่าน โปรดเฝ้าระวังและปฏิบัติตามคำเตือนของหน่วยงานป้องกันภัยพิบัติ" },
    LANDSLIDE_WARNING: { title: "แจ้งเตือนดินถล่ม", body: "เซนเซอร์ตรวจพบการเคลื่อนตัวของลาดเขาใกล้กับ {place}" },
    ROAD_BLOCKAGE: { title: "แจ้งเตือนเส้นทางถูกปิดกั้น", body: "เส้นทาง {road} อาจไม่ปลอดภัยหรือมีดินสไลด์ปิดทับ" },
    EVACUATION: { title: "คำแนะนำการอพยพ", body: "โปรดเดินทางไปยังศูนย์พักพิงปลอดภัยที่กำหนดสำหรับ {place}" },
    SAFETY_UPDATE: { title: "รายงานความปลอดภัย", body: "ระบบกำลังติดตามเสถียรภาพของดินในพื้นที่ {place} อย่างต่อเนื่อง" },
    COMMUNITY_NOTICE: { title: "ประกาศชุมชน", body: "กรุณาส่งต่อข้อมูลเตือนภัยที่ตรวจสอบแล้วแก่ผู้อยู่อาศัยใกล้ {place}" },
  },
  SW: {
    CRITICAL_WARNING: { title: "ONYO KALI LA MMOMONYOKO WA ARDHI", body: "Mvua kubwa na unyevu hatari wa udongo umegunduliwa katika eneo lako. Tafadhali kuwa macho na ufuate maagizo ya mamlaka za dharura." },
    LANDSLIDE_WARNING: { title: "TAHADHARI YA MMOMONYOKO", body: "Viashiria vya mtikisiko wa mteremko vimeongezeka karibu na {place}." },
    ROAD_BLOCKAGE: { title: "TAARIFA YA KUFUNGA NJIA", body: "Njia ya {road} inaweza kuwa hatari au imeziba." },
    EVACUATION: { title: "MAAGIZO YA KUHAMA", body: "Sogea kwa utulivu kwenye eneo salama lililotengwa kwa ajili ya {place}." },
    SAFETY_UPDATE: { title: "TAARIFA YA USALAMA", body: "Ufuatiliaji unaendelea kwa eneo la {place}." },
    COMMUNITY_NOTICE: { title: "TAARIFA KWA JAMII", body: "Tafadhali sambaza taarifa zilizothibitishwa kwa wakazi wa {place}." },
  },
  NL: {
    CRITICAL_WARNING: { title: "KRITIEKE WAARSCHUWING VOOR AARDVERSCHUIVING", body: "Zware regenval en gevaarlijke bodemomstandigheden gedetecteerd in uw regio. Blijf alert en volg de instructies van de hulpdiensten nauwgezet op." },
    LANDSLIDE_WARNING: { title: "AARDVERSCHUIVING WAARSCHUWING", body: "Verhoogde hellingsbeweging waargenomen nabij {place}." },
    ROAD_BLOCKAGE: { title: "MELDING WEGAFSLUITING", body: "De corridor {road} is mogelijk geblokkeerd of onveilig." },
    EVACUATION: { title: "EVACUATIE-INSTRUCTIE", body: "Ga rustig naar de aangewezen veilige opvanglocatie voor {place}." },
    SAFETY_UPDATE: { title: "VEILIGHEIDSUPDATE", body: "Monitoring van de hellingstabiliteit in {place} duurt voort." },
    COMMUNITY_NOTICE: { title: "GEMEENSCHAPSMELDING", body: "Deel uitsluitend geverifieerde veiligheidsinformatie met inwoners van {place}." },
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
  const message = (messages[language] && messages[language][kind]) || messages.EN[kind];
  const replacements: Record<string, string> = {
    place: context.place ?? "your monitored area",
    road: context.road ?? "the monitored road",
  };
  const fill = (value: string) => value.replace(/\{(place|road)\}/g, (_, key: string) => replacements[key] ?? "");
  return { title: message.title, body: fill(message.body) };
};

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
    return "KN";
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
    return "ML";
  }
  if (
    normalized.includes("NLG") ||
    normalized.includes("NILGIRIS") ||
    normalized.includes("COONOOR") ||
    normalized.includes("VLP") ||
    normalized.includes("VALPARAI") ||
    normalized.includes("TAMIL")
  ) {
    return "TA";
  }
  if (
    normalized.includes("ANDHRA") ||
    normalized.includes("TELANGANA") ||
    normalized.includes("VIZAG") ||
    normalized.includes("ARAKU")
  ) {
    return "TE";
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
    return "HI";
  }
  return "EN";
};

export const detectLanguageFromCoords = (latitude: number, longitude: number): NotificationLanguage => {
  if (latitude >= 28.0 && latitude <= 35.0 && longitude >= 75.0 && longitude <= 82.0) {
    return "HI";
  }
  if (latitude >= 8.2 && latitude <= 12.5 && longitude >= 75.0 && longitude <= 77.2) {
    if (latitude < 12.0 && longitude > 75.8) return "ML";
  }
  if (latitude >= 8.1 && latitude <= 13.5 && longitude >= 76.5 && longitude <= 80.3) {
    if (latitude < 12.0 && longitude > 76.8) return "TA";
  }
  if (latitude >= 11.5 && latitude <= 18.5 && longitude >= 74.0 && longitude <= 78.0) {
    return "KN";
  }
  if (latitude >= 12.5 && latitude <= 19.9 && longitude >= 78.0 && longitude <= 84.8) {
    return "TE";
  }
  return "EN";
};
