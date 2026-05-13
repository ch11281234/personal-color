import type { RealAnalysisResult } from "./face-analyzer";

const KEY = "isaac:last-analysis";
const IMG_KEY = "isaac:last-image";
let memoryAnalysis: RealAnalysisResult | null = null;
let memoryImage: string | null = null;

export function saveAnalysis(result: RealAnalysisResult) {
  memoryAnalysis = result;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(result));
  } catch {}
}

export function loadAnalysis(): RealAnalysisResult | null {
  if (memoryAnalysis) return memoryAnalysis;
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    memoryAnalysis = JSON.parse(raw) as RealAnalysisResult;
    return memoryAnalysis;
  } catch {
    return null;
  }
}

export function saveImage(dataUrl: string) {
  memoryImage = dataUrl;
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(IMG_KEY, dataUrl); } catch {}
}

export function loadImage(): string | null {
  if (memoryImage) return memoryImage;
  if (typeof window === "undefined") return null;
  const image = sessionStorage.getItem(IMG_KEY);
  if (image) memoryImage = image;
  return image;
}
