export type EonetEvent = {
  id: string;
  title: string;
  date: string;
  latitude: number;
  longitude: number;
  source: string;
  status: string;
};

export type EonetResult = {
  events: EonetEvent[];
  available: boolean;
  updatedAt: string | null;
  error: string | null;
};

type EonetPayload = {
  events?: Array<{
    id?: string;
    title?: string;
    closed?: string | null;
    categories?: Array<{ title?: string }>;
    sources?: Array<{ id?: string; url?: string }>;
    geometry?: Array<{ date?: string; type?: string; coordinates?: number[] }>;
  }>;
};

const DEFAULT_URL = "https://eonet.gsfc.nasa.gov/api/v3/events?category=landslides&status=open&limit=100";
const CACHE_MS = 5 * 60 * 1000;
let cache: { expiresAt: number; result: EonetResult } | null = null;

function normalizeEvent(event: NonNullable<EonetPayload["events"]>[number]): EonetEvent | null {
  const geometry = [...(event.geometry ?? [])].reverse().find(item => item.coordinates && item.coordinates.length >= 2);
  const longitude = geometry?.coordinates?.[0];
  const latitude = geometry?.coordinates?.[1];
  if (!event.id || !event.title || typeof latitude !== "number" || typeof longitude !== "number") return null;
  const source = event.sources?.find(item => item.id || item.url);
  return {
    id: event.id,
    title: event.title,
    date: geometry?.date ?? event.closed ?? new Date().toISOString(),
    latitude,
    longitude,
    source: source?.id || source?.url || "NASA EONET",
    status: event.closed ? "closed" : "open",
  };
}

export function normalizeEonetPayload(payload: EonetPayload): EonetEvent[] {
  return (payload.events ?? []).map(normalizeEvent).filter((event): event is EonetEvent => Boolean(event));
}

export async function fetchEonetEvents(force = false): Promise<EonetResult> {
  if (!force && cache && cache.expiresAt > Date.now()) return cache.result;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(process.env.NASA_EONET_URL || DEFAULT_URL, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`NASA EONET returned HTTP ${response.status}`);
    const payload = await response.json() as EonetPayload;
    const result: EonetResult = { events: normalizeEonetPayload(payload), available: true, updatedAt: new Date().toISOString(), error: null };
    cache = { expiresAt: Date.now() + CACHE_MS, result };
    return result;
  } catch (error) {
    const result: EonetResult = { events: [], available: false, updatedAt: null, error: error instanceof Error ? error.message : "NASA EONET unavailable" };
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

export function clearEonetCache() { cache = null; }
