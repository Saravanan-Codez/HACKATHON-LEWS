import { describe, expect, it } from "vitest";
import { validateTelemetryReading, type SensorTelemetryInput } from "./services/anomalyValidationService";

describe("Landsora Anomaly Detection & Data Validation Service", () => {
  const baseReading: SensorTelemetryInput = {
    deviceId: "landsora-esp32-001",
    siteId: "KDG-03",
    capturedAtUtc: new Date().toISOString(),
    rainfallMmInterval: 14.5,
    soilMoisturePercent: 65.0,
    tiltDegrees: 0.065,
    temperatureC: 23.2,
    humidityPercent: 82.0,
    pressureHpa: 1013.2,
    batteryVoltage: 3.95,
    wifiRssiDbm: -62,
    sourceMode: "LIVE",
  };

  it("accepts valid normal telemetry with full confidence", () => {
    const result = validateTelemetryReading(baseReading);
    expect(result.status).toBe("ACCEPTED");
    expect(result.overallConfidence).toBe(100);
    expect(result.isQuarantined).toBe(false);
    expect(result.anomaliesDetected.length).toBe(0);
    expect(result.requiresOperatorReview).toBe(false);
  });

  it("quarantines negative rainfall as an impossible value and adjusts confidence", () => {
    const badReading = { ...baseReading, rainfallMmInterval: -12.4 };
    const result = validateTelemetryReading(badReading);
    expect(result.isQuarantined).toBe(true);
    expect(result.status).toBe("QUARANTINED");
    expect(result.anomaliesDetected).toContain("IMPOSSIBLE_VALUE");
    expect(result.overallConfidence).toBeLessThan(60);
    expect(result.requiresOperatorReview).toBe(true);
  });

  it("detects and quarantines sudden unrealistic tilt spikes", () => {
    const prevReading: SensorTelemetryInput = { ...baseReading, tiltDegrees: 0.055 };
    const spikeReading: SensorTelemetryInput = { ...baseReading, tiltDegrees: 0.22 }; // Jump > 0.08 in single sample
    const result = validateTelemetryReading(spikeReading, [prevReading]);

    expect(result.isQuarantined).toBe(true);
    expect(result.anomaliesDetected).toContain("SUDDEN_SPIKE");
    expect(result.overallConfidence).toBeLessThan(50);
    // Should fallback to safe previous tilt so bad data does not falsely spike risk
    expect(result.validatedTelemetry.tiltDegrees).toBe(0.055);
  });

  it("penalizes confidence when local rain gauge conflicts with external weather API", () => {
    const conflictingReading: SensorTelemetryInput = {
      ...baseReading,
      rainfallMmInterval: 32.0,
      externalWeatherRainfallMm: 2.0, // Large gap > 25mm
    };
    const result = validateTelemetryReading(conflictingReading);

    expect(result.status).toBe("ACCEPTED_WITH_WARNING");
    expect(result.isQuarantined).toBe(false);
    expect(result.anomaliesDetected).toContain("CROSS_SOURCE_DISAGREEMENT");
    expect(result.overallConfidence).toBe(80);
  });

  it("flags low battery voltage as a hardware degradation warning", () => {
    const lowBattReading: SensorTelemetryInput = { ...baseReading, batteryVoltage: 3.15 };
    const result = validateTelemetryReading(lowBattReading);

    expect(result.status).toBe("ACCEPTED_WITH_WARNING");
    expect(result.anomaliesDetected).toContain("LOW_BATTERY_DEGRADATION");
    expect(result.overallConfidence).toBe(85);
  });
});
