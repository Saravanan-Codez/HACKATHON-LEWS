import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { ingestTelemetryFromHardware } from "../server/services/hardwareIngestService";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

// REST Hardware Telemetry Ingest Endpoint (for ESP32, Arduino, MicroPython, GSM/LoRa Gateways)
app.post("/api/telemetry/ingest", (req, res) => {
  try {
    const {
      nodeId,
      rainfallMm,
      soilMoisture,
      tiltDegrees,
      batteryVoltage,
      wifiRssiDbm,
      temperatureC,
      humidity,
      apiKey,
    } = req.body;

    if (!nodeId || rainfallMm === undefined || soilMoisture === undefined || tiltDegrees === undefined) {
      return res.status(400).json({
        error: "Missing required telemetry fields: nodeId, rainfallMm, soilMoisture, tiltDegrees",
      });
    }

    const result = ingestTelemetryFromHardware({
      nodeId: String(nodeId),
      rainfallMm: Number(rainfallMm),
      soilMoisture: Number(soilMoisture),
      tiltDegrees: Number(tiltDegrees),
      batteryVoltage: batteryVoltage !== undefined ? Number(batteryVoltage) : undefined,
      wifiRssiDbm: wifiRssiDbm !== undefined ? Number(wifiRssiDbm) : undefined,
      temperatureC: temperatureC !== undefined ? Number(temperatureC) : undefined,
      humidity: humidity !== undefined ? Number(humidity) : undefined,
      apiKey: apiKey ? String(apiKey) : undefined,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Telemetry ingestion error" });
  }
});

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
