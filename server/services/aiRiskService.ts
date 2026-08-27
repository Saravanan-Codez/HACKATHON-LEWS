import { invokeLLM } from "../_core/llm";

export const supportedRiskLevels = ["LOW", "MODERATE", "HIGH", "CRITICAL"] as const;
export type RiskLevel = (typeof supportedRiskLevels)[number];
export type AiLanguage = "EN" | "TA" | "TE" | "KN" | "ML";

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
  provider: "BUILT_IN_SERVER_LLM";
  model: "claude-haiku-4-5";
  status: "READY" | "INSUFFICIENT_DATA" | "UNAVAILABLE";
  riskLevel: RiskLevel;
  assessment: string;
  why: string;
  factors: string[];
  actions: string[];
  warning: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  generatedAt: string;
};

const safetyWarning = (language: AiLanguage) => language === "TA" ? "AI கிடைக்கும் சுற்றுச்சூழல் தரவுகளை மட்டுமே விளக்குகிறது. அவசரநிலைகளில் அதிகாரப்பூர்வ பேரிடர் மேலாண்மை அதிகாரிகளின் அறிவுறுத்தல்களை எப்போதும் பின்பற்றவும்." : language === "TE" ? "AI అందుబాటులో ఉన్న పర్యావరణ డేటాను మాత్రమే వివరిస్తుంది. అత్యవసర పరిస్థితుల్లో అధికారిక విపత్తు నిర్వహణ అధికారుల సూచనలను ఎల్లప్పుడూ పాటించండి." : language === "KN" ? "AI ಲಭ್ಯವಿರುವ ಪರಿಸರ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ಅರ್ಥೈಸುತ್ತದೆ. ತುರ್ತು ಸಂದರ್ಭಗಳಲ್ಲಿ ಅಧಿಕೃತ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಅಧಿಕಾರಿಗಳ ಸೂಚನೆಗಳನ್ನು ಯಾವಾಗಲೂ ಪಾಲಿಸಿ." : language === "ML" ? "ലഭ്യമായ പരിസ്ഥിതി ഡാറ്റയെ AI വ്യാഖ്യാനിക്കുക മാത്രമാണ് ചെയ്യുന്നത്. അടിയന്തര സാഹചര്യങ്ങളിൽ ഔദ്യോഗിക ദുരന്തനിവാരണ അധികാരികളുടെ നിർദ്ദേശങ്ങൾ എപ്പോഴും പാലിക്കുക." : "AI provides an interpretation of available environmental data. Official disaster-management authorities should always be followed during emergencies.";

const insufficientData = (language: AiLanguage): AiRiskAssessment => ({
  provider: "BUILT_IN_SERVER_LLM",
  model: "claude-haiku-4-5",
  status: "INSUFFICIENT_DATA",
  riskLevel: "LOW",
  assessment: language === "TA" ? "நம்பகமான AI பகுப்பாய்வுக்கு போதுமான நேரடி தரவு இல்லை." : language === "TE" ? "నమ్మకమైన AI విశ్లేషణకు తగిన ప్రత్యక్ష డేటా అందుబాటులో లేదు." : language === "KN" ? "ವಿಶ್ವಾಸಾರ್ಹ AI ವಿಶ್ಲೇಷಣೆಗೆ ಸಾಕಷ್ಟು ನೈಜ-ಸಮಯದ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ." : language === "ML" ? "വിശ്വസനീയമായ AI വിശകലനത്തിന് മതിയായ തത്സമയ ഡാറ്റ ലഭ്യമല്ല." : "Insufficient real-time data available for reliable AI analysis.",
  why: "The analysis is paused because the source data is unavailable or incomplete.",
  factors: [],
  actions: ["Follow official disaster-management advisories.", "Do not treat this dashboard as a confirmed prediction."],
  warning: safetyWarning(language),
  confidence: "LOW",
  generatedAt: new Date().toISOString(),
});

const responseSchema = {
  type: "json_schema" as const,
  json_schema: {
    name: "lews_ai_risk_assessment",
    strict: true,
    schema: {
      type: "object",
      properties: {
        riskLevel: { type: "string", enum: [...supportedRiskLevels] },
        assessment: { type: "string" },
        why: { type: "string" },
        factors: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
        actions: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
        warning: { type: "string" },
        confidence: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
      },
      required: ["riskLevel", "assessment", "why", "factors", "actions", "warning", "confidence"],
      additionalProperties: false,
    },
  },
};

const normalizeRiskLevel = (value: unknown): RiskLevel | null => {
  const text = String(value ?? "").trim().toUpperCase();
  const aliases: Record<string, RiskLevel> = { LOW: "LOW", MODERATE: "MODERATE", HIGH: "HIGH", CRITICAL: "CRITICAL", "குறைவு": "LOW", "மிதமான": "MODERATE", "உயர்": "HIGH", "முக்கியமான": "CRITICAL", "తక్కువ": "LOW", "మధ్యస్థ": "MODERATE", "అధిక": "HIGH", "తీవ్రమైన": "CRITICAL", "ಕಡಿಮೆ": "LOW", "ಮಧ್ಯಮ": "MODERATE", "ಹೆಚ್ಚು": "HIGH", "ಗಂಭೀರ": "CRITICAL", "കുറഞ്ഞ": "LOW", "മിതമായ": "MODERATE", "ഉയർന്ന": "HIGH", "ഗുരുതര": "CRITICAL" };
  return aliases[text] ?? null;
};

const normalizeConfidence = (value: unknown): "LOW" | "MEDIUM" | "HIGH" | null => {
  const text = String(value ?? "").trim().toUpperCase();
  const aliases: Record<string, "LOW" | "MEDIUM" | "HIGH"> = { LOW: "LOW", MEDIUM: "MEDIUM", HIGH: "HIGH", "குறைவு": "LOW", "மிதமான": "MEDIUM", "உயர்": "HIGH", "తక్కువ": "LOW", "మధ్యస్థ": "MEDIUM", "అధిక": "HIGH", "ಕಡಿಮೆ": "LOW", "ಮಧ್ಯಮ": "MEDIUM", "ಹೆಚ್ಚು": "HIGH", "കുറഞ്ഞ": "LOW", "മിതമായ": "MEDIUM", "ഉയർന്ന": "HIGH" };
  return aliases[text] ?? null;
};

export const normalizeAssessment = (value: unknown) => {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const riskLevel = normalizeRiskLevel(item.riskLevel);
  const confidence = normalizeConfidence(item.confidence);
  return riskLevel && confidence ? { ...item, riskLevel, confidence } : null;
};

const validAssessment = (value: unknown): value is Omit<AiRiskAssessment, "provider" | "model" | "status" | "generatedAt"> => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return supportedRiskLevels.includes(item.riskLevel as RiskLevel)
    && typeof item.assessment === "string"
    && typeof item.why === "string"
    && Array.isArray(item.factors) && item.factors.every(factor => typeof factor === "string")
    && Array.isArray(item.actions) && item.actions.every(action => typeof action === "string")
    && typeof item.warning === "string"
    && ["LOW", "MEDIUM", "HIGH"].includes(item.confidence as string);
};

const safeFallback = (language: AiLanguage): AiRiskAssessment => ({
  ...insufficientData(language),
  status: "UNAVAILABLE",
  assessment: "AI analysis is temporarily unavailable. Review the deterministic risk score and official advisories.",
  why: "The AI interpretation layer did not return a valid assessment.",
});

export async function analyzeRiskWithLLM(input: AiRiskInput): Promise<AiRiskAssessment> {
  if (!input.dataAvailable) return insufficientData(input.language);

  try {
    const response = await invokeLLM({
      model: "claude-haiku-4-5",
      maxTokens: 900,
      messages: [
        {
          role: "system",
          content: "You are the LEWS AI Risk Intelligence explanation layer. The deterministic risk engine and live environmental feeds are the source of truth. Never invent measurements, never claim a landslide will definitely happen, and never override official authorities. Your entire response MUST be one valid JSON object beginning with { and ending with }, with exactly these keys: riskLevel, assessment, why, factors, actions, warning, confidence. Do not use Markdown, headings, or commentary outside the JSON object. Write prose values in the requested language, but keep riskLevel and confidence as the supplied English enum values. Keep the supplied risk level and score unchanged. The warning must preserve uncertainty and direct people to official instructions.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Explain the supplied risk assessment and produce safe response information.",
            requestedLanguage: input.language,
            sourceOfTruth: "LEWS deterministic risk engine plus NASA EONET event context",
            environmentalData: {
              location: input.location,
              rainfall: input.rainfall,
              weather: input.weather,
              soilConditionScore: input.soil,
              slopeTilt: input.tilt,
              recentEventsNearby: input.recentEventsNearby,
              recentEventCount: input.recentEventCount,
              historicalContext: input.historicalContext,
            },
            calculatedRiskScore: input.calculatedRiskScore,
            calculatedRiskLevel: input.calculatedRiskLevel,
          }),
        },
      ],
      // The project proxy may expose web-search capability on this model, which conflicts with JSON response mode. The prompt still sends structured JSON input, and the returned JSON is validated below.

    });

    const content = response.choices[0]?.message?.content;
    const raw = typeof content === "string" ? content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim() : "";
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const parsed = jsonStart >= 0 && jsonEnd > jsonStart ? JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) : null;
    const normalized = normalizeAssessment(parsed);
    if (!validAssessment(normalized)) {
      console.warn("[AI Risk] Invalid model payload", raw.slice(0, 1400));
      return safeFallback(input.language);
    }
    return { ...normalized, provider: "BUILT_IN_SERVER_LLM", model: "claude-haiku-4-5", status: "READY", generatedAt: new Date().toISOString() };
  } catch (error) {
    console.warn("[AI Risk] Model request failed", error instanceof Error ? error.message : "unknown error");
    return safeFallback(input.language);
  }
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

const assistantFallback = (language: AiLanguage) => language === "TA" ? "இந்த கேள்விக்கு பதிலளிக்க போதுமான சரிபார்க்கப்பட்ட தரவு என்னிடம் இல்லை." : language === "TE" ? "ఈ ప్రశ్నకు సమాధానం ఇవ్వడానికి నా వద్ద తగినంత ధృవీకరించబడిన డేటా లేదు." : language === "KN" ? "ಈ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ನನ್ನ ಬಳಿ ಸಾಕಷ್ಟು ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿ ಇಲ್ಲ." : language === "ML" ? "ഈ ചോദ്യത്തിന് ഉത്തരം നൽകാൻ മതിയായ സ്ഥിരീകരിച്ച ഡാറ്റ എന്റെ പക്കലില്ല." : "I don't have enough verified data to answer that.";

export async function answerLeWsQuestion(input: AiAssistantInput): Promise<{ provider: "BUILT_IN_SERVER_LLM"; status: "READY" | "INSUFFICIENT_DATA" | "UNAVAILABLE"; answer: string; generatedAt: string }> {
  if (!input.dataAvailable) return { provider: "BUILT_IN_SERVER_LLM", status: "INSUFFICIENT_DATA", answer: assistantFallback(input.language), generatedAt: new Date().toISOString() };
  try {
    const response = await invokeLLM({
      model: "claude-haiku-4-5",
      maxTokens: 500,
      messages: [
        { role: "system", content: "You are the LEWS contextual assistant. Answer only from the supplied current dashboard context. Never invent measurements, events, forecasts, locations, or authorities. If the question cannot be answered from the supplied context, reply with the exact safe meaning of: I don't have enough verified data to answer that. Answer in the requested language, in two or three concise sentences. Do not use Markdown or claim that a landslide is certain." },
        { role: "user", content: JSON.stringify({ question: input.question, requestedLanguage: input.language, currentVerifiedContext: input }) },
      ],
    });
    const answer = response.choices[0]?.message?.content;
    if (typeof answer !== "string" || answer.trim().length < 8) return { provider: "BUILT_IN_SERVER_LLM", status: "UNAVAILABLE", answer: assistantFallback(input.language), generatedAt: new Date().toISOString() };
    return { provider: "BUILT_IN_SERVER_LLM", status: "READY", answer: answer.trim().replace(/^```(?:text)?\s*/i, "").replace(/\s*```$/i, ""), generatedAt: new Date().toISOString() };
  } catch (error) {
    console.warn("[LEWS Assistant] Model request failed", error instanceof Error ? error.message : "unknown error");
    return { provider: "BUILT_IN_SERVER_LLM", status: "UNAVAILABLE", answer: assistantFallback(input.language), generatedAt: new Date().toISOString() };
  }
}
