import { describe, expect, it, vi } from "vitest";
import { invokeLLM } from "./_core/llm";
import { analyzeRiskWithLLM, answerLeWsQuestion, normalizeAssessment, supportedRiskLevels } from "./services/aiRiskService";

vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));

describe("AI risk intelligence safety contract", () => {
  it("does not call the model when real-time source data is unavailable", async () => {
    const result = await analyzeRiskWithLLM({
      location: "Kodagu",
      rainfall: 0,
      weather: "UNKNOWN",
      soil: 0,
      tilt: 0,
      recentEventsNearby: false,
      recentEventCount: 0,
      historicalContext: "Source unavailable",
      calculatedRiskScore: 0,
      calculatedRiskLevel: "LOW",
      language: "TA",
      dataAvailable: false,
    });
    expect(result.status).toBe("INSUFFICIENT_DATA");
    expect(result.assessment).toContain("AI");
    expect(result.warning).toMatch(/[^\x00-\x7F]/);
  });

  it("returns the safe assistant response when verified data is unavailable", async () => {
    const result = await answerLeWsQuestion({ question: "What should residents do now?", language: "ML", location: "Wayanad", rainfall: 0, weather: "UNKNOWN", soil: 0, tilt: 0, recentEventCount: 0, calculatedRiskScore: 0, calculatedRiskLevel: "LOW", dataAvailable: false });
    expect(result.status).toBe("INSUFFICIENT_DATA");
    expect(result.answer).toMatch(/[^\\x00-\\x7F]/);
  });

  it("accepts a successful multilingual assessment while normalizing localized confidence", async () => {
    vi.mocked(invokeLLM).mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ riskLevel: "MODERATE", assessment: "மிதமான அபாயம்.", why: "மழை அதிகரித்துள்ளது.", factors: ["கனமழை"], actions: ["அதிகாரிகளின் அறிவுறுத்தல்களைப் பின்பற்றவும்."], warning: "அதிகாரப்பூர்வ அறிவுறுத்தல்களைப் பின்பற்றவும்.", confidence: "மிதமான" }) } }] } as never);
    const result = await analyzeRiskWithLLM({ location: "Nilgiris", rainfall: 24, weather: "HEAVY RAIN", soil: 72, tilt: 0.09, recentEventsNearby: false, recentEventCount: 0, historicalContext: "NASA EONET feed available", calculatedRiskScore: 58, calculatedRiskLevel: "MODERATE", language: "TA", dataAvailable: true });
    expect(result.status).toBe("READY");
    expect(result.riskLevel).toBe("MODERATE");
    expect(result.confidence).toBe("MEDIUM");
    expect(result.assessment).toContain("மிதமான");
  });

  it("falls back when a model response is invalid", async () => {
    vi.mocked(invokeLLM).mockResolvedValueOnce({ choices: [{ message: { content: "not json" } }] } as never);
    const result = await analyzeRiskWithLLM({ location: "Wayanad", rainfall: 22, weather: "HEAVY RAIN", soil: 80, tilt: 0.1, recentEventsNearby: true, recentEventCount: 2, historicalContext: "NASA EONET feed available", calculatedRiskScore: 64, calculatedRiskLevel: "HIGH", language: "EN", dataAvailable: true });
    expect(result.status).toBe("UNAVAILABLE");
    expect(result.riskLevel).toBe("LOW");
  });

  it("returns a contextual assistant answer from the supplied data", async () => {
    vi.mocked(invokeLLM).mockResolvedValueOnce({ choices: [{ message: { content: "Residents should follow current official advisories and avoid unstable slopes while heavy rain continues." } }] } as never);
    const result = await answerLeWsQuestion({ question: "What should residents do now?", language: "EN", location: "Kodagu", rainfall: 24, weather: "HEAVY RAIN", soil: 78, tilt: 0.08, recentEventCount: 0, calculatedRiskScore: 58, calculatedRiskLevel: "MODERATE", dataAvailable: true });
    expect(result.status).toBe("READY");
    expect(result.answer).toContain("official advisories");
  });

  it("normalizes localized risk and confidence enum values", () => {
    expect(normalizeAssessment({ riskLevel: "ഗുരുതര", confidence: "മിതമായ", assessment: "x", why: "x", factors: ["x"], actions: ["x"], warning: "x" })).toMatchObject({ riskLevel: "CRITICAL", confidence: "MEDIUM" });
  });

  it("keeps the deterministic risk-level vocabulary explicit", () => {
    expect(supportedRiskLevels).toEqual(["LOW", "MODERATE", "HIGH", "CRITICAL"]);
  });
});
