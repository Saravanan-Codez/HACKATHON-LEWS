import { describe, expect, it } from "vitest";
import { flushOfflineQueue, reportServiceStatus, validateQueuedReport } from "./services/reportSyncService";

describe("report sync boundary", () => {
  it("exposes local-only upload and sync capabilities", () => {
    const status = reportServiceStatus();
    expect(status.mediaUpload.capability).toBe("NOT_CONFIGURED");
    expect(status.offlineSync.capability).toBe("LOCAL_ONLY");
  });

  it("validates a geolocated queued report", () => {
    expect(validateQueuedReport({ reportId: "LEWS-2026-1000", category: "SLOPE CRACK", severity: "HIGH", description: "Visible crack", latitude: 13.3, longitude: 75.7 })).toBe(true);
    expect(validateQueuedReport({ reportId: "", category: "", severity: "", description: "", latitude: Number.NaN, longitude: 75.7 })).toBe(false);
  });

  it("does not claim to flush local reports to an unavailable backend", async () => {
    const result = await flushOfflineQueue();
    expect(result.flushed).toBe(0);
    expect(result.message).toContain("not transmitted");
  });
});
