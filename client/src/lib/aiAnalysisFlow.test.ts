import { describe, expect, it } from "vitest";
import { shouldRefreshAiAnalysis } from "./aiAnalysisFlow";

describe("AI analysis refresh flow", () => {
  it("refreshes only when a live risk category changes", () => {
    expect(shouldRefreshAiAnalysis({ previousLevel: "MODERATE", currentLevel: "HIGH", liveAvailable: true, demoMode: false })).toBe(true);
    expect(shouldRefreshAiAnalysis({ previousLevel: "HIGH", currentLevel: "HIGH", liveAvailable: true, demoMode: false })).toBe(false);
  });

  it("does not refresh from demo or unavailable data", () => {
    expect(shouldRefreshAiAnalysis({ previousLevel: null, currentLevel: "LOW", liveAvailable: false, demoMode: false })).toBe(false);
    expect(shouldRefreshAiAnalysis({ previousLevel: "MODERATE", currentLevel: "HIGH", liveAvailable: true, demoMode: true })).toBe(false);
  });
});
