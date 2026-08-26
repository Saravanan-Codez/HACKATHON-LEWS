import type { EonetEvent } from "./eonetService";

export type HistoricalLayer = {
  id: "isro-bhuvan";
  label: string;
  enabled: false;
  events: EonetEvent[];
  note: string;
};

/**
 * Reserved integration boundary for a legally accessible ISRO/Bhuvan dataset.
 * Keep disabled until an approved public service or exported dataset is configured.
 */
export function getHistoricalLandslideLayer(): HistoricalLayer {
  return {
    id: "isro-bhuvan",
    label: "ISRO / Bhuvan historical layer",
    enabled: false,
    events: [],
    note: "Historical layer reserved for an approved public dataset; no direct API is assumed.",
  };
}
