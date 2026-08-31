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
      language: z.enum(["EN", "TA", "TE", "KN", "ML"]),
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
      language: z.enum(["EN", "TA", "TE", "KN", "ML"]),
      dataAvailable: z.boolean(),
    })).mutation(({ input }) => analyzeRiskWithLLM(input as { location: string; rainfall: number; weather: string; soil: number; tilt: number; recentEventsNearby: boolean; recentEventCount: number; historicalContext: string; calculatedRiskScore: number; calculatedRiskLevel: RiskLevel; language: AiLanguage; dataAvailable: boolean })),
  }),
  platform: router({
    capabilities: publicProcedure.query(() => [...platformServiceStatus(), { name: "Report media upload", capability: reportServiceStatus().mediaUpload.capability, source: "Local report workflow", message: reportServiceStatus().mediaUpload.message }, { name: "Offline report sync", capability: reportServiceStatus().offlineSync.capability, source: "Local report workflow", message: reportServiceStatus().offlineSync.message }]),
  }),
});

export type AppRouter = typeof appRouter;
