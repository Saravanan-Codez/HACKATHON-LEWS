import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { fetchEonetEvents } from "./services/eonetService";
import { getHistoricalLandslideLayer } from "./services/historicalLandslideService";
import { calculatePrototypeRisk } from "./services/riskEngine";
import { platformServiceStatus } from "./services/platformServices";
import { reportServiceStatus } from "./services/reportSyncService";
import { analyzeRiskWithLLM, answerLeWsQuestion, type AiLanguage, type RiskLevel } from "./services/aiRiskService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  landslides: router({
    list: publicProcedure.query(() => fetchEonetEvents()),
    historicalLayer: publicProcedure.query(() => getHistoricalLandslideLayer()),
  }),
  risk: router({
    score: publicProcedure.input(z.object({ rainfallScore: z.number(), terrainScore: z.number(), historicalLandslideScore: z.number(), recentEventScore: z.number() })).query(({ input }) => calculatePrototypeRisk(input)),
    assistant: publicProcedure.input(z.object({
      question: z.string().min(3).max(320),
      language: z.enum(["EN", "HI", "TA", "TE", "KN", "ML"]),
      location: z.string().min(1).max(160),
      rainfall: z.number().min(0).max(100),
      weather: z.string().min(1).max(80),
      soil: z.number().min(0).max(100),
      tilt: z.number().min(0).max(180),
      recentEventCount: z.number().int().min(0).max(1000),
      calculatedRiskScore: z.number().int().min(0).max(100),
      calculatedRiskLevel: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
      dataAvailable: z.boolean(),
    })).mutation(({ input }) => answerLeWsQuestion(input)),
    aiAnalysis: publicProcedure.input(z.object({
      location: z.string().min(1).max(160),
      rainfall: z.number().min(0).max(100),
      weather: z.string().min(1).max(80),
      soil: z.number().min(0).max(100),
      tilt: z.number().min(0).max(180),
      recentEventsNearby: z.boolean(),
      recentEventCount: z.number().int().min(0).max(1000),
      historicalContext: z.string().min(1).max(240),
      calculatedRiskScore: z.number().int().min(0).max(100),
      calculatedRiskLevel: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
      language: z.enum(["EN", "HI", "TA", "TE", "KN", "ML"]),
      dataAvailable: z.boolean(),
    })).mutation(({ input }) => analyzeRiskWithLLM(input as { location: string; rainfall: number; weather: string; soil: number; tilt: number; recentEventsNearby: boolean; recentEventCount: number; historicalContext: string; calculatedRiskScore: number; calculatedRiskLevel: RiskLevel; language: AiLanguage; dataAvailable: boolean })),
  }),
  platform: router({
    capabilities: publicProcedure.query(() => [...platformServiceStatus(), { name: "Report media upload", capability: reportServiceStatus().mediaUpload.capability, source: "Local report workflow", message: reportServiceStatus().mediaUpload.message }, { name: "Offline report sync", capability: reportServiceStatus().offlineSync.capability, source: "Local report workflow", message: reportServiceStatus().offlineSync.message }]),
  }),
  iot: router({
    deviceHealth: publicProcedure.input(z.object({ nodeId: z.string().optional() })).query(({ input }) => {
      const nodeId = input.nodeId || "KDG-03";
      return {
        nodeId,
        deviceId: `landsora-esp32-${nodeId.toLowerCase()}`,
        status: "ONLINE",
        firmwareVersion: "1.0.0",
        batteryVoltage: 3.92,
        batteryPercent: 86,
        wifiRssiDbm: -62,
        freeHeapBytes: 184200,
        uptimeSeconds: 124800,
        sensors: [
          { name: "Tipping Bucket Rain Gauge", pin: "GPIO 4 (Interrupt)", status: "OK", lastSampleTime: new Date().toISOString() },
          { name: "Capacitive Soil Moisture v1.2", pin: "GPIO 34 (ADC1)", status: "OK", lastSampleTime: new Date().toISOString() },
          { name: "MPU6050 Dual-Axis Inclinometer", pin: "I2C (SDA 21 / SCL 22)", status: "OK", lastSampleTime: new Date().toISOString() },
          { name: "BME280 Atmospheric Sensor", pin: "I2C (0x76)", status: "OK", lastSampleTime: new Date().toISOString() },
        ],
        lastSeenUtc: new Date().toISOString(),
      };
    }),
  }),
  validation: router({
    validate: publicProcedure.input(z.object({
      deviceId: z.string(),
      siteId: z.string(),
      capturedAtUtc: z.string(),
      rainfallMmInterval: z.number(),
      soilMoisturePercent: z.number(),
      tiltDegrees: z.number(),
      batteryVoltage: z.number().optional(),
      wifiRssiDbm: z.number().optional(),
      externalWeatherRainfallMm: z.number().optional(),
    })).mutation(({ input }) => {
      const { validateTelemetryReading } = require("./services/anomalyValidationService");
      return validateTelemetryReading(input);
    }),
  }),
  alerts: router({
    operatorApproval: publicProcedure.input(z.object({
      zoneId: z.string(),
      riskScore: z.number(),
      riskLevel: z.string(),
      operatorName: z.string(),
      language: z.enum(["EN", "HI", "TA", "TE", "KN", "ML"]),
      channels: z.array(z.string()),
    })).mutation(({ input }) => {
      const dispatchId = `DISPATCH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        dispatchId,
        status: "APPROVED_AND_DELIVERED",
        approvedAt: new Date().toISOString(),
        operator: input.operatorName || "Officer In-Charge (DDMA)",
        zoneId: input.zoneId,
        riskScore: input.riskScore,
        riskLevel: input.riskLevel,
        recipientsSimulated: {
          smsPanchayatCount: 24,
          pushSubscribersCount: 1420,
          policeUnitsNotified: 4,
        },
        deliveryLogs: [
          { channel: "SMS_PANCHAYAT", status: "DELIVERED", timestamp: new Date().toISOString(), messagePreview: `[LANDSORA EMERGENCY] ${input.zoneId} risk score ${input.riskScore}/100 (${input.riskLevel}). Immediate hillside precaution advised.` },
          { channel: "BROWSER_PUSH", status: "BROADCASTED", timestamp: new Date().toISOString(), messagePreview: `Landsora Live Advisory: High slope saturation in ${input.zoneId}. Avoid mountain corridors.` },
        ],
      };
    }),
  }),
});


export type AppRouter = typeof appRouter;
