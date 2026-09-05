import { describe, expect, it } from "vitest";
import { fetchLiveStationTelemetry } from "./services/liveTelemetryService";

describe("Live Telemetry Service (Open-Meteo & USGS)", () => {
  it("fetches real environmental data for Kodagu or returns valid fallback snapshot", async () => {
    const result = await fetchLiveStationTelemetry(12.3375, 75.8069, "KDG-03");
    expect(result).toBeDefined();
    expect(result.zoneId).toBe("KDG-03");
    expect(typeof result.temperatureC).toBe("number");
    expect(typeof result.soilMoisturePct).toBe("number");
    expect(result.soilMoisturePct).toBeGreaterThanOrEqual(0);
    expect(result.soilMoisturePct).toBeLessThanOrEqual(100);
    expect(typeof result.geotechnicalAnalysis.factorOfSafety).toBe("number");
    expect(["OPEN_METEO_LIVE", "CACHED_LIVE", "FALLBACK"]).toContain(result.source);

    // Open-Meteo Flood API validation
    expect(result.hydrology).toBeDefined();
    expect(typeof result.hydrology.riverDischargeM3s).toBe("number");
    expect(Array.isArray(result.hydrology.dailyDischargeForecast)).toBe(true);

    // Open-Meteo Air Quality API validation
    expect(result.airQuality).toBeDefined();
    expect(typeof result.airQuality.usAqi).toBe("number");
    expect(typeof result.airQuality.pm25).toBe("number");
    expect(typeof result.airQuality.pm10).toBe("number");

    // Multi-depth soil stratum profile validation
    expect(result.soilMoistureProfile).toBeDefined();
    expect(typeof result.soilMoistureProfile.depth0to1cm).toBe("number");
    expect(typeof result.soilMoistureProfile.depth27to81cm).toBe("number");
  });

  it("fetches live data for international stations (e.g. Mount Fuji, Japan)", async () => {
    const result = await fetchLiveStationTelemetry(35.3606, 138.7274, "FUJ-01");
    expect(result).toBeDefined();
    expect(result.zoneId).toBe("FUJ-01");
    expect(typeof result.elevationMeters).toBe("number");
    expect(Array.isArray(result.seismicEvents)).toBe(true);
    expect(result.hydrology).toBeDefined();
    expect(result.airQuality).toBeDefined();
  });
});
