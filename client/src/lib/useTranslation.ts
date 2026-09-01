import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import type { NotificationLanguage } from "@/lib/notificationTranslations";

// Comprehensive built-in dictionary for instant zero-latency UI rendering across Indic languages
const STATIC_DICTIONARY: Record<string, Record<string, string>> = {
  // Navigation & Header
  "OVERVIEW": { KN: "ಅವಲೋಕನ", HI: "अवलोकन", TA: "கண்ணோட்டம்", TE: "అవలోకనం", ML: "അവലോകനം" },
  "LANDSORA CONSOLE": { KN: "ಲ್ಯಾಂಡ್‌ಸೋರಾ ಕನ್ಸೋಲ್", HI: "लैंडसोरा कंसोल", TA: "லேண்ட்சோரா கன்சோல்", TE: "లాండ్‌సోరా కన్సోల్", ML: "ലാൻഡ്സോറ കൺസോൾ" },
  "AI COMPANION": { KN: "AI ಸಹಾಯಕ", HI: "AI साथी", TA: "AI துணை", TE: "AI సహచరుడు", ML: "AI സഹായി" },
  "CONNECT GOOGLE": { KN: "ಗೂಗಲ್ ಸಂಪರ್ಕಿಸಿ", HI: "गूगल कनेक्ट करें", TA: "கூகிள் இணைக்கவும்", TE: "గూగుల్ కనెక్ట్ చేయండి", ML: "ഗൂഗിൾ ബന്ധിപ്പിക്കുക" },
  
  // HUD & Scenarios
  "SCENARIOS:": { KN: "ಸನ್ನಿವೇಶಗಳು:", HI: "परिदृश्य:", TA: "சூழ்நிலைகள்:", TE: "పరిస్థితులు:", ML: "സാഹചര്യങ്ങൾ:" },
  "01 NORMAL": { KN: "01 ಸಾಮಾನ್ಯ", HI: "01 सामान्य", TA: "01 இயல்பு", TE: "01 సాధారణం", ML: "01 സാധാരണ" },
  "02 HEAVY RAIN": { KN: "02 ಭಾರಿ ಮಳೆ", HI: "02 भारी बारिश", TA: "02 கனமழை", TE: "02 భారీ వర్షం", ML: "02 കനത്ത മഴ" },
  "03 EXTREME STORM": { KN: "03 ತೀವ್ರ ಚಂಡಮಾರುತ", HI: "03 भीषण तूफान", TA: "03 தீவிர புயல்", TE: "03 తీవ్ర తుఫాను", ML: "03 തീവ്ര കൊടുങ്കാറ്റ്" },
  "04 TILT QUARANTINE": { KN: "04 ಇಳಿಜಾರು ಕ್ವಾರಂಟೈನ್", HI: "04 झुकाव क्वारंटाइन", TA: "04 சாய்வு தனிமை", TE: "04 వాలు క్వారంటైన్", ML: "04 ചരിവ് ക്വാറന്റൈൻ" },
  "05 API DELAY": { KN: "05 API ವಿಳಂಬ", HI: "05 API विलंब", TA: "05 API தாமதம்", TE: "05 API ఆలస్యం", ML: "05 API കാലതാമസം" },
  "06 LOW BATTERY": { KN: "06 ಕಡಿಮೆ ಬ್ಯಾಟರಿ", HI: "06 कम बैटरी", TA: "06 குறைந்த பேட்டரி", TE: "06 తక్కువ బ్యాటరీ", ML: "06 കുറഞ്ഞ ബാറ്ററി" },
  "07 HAZARD ALERT": { KN: "07 ಅಪಾಯದ ಎಚ್ಚರಿಕೆ", HI: "07 खतरा चेतावनी", TA: "07 ஆபத்து எச்சரிக்கை", TE: "07 ప్రమాద హెచ్చరిక", ML: "07 അപകട മുന്നറിയിപ്പ്" },
  
  // Tools
  "CONFIDENCE": { KN: "ವಿಶ್ವಾಸಾರ್ಹತೆ", HI: "विश्वसनीयता", TA: "நம்பகத்தன்மை", TE: "విశ్వసనీయత", ML: "വിശ്വാസ്യത" },
  "ENABLE PUSH": { KN: "ಪುಶ್ ಸಕ್ರಿಯಗೊಳಿಸಿ", HI: "पुश सक्षम करें", TA: "புஷ் செயல்படுத்து", TE: "పుష్ ప్రారంభించండి", ML: "പുഷ് പ്രവർത്തനക്ഷമമാക്കുക" },
  "TEST ALERT": { KN: "ಎಚ್ಚರಿಕೆ ಪರೀಕ್ಷಿಸಿ", HI: "परीक्षण चेतावनी", TA: "சோதனை எச்சரிக்கை", TE: "హెచ్చరికను పరీక్షించండి", ML: "മുന്നറിയിപ്പ് പരിശോധിക്കുക" },
  "INCIDENT REPORT": { KN: "ಘಟನೆಯ ವರದಿ", HI: "घटना रिपोर्ट", TA: "சம்பவ அறிக்கை", TE: "ఘటన నివేదిక", ML: "സംഭവ റിപ്പോർട്ട്" },

  // Left Sidebar
  "ZONE MONITOR / SENSOR STATE": { KN: "ವಲಯ ಮಾನಿಟರ್ / ಸಂವೇದಕ ಸ್ಥಿತಿ", HI: "ज़ोन मॉनिटर / सेंसर स्थिति", TA: "மண்டல கண்காணிப்பு / சென்சார் நிலை", TE: "జోన్ మానిటర్ / సెన్సార్ స్థితి", ML: "മേഖല നിരീക്ഷണം / സെൻസർ അവസ്ഥ" },
  "RISK TRACE": { KN: "ಅಪಾಯದ ಜಾಡು", HI: "जोखिम ट्रेस", TA: "ஆபத்து தடமறிதல்", TE: "ప్రమాద ట్రేస్", ML: "അപകട ഗതി" },
  "SENSOR NETWORK": { KN: "ಸಂವೇದಕ ಜಾಲ", HI: "सेंसर नेटवर्क", TA: "சென்சார் நெட்வொர்க்", TE: "సెన్సార్ నెట్‌వర్క్", ML: "സെൻസർ ശൃംഖല" },
  "CHANNELS ONLINE": { KN: "ಚಾನಲ್‌ಗಳು ಆನ್‌ಲೈನ್", HI: "चैनल ऑनलाइन", TA: "சேனல்கள் ஆன்லைனில்", TE: "ఛానెల్‌లు ఆన్‌లైన్", ML: "ചാനലുകൾ ഓൺലൈൻ" },
  "DATA LINK": { KN: "ಡೇಟಾ ಲಿಂಕ್", HI: "डेटा लिंक", TA: "தரவு இணைப்பு", TE: "డేటా లింక్", ML: "ഡാറ്റ ലിങ്ക്" },
  "MQTT LATENCY": { KN: "MQTT ಸುಪ್ತತೆ", HI: "MQTT विलंबता", TA: "MQTT தாமதம்", TE: "MQTT జాప్యం", ML: "MQTT ലേറ്റൻസി" },
  "NODE BATTERY": { KN: "ನೋಡ್ ಬ್ಯಾಟರಿ", HI: "नोड बैटरी", TA: "முனைய பேட்டரி", TE: "నోడ్ బ్యాటరీ", ML: "നോഡ് ബാറ്ററി" },

  // Center Map & Metrics
  "SATELLITE": { KN: "ಉಪಗ್ರಹ", HI: "उपग्रह", TA: "செயற்கைக்கோள்", TE: "ఉపగ్రహం", ML: "ഉപഗ്രഹം" },
  "TOPOGRAPHY": { KN: "ಸ್ಥಳಾಕೃತಿ", HI: "स्थलाकृति", TA: "நிலப்பரப்பு", TE: "స్థలాకృతి", ML: "ഭൂപ്രകൃതി" },
  "DARK GIS": { KN: "ಡಾರ್ಕ್ ಜಿಐಎಸ್", HI: "डार्क जीआईएस", TA: "டார்க் ஜிஐஎஸ்", TE: "డార్క్ జిఐఎస్", ML: "ഡാർക്ക് ജിഐഎസ്" },
  "STREET": { KN: "ರಸ್ತೆ", HI: "सड़क", TA: "தெரு", TE: "వీధి", ML: "തെരുവ്" },

  // Right Sidebar
  "ZONE INTELLIGENCE": { KN: "ವಲಯ ಬುದ್ಧಿಮತ್ತೆ", HI: "ज़ोन इंटेलिजेंस", TA: "மண்டல நுண்ணறிவு", TE: "జోన్ ఇంటెలిజెన్స్", ML: "മേഖല വിവരങ്ങൾ" },
  "SELECTED NODE": { KN: "ಆಯ್ಕೆಮಾಡಿದ ನೋಡ್", HI: "चयनित नोड", TA: "தேர்ந்தெடுக்கப்பட்ட முனையம்", TE: "ఎంచుకున్న నోడ్", ML: "തിരഞ്ഞെടുത്ത നോഡ്" },
  "LOCATION TELEMETRY STATUS": { KN: "ಸ್ಥಳ ಟೆಲಿಮೆಟ್ರಿ ಸ್ಥಿತಿ", HI: "स्थान टेलीमेट्री स्थिति", TA: "இருப்பிட டெலிமெட்ரி நிலை", TE: "స్థాన టెలిమెట్రీ స్థితి", ML: "ലൊക്കേഷൻ ടെലിമെട്രി നില" },
  "DATA CONFIDENCE": { KN: "ಡೇಟಾ ವಿಶ್ವಾಸ", HI: "डेटा विश्वास", TA: "தரவு நம்பிக்கை", TE: "డేటా విశ్వాసం", ML: "ഡാറ്റാ വിശ്വാസ്യത" },
  "NEAREST REPORTED EVENT": { KN: "ಹತ್ತಿರದ ದಾಖಲಾದ ಘಟನೆ", HI: "निकटतम दर्ज घटना", TA: "அருகிலுள்ள பதிவான நிகழ்வு", TE: "సమీపంలోని నమోదైన సంఘటన", ML: "ഏറ്റവും അടുത്ത സംഭവം" },
  "LANDSORA RISK SCORE": { KN: "ಲ್ಯಾಂಡ್‌ಸೋರಾ ಅಪಾಯದ ಅಂಕ", HI: "लैंडसोरा जोखिम स्कोर", TA: "லேண்ட்சோரா ஆபத்து மதிப்பெண்", TE: "లాండ్‌సోరా ప్రమాద స్కోరు", ML: "ലാൻഡ്സോറ അപകട സ്കോർ" },
  "RAINFALL": { KN: "ಮಳೆ ಪ್ರಮಾಣ", HI: "वर्षा", TA: "மழைப்பொழிவு", TE: "వర్షపాతం", ML: "മഴയളവ്" },
  "SOIL MOISTURE": { KN: "ಮಣ್ಣಿನ ತೇವಾಂಶ", HI: "मृदा नमी", TA: "மண் ஈரப்பதம்", TE: "నేల తేమ", ML: "മണ്ണിലെ ഈർപ്പം" },
  "SLOPE TILT": { KN: "ಇಳಿಜಾರಿನ ಓರೆ", HI: "ढलान झुकाव", TA: "சரிவு கோணம்", TE: "వాలు వంపు", ML: "ചരിവിന്റെ ചരിവ്" },

  // Advisories
  "Slope conditions remain within seasonal stability margins.": {
    KN: "ಇಳಿಜಾರಿನ ಸ್ಥಿತಿ ಕಾಲೋಚಿತ ಸ್ಥಿರತೆಯ ಮಿತಿಯಲ್ಲಿದೆ.",
    HI: "ढलान की स्थिति मौसमी स्थिरता सीमा के भीतर बनी हुई है।",
    TA: "சரிவு நிலை பருவகால ஸ்திரத்தன்மை வரம்புகளுக்குள் உள்ளது.",
    TE: "వాలు పరిస్థితులు కాలానుగుణ స్థిరత్వ పరిమితుల్లోనే ఉన్నాయి.",
    ML: "ചരിവിന്റെ അവസ്ഥ സുരക്ഷിത പരിധിക്കുള്ളിലാണ്."
  },
  "Moisture approaching plastic saturation limit. Maintain continuous monitoring.": {
    KN: "ತೇವಾಂಶವು ಪ್ಲಾಸ್ಟಿಕ್ ಶುದ್ಧತ್ವ ಮಿತಿಯನ್ನು ಸಮೀಪಿಸುತ್ತಿದೆ. ನಿರಂತರ ನಿಗಾ ವಹಿಸಿ.",
    HI: "नमी प्लास्टिक संतृप्ति सीमा के करीब पहुंच रही है। निरंतर निगरानी बनाए रखें।",
    TA: "ஈரப்பதம் செறிவூட்டல் வரம்பை நெருங்குகிறது. தொடர் கண்காணிப்பை பராமரிக்கவும்.",
    TE: "తేమ సంతృప్త పరిమితికి చేరువవుతోంది. నిరంతర పర్యవేక్షణ అవసరం.",
    ML: "ഈർപ്പം അപകടകരമായ അളവിലേക്ക് ഉയരുന്നു. തുടർച്ചയായ നിരീക്ഷണം തുടരുക."
  },
  "Elevated pore pressure detected. Review mountain road corridors.": {
    KN: "ಹೆಚ್ಚಿದ ರಂಧ್ರದ ಒತ್ತಡ ಪತ್ತೆಯಾಗಿದೆ. ಪರ್ವತ ರಸ್ತೆ ಕಾರಿಡಾರ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    HI: "बढ़ा हुआ पोर प्रेशर पाया गया। पर्वतीय सड़क गलियारों की समीक्षा करें।",
    TA: "அதிகரித்த துளை நீர் அழுத்தம் கண்டறியப்பட்டது. மலைப்பாதை சாலைகளை ஆய்வு செய்யவும்.",
    TE: "అధిక రంధ్ర పీడనం గుర్తించబడింది. పర్వత రహదారి మార్గాలను సమీక్షించండి.",
    ML: "ഉയർന്ന ജലമർദ്ദം കണ്ടെത്തി. മലയോര പാതകൾ പരിശോധിക്കുക."
  },
  "Critical slope failure risk. Authority assessment and response procedures should be initiated.": {
    KN: "ತೀವ್ರ ಭೂಕುಸಿತದ ಅಪಾಯವಿದೆ. ತಕ್ಷಣ ಮುನ್ನೆಚ್ಚರಿಕೆ ಮತ್ತು ಸ್ಥಳಾಂತರ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಬೇಕು.",
    HI: "गंभीर ढलान विफलता जोखिम। तुरंत सुरक्षा और निकासी प्रक्रिया शुरू की जानी चाहिए।",
    TA: "தீவிர நிலச்சரிவு அபாயம். உடனடியாக பாதுகாப்பு மற்றும் வெளியேற்ற நடவடிக்கைகள் தொடங்கப்பட வேண்டும்.",
    TE: "తీవ్ర కొండచరియల విరిగిపడే ప్రమాదం. వెంటనే భద్రతా చర్యలు చేపట్టాలి.",
    ML: "ഗുരുതരമായ മണ്ണിടിച്ചിൽ സാധ്യത. അടിയന്തര സുരക്ഷാ നടപടികൾ സ്വീകരിക്കുക."
  },

  // Modules & Lower Cards
  "RISK SCORE — LAST 16 READINGS": { KN: "ಅಪಾಯದ ಅಂಕ — ಕೊನೆಯ 16 ವಾಚನಗಳು", HI: "जोखिम स्कोर — अंतिम 16 रीडिंग", TA: "ஆபத்து மதிப்பெண் — கடைசி 16 அளவீடுகள்", TE: "ప్రమాద స్కోర్ — చివరి 16 రీడింగ్‌లు", ML: "അപകട സ്കോർ — അവസാന 16 റീഡിംഗുകൾ" },
  "WHY THIS SCORE?": { KN: "ಈ ಅಂಕ ಏಕೆ?", HI: "यह स्कोर क्यों?", TA: "இந்த மதிப்பெண் ஏன்?", TE: "ఈ స్కోరు ఎందుకు?", ML: "എന്തുകൊണ്ട് ഈ സ്കോർ?" },
  "DETERMINISTIC 4-FACTOR BREAKDOWN": { KN: "4-ಅಂಶಗಳ ವಿವರಣೆ", HI: "4-कारक विभाजन", TA: "4-காரணி பகுப்பாய்வு", TE: "4-కారకాల విశ్లేషణ", ML: "4-ഘടക വിശകലനം" },
  "RAINFALL INTENSITY": { KN: "ಮಳೆಯ ತೀವ್ರತೆ", HI: "वर्षा की तीव्रता", TA: "மழை தீவிரம்", TE: "వర్షపాత తీవ్రత", ML: "മഴയുടെ തീവ്രത" },
  "TERRAIN / TILT ACCELERATION": { KN: "ಭೂಪ್ರದೇಶ / ಇಳಿಜಾರಿನ ವೇಗವರ್ಧನೆ", HI: "भूभाग / झुकाव त्वरण", TA: "நிலப்பரப்பு / சாய்வு முடுக்கம்", TE: "భూభాగం / వాలు త్వరణం", ML: "ഭൂപ്രകൃതി / ചരിവ് വേഗത" },
  "GEOLOGICAL BASELINE": { KN: "ಭೂವೈಜ್ಞಾನಿಕ ತಳಹದಿ", HI: "भूवैज्ञानिक आधार", TA: "புவியியல் அடிப்படை", TE: "భూగర్భ మూలాధారం", ML: "ഭൂമിശാസ്ത്ര അടിത്തറ" },
  "REGIONAL EVENT CONTEXT": { KN: "ಪ್ರಾದೇಶಿಕ ಘಟನೆಯ ಸಂದರ್ಭ", HI: "क्षेत्रीय घटना संदर्भ", TA: "பிராந்திய நிகழ்வு சூழல்", TE: "ప్రాంతీయ సంఘటన సందర్భం", ML: "പ്രാദേശിക സംഭവ പശ്ചാത്തലം" },
  "SENSOR HISTORY LOG": { KN: "ಸಂವೇದಕ ಇತಿಹಾಸ ಲಾಗ್", HI: "सेंसर इतिहास लॉग", TA: "சென்சார் வரலாற்று பதிவு", TE: "సెన్సార్ హిస్టరీ లాగ్", ML: "സെൻസർ ചരിത്ര ലോഗ്" },
  "LAST 5 READINGS": { KN: "ಕೊನೆಯ 5 ವಾಚನಗಳು", HI: "अंतिम 5 रीडिंग", TA: "கடைசி 5 அளவீடுகள்", TE: "చివరి 5 రీడింగ్‌లు", ML: "അവസാന 5 റീഡിംഗുകൾ" },
  "AI RISK INTELLIGENCE": { KN: "AI ಅಪಾಯದ ಬುದ್ಧಿಮತ್ತೆ", HI: "AI जोखिम इंटेलिजेंस", TA: "AI ஆபத்து நுண்ணறிவு", TE: "AI ప్రమాద ఇంటెలిజెన్స్", ML: "AI അപകട വിവരങ്ങൾ" },
  "EXECUTIVE SITUATION SUMMARY": { KN: "ಕಾರ್ಯನಿರ್ವಾಹಕ ಪರಿಸ್ಥಿತಿ ಸಾರಾಂಶ", HI: "कार्यकारी स्थिति सारांश", TA: "நிர்வாக நிலை சுருக்கம்", TE: "కార్యనిర్వాహక పరిస్థితి సారాంశం", ML: "എക്സിക്യൂട്ടീവ് സാഹചര്യ സംഗ്രഹം" },
  "ROAD CONNECTIVITY INTELLIGENCE": { KN: "ರಸ್ತೆ ಸಂಪರ್ಕ ಬುದ್ಧಿಮತ್ತೆ", HI: "सड़क संपर्क इंटेलिजेंस", TA: "சாலை இணைப்பு நுண்ணறிவு", TE: "రహదారి కనెక్టివిటీ ఇంటెలిజెన్స్", ML: "റോഡ് കണക്റ്റിവിറ്റി വിവരങ്ങൾ" },
  "WEATHER-LINKED RISK FORECAST": { KN: "ಹವಾಮಾನ ಆಧಾರಿತ ಅಪಾಯ ಮುನ್ಸೂಚನೆ", HI: "मौसम आधारित जोखिम पूर्वानुमान", TA: "வானிலை சார்ந்த ஆபத்து முன்னறிவிப்பு", TE: "వాతావరణ ఆధారిత ప్రమాద సూచన", ML: "കാലാവസ്ഥാ അടിസ്ഥാനമാക്കിയുള്ള പ്രവചനം" },
  "CITIZEN / FIELD REPORTING": { KN: "ಸಾರ್ವಜನಿಕ / ಕ್ಷೇತ್ರ ವರದಿ", HI: "नागरिक / फील्ड रिपोर्टिंग", TA: "பொதுமக்கள் / கள அறிக்கை", TE: "పౌర / ఫీల్డ్ రిపోర్టింగ్", ML: "പൊതുജന / ഫീൽഡ് റിപ്പോർട്ടിംഗ്" },
};

/**
 * Universal Real-Time Translation Hook connected to Google Translate API & Local Caching
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

  // Translate function: synchronous dictionary hit or fallback to original while queuing API translation
  const t = useCallback((text: string): string => {
    if (!text || language === "EN") return text;

    // 1. Check static high-priority dictionary
    if (STATIC_DICTIONARY[text] && STATIC_DICTIONARY[text][language]) {
      return STATIC_DICTIONARY[text][language];
    }

    // 2. Check dynamic runtime cache
    const cacheKey = `${language}:${text}`;
    if (dynamicCache[cacheKey]) {
      return dynamicCache[cacheKey];
    }

    return text;
  }, [language, dynamicCache]);

  // Batch translate dynamic strings in the background
  const translateDynamicBatch = useCallback((texts: string[]) => {
    if (language === "EN" || !texts.length) return;

    const uncached = texts.filter(text => {
      const cacheKey = `${language}:${text}`;
      return !dynamicCache[cacheKey] && (!STATIC_DICTIONARY[text] || !STATIC_DICTIONARY[text][language]) && !pendingRequestsRef.current.has(text);
    });

    if (!uncached.length) return;

    uncached.forEach(t => pendingRequestsRef.current.add(t));

    translateMutation.mutate(
      { texts: uncached, targetLang: language },
      {
        onSuccess: (data) => {
          setDynamicCache((prev) => {
            const next = { ...prev };
            uncached.forEach((original, idx) => {
              const translated = data.translations[idx];
              if (translated) {
                next[`${language}:${original}`] = translated;
              }
              pendingRequestsRef.current.delete(original);
            });
            try {
              localStorage.setItem(`landsora_translations_${language}`, JSON.stringify(next));
            } catch {}
            return next;
          });
        },
        onError: () => {
          uncached.forEach(t => pendingRequestsRef.current.delete(t));
        }
      }
    );
  }, [language, dynamicCache, translateMutation]);

  return { t, translateDynamicBatch, currentLanguage: language };
}
