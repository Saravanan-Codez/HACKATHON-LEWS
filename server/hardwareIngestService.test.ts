import { describe, expect, it } from "vitest";
import { ingestTelemetryFromHardware, getAllLiveHardwareNodes } from "./services/hardwareIngestService";

describe("Hardware Ingest Service", () => {
  it("ingests nominal hardware telemetry and returns low risk", () => {
    const result = ingestTelemetryFromHardware({
      nodeId: "CRG-04",
      rainfallMm: 2.4,
      soilMoisture: 35.0,
      tiltDegrees: 0.8,
      batteryVoltage: 4.12,
      wifiRssiDbm: -62,
    });

    expect(result.success).toBe(true);
    expect(result.nodeId).toBe("CRG-04");
    expect(result.calculatedRiskLevel).toBe("LOW");
    expect(result.validation.status).toBe("ACCEPTED");
    expect(result.validation.isQuarantined).toBe(false);
  });

  it("identifies critical threshold when heavy rainfall and tilt combine", () => {
    const result = ingestTelemetryFromHardware({
      nodeId: "IDK-01",
      rainfallMm: 28.5,
      soilMoisture: 92.0,
      tiltDegrees: 8.5,
      batteryVoltage: 3.85,
    });

    expect(result.success).toBe(true);
    expect(result.calculatedRiskLevel).toBe("CRITICAL");
    expect(result.calculatedRiskScore).toBeGreaterThanOrEqual(75);
  });

  it("stores active hardware node state in live buffer", () => {
    const nodes = getAllLiveHardwareNodes();
    expect(nodes.length).toBeGreaterThanOrEqual(1);
    expect(nodes.some(n => n.nodeId === "IDK-01")).toBe(true);
  });
});
