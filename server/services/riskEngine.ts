export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type RiskInputs = {
  rainfallScore: number;
  terrainScore: number;
  historicalLandslideScore: number;
  recentEventScore: number;
};

export function riskLevel(score: number): RiskLevel {
  if (score >= 76) return "CRITICAL";
  if (score >= 51) return "HIGH";
  if (score >= 26) return "MODERATE";
  return "LOW";
}

export function calculatePrototypeRisk(inputs: RiskInputs) {
  const values = Object.values(inputs).map(value => Math.max(0, Math.min(100, value)));
  const score = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  return { score, level: riskLevel(score), inputs };
}
