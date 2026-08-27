export type ReportSyncCapability = "NOT_CONFIGURED" | "LOCAL_ONLY";

export type QueuedReport = {
  reportId: string;
  category: string;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  attachmentName?: string | null;
};

export const reportServiceStatus = () => ({
  mediaUpload: {
    capability: "NOT_CONFIGURED" as const,
    message: "Media metadata can be captured locally; no remote object-storage upload provider is configured.",
  },
  offlineSync: {
    capability: "LOCAL_ONLY" as const,
    message: "Reports can be queued locally and require a future authenticated sync endpoint.",
  },
});

export const validateQueuedReport = (report: QueuedReport) => Boolean(
  report.reportId && report.category && report.severity && Number.isFinite(report.latitude) && Number.isFinite(report.longitude),
);

export const flushOfflineQueue = async () => ({
  capability: "LOCAL_ONLY" as const,
  flushed: 0,
  message: "No remote sync endpoint configured; local queue was not transmitted.",
});
