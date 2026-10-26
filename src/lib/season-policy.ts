import type { PersonalColor } from "./analysis";

export type Season = PersonalColor["season"];
export const SEASON_LABELS: Record<Season, string> = { spring: "봄", summer: "여름", autumn: "가을", winter: "겨울" };

export function parseSeason(label: string): Season {
  const normalized = label.trim().toLowerCase();
  const labels: Record<string, Season> = { spring: "spring", summer: "summer", fall: "autumn", autumn: "autumn", winter: "winter", 봄: "spring", 여름: "summer", 가을: "autumn", 겨울: "winter" };
  const season = labels[normalized];
  if (!season) throw new Error(`지원하지 않는 계절 이름: ${label}`);
  return season;
}

export function scoresWithinSeason(scores: Record<string, number>, season?: Season): Record<string, number> {
  return Object.fromEntries(Object.entries(scores).filter(([id]) => !season || id.startsWith(`${season}-`)));
}

export type SeasonPrediction = {
  season: Season;
  confidence: number;
  probabilities: { season: Season; prob: number }[];
};

export function selectSeason(predictions: { className: string; probability: number }[]): SeasonPrediction {
  const probabilities = predictions.map((p) => ({ season: parseSeason(p.className), prob: p.probability }));
  if (probabilities.length !== 4 || new Set(probabilities.map((p) => p.season)).size !== 4 || probabilities.some((p) => !Number.isFinite(p.prob) || p.prob < 0 || p.prob > 1)) {
    throw new Error("계절 모델의 분류 결과가 올바르지 않습니다.");
  }
  const top = [...probabilities].sort((a, b) => b.prob - a.prob)[0];
  if (!top) throw new Error("계절 분류 결과가 없습니다.");
  return { season: top.season, confidence: top.prob, probabilities };
}