import { describe, expect, it } from "vitest";
import { getDataPresentation } from "./dataPresentation";

describe("getDataPresentation", () => {
  it("prioritizes demonstration mode", () => {
    expect(getDataPresentation({ demoMode: true, available: true, queryError: false, eventCount: 3 }).tone).toBe("demo");
  });
  it("distinguishes live data from a reachable empty feed", () => {
    expect(getDataPresentation({ demoMode: false, available: true, queryError: false, eventCount: 2 }).tone).toBe("live");
    expect(getDataPresentation({ demoMode: false, available: true, queryError: false, eventCount: 0 }).tone).toBe("empty");
  });
  it("falls back when the external query fails", () => {
    const state = getDataPresentation({ demoMode: false, available: false, queryError: true, eventCount: 0 });
    expect(state.tone).toBe("fallback");
    expect(state.source).toBe("Demonstration dataset");
  });
});
