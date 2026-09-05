import { describe, expect, it } from "vitest";
import { isUnitOrNumber, STATIC_DICTIONARY } from "./useTranslation";

describe("isUnitOrNumber - Unit and Number Exclusions", () => {
  it("recognizes pure numbers as non-translatable", () => {
    expect(isUnitOrNumber("100")).toBe(true);
    expect(isUnitOrNumber("12.3375")).toBe(true);
    expect(isUnitOrNumber("0.014")).toBe(true);
    expect(isUnitOrNumber("-0.5")).toBe(true);
    expect(isUnitOrNumber("+2.4")).toBe(true);
    expect(isUnitOrNumber("1,200")).toBe(true);
    expect(isUnitOrNumber("184,520")).toBe(true);
  });

  it("recognizes scientific and geotechnical numbers with units as non-translatable", () => {
    expect(isUnitOrNumber("12.4 mm")).toBe(true);
    expect(isUnitOrNumber("100mm")).toBe(true);
    expect(isUnitOrNumber("0.014°/hr")).toBe(true);
    expect(isUnitOrNumber("94%")).toBe(true);
    expect(isUnitOrNumber("3.28V")).toBe(true);
    expect(isUnitOrNumber("3.12 V")).toBe(true);
    expect(isUnitOrNumber("-88 dBm")).toBe(true);
    expect(isUnitOrNumber("1011.4 hPa")).toBe(true);
    expect(isUnitOrNumber("45 km/h")).toBe(true);
    expect(isUnitOrNumber("1.42")).toBe(true);
    expect(isUnitOrNumber("1,200 Persons")).toBe(true);
    expect(isUnitOrNumber("184,520 bytes")).toBe(true);
    expect(isUnitOrNumber("2x")).toBe(true);
  });

  it("recognizes standalone units, coordinates, and codes as non-translatable", () => {
    expect(isUnitOrNumber("mm")).toBe(true);
    expect(isUnitOrNumber("mm/hr")).toBe(true);
    expect(isUnitOrNumber("°")).toBe(true);
    expect(isUnitOrNumber("°/hr")).toBe(true);
    expect(isUnitOrNumber("%")).toBe(true);
    expect(isUnitOrNumber("V")).toBe(true);
    expect(isUnitOrNumber("hPa")).toBe(true);
    expect(isUnitOrNumber("LAT")).toBe(true);
    expect(isUnitOrNumber("LNG")).toBe(true);
    expect(isUnitOrNumber("LON")).toBe(true);
    expect(isUnitOrNumber("FoS")).toBe(true);
    expect(isUnitOrNumber("12.48°N")).toBe(true);
    expect(isUnitOrNumber("75.82°E")).toBe(true);
    expect(isUnitOrNumber("CHK-01")).toBe(true);
    expect(isUnitOrNumber("KDG-03")).toBe(true);
    expect(isUnitOrNumber("2026-09-05")).toBe(true);
    expect(isUnitOrNumber("14:32:00")).toBe(true);
  });

  it("identifies human-readable UI text as translatable", () => {
    expect(isUnitOrNumber("OVERVIEW")).toBe(false);
    expect(isUnitOrNumber("LANDSORA CONSOLE")).toBe(false);
    expect(isUnitOrNumber("RAINFALL")).toBe(false);
    expect(isUnitOrNumber("RAINFALL (24H)")).toBe(false);
    expect(isUnitOrNumber("PORE SATURATION")).toBe(false);
    expect(isUnitOrNumber("SLOPE TILT RATE")).toBe(false);
    expect(isUnitOrNumber("CRITICAL")).toBe(false);
    expect(isUnitOrNumber("WATCH")).toBe(false);
    expect(isUnitOrNumber("STABLE")).toBe(false);
    expect(isUnitOrNumber("ZONE INTELLIGENCE")).toBe(false);
    expect(isUnitOrNumber("EVACUATION ADVISORY")).toBe(false);
    expect(isUnitOrNumber("Threshold")).toBe(false);
  });

  it("contains pre-compiled static translations for major languages", () => {
    expect(STATIC_DICTIONARY["OVERVIEW"]?.KN).toBe("ಅವಲೋಕನ");
    expect(STATIC_DICTIONARY["OVERVIEW"]?.HI).toBe("अवलोकन");
    expect(STATIC_DICTIONARY["OVERVIEW"]?.TA).toBe("கண்ணோட்டம்");
    expect(STATIC_DICTIONARY["OVERVIEW"]?.TE).toBe("అవలోకనం");
    expect(STATIC_DICTIONARY["OVERVIEW"]?.ML).toBe("അവലോകനം");
    expect(STATIC_DICTIONARY["RAINFALL"]?.KN).toBe("ಮಳೆ ಪ್ರಮಾಣ");
    expect(STATIC_DICTIONARY["RAINFALL"]?.HI).toBe("वर्षा");
    expect(STATIC_DICTIONARY["CRITICAL"]?.KN).toBe("ಗಂಭೀರ");
  });
});
