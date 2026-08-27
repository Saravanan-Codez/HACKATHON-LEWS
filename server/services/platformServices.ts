export type ServiceCapability = "AVAILABLE" | "SIMULATED" | "NOT_CONFIGURED" | "UNAVAILABLE";

export type ServiceStatus = {
  name: string;
  capability: ServiceCapability;
  source: string;
  message: string;
};

/**
 * Integration boundaries for providers that are not configured in this prototype.
 * Each boundary returns an explicit status instead of pretending that demo data is live.
 */
export const platformServiceStatus = (): ServiceStatus[] => [
  { name: "Weather and rainfall", capability: "NOT_CONFIGURED", source: "Provider connector", message: "No weather API credentials configured; dashboard forecast is scenario-derived." },
  { name: "Road and routing", capability: "NOT_CONFIGURED", source: "Mappls or approved routing provider", message: "No routing provider configured; road status is prototype risk-surface analysis." },
  { name: "IoT sensor bridge", capability: "NOT_CONFIGURED", source: "ESP32 / LoRa / approved gateway", message: "Physical sensors are not connected; local sensor values are simulated." },
  { name: "Notification dispatch", capability: "NOT_CONFIGURED", source: "SMS, voice, email, or mobile provider", message: "Notifications remain demonstration-only until a provider is configured." },
  { name: "Citizen report storage", capability: "SIMULATED", source: "Local prototype queue", message: "Reports are queued locally for human verification in this prototype." },
];

export const getWeatherForecast = async () => ({ capability: "NOT_CONFIGURED" as const, forecast: [], message: "Weather provider not configured." });
export const getRouteAnalysis = async () => ({ capability: "NOT_CONFIGURED" as const, routes: [], message: "Routing provider not configured." });
export const dispatchNotification = async (channel: "SMS" | "VOICE" | "EMAIL", message: string) => ({ capability: "NOT_CONFIGURED" as const, channel, delivered: false, message: `Demo ${channel.toLowerCase()} queued; no external delivery configured.`, requestedMessage: message });
