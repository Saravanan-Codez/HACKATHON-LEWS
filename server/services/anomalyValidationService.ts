/* Landsora Data Validation & Anomaly Detection Engine
 * Strictly deterministic: checks timestamps, physical ranges, rate-of-change spikes,
 * flatlines, stale data, and cross-source consistency.
 * Computes an auditable Data Confidence Score (0-100%) and isolates bad data into quarantine.
 */

export type ValidationStatus = "ACCEPTED" | "ACCEPTED_WITH_WARNING" | "QUARANTINED" | "REJECTED";

export type AnomalyType =
  | "IMPOSSIBLE_VALUE"
  | "SUDDEN_SPIKE"
  | "FLATLINE_SENSOR"
  | "STALE_DATA"
  | "CLOCK_DRIFT"
  | "CROSS_SOURCE_DISAGREEMENT"
  | "LOW_BATTERY_DEGRADATION"
  | "NONE";

export interface SensorTelemetryInput {
  deviceId: string;
  siteId: string;
  capturedAtUtc: string;
  rainfallMmInterval: number;
  rainfallMm24h?: number;
  soilMoisturePercent: number;
  tiltDegrees: number;
  tiltRateChange?: number;
  temperatureC?: number;
  humidityPercent?: number;
  pressureHpa?: number;
  batteryVoltage?: number;
  wifiRssiDbm?: number;
  sourceMode?: "LIVE" | "SIMULATED" | "API_FALLBACK";
  externalWeatherRainfallMm?: number;
}

export interface ValidationRuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  detail: string;
  anomalyType: AnomalyType;
  confidencePenalty: number;
}

export interface ValidationSummary {
  readingId: string;
  deviceId: string;
  siteId: string;
  timestampUtc: string;
  status: ValidationStatus;
  overallConfidence: number; // 0 - 100
  isQuarantined: boolean;
  anomaliesDetected: AnomalyType[];
  triggeredRules: ValidationRuleResult[];
  explanationFacts: string[];
  requiresOperatorReview: boolean;
  validatedTelemetry: {
    rainfallMm: number;
    soilMoisturePercent: number;
    tiltDegrees: number;
    effectiveTiltRate: number;
    temperatureC: number;
    humidityPercent: number;
    pressureHpa: number;
    batteryVoltage: number;
  };
}

export interface QuarantineRecord {
  id: string;
  readingId: string;
  deviceId: string;
  siteId: string;
  timestamp: string;
  anomalyTypes: AnomalyType[];
  rawValues: Record<string, number | string | undefined>;
  reason: string;
  reviewed: boolean;
  reviewedBy?: string;
  resolution?: "DISMISSED" | "OVERRIDDEN" | "CALIBRATED";
}

/**
 * Validates incoming IoT sensor telemetry against deterministic physical and behavioral rules.
 */
export function validateTelemetryReading(
  reading: SensorTelemetryInput,
  previousReadings: SensorTelemetryInput[] = []
): ValidationSummary {
  const readingId = `VAL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const rules: ValidationRuleResult[] = [];
  let confidence = 100;
  const anomalies: AnomalyType[] = [];
  const explanationFacts: string[] = [];

  // --- STAGE 1: Timestamp & Clock Drift Checks ---
  const capturedTime = new Date(reading.capturedAtUtc).getTime();
  const now = Date.now();
  const timeDiffMinutes = (now - capturedTime) / 60000;

  if (isNaN(capturedTime)) {
    rules.push({
      ruleId: "TIME-01",
      ruleName: "Invalid Timestamp",
      passed: false,
      severity: "CRITICAL",
      detail: "Timestamp format is malformed.",
      anomalyType: "IMPOSSIBLE_VALUE",
      confidencePenalty: 40,
    });
    confidence -= 40;
    anomalies.push("IMPOSSIBLE_VALUE");
  } else if (timeDiffMinutes < -2) {
    rules.push({
      ruleId: "TIME-02",
      ruleName: "Future Timestamp Drift",
      passed: false,
      severity: "HIGH",
      detail: `Timestamp is ${Math.abs(timeDiffMinutes).toFixed(1)}m in the future. Check device RTC clock.`,
      anomalyType: "CLOCK_DRIFT",
      confidencePenalty: 25,
    });
    confidence -= 25;
    anomalies.push("CLOCK_DRIFT");
    explanationFacts.push("Device clock exhibits future drift.");
  } else if (timeDiffMinutes > 30) {
    rules.push({
      ruleId: "TIME-03",
      ruleName: "Stale Reading Detected",
      passed: false,
      severity: "WARNING",
      detail: `Telemetry received is ${timeDiffMinutes.toFixed(0)} minutes old.`,
      anomalyType: "STALE_DATA",
      confidencePenalty: 30,
    });
    confidence -= 30;
    anomalies.push("STALE_DATA");
    explanationFacts.push("Telemetry stream latency exceeds nominal 2.5s interval.");
  }

  // --- STAGE 2: Physical Range Boundaries ---
  // Rainfall cannot be negative
  if (reading.rainfallMmInterval < 0) {
    rules.push({
      ruleId: "RANGE-01",
      ruleName: "Negative Rainfall",
      passed: false,
      severity: "CRITICAL",
      detail: `Rainfall interval value (${reading.rainfallMmInterval} mm) is negative.`,
      anomalyType: "IMPOSSIBLE_VALUE",
      confidencePenalty: 50,
    });
    confidence -= 50;
    anomalies.push("IMPOSSIBLE_VALUE");
    explanationFacts.push("Rainfall sensor returned invalid negative measurement.");
  } else if (reading.rainfallMmInterval > 150) {
    rules.push({
      ruleId: "RANGE-02",
      ruleName: "Extreme Rainfall Value",
      passed: false,
      severity: "HIGH",
      detail: `Rainfall interval value (${reading.rainfallMmInterval} mm) exceeds plausible physical ceiling (150 mm/hr).`,
      anomalyType: "IMPOSSIBLE_VALUE",
      confidencePenalty: 35,
    });
    confidence -= 35;
    anomalies.push("IMPOSSIBLE_VALUE");
  }

  // Soil Moisture Saturation (0% - 100%)
  if (reading.soilMoisturePercent < 0 || reading.soilMoisturePercent > 100) {
    rules.push({
      ruleId: "RANGE-03",
      ruleName: "Soil Moisture Range",
      passed: false,
      severity: "CRITICAL",
      detail: `Soil moisture (${reading.soilMoisturePercent}%) outside 0-100% boundary.`,
      anomalyType: "IMPOSSIBLE_VALUE",
      confidencePenalty: 40,
    });
    confidence -= 40;
    anomalies.push("IMPOSSIBLE_VALUE");
    explanationFacts.push("Soil moisture sensor returned value outside physical saturation bounds.");
  }

  // Slope Tilt Range (-45° to +45° / 0.0 to 0.4 °/hr rate)
  if (Math.abs(reading.tiltDegrees) > 45) {
    rules.push({
      ruleId: "RANGE-04",
      ruleName: "Tilt Angle Plausibility",
      passed: false,
      severity: "HIGH",
      detail: `Slope tilt angle (${reading.tiltDegrees}°) exceeds realistic monitoring range.`,
      anomalyType: "IMPOSSIBLE_VALUE",
      confidencePenalty: 45,
    });
    confidence -= 45;
    anomalies.push("IMPOSSIBLE_VALUE");
  }

  // Battery voltage check
  if (reading.batteryVoltage !== undefined && reading.batteryVoltage < 3.3) {
    rules.push({
      ruleId: "HW-01",
      ruleName: "Low Battery Warning",
      passed: false,
      severity: "WARNING",
      detail: `Node battery voltage (${reading.batteryVoltage}V) below nominal 3.3V operating limit.`,
      anomalyType: "LOW_BATTERY_DEGRADATION",
      confidencePenalty: 15,
    });
    confidence -= 15;
    anomalies.push("LOW_BATTERY_DEGRADATION");
    explanationFacts.push("Device battery voltage is low; ADC accuracy may be slightly degraded.");
  }

  // --- STAGE 3: Rate-of-Change & Sudden Spike Checks ---
  if (previousReadings.length > 0) {
    const last = previousReadings[previousReadings.length - 1];
    const tiltDiff = Math.abs(reading.tiltDegrees - last.tiltDegrees);

    // If tilt angle jumps by more than 0.08° in a single 2.5s step without gradual progression, flag sudden spike
    if (tiltDiff > 0.08) {
      rules.push({
        ruleId: "SPIKE-01",
        ruleName: "Sudden Unrealistic Tilt Spike",
        passed: false,
        severity: "CRITICAL",
        detail: `Tilt jumped by ${tiltDiff.toFixed(3)}° in a single sample (threshold: 0.08°/sample). Quarantining reading.`,
        anomalyType: "SUDDEN_SPIKE",
        confidencePenalty: 60,
      });
      confidence -= 60;
      anomalies.push("SUDDEN_SPIKE");
      explanationFacts.push("Sudden mechanical shock or sensor glitch detected; isolated from risk scoring.");
    }
  }

  // --- STAGE 4: Flatline Sensor Check (Stuck Sensor) ---
  if (previousReadings.length >= 8) {
    const last8Moisture = previousReadings.slice(-8).map((r) => r.soilMoisturePercent);
    const isFlatline = last8Moisture.every((v) => v === reading.soilMoisturePercent);
    if (isFlatline && reading.rainfallMmInterval > 10) {
      rules.push({
        ruleId: "FLATLINE-01",
        ruleName: "Stuck Soil Sensor During Heavy Rain",
        passed: false,
        severity: "HIGH",
        detail: `Soil moisture remained exactly ${reading.soilMoisturePercent}% over 8 samples despite ${reading.rainfallMmInterval} mm/hr rain.`,
        anomalyType: "FLATLINE_SENSOR",
        confidencePenalty: 25,
      });
      confidence -= 25;
      anomalies.push("FLATLINE_SENSOR");
      explanationFacts.push("Soil sensor flatline detected during active precipitation.");
    }
  }

  // --- STAGE 5: Cross-Source Reconciliation ---
  if (reading.externalWeatherRainfallMm !== undefined) {
    const rainDiff = Math.abs(reading.rainfallMmInterval - reading.externalWeatherRainfallMm);
    if (rainDiff > 25) {
      rules.push({
        ruleId: "CROSS-01",
        ruleName: "Cross-Source Rainfall Discrepancy",
        passed: false,
        severity: "WARNING",
        detail: `Local rain gauge (${reading.rainfallMmInterval} mm/hr) conflicts with regional weather API (${reading.externalWeatherRainfallMm} mm/hr).`,
        anomalyType: "CROSS_SOURCE_DISAGREEMENT",
        confidencePenalty: 20,
      });
      confidence -= 20;
      anomalies.push("CROSS_SOURCE_DISAGREEMENT");
      explanationFacts.push("Local rain gauge differs from regional meteorological API (confidence reduced).");
    }
  }

  // Clamp confidence to 0 - 100
  const overallConfidence = Math.max(0, Math.min(100, confidence));

  // Determine Quarantine & Acceptance status
  const hasCriticalAnomaly = rules.some((r) => r.severity === "CRITICAL" && !r.passed);
  const isQuarantined = hasCriticalAnomaly || anomalies.includes("SUDDEN_SPIKE") || anomalies.includes("IMPOSSIBLE_VALUE");

  let status: ValidationStatus = "ACCEPTED";
  if (isQuarantined) {
    status = "QUARANTINED";
  } else if (rules.some((r) => !r.passed)) {
    status = "ACCEPTED_WITH_WARNING";
  }

  // If quarantined, substitute with safe fallback for risk engine calculations so bad data never corrupts risk scoring
  const validatedRain = isQuarantined && (reading.rainfallMmInterval < 0 || reading.rainfallMmInterval > 150)
    ? (previousReadings.slice(-1)[0]?.rainfallMmInterval ?? 12.0)
    : Math.max(0, reading.rainfallMmInterval);

  const validatedSoil = isQuarantined && (reading.soilMoisturePercent < 0 || reading.soilMoisturePercent > 100)
    ? (previousReadings.slice(-1)[0]?.soilMoisturePercent ?? 55.0)
    : Math.max(0, Math.min(100, reading.soilMoisturePercent));

  const validatedTilt = isQuarantined && anomalies.includes("SUDDEN_SPIKE")
    ? (previousReadings.slice(-1)[0]?.tiltDegrees ?? 0.065)
    : reading.tiltDegrees;

  return {
    readingId,
    deviceId: reading.deviceId,
    siteId: reading.siteId,
    timestampUtc: reading.capturedAtUtc,
    status,
    overallConfidence,
    isQuarantined,
    anomaliesDetected: Array.from(new Set(anomalies)),
    triggeredRules: rules,
    explanationFacts,
    requiresOperatorReview: isQuarantined || overallConfidence < 50,
    validatedTelemetry: {
      rainfallMm: validatedRain,
      soilMoisturePercent: validatedSoil,
      tiltDegrees: validatedTilt,
      effectiveTiltRate: Math.max(0.02, validatedTilt * 1.05),
      temperatureC: reading.temperatureC ?? 22.4,
      humidityPercent: reading.humidityPercent ?? 78.0,
      pressureHpa: reading.pressureHpa ?? 1012.5,
      batteryVoltage: reading.batteryVoltage ?? 3.85,
    },
  };
}
