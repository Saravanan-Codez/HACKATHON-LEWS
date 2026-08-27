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
  }),
  platform: router({
    capabilities: publicProcedure.query(() => [...platformServiceStatus(), { name: "Report media upload", capability: reportServiceStatus().mediaUpload.capability, source: "Local report workflow", message: reportServiceStatus().mediaUpload.message }, { name: "Offline report sync", capability: reportServiceStatus().offlineSync.capability, source: "Local report workflow", message: reportServiceStatus().offlineSync.message }]),
  }),
});

export type AppRouter = typeof appRouter;
