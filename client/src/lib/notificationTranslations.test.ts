import { describe, expect, it } from "vitest";
import {
  getStoredNotificationLanguage,
  notificationLanguageStorageKey,
  notificationLanguages,
  renderNotification,
  saveNotificationLanguage,
} from "./notificationTranslations";

describe("multilingual notification system", () => {
  it("supports every requested language with a localized critical alert", () => {
    const messages = notificationLanguages.map(({ code }) => renderNotification("CRITICAL_WARNING", code));
    expect(messages).toHaveLength(5);
    expect(new Set(messages.map((message) => message.title)).size).toBe(5);
    expect(messages.every((message) => message.body.length > 30)).toBe(true);
  });

  it("fills location context into road and landslide notifications", () => {
    const road = renderNotification("ROAD_BLOCKAGE", "KN", { road: "Kodagu Valley Link" });
    const landslide = renderNotification("LANDSLIDE_WARNING", "TA", { place: "Wayanad" });
    expect(road.body).toContain("Kodagu Valley Link");
    expect(landslide.body).toContain("Wayanad");
  });

  it("persists and restores a supported notification language", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    saveNotificationLanguage("ML", storage);
    expect(values.get(notificationLanguageStorageKey)).toBe("ML");
    expect(getStoredNotificationLanguage(storage)).toBe("ML");
    values.set(notificationLanguageStorageKey, "UNSUPPORTED");
    expect(getStoredNotificationLanguage(storage)).toBe("EN");
  });
});
