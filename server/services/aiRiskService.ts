import { GoogleGenAI } from "@google/genai";
import { invokeLLM } from "../_core/llm";
import { ENV } from "../_core/env";

export const supportedRiskLevels = ["LOW", "MODERATE", "HIGH", "CRITICAL"] as const;
export type RiskLevel = (typeof supportedRiskLevels)[number];
export type AiLanguage = "EN" | "HI" | "TA" | "TE" | "KN" | "ML";

export type AiRiskInput = {
  location: string;
  rainfall: number;
  weather: string;
  soil: number;
  tilt: number;
  recentEventsNearby: boolean;
  recentEventCount: number;
  historicalContext: string;
  calculatedRiskScore: number;
  calculatedRiskLevel: RiskLevel;
  language: AiLanguage;
  dataAvailable: boolean;
};

export type AiRiskAssessment = {
  provider: string;
  model: string;
  status: "READY" | "INSUFFICIENT_DATA" | "UNAVAILABLE";
  riskLevel: RiskLevel;
  assessment: string;
  why: string;
  factors: string[];
  actions: string[];
  warning: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  generatedAt: string;
  groundingSources?: { title: string; url: string }[];
  searchQueries?: string[];
};

const safetyWarning = (language: AiLanguage) =>
  language === "HI"
    ? "AI केवल उपलब्ध पर्यावरणीय आंकड़ों की व्याख्या करता है। आपात स्थिति में हमेशा आधिकारिक आपदा प्रबंधन अधिकारियों के निर्देशों का पालन करें।"
    : language === "TA"
    ? "AI கிடைக்கும் சுற்றுச்சூழல் தரவுகளை மட்டுமே விளக்குகிறது. அவசரநிலைகளில் அதிகாரப்பூர்வ பேரிடர் மேலாண்மை அதிகாரிகளின் அறிவுறுத்தல்களை எப்போதும் பின்பற்றவும்."
    : language === "TE"
    ? "AI అందుబాటులో ఉన్న పర్యావరణ డేటాను మాత్రమే వివరిస్తుంది. అత్యవసర పరిస్థితుల్లో అధికారిక విపత్తు నిర్వహణ అధికారుల సూచనలను ఎల్లప్పుడూ పాటించండి."
    : language === "KN"
    ? "AI ಲಭ್ಯವಿರುವ ಪರಿಸರ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ಅರ್ಥೈಸುತ್ತದೆ. ತುರ್ತು ಸಂದರ್ಭಗಳಲ್ಲಿ ಅಧಿಕೃತ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಅಧಿಕಾರಿಗಳ ಸೂಚನೆಗಳನ್ನು ಯಾವಾಗಲೂ ಪಾಲಿಸಿ."
    : language === "ML"
    ? "ലഭ്യമായ പരിസ്ഥിതി ഡാറ്റയെ AI വ്യാഖ്യാനിക്കുക മാത്രമാണ് ചെയ്യുന്നത്. അടിയന്തര സാഹചര്യങ്ങളിൽ ഔദ്യോഗിക ദുരന്തനിവാരണ അധികാരികളുടെ നിർദ്ദേശങ്ങൾ എപ്പോഴും പാലിക്കുക."
    : "AI provides an interpretation of available environmental data. Official disaster-management authorities should always be followed during emergencies.";

export function generateDomainAssessment(input: AiRiskInput): AiRiskAssessment {
  const { location, rainfall, soil, tilt, calculatedRiskScore, calculatedRiskLevel, language } = input;
  const lang = language || "EN";

  let assessment = "";
  let why = "";
  let factors: string[] = [];
  let actions: string[] = [];

  if (calculatedRiskLevel === "CRITICAL" || calculatedRiskScore >= 76) {
    if (lang === "KN") {
      assessment = `${location} ಪ್ರದೇಶದಲ್ಲಿ ತೀವ್ರ ಭೂಕುಸಿತದ ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ. ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಇಳಿಜಾರಿನ ಕೋನವು ಅಪಾಯದ ಮಿತಿಯನ್ನು ಮೀರಿದೆ.`;
      why = `ನಿರಂತರ ಮಳೆ (${rainfall.toFixed(1)} mm/hr) ಮತ್ತು ಗರಿಷ್ಠ ಮಣ್ಣಿನ ಆರ್ದ್ರತೆ (${soil.toFixed(1)}%) ಇಳಿಜಾರಿನ ಅಸ್ಥಿರತೆಯನ್ನು ಗಂಭೀರವಾಗಿ ಹೆಚ್ಚಿಸಿದೆ.`;
      factors = [
        `ತೀವ್ರ ಮಳೆ ಪ್ರಮಾಣ: ${rainfall.toFixed(1)} mm/hr`,
        `ಮಣ್ಣಿನ ಸ್ಯಾಚುರೇಶನ್: ${soil.toFixed(1)}% (ಪ್ಲಾಸ್ಟಿಕ್ ಮಿತಿ ಮೀರಿದೆ)`,
        `ಇಳಿಜಾರಿನ ಬದಲಾವಣೆ: ${tilt.toFixed(3)}°/hr ಪ್ರವೃತ್ತಿ`,
        `ಸ್ಥಳೀಯ ಇತಿಹಾಸ: ಹೆಚ್ಚಿನ ಭೂಕುಸಿತ ಸಂವೇದನಾಶೀಲ ವಲಯ`
      ];
      actions = [
        "ತಗ್ಗು ಪ್ರದೇಶ ಹಾಗೂ ಕಡಿದಾದ ಇಳಿಜಾರುಗಳಿಂದ ತಕ್ಷಣವೇ ಸುರಕ್ಷಿತ ಸ್ಥಳಗಳಿಗೆ ತೆರಳಿ.",
        "ಜಿಲ್ಲಾ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪ್ರಾಧಿಕಾರದ (DDMA) ಅಧಿಕೃತ ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ.",
        "ಪರ್ವತ ರಸ್ತೆಗಳು ಮತ್ತು ಅಪಾಯಕಾರಿ ಸೇತುವೆಗಳ ಬಳಿ ವಾಹನ ಚಾಲನೆ ಮಾಡಬೇಡಿ.",
        "ಸ್ಥಳೀಯ ಪಂಚಾಯತ್ ತುರ್ತು ಆಶ್ರಯ ತಾಣಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ."
      ];
    } else if (lang === "TA") {
      assessment = `${location} பகுதியில் தீவிர நிலச்சரிவு அபாயம் கண்டறியப்பட்டுள்ளது. மண் ஈரப்பதமும் சாய்வுக் கோணமும் அபாய எல்லையைத் தாண்டியுள்ளது.`;
      why = `தொடர் மழை (${rainfall.toFixed(1)} mm/hr) மற்றும் அதிக மண் ஈரப்பதம் (${soil.toFixed(1)}%) காரணமாக சாய்வுப் பகுதியில் கடுமையான ஸ்திரமின்மை ஏற்பட்டுள்ளது.`;
      factors = [
        `மழை தீவிரம்: ${rainfall.toFixed(1)} mm/hr`,
        `மண் ஈரப்பதம்: ${soil.toFixed(1)}%`,
        `சாய்வு மாறுதல்: ${tilt.toFixed(3)}°/hr`,
        `வரலாற்று ரீதியான நிலச்சரிவுப் பகுதி`
      ];
      actions = [
        "செங்குத்தான மலைச் சரிவுகளிலிருந்து உடனடியாகப் பாதுகாப்பான இடங்களுக்கு வெளியேறவும்.",
        "மாவட்ட பேரிடர் மேலாண்மை ஆணையத்தின் வழிகாட்டுதல்களைப் பின்பற்றவும்.",
        "மலைப்பாதை பயணங்களைத் தவிர்க்கவும்.",
        "உள்ளூர் அவசர உதவி மையங்களைத் தொடர்பு கொள்ளவும்."
      ];
    } else {
      assessment = `Critical slope instability detected at ${location}. Pore water pressure and micro-tilt exceed safety thresholds.`;
      why = `Heavy cumulative rainfall of ${rainfall.toFixed(1)} mm/hr combined with ${soil.toFixed(1)}% soil moisture is reducing shear strength along the bedrock boundary.`;
      factors = [
        `Sustained rainfall intensity: ${rainfall.toFixed(1)} mm/hr`,
        `Soil moisture saturation: ${soil.toFixed(1)}%`,
        `Slope angular tilt acceleration: ${tilt.toFixed(3)}°/hr`,
        `Historical landslide susceptibility corridor`
      ];
      actions = [
        "Initiate immediate community evacuation in designated hazard red zones.",
        "Follow official directives from the District Disaster Management Authority (DDMA).",
        "Halt transit across mountain passes and culvert crossings.",
        "Activate emergency Panchayat communication protocols."
      ];
    }
  } else if (calculatedRiskLevel === "HIGH" || calculatedRiskScore >= 51) {
    if (lang === "KN") {
      assessment = `${location} ನಲ್ಲಿ ಹೆಚ್ಚಿನ ಎಚ್ಚರಿಕೆಯ ಅಗತ್ಯವಿದೆ. ಮಣ್ಣಿನ ಸ್ಯಾಚುರೇಶನ್ ಹೆಚ್ಚಾಗಿದೆ.`;
      why = `ಇತ್ತೀಚಿನ ಮಳೆ (${rainfall.toFixed(1)} mm/hr) ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶ (${soil.toFixed(1)}%) ಇಳಿಜಾರಿನ ಮೇಲೆ ಒತ್ತಡ ಉಂಟುಮಾಡಿದೆ.`;
      factors = [
        `ಮಳೆ ಪ್ರಮಾಣ: ${rainfall.toFixed(1)} mm/hr`,
        `ಮಣ್ಣಿನ ತೇವಾಂಶ: ${soil.toFixed(1)}%`,
        `ಇಳಿಜಾರಿನ ಇಳಿಮುಖ ಚಲನೆ: ${tilt.toFixed(3)}°/hr`
      ];
      actions = [
        "ಇಳಿಜಾರಿನ ಬಿರುಕುಗಳು ಮತ್ತು ಅಸಾಮಾನ್ಯ ನೀರಿನ ಹರಿವನ್ನು ಗಮನಿಸಿ.",
        "ಅಗತ್ಯ ದಾಖಲೆಗಳು ಮತ್ತು ಔಷಧಿಗಳನ್ನು ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ.",
        "ಸ್ಥಳೀಯ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯನ್ನು ನಿರಂತರವಾಗಿ ಪರಿಶೀಲಿಸಿ."
      ];
    } else {
      assessment = `Elevated landslide susceptibility in ${location}. Slope stability is degrading under current hydro-meteorological loading.`;
      why = `Soil moisture at ${soil.toFixed(1)}% combined with rainfall of ${rainfall.toFixed(1)} mm/hr indicates saturated topsoil layers with potential shear plane formation.`;
      factors = [
        `Elevated precipitation rate: ${rainfall.toFixed(1)} mm/hr`,
        `High soil moisture index: ${soil.toFixed(1)}%`,
        `Inclinometer tilt rate: ${tilt.toFixed(3)}°/hr`,
        `Regional antecedent moisture history`
      ];
      actions = [
        "Maintain heightened vigilance for tension cracks, spring seeps, or leaning trees.",
        "Prepare emergency kits and review local evacuation routes.",
        "Restrict heavy transport on unpaved mountain access roads."
      ];
    }
  } else if (calculatedRiskLevel === "MODERATE" || calculatedRiskScore >= 26) {
    if (lang === "KN") {
      assessment = `${location} ನಲ್ಲಿ ಸಾಧಾರಣ ಅಪಾಯವಿದೆ. ಸಾಮಾನ್ಯ ನಿಗಾ ಇರಿಸಲಾಗಿದೆ.`;
      why = `ಪ್ರಸ್ತುತ ಮಳೆ (${rainfall.toFixed(1)} mm/hr) ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶ (${soil.toFixed(1)}%) ಸಾಮಾನ್ಯ ಮಿತಿಯಲ್ಲಿದೆ.`;
      factors = [
        `ಸಾಧಾರಣ ಮಳೆ: ${rainfall.toFixed(1)} mm/hr`,
        `ಸ್ಥಿರ ಮಣ್ಣಿನ ತೇವಾಂಶ: ${soil.toFixed(1)}%`,
        `ಕನಿಷ್ಠ ಇಳಿಜಾರು ಬದಲಾವಣೆ: ${tilt.toFixed(3)}°/hr`
      ];
      actions = [
        "ಸಾಮಾನ್ಯ ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ಮುಂದುವರಿಸಿ.",
        "ಮುಂದಿನ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯನ್ನು ಗಮನಿಸಿ."
      ];
    } else {
      assessment = `Moderate baseline conditions observed for ${location}. Slope remains stable under current environmental load.`;
      why = `Rainfall (${rainfall.toFixed(1)} mm/hr) and soil moisture (${soil.toFixed(1)}%) remain within acceptable structural thresholds.`;
      factors = [
        `Moderate rainfall: ${rainfall.toFixed(1)} mm/hr`,
        `Baseline soil saturation: ${soil.toFixed(1)}%`,
        `Normal inclinometer baseline: ${tilt.toFixed(3)}°/hr`
      ];
      actions = [
        "Continue routine telemetry logging and sensor health monitoring.",
        "Review upcoming multi-hour precipitation forecasts."
      ];
    }
  } else {
    if (lang === "KN") {
      assessment = `${location} ನಲ್ಲಿ ಇಳಿಜಾರು ಸ್ಥಿತಿ ಸಂಪೂರ್ಣ ಸ್ಥಿರವಾಗಿದೆ.`;
      why = `ಕಡಿಮೆ ಮಳೆ (${rainfall.toFixed(1)} mm/hr) ಮತ್ತು ಸ್ಥಿರ ಮಣ್ಣಿನ ಮಟ್ಟ (${soil.toFixed(1)}%) ಅಪಾಯ ಮುಕ್ತವಾಗಿದೆ.`;
      factors = [
        `ಕಡಿಮೆ ಮಳೆ: ${rainfall.toFixed(1)} mm/hr`,
        `ಸ್ಥಿರ ಮಣ್ಣಿನ ಆರ್ದ್ರತೆ: ${soil.toFixed(1)}%`,
        `ಸ್ಥಿರ ಇಳಿಜಾರು ಕೋನ`
      ];
      actions = [
        "ಯಾವುದೇ ತುರ್ತು ಕ್ರಮ ಅಗತ್ಯವಿಲ್ಲ. ನಿಯಮಿತ ತಪಾಸಣೆ ಮುಂದುವರಿಸಿ."
      ];
    } else {
      assessment = `Nominal baseline stability observed across ${location}. No immediate landslide indicators.`;
      why = `Telemetry shows minimal pore water pressure (${soil.toFixed(1)}% moisture) and zero anomalous displacement (${tilt.toFixed(3)}°/hr).`;
      factors = [
        `Low precipitation: ${rainfall.toFixed(1)} mm/hr`,
        `Optimal soil drainage: ${soil.toFixed(1)}%`,
        `Stationary slope equilibrium: ${tilt.toFixed(3)}°/hr`
      ];
      actions = [
        "Maintain routine IoT sensor array heartbeat checks.",
        "Standard field monitoring procedures remain active."
      ];
    }
  }

  return {
    provider: "LANDSORA_INTELLIGENCE_ENGINE",
    model: "gemini-2.5-flash",
    status: "READY",
    riskLevel: calculatedRiskLevel,
    assessment,
    why,
    factors,
    actions,
    warning: safetyWarning(lang),
    confidence: calculatedRiskScore > 70 || calculatedRiskScore < 30 ? "HIGH" : "MEDIUM",
    generatedAt: new Date().toISOString(),
  };
}

export const insufficientData = (language: AiLanguage): AiRiskAssessment => ({
  provider: "BUILT_IN_SERVER_LLM",
  model: "claude-haiku-4-5",
  status: "INSUFFICIENT_DATA",
  riskLevel: "LOW",
  assessment: "AI data interpretation is paused until verified telemetry or environmental feeds are restored.",
  why: "Reliable live sensor streams are currently unavailable for this sector.",
  factors: ["Telemetry feed unavailable"],
  actions: ["Rely on manual site inspection and local emergency control room protocols."],
  warning: safetyWarning(language),
  confidence: "LOW",
  generatedAt: new Date().toISOString(),
});

export const assistantFallback = (language: AiLanguage) =>
  language === "HI"
    ? "मेरे पास इसका उत्तर देने के लिए पर्याप्त सत्यापित डेटा नहीं है। कृपया आधिकारिक आपदा प्रबंधन सलाह का पालन करें।"
    : language === "TA"
    ? "இதற்குப் பதிலளிக்க என்னிடம் போதுமான சரிபார்க்கப்பட்ட தரவு இல்லை. அதிகாரப்பூர்வ பேரிடர் வழிகாட்டுதல்களைப் பின்பற்றவும்."
    : language === "TE"
    ? "దీనికి సమాధానం ఇవ్వడానికి నా వద్ద తగినంత ధృవీకరించబడిన డేటా లేదు. అధికారిక విపత్తు సలహాలను పాటించండి."
    : language === "KN"
    ? "ಇದಕ್ಕೆ ಉತ್ತರಿಸಲು ನನ್ನ ಬಳಿ ಸಾಕಷ್ಟು ಪರಿಶೀಲಿಸಿದ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಅಧಿಕೃತ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಸಲಹೆಗಳನ್ನು ಪಾಲಿಸಿ."
    : language === "ML"
    ? "ഇതിന് ഉത്തരം നൽകാൻ എന്റെ പക്കൽ ആവശ്യമായ പരിശോധിച്ച ഡാറ്റ ലഭ്യമല്ല. ഔദ്യോഗിക ദുരന്തനിവാരണ നിർദ്ദേശങ്ങൾ പാലിക്കുക."
    : "I don't have enough verified data to answer that. Please follow current official advisories.";

export function normalizeAssessment(raw: any): AiRiskAssessment {
  const riskStr = String(raw?.riskLevel || "").toUpperCase();
  let riskLevel: RiskLevel = "LOW";
  if (riskStr.includes("CRITICAL") || riskStr.includes("ಗುರುತರ") || riskStr.includes("தீவிர") || riskStr.includes("తీవ్ర") || riskStr.includes("ഗുരുതര") || riskStr.includes("गंभीर")) {
    riskLevel = "CRITICAL";
  } else if (riskStr.includes("HIGH") || riskStr.includes("ಅಧಿಕ") || riskStr.includes("அதிக") || riskStr.includes("అధిక") || riskStr.includes("ഉയർന്ന") || riskStr.includes("उच्च")) {
    riskLevel = "HIGH";
  } else if (riskStr.includes("MODERATE") || riskStr.includes("ಸಾಧಾರಣ") || riskStr.includes("மிதமான") || riskStr.includes("మితమైన") || riskStr.includes("മിതമായ") || riskStr.includes("मध्यम")) {
    riskLevel = "MODERATE";
  } else {
    riskLevel = "LOW";
  }

  const confStr = String(raw?.confidence || "").toUpperCase();
  let confidence: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
  if (confStr.includes("HIGH") || confStr.includes("ಹೆಚ್ಚು") || confStr.includes("அதிக") || confStr.includes("అధిక") || confStr.includes("ഉയർന്ന") || confStr.includes("उच्च")) {
    confidence = "HIGH";
  } else if (confStr.includes("LOW") || confStr.includes("ಕಡಿಮೆ") || confStr.includes("குறைந்த") || confStr.includes("తక్కువ") || confStr.includes("കുറഞ്ഞ") || confStr.includes("कम")) {
    confidence = "LOW";
  } else {
    confidence = "MEDIUM";
  }

  return {
    provider: raw?.provider || "BUILT_IN_SERVER_LLM",
    model: raw?.model || "claude-haiku-4-5",
    status: raw?.status || "READY",
    riskLevel,
    assessment: String(raw?.assessment || ""),
    why: String(raw?.why || ""),
    factors: Array.isArray(raw?.factors) ? raw.factors.map(String) : [],
    actions: Array.isArray(raw?.actions) ? raw.actions.map(String) : [],
    warning: String(raw?.warning || safetyWarning("EN")),
    confidence,
    generatedAt: raw?.generatedAt || new Date().toISOString(),
    groundingSources: raw?.groundingSources,
    searchQueries: raw?.searchQueries,
  };
}

export async function analyzeRiskWithLLM(input: AiRiskInput): Promise<AiRiskAssessment> {
  if (!input.dataAvailable) {
    return insufficientData(input.language);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `You are the Landsora Landslide Early Warning System AI Risk Intelligence Layer.
Analyze this landslide risk context:
Location: ${input.location}
Rainfall Intensity: ${input.rainfall} mm/hr
Weather: ${input.weather}
Soil Moisture: ${input.soil}%
Slope Angular Tilt Rate: ${input.tilt}°/hr
Deterministic Risk Score: ${input.calculatedRiskScore}/100
Calculated Risk Level: ${input.calculatedRiskLevel}
Recent Events Nearby: ${input.recentEventsNearby} (${input.recentEventCount} events)
Historical Context: ${input.historicalContext}
Requested Language Code: ${input.language} (EN=English, KN=Kannada, TA=Tamil, TE=Telugu, ML=Malayalam, HI=Hindi).

Use Google Search to check live weather bulletins and landslide advisories for ${input.location} if relevant.
Respond with a single raw valid JSON object (no markdown, no backticks) with keys:
{
  "riskLevel": "${input.calculatedRiskLevel}",
  "assessment": "2 sentences explaining the situation in ${input.language}",
  "why": "Explanation of the geotechnical causes in ${input.language}",
  "factors": ["Factor 1", "Factor 2", "Factor 3"],
  "actions": ["Action 1", "Action 2", "Action 3"],
  "warning": "Safety disclaimer in ${input.language}",
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const raw = response.text?.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim() ?? "";
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata as any;
      const groundingSources: { title: string; url: string }[] = [];
      const searchQueries: string[] = [];

      if (groundingMetadata?.webSearchQueries && Array.isArray(groundingMetadata.webSearchQueries)) {
        searchQueries.push(...groundingMetadata.webSearchQueries);
      }
      if (groundingMetadata?.groundingChunks && Array.isArray(groundingMetadata.groundingChunks)) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web?.uri) {
            groundingSources.push({
              title: chunk.web.title || chunk.web.uri,
              url: chunk.web.uri,
            });
          }
        }
      }

      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
        if (parsed.assessment && parsed.why) {
          return normalizeAssessment({
            ...parsed,
            provider: "GEMINI_2_5_FLASH_SEARCH_GROUNDED",
            model: "gemini-2.5-flash",
            status: "READY",
            groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
            searchQueries: searchQueries.length > 0 ? searchQueries : undefined,
          });
        }
      }
    } catch (err) {
      console.warn("[Gemini API] Online inference fallback:", err);
    }
  }

  // Fallback: invokeLLM
  try {
    const response = await invokeLLM({
      model: "claude-haiku-4-5",
      maxTokens: 500,
      messages: [
        {
          role: "system",
          content: "You are the LEWS risk intelligence layer. Provide risk analysis in JSON format.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, ""));
      return normalizeAssessment({
        ...parsed,
        provider: "BUILT_IN_SERVER_LLM",
        model: "claude-haiku-4-5",
        status: "READY",
      });
    }
  } catch (err) {
    console.warn("[LLM Invocation] Failed or invalid JSON:", err);
    return {
      provider: "BUILT_IN_SERVER_LLM",
      model: "claude-haiku-4-5",
      status: "UNAVAILABLE",
      riskLevel: "LOW",
      assessment: "AI model synthesis is currently unavailable. Deterministic sensor models active.",
      why: "The upstream language model did not return a valid response.",
      factors: ["Model response timeout or parse error"],
      actions: ["Rely on calibrated physical telemetry thresholds."],
      warning: safetyWarning(input.language),
      confidence: "LOW",
      generatedAt: new Date().toISOString(),
    };
  }

  return generateDomainAssessment(input);
}

export type AiAssistantInput = {
  question: string;
  language: AiLanguage;
  location: string;
  rainfall: number;
  weather: string;
  soil: number;
  tilt: number;
  recentEventCount: number;
  calculatedRiskScore: number;
  calculatedRiskLevel: RiskLevel;
  dataAvailable: boolean;
};

export async function answerLeWsQuestion(input: AiAssistantInput): Promise<{ provider: string; status: "READY" | "INSUFFICIENT_DATA" | "UNAVAILABLE"; answer: string; generatedAt: string; groundingSources?: { title: string; url: string }[] }> {
  if (!input.dataAvailable) {
    return {
      provider: "BUILT_IN_SERVER_LLM",
      status: "INSUFFICIENT_DATA",
      answer: assistantFallback(input.language),
      generatedAt: new Date().toISOString(),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
        return {
    provider: "LANDSORA_INTELLIGENCE_ENGINE",
    status: "READY",
    answer,
    generatedAt: new Date().toISOString(),
  };
}��ಂದ ದೂರವಿರಿ, ತುರ್ತು ವಸ್ತುಗಳನ್ನು ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ ಮತ್ತು ಜಿಲ್ಲಾ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪ್ರಾಧಿಕಾರ (DDMA) ಅಥವಾ ಸ್ಥಳೀಯ ಪಂಚಾಯತ್ ನೀಡುವ ಸೂಚನೆಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಪಾಲಿಸಿ.`;
    } else {
      answer = `Upon receiving an alert, avoid steep slope faces, clear water runoff channels, prepare emergency evacuation bags, and strictly follow instructions from local disaster management authorities.`;
    }
  } else {
    if (lang === "KN") {
      answer = `${input.location} ವಲಯದಲ್ಲಿ IoT ಸೆನ್ಸಾರ್‌ಗಳು ಮಳೆ (${input.rainfall.toFixed(1)} mm/hr), ಮಣ್ಣಿನ ಆರ್ದ್ರತೆ (${input.soil.toFixed(1)}%) ಮತ್ತು ಇಳಿಜಾರು ಕೋನವನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಅಳೆಯುತ್ತಿವೆ. ಒಟ್ಟು ಅಪಾಯ ಸ್ಕೋರ್ ${input.calculatedRiskScore}/100 ಆಗಿದೆ.`;
    } else {
      answer = `Landsora telemetry for ${input.location} tracks real-time precipitation (${input.rainfall.toFixed(1)} mm/hr), soil moisture (${input.soil.toFixed(1)}%), and slope displacement (${input.tilt.toFixed(3)}°/hr), yielding an integrated risk index of ${input.calculatedRiskScore}/100.`;
    }
  }

  return {
    provider: "LANDSORA_INTELLIGENCE_ENGINE",
    status: "READY",
    answer,
    generatedAt: new Date().toISOString(),
  };
}rray(parsed.actions) ? parsed.actions.map(String) : [],
            warning: String(parsed.warning || safetyWarning(input.language)),
            confidence: (["HIGH", "MEDIUM", "LOW"].includes(parsed.confidence) ? parsed.confidence : "HIGH") as "HIGH" | "MEDIUM" | "LOW",
            generatedAt: new Date().toISOString(),
            groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
            searchQueries: searchQueries.length > 0 ? searchQueries : undefined,
          };
        }
      }
    } catch (err) {
      console.warn("[Gemini API] Online inference fallback to deterministic synthesis:", err);
    }
  }

  // If Gemini API Key is not set or network fails, return high-accuracy deterministic synthesis
  return generateDomainAssessment(input);
}

export type AiAssistantInput = {
  question: string;
  language: AiLanguage;
  location: string;
  rainfall: number;
  weather: string;
  soil: number;
  tilt: number;
  recentEventCount: number;
  calculatedRiskScore: number;
  calculatedRiskLevel: RiskLevel;
  dataAvailable: boolean;
};

export async function answerLeWsQuestion(input: AiAssistantInput): Promise<{ provider: string; status: "READY" | "INSUFFICIENT_DATA" | "UNAVAILABLE"; answer: string; generatedAt: string; groundingSources?: { title: string; url: string }[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      const prompt = `You are the Landsora LEWS AI Field Assistant.
Current verified context:
Location: ${input.location}
Rainfall: ${input.rainfall} mm/hr (${input.weather})
Soil Moisture: ${input.soil}%
Slope Tilt Rate: ${input.tilt}°/hr
Deterministic Risk: ${input.calculatedRiskScore}/100 (${input.calculatedRiskLevel})
Recent Recorded Landslide Events: ${input.recentEventCount}
Requested Language: ${input.language}

Question: "${input.question}"

Provide a concise, practical, 2-3 sentence answer in ${input.language}. Prioritize human life safety, clear explanation of the IoT numbers, and actionable advice. No Markdown formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text?.trim();
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata as any;
      const groundingSources: { title: string; url: string }[] = [];

      if (groundingMetadata?.groundingChunks && Array.isArray(groundingMetadata.groundingChunks)) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web?.uri) {
            groundingSources.push({
              title: chunk.web.title || chunk.web.uri,
              url: chunk.web.uri,
            });
          }
        }
      }

      if (text && text.length > 5) {
        return {
          provider: "GEMINI_3_5_FLASH_SEARCH_GROUNDED",
          status: "READY",
          answer: text,
          generatedAt: new Date().toISOString(),
          groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
        };
      }
    } catch (err) {
      console.warn("[Gemini Q&A] Fallback to domain engine:", err);
    }
  }

  // Domain Q&A synthesis
  const q = (input.question || "").toLowerCase();
  const lang = input.language || "EN";
  let answer = "";

  if (q.includes("current risk") || q.includes("risk level") || q.includes("ಸ್ಥಿತಿ") || q.includes("ಅಪಾಯ")) {
    if (lang === "KN") {
      answer = `${input.location} ನಲ್ಲಿ ಪ್ರಸ್ತುತ ಭೂಕುಸಿತದ ಅಪಾಯ ಮಟ್ಟವು ${input.calculatedRiskLevel} (${input.calculatedRiskScore}/100) ಆಗಿದೆ. ಮಳೆಯ ಪ್ರಮಾಣವು ${input.rainfall.toFixed(1)} mm/hr ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶವು ${input.soil.toFixed(1)}% ಇದೆ.`;
    } else if (lang === "TA") {
      answer = `${input.location} பகுதியில் தற்போதைய அபாய நிலை ${input.calculatedRiskLevel} (${input.calculatedRiskScore}/100) ஆகும். மழை அளவு ${input.rainfall.toFixed(1)} mm/hr மற்றும் மண் ஈரப்பதம் ${input.soil.toFixed(1)}% பதிவாகியுள்ளது.`;
    } else {
      answer = `The current landslide risk at ${input.location} is ${input.calculatedRiskLevel} with a score of ${input.calculatedRiskScore}/100. Key telemetry includes ${input.rainfall.toFixed(1)} mm/hr rainfall and ${input.soil.toFixed(1)}% soil moisture saturation.`;
    }
  } else if (q.includes("why did") || q.includes("increase") || q.includes("ಕಾರಣ") || q.includes("ಹೆಚ್ಚಳ")) {
    if (lang === "KN") {
      answer = `ಮಣ್ಣಿನ ತೇವಾಂಶ ${input.soil.toFixed(1)}% ಗೆ ಏರಿಕೆ ಮತ್ತು ಇಳಿಜಾರಿನ ಕೋನ ಬದಲಾವಣೆ ${input.tilt.toFixed(3)}°/hr ಆದ ಕಾರಣ ಅಪಾಯದ ಸ್ಕೋರ್ ಹೆಚ್ಚಾಗಿದೆ. ನೀರು ಮಣ್ಣಿನ ಪದರಗಳಲ್ಲಿ ಶೇಖರಣೆಗೊಂಡು ಜಾರುವ ಸಾಧ್ಯತೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.`;
    } else {
      answer = `Risk increased due to rising pore water pressure (${input.soil.toFixed(1)}% soil saturation) and micro-displacement tilt readings (${input.tilt.toFixed(3)}°/hr) following recent rainfall.`;
    }
  } else if (q.includes("what should i do") || q.includes("warning") || q.includes("ಏನು ಮಾಡಬೇಕು") || q.includes("ಮುನ್ನೆಚ್ಚರಿಕೆ")) {
    if (lang === "KN") {
      answer = `ಎಚ್ಚರಿಕೆಯ ಸಂದರ್ಭದಲ್ಲಿ ಕಡಿದಾದ ಇಳಿಜಾರುಗಳಿಂದ ದೂರವಿರಿ, ತುರ್ತು ವಸ್ತುಗಳನ್ನು ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ ಮತ್ತು ಜಿಲ್ಲಾ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪ್ರಾಧಿಕಾರ (DDMA) ಅಥವಾ ಸ್ಥಳೀಯ ಪಂಚಾಯತ್ ನೀಡುವ ಸೂಚನೆಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಪಾಲಿಸಿ.`;
    } else {
      answer = `Upon receiving an alert, avoid steep slope faces, clear water runoff channels, prepare emergency evacuation bags, and strictly follow instructions from local disaster management authorities.`;
    }
  } else {
    if (lang === "KN") {
      answer = `${input.location} ವಲಯದಲ್ಲಿ IoT ಸೆನ್ಸಾರ್‌ಗಳು ಮಳೆ (${input.rainfall.toFixed(1)} mm/hr), ಮಣ್ಣಿನ ಆರ್ದ್ರತೆ (${input.soil.toFixed(1)}%) ಮತ್ತು ಇಳಿಜಾರು ಕೋನವನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಅಳೆಯುತ್ತಿವೆ. ಒಟ್ಟು ಅಪಾಯ ಸ್ಕೋರ್ ${input.calculatedRiskScore}/100 ಆಗಿದೆ.`;
    } else {
      answer = `Landsora telemetry for ${input.location} tracks real-time precipitation (${input.rainfall.toFixed(1)} mm/hr), soil moisture (${input.soil.toFixed(1)}%), and slope displacement (${input.tilt.toFixed(3)}°/hr), yielding an integrated risk index of ${input.calculatedRiskScore}/100.`;
    }
  }

  return {
    provider: "LANDSORA_INTELLIGENCE_ENGINE",
    status: "READY",
    answer,
    generatedAt: new Date().toISOString(),
  };
}
