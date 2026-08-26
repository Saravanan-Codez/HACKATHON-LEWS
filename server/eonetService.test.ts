import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchEonetEvents, normalizeEonetPayload, clearEonetCache } from "./services/eonetService";

describe("eonetService", () => {
  afterEach(() => { clearEonetCache(); vi.unstubAllEnvs(); });

  it("returns an explicit unavailable result when the public feed fails", async () => {
    vi.stubEnv("NASA_EONET_URL", "http://127.0.0.1:1/unavailable");
    const result = await fetchEonetEvents(true);
    expect(result.available).toBe(false);
    expect(result.events).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it("normalizes valid events and ignores malformed geometry", () => {
    const events = normalizeEonetPayload({ events: [
      { id: "EONET_1", title: "Reported slope failure", geometry: [{ date: "2026-08-25T10:00:00Z", coordinates: [75.8, 12.3] }], sources: [{ id: "USGS" }] },
      { id: "EONET_2", title: "Missing location", geometry: [{ date: "2026-08-25T10:00:00Z", coordinates: [] }] },
    ] });
    expect(events).toEqual([{ id: "EONET_1", title: "Reported slope failure", date: "2026-08-25T10:00:00Z", latitude: 12.3, longitude: 75.8, source: "USGS", status: "open" }]);
  });
});
