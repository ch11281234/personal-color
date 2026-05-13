import type { AnalysisResult } from "./analysis";

const KEY = "isaac:last-analysis";
const IMG_KEY = "isaac:last-image";

export function saveAnalysis(result: AnalysisResult) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(result));
}

export function loadAnalysis(): AnalysisResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AnalysisResult; } catch { return null; }
}

export function saveImage(dataUrl: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(IMG_KEY, dataUrl);
}

export function loadImage(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(IMG_KEY);
}
