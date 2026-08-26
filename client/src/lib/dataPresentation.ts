export type DataPresentationInput = {
  demoMode: boolean;
  available: boolean;
  queryError: boolean;
  eventCount: number;
};

export function getDataPresentation(input: DataPresentationInput) {
  if (input.demoMode) return { label: "DEMONSTRATION DATA", source: "Demonstration dataset", tone: "demo" as const, message: "DEMO MODE — Demonstration data is active and does not represent an official warning." };
  if (input.queryError || !input.available) return { label: "DATA FALLBACK", source: "Demonstration dataset", tone: "fallback" as const, message: "Live external data unavailable. Showing demonstration data." };
  if (input.eventCount === 0) return { label: "LIVE DATA / NO EVENTS", source: "NASA EONET", tone: "empty" as const, message: "NASA EONET is reachable, but the current landslide feed has no reported events." };
  return { label: "LIVE DATA / NASA EONET", source: "NASA EONET", tone: "live" as const, message: "NASA EONET reported-event context is active; it is not a prediction or certified warning." };
}
