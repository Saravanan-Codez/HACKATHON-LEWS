import { describe, expect, it } from "vitest";
import { dispatchNotification, platformServiceStatus } from "./services/platformServices";

describe("platform service boundaries", () => {
  it("reports unavailable providers honestly", () => {
    const statuses = platformServiceStatus();
    expect(statuses.find(status => status.name === "Weather and rainfall")?.capability).toBe("NOT_CONFIGURED");
    expect(statuses.find(status => status.name === "Road and routing")?.capability).toBe("NOT_CONFIGURED");
    expect(statuses.find(status => status.name === "IoT sensor bridge")?.message).toContain("not connected");
  });

  it("never claims that a notification was delivered without a provider", async () => {
    const result = await dispatchNotification("SMS", "Test warning");
    expect(result.delivered).toBe(false);
    expect(result.message).toContain("no external delivery configured");
  });
});
