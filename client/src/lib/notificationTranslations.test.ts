import { describe, expect, it } from "vitest";
import {
  detectLanguageForZone,
  detectLanguageFromCoords,
  getStoredNotificationLanguage,
  notificationLanguageStorageKey,
  notificationLanguages,
  renderNotification,
  saveNotificationLanguage,
} from "./notificationTranslations";

describe("multilingual notification system", () => {
  it("supports every requested language with a localized critical alert", () => {
    const messages = notificationLanguages.map(({ code }) => renderNotification("CRITICAL_WARNING", code));
    expect(messages).toHaveLength(notificationLanguages.length);
    expect(new Set(messages.map((message) => message.title)).size).toBe(notificationLanguages.length);
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

  it("automatically detects correct regional language for monitored nodes", () => {
    expect(detectLanguageForZone("KDG-03")).toBe("KN"); // Kodagu -> Kannada
    expect(detectLanguageForZone("CHK-01")).toBe("KN"); // Chikkamagaluru -> Kannada
    expect(detectLanguageForZone("WYD-04")).toBe("ML"); // Wayanad -> Malayalam
    expect(detectLanguageForZone("NLG-05")).toBe("TA"); // Nilgiris -> Tamil
    expect(detectLanguageForZone("DJE-06")).toBe("EN"); // Darjeeling -> English

    // Coordinate detection
    expect(detectLanguageFromCoords(11.6854, 76.1320)).toBe("ML"); // Wayanad coords
    expect(detectLanguageFromCoords(12.3375, 75.8069)).toBe("KN"); // Kodagu coords
  });
});

