export type LocalQueuedReport = {
  reportId: string;
  category: string;
  severity: string;
  description: string;
  location: { latitude: number; longitude: number };
  attachment: string | null;
  createdAt: string;
};

export const createQueuedReport = (input: Omit<LocalQueuedReport, "createdAt">, now = new Date()) => ({
  ...input,
  createdAt: now.toISOString(),
});

export const saveQueuedReport = (report: LocalQueuedReport, storage: Pick<Storage, "setItem"> = window.localStorage) => {
  storage.setItem("lews-report-queue", JSON.stringify(report));
  return report;
};
