/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { selectSeason, TM_MODEL_URL } from "./tm-season";

describe("user's TM season mapping", () => {
  test("uses the requested model", () => {
    expect(TM_MODEL_URL).toBe("https://teachablemachine.withgoogle.com/models/peK9bvLnO/");
  });
  for (const [label, season] of [["Class 1", "spring"], ["Class 2", "summer"], ["Class 3", "autumn"], ["Class 4", "winter"]] as const) {
    test(`${label} selects ${season}`, () => {
      expect(selectSeason(["Class 1", "Class 2", "Class 3", "Class 4"].map(className => ({ className, probability: className === label ? 0.9 : 0.03 })))).toBe(season);
    });
  }
  test("does not silently invent a season for unknown classes", () => {
    expect(() => selectSeason([{ className: "unknown", probability: 1 }])).toThrow();
  });
});