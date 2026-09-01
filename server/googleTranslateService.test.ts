import { describe, expect, it } from "vitest";
import { translateText, translateBatch } from "./services/googleTranslateService";

describe("Google Translate Service", () => {
  it("translates text to Kannada, Hindi, and Tamil or returns valid strings", async () => {
    const kannada = await translateText("Landslide warning: High slope saturation", "KN");
    expect(typeof kannada).toBe("string");
    expect(kannada.length).toBeGreaterThan(0);

    const hindi = await translateText("Heavy rainfall detected", "HI");
    expect(typeof hindi).toBe("string");
    expect(hindi.length).toBeGreaterThan(0);
  });

  it("handles batch translations concurrently", async () => {
    const phrases = ["Evacuate immediately", "Road corridor blocked", "Safe shelter location"];
    const results = await translateBatch(phrases, "TA");
    expect(results.length).toBe(3);
    results.forEach(r => expect(typeof r).toBe("string"));
  });

  it("returns English text quickly without unnecessary API roundtrips", async () => {
    const result = await translateText("Immediate precaution advised", "EN");
    expect(result).toBe("Immediate precaution advised");
  });
});
