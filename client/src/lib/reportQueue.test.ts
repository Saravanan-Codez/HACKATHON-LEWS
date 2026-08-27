import { describe, expect, it } from "vitest";
import { createQueuedReport, saveQueuedReport } from "./reportQueue";

describe("local report queue", () => {
  it("creates and stores a geolocated report with attachment metadata", () => {
    const writes: Array<{ key: string; value: string }> = [];
    const storage = { setItem: (key: string, value: string) => writes.push({ key, value }) };
    const report = createQueuedReport({
      reportId: "LEWS-2026-1001",
      category: "BLOCKED ROAD",
      severity: "HIGH",
      description: "Rockfall across the access road",
      location: { latitude: 13.3153, longitude: 75.7754 },
      attachment: "field-photo.jpg",
    }, new Date("2026-08-27T10:00:00.000Z"));
    saveQueuedReport(report, storage);
    expect(writes).toHaveLength(1);
    expect(writes[0]?.key).toBe("lews-report-queue");
    expect(JSON.parse(writes[0]?.value ?? "{}")).toMatchObject({ reportId: "LEWS-2026-1001", attachment: "field-photo.jpg", location: { latitude: 13.3153 } });
  });
});
