/* Client-Side Anomaly Validator & Quarantine Storage for Landsora */
import { validateTelemetryReading, type SensorTelemetryInput, type ValidationSummary, type QuarantineRecord } from "../../../server/services/anomalyValidationService";

const QUARANTINE_KEY = "landsora_quarantine_queue";

export function runLiveValidation(
  current: SensorTelemetryInput,
  history: SensorTelemetryInput[] = []
): ValidationSummary {
  return validateTelemetryReading(current, history);
}

export function getStoredQuarantine(): QuarantineRecord[] {
  try {
    const raw = localStorage.getItem(QUARANTINE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuarantineRecord(record: QuarantineRecord) {
  try {
    const existing = getStoredQuarantine();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)].slice(0, 20);
    localStorage.setItem(QUARANTINE_KEY, JSON.stringify(updated));
  } catch {
    // Graceful fallback
  }
}

export function clearQuarantineRecords() {
  try {
    localStorage.removeItem(QUARANTINE_KEY);
  } catch {
    // Graceful fallback
  }
}
