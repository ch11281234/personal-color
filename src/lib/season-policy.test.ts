import { describe, expect, it } from "vitest";
import { PERSONAL_COLORS } from "./analysis";
import { parseSeason, scoresWithinSeason, selectSeason } from "./season-policy";

describe("user model season contract", () => {
  it.each([["spring", "spring"], ["summer", "summer"], ["fall", "autumn"], ["winter", "winter"]])("maps %s to %s", (input, expected) => {
    expect(parseSeason(input)).toBe(expected);
  });
  it("chooses only the highest scoring season", () => {
    expect(selectSeason([{ className: "spring", probability: 0.1 }, { className: "summer", probability: 0.2 }, { className: "fall", probability: 0.6 }, { className: "winter", probability: 0.1 }]).season).toBe("autumn");
  });
  it.each(["spring", "summer", "autumn", "winter"] as const)("keeps detailed scoring inside %s", (season) => {
    const all = Object.fromEntries(PERSONAL_COLORS.map((p, i) => [p.id, i]));
    const scores = scoresWithinSeason(all, season);
    expect(Object.keys(scores)).toEqual(PERSONAL_COLORS.filter((p) => p.season === season).map((p) => p.id));
    expect(Object.keys(scores)).toHaveLength(3);
  });
  it.each([["spring", "warm"], ["summer", "cool"], ["autumn", "warm"], ["winter", "cool"]] as const)("preserves %s tone and catalogue recommendations", (season, tone) => {
    const colors = PERSONAL_COLORS.filter((p) => p.season === season);
    expect(colors).toHaveLength(3);
    for (const color of colors) { expect(color.tone).toBe(tone); expect(color.palette.length).toBeGreaterThan(0); expect(color.makeup.lip.length).toBeGreaterThan(0); }
  });
  it("rejects incomplete model output instead of using a dummy season", () => {
    expect(() => selectSeason([{ className: "spring", probability: 1 }])).toThrow();
  });
});