import { describe, expect, it } from "vitest";
import { debugCollectorSource } from "../../../shared/debugCollector";

describe("development debug collector asset", () => {
  it("returns executable JavaScript source without an HTML fallback marker", () => {
    expect(debugCollectorSource.trimStart().startsWith("<")).toBe(false);
    expect(debugCollectorSource).toContain('fetch("/__manus__/logs"');
    expect(() => new Function(debugCollectorSource)).not.toThrow();
  });
});
