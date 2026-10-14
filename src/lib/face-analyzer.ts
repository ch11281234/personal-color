import * as faceapi from "face-api.js";
import {
  FACE_SHAPES,
  PERSONAL_COLORS,
  type AnalysisResult,
  type PersonalColor,
} from "./analysis";
import {
  classifyKoreanShape,
  toLegacyShapeId,
  type Gender,
  type KoreanFaceShape,
} from "./hair-recommendations";

const MODEL_URL = "/models";

let modelsLoaded = false;
let loadPromise: Promise<void> | null = null;

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded = true;
    } catch {
      loadPromise = null;
      throw new FaceAnalysisError("load-failed", "AI 분석 모델을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  })();
  return loadPromise;
}

export type AnalysisError =
  | "no-face"
  | "multi-face"
  | "too-dark"
  | "not-frontal"
  | "load-failed";

export class FaceAnalysisError extends Error {
  constructor(public code: AnalysisError, message: string) {
    super(message);
  }
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다"));
    img.src = dataUrl;
  });
}

type Point = { x: number; y: number };
type RGB = { r: number; g: number; b: number };
type Lab = { L: number; a: number; b: number };

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ============ Color space conversion ============

function srgbToLinear(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function rgbToLab(r: number, g: number, b: number): Lab {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  // sRGB D65 -> XYZ
  const X = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  const Y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175;
  const Z = lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041;
  const xn = X / 0.95047, yn = Y / 1.0, zn = Z / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return { L: 116 * f(yn) - 16, a: 500 * (f(xn) - f(yn)), b: 200 * (f(yn) - f(zn)) };
}

function rgbToHsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const v = max / 255;
  const s = max === 0 ? 0 : (max - min) / max;
  let h = 0;
  if (max !== min) {
    if (max === r) h = ((g - b) / (max - min)) * 60;
    else if (max === g) h = ((b - r) / (max - min)) * 60 + 120;
    else h = ((r - g) / (max - min)) * 60 + 240;
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

// ============ Pixel sampling ============

function samplePatch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  width: number,
  height: number,
  applySkinFilter = true
): RGB[] {
  const x = Math.max(0, Math.round(cx - radius));
  const y = Math.max(0, Math.round(cy - radius));
  const w = Math.min(width - x, radius * 2);
  const h = Math.min(height - y, radius * 2);
  if (w <= 1 || h <= 1) return [];
  const data = ctx.getImageData(x, y, w, h).data;
  const out: RGB[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (applySkinFilter) {
      const Y = 0.299 * r + 0.587 * g + 0.114 * b;
      const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      if (Y < 40 || Y > 240) continue;
      if (Cb < 77 || Cb > 127) continue;
      if (Cr < 133 || Cr > 173) continue;
    }
    out.push({ r, g, b });
  }
  return out;
}

function meanRGB(px: RGB[]): RGB {
  if (px.length === 0) return { r: 0, g: 0, b: 0 };
  let r = 0, g = 0, b = 0;
  for (const p of px) { r += p.r; g += p.g; b += p.b; }
  return { r: r / px.length, g: g / px.length, b: b / px.length };
}

// ============ Region-based skin sampling ============

type SkinRegion = "forehead" | "leftCheek" | "rightCheek" | "noseBridge" | "chin";

type RegionSample = {
  region: SkinRegion;
  pixels: RGB[];
  mean: RGB;
  lab: Lab;
};

function sampleSkinRegions(
  img: HTMLImageElement,
  landmarks: Point[]
): { regions: RegionSample[]; allPixels: RGB[]; ctx: CanvasRenderingContext2D; w: number; h: number } {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const W = canvas.width, H = canvas.height;

  const faceW = dist(landmarks[0], landmarks[16]);
  const radius = Math.max(6, Math.round(faceW * 0.025));

  const forehead: Point = {
    x: (landmarks[19].x + landmarks[24].x) / 2,
    y: landmarks[19].y - (landmarks[8].y - landmarks[27].y) * 0.28,
  };

  const regions: { region: SkinRegion; center: Point }[] = [
    { region: "forehead", center: forehead },
    { region: "leftCheek", center: { x: (landmarks[2].x + landmarks[31].x) / 2, y: (landmarks[2].y + landmarks[31].y) / 2 } },
    { region: "rightCheek", center: { x: (landmarks[14].x + landmarks[35].x) / 2, y: (landmarks[14].y + landmarks[35].y) / 2 } },
    { region: "noseBridge", center: landmarks[29] },
    { region: "chin", center: { x: landmarks[8].x, y: landmarks[8].y - radius } },
  ];

  const samples: RegionSample[] = [];
  const all: RGB[] = [];
  for (const { region, center } of regions) {
    const pixels = samplePatch(ctx, center.x, center.y, radius, W, H, true);
    if (pixels.length === 0) continue;
    const mean = meanRGB(pixels);
    samples.push({ region, pixels, mean, lab: rgbToLab(mean.r, mean.g, mean.b) });
    for (const p of pixels) all.push(p);
  }

  return { regions: samples, allPixels: all, ctx, w: W, h: H };
}

// ============ Gray World illumination correction ============

function grayWorldCorrect(pixels: RGB[]): { gains: RGB; corrected: RGB[] } {
  const mean = meanRGB(pixels);
  const avg = (mean.r + mean.g + mean.b) / 3;
  const gains: RGB = {
    r: mean.r > 0 ? avg / mean.r : 1,
    g: mean.g > 0 ? avg / mean.g : 1,
    b: mean.b > 0 ? avg / mean.b : 1,
  };
  // Softer correction (50% strength) to avoid over-compensating tanned skin
  const blend = 0.5;
  gains.r = 1 + (gains.r - 1) * blend;
  gains.g = 1 + (gains.g - 1) * blend;
  gains.b = 1 + (gains.b - 1) * blend;
  const corrected = pixels.map((p) => ({
    r: Math.min(255, Math.max(0, p.r * gains.r)),
    g: Math.min(255, Math.max(0, p.g * gains.g)),
    b: Math.min(255, Math.max(0, p.b * gains.b)),
  }));
  return { gains, corrected };
}

// ============ Hair sampling for contrast ============

function sampleHair(
  ctx: CanvasRenderingContext2D,
  landmarks: Point[],
  W: number,
  H: number
): RGB | null {
  // sample a band above the brows
  const faceW = dist(landmarks[0], landmarks[16]);
  const faceH = dist(landmarks[8], landmarks[27]);
  const browMidX = (landmarks[19].x + landmarks[24].x) / 2;
  const browY = Math.min(landmarks[19].y, landmarks[24].y);
  const sampleY = browY - faceH * 0.55;
  if (sampleY < 8) return null;
  const radius = Math.max(8, Math.round(faceW * 0.12));
  const px = samplePatch(ctx, browMidX, sampleY, radius, W, H, false);
  if (px.length < 30) return null;
  // pick the darker quartile (likely hair, not skin/background)
  const sorted = [...px].sort(
    (a, b) => (a.r + a.g + a.b) - (b.r + b.g + b.b)
  );
  const dark = sorted.slice(0, Math.max(20, Math.floor(sorted.length * 0.35)));
  return meanRGB(dark);
}

// ============ Face shape (geometric) ============

function classifyFaceShape(landmarks: Point[]) {
  const jaw = landmarks.slice(0, 17);
  const leftBrow = landmarks.slice(17, 22);
  const rightBrow = landmarks.slice(22, 27);

  const chin = jaw[8];
  const leftCheek = jaw[2];
  const rightCheek = jaw[14];
  const leftJaw = jaw[5];
  const rightJaw = jaw[11];

  const browLeft = leftBrow[0];
  const browRight = rightBrow[rightBrow.length - 1];
  const browMid = { x: (browLeft.x + browRight.x) / 2, y: (browLeft.y + browRight.y) / 2 };
  const foreheadTop = { x: browMid.x, y: browMid.y - dist(leftCheek, rightCheek) * 0.35 };

  const faceLength = dist(foreheadTop, chin);
  const cheekWidth = dist(leftCheek, rightCheek);
  const jawWidth = dist(leftJaw, rightJaw);
  const foreheadWidth = dist(browLeft, browRight);

  const lengthRatio = faceLength / cheekWidth;
  const jawCheek = jawWidth / cheekWidth;
  const foreheadJaw = foreheadWidth / jawWidth;
  const foreheadCheek = foreheadWidth / cheekWidth;

  // jaw angle at chin
  const v1 = { x: leftJaw.x - chin.x, y: leftJaw.y - chin.y };
  const v2 = { x: rightJaw.x - chin.x, y: rightJaw.y - chin.y };
  const jawAngleDeg = (Math.acos(
    (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y))
  ) * 180) / Math.PI;

  // Jaw curvature: deviation of midpoints from straight line
  let curvature = 0;
  for (let i = 1; i < 16; i++) {
    const p = jaw[i];
    const t = i / 16;
    const lineX = jaw[0].x + t * (jaw[16].x - jaw[0].x);
    const lineY = jaw[0].y + t * (jaw[16].y - jaw[0].y);
    curvature += Math.hypot(p.x - lineX, p.y - lineY);
  }
  curvature /= 16 * cheekWidth;

  // 안면지수 보정 계산
  // noseToChin만 사용하면 이마 길이가 빠져 안면지수가 낮게 나오고,
  // faceLength를 그대로 사용하면 이마 추정값이 과하게 반영되어 120~130대로 튈 수 있습니다.
  // 따라서 noseToChin을 기본 세로값으로 두고, 제한된 이마 추정값만 더합니다.
  const noseRoot = landmarks[27];
  const noseTip = landmarks[30];
  const noseToChin = dist(noseRoot, chin);
  const noseLength = dist(noseRoot, noseTip);
  const foreheadPartFromFaceLength = Math.max(0, faceLength - noseToChin);
  const foreheadByNose = noseLength * 0.85;
  const rawForeheadEstimate =
    foreheadByNose * 0.6 + foreheadPartFromFaceLength * 0.4;
  const minForehead = noseToChin * 0.18;
  const maxForehead = noseToChin * 0.13;
  const estimatedForeheadLength = Math.min(
    maxForehead,
    Math.max(minForehead, rawForeheadEstimate)
  );
  const correctedFaceLength = noseToChin + estimatedForeheadLength;
  const cheekboneWidth = dist(landmarks[1], landmarks[15]);
  const fullFaceWidth = Math.max(cheekboneWidth, cheekWidth);
  const facialIndex = (correctedFaceLength / fullFaceWidth) * 100;

  // Heart vs Diamond detection
  let extraNote = "";
  let id: string;
  let reason: string;

  if (foreheadCheek > 1.0 && jawCheek < 0.78 && facialIndex >= 88) {
    id = "heart";
    reason = `이마(${foreheadWidth | 0}px)가 광대(${cheekWidth | 0}px)보다 넓고 턱이 좁은 V라인 — 하트형 패턴`;
  } else if (foreheadCheek < 0.85 && jawCheek < 0.85 && facialIndex >= 90) {
    id = "diamond";
    reason = `광대가 가장 넓고 이마·턱이 좁은 입체 윤곽 — 다이아형 패턴`;
  } else if (facialIndex >= 92) {
    id = "long";
    reason = `안면지수 ${facialIndex.toFixed(1)} — 얼굴의 세로 비율이 뚜렷하게 길어 장안형에 가깝습니다.`;
  } else if (facialIndex >= 86) {
    id = "long";
    reason = `안면지수 ${facialIndex.toFixed(1)} — 얼굴의 세로 비율이 평균보다 길어 긴형 경향이 있습니다.`;
  } else if (facialIndex >= 85) {
    id = "oval";
    reason = `안면지수 ${facialIndex.toFixed(1)} — 황금비에 가까운 균형 잡힌 비율입니다 (중안/계란형).`;
  } else if (facialIndex >= 80) {
    id = "round";
    reason = `안면지수 ${facialIndex.toFixed(1)} — 가로 폭이 넓고 턱선이 둥급니다 (단안).`;
  } else {
    id = "square";
    reason = `안면지수 ${facialIndex.toFixed(1)} — 가로 폭이 매우 넓고 턱이 또렷합니다 (초단안/각진형).`;
  }

  // Annotate curvature/angle
  if (id !== "heart" && id !== "diamond") {
    if (jawAngleDeg < 110 && curvature < 0.04) extraNote = " 턱이 또렷한 각진 인상.";
    else if (curvature > 0.06) extraNote = " 턱선이 부드럽게 둥근 인상.";
  }

  const shape = FACE_SHAPES.find((s) => s.id === id) ?? FACE_SHAPES[0];

  return {
    shape,
    reason: reason + extraNote,
    facialIndex,
    metrics: {
      faceLength: Math.round(faceLength),
      cheekWidth: Math.round(cheekWidth),
      jawWidth: Math.round(jawWidth),
      foreheadWidth: Math.round(foreheadWidth),
      lengthRatio: +lengthRatio.toFixed(2),
      jawAngleDeg: +jawAngleDeg.toFixed(1),
      foreheadJaw: +foreheadJaw.toFixed(2),
      jawCheek: +jawCheek.toFixed(2),
      foreheadCheek: +foreheadCheek.toFixed(2),
      jawCurvature: +curvature.toFixed(3),
      facialIndex: +facialIndex.toFixed(1),
    },
  };
}

// ============ Personal color (12-type) ============

type ColorFeatures = {
  L: number;            // skin lightness 0..100
  a: number;            // green-red
  b: number;            // blue-yellow (warm if high)
  chroma: number;       // sqrt(a^2 + b^2)
  hue: number;          // 0..360
  contrast: number;     // |L_skin - L_hair|
  warmth: number;       // -1..1
};

function softmax(scores: Record<string, number>, temperature = 1.4): Record<string, number> {
  const keys = Object.keys(scores);
  const max = Math.max(...keys.map((k) => scores[k]));
  const exps = keys.map((k) => Math.exp((scores[k] - max) / temperature));
  const sum = exps.reduce((a, c) => a + c, 0);
  const out: Record<string, number> = {};
  keys.forEach((k, i) => { out[k] = exps[i] / sum; });
  return out;
}

function classifyPersonalColor(features: ColorFeatures): {
  pc: PersonalColor;
  reason: string;
  probabilities: { id: string; name: string; prob: number }[];
  seasonProbs: Record<"spring" | "summer" | "autumn" | "winter", number>;
} {
  const { L, b, chroma, contrast, warmth } = features;

  // Per-type prototype scoring (higher = better fit)
  const score = (warm: number, light: number, deep: number, soft: number, clear: number) => {
    return warm + light + deep + soft + clear;
  };

  const wWarm = warmth;          // -1..1
  const wCool = -warmth;
  const wLight = (L - 55) / 25;  // > 65 → light
  const wDeep = (50 - L) / 25;   // < 40 → deep
  const wSoft = (16 - chroma) / 10; // low chroma
  const wClear = (chroma - 18) / 10; // high chroma
  const wContrast = (contrast - 30) / 25;

  const raw: Record<string, number> = {
    "spring-light":  score(wWarm * 0.7, wLight * 1.1, 0, 0, 0) + 0.3,
    "spring-warm":   score(wWarm * 1.4, wLight * 0.3, 0, 0, wClear * 0.3),
    "spring-clear":  score(wWarm * 0.6, wLight * 0.6, 0, 0, wClear * 1.2 + wContrast * 0.4),
    "summer-light":  score(wCool * 0.7, wLight * 1.1, 0, wSoft * 0.4, 0) + 0.3,
    "summer-cool":   score(wCool * 1.4, wLight * 0.3, 0, wSoft * 0.4, 0),
    "summer-soft":   score(wCool * 0.7, 0, 0, wSoft * 1.3, 0),
    "autumn-soft":   score(wWarm * 0.8, 0, 0, wSoft * 1.2, 0),
    "autumn-warm":   score(wWarm * 1.3, 0, wDeep * 0.5, 0, 0),
    "autumn-deep":   score(wWarm * 0.7, 0, wDeep * 1.3, 0, 0),
    "winter-cool":   score(wCool * 1.3, 0, wDeep * 0.4, 0, wClear * 0.3),
    "winter-deep":   score(wCool * 0.8, 0, wDeep * 1.2, 0, wClear * 0.3),
    "winter-clear":  score(wCool * 0.7, 0, wDeep * 0.5, 0, wClear * 1.2 + wContrast * 0.5),
  };

  const probs = softmax(raw, 0.6);
  // Teachable Machine decides the season; existing color features pick the sub-type within it.
  if (features.tmSeason) {
    const tm = features.tmSeason;
    for (const pcMeta of PERSONAL_COLORS) {
      const s = pcMeta.season;
      const within = PERSONAL_COLORS.filter((p) => p.season === s).reduce((a, p) => a + probs[p.id], 0) || 1;
      probs[pcMeta.id] = (probs[pcMeta.id] / within) * tm.probs[s];
    }
  }
  const ranked = Object.entries(probs)
    .map(([id, prob]) => {
      const meta = PERSONAL_COLORS.find((p) => p.id === id)!;
      return { id, name: meta.name, prob };
    })
    .sort((a, b2) => b2.prob - a.prob);

  const top = features.tmSeason
    ? ranked.find((r) => PERSONAL_COLORS.find((p) => p.id === r.id)!.season === features.tmSeason!.top)!
    : ranked[0];
  const pc = PERSONAL_COLORS.find((p) => p.id === top.id)!;

  const seasonProbs = { spring: 0, summer: 0, autumn: 0, winter: 0 };
  for (const r of ranked) {
    const meta = PERSONAL_COLORS.find((p) => p.id === r.id)!;
    seasonProbs[meta.season] += r.prob;
  }

  const reasonParts: string[] = [];
  reasonParts.push(`피부 L*${L.toFixed(0)} / b*${b.toFixed(1)} → ${b > 14 ? "노란기 우세 (웜)" : "푸른기 우세 (쿨)"}`);
  reasonParts.push(`채도 ${chroma.toFixed(1)} (${chroma > 18 ? "선명함" : chroma < 12 ? "탁함" : "중간"})`);
  if (contrast > 0) reasonParts.push(`피부–머리카락 대비 ${contrast.toFixed(0)} (${contrast > 35 ? "강한 대비" : contrast < 20 ? "낮은 대비" : "중간"})`);
  reasonParts.push(`→ ${pc.name} 매칭 ${(top.prob * 100).toFixed(0)}%`);

  return { pc, reason: reasonParts.join(" · "), probabilities: ranked, seasonProbs };
}

// ============ Main exported type ============

export type RegionStat = { region: SkinRegion; r: number; g: number; b: number; L: number; a: number; bAxis: number };

export type RealAnalysisResult = AnalysisResult & {
  gender: Gender;
  reasons: { color: string; shape: string };
  skin: { r: number; g: number; b: number; warmth: number; brightness: number; saturation: number; L: number; a: number; bAxis: number; chroma: number };
  metrics: {
    faceLength: number;
    cheekWidth: number;
    jawWidth: number;
    foreheadWidth: number;
    lengthRatio: number;
    jawAngleDeg: number;
    foreheadJaw: number;
    jawCheek: number;
    foreheadCheek: number;
    jawCurvature: number;
    facialIndex: number;
  };
  facialIndex: number;
  koreanShape: KoreanFaceShape;
  hairRecommendation: string;
  glassesRecommendation: string;

  // New advanced fields
  regions: RegionStat[];
  hair: { r: number; g: number; b: number; L: number } | null;
  contrast: number;
  probabilities: { id: string; name: string; prob: number }[];
  seasonProbabilities: { season: string; prob: number }[];
  whiteBalanceGains: { r: number; g: number; b: number };
};

// ============ Orchestration ============

export async function analyzeFace(
  dataUrl: string,
  gender: Gender = "male"
): Promise<RealAnalysisResult> {
  await loadModels();
  const img = await loadImage(dataUrl);

  const detectionOptions = [
    new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 }),
    new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.25 }),
    new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.2 }),
  ];

  let detections: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>[] = [];
  for (const options of detectionOptions) {
    const result = await faceapi.detectAllFaces(img, options).withFaceLandmarks();
    if (result.length > 0) { detections = result; break; }
  }

  if (detections.length === 0) {
    throw new FaceAnalysisError("no-face", "얼굴을 찾지 못했습니다. 얼굴이 크게 보이는 밝은 정면 사진으로 다시 시도해주세요.");
  }
  if (detections.length > 1) {
    throw new FaceAnalysisError("multi-face", "여러 명이 감지되었습니다. 한 명만 나오는 사진을 사용해주세요.");
  }

  const det = detections[0];
  const points: Point[] = det.landmarks.positions.map((p) => ({ x: p.x, y: p.y }));

  const jawLeft = points[0], jawRight = points[16], nose = points[30];
  const jawMidX = (jawLeft.x + jawRight.x) / 2;
  const jawWidthPx = Math.abs(jawRight.x - jawLeft.x);
  const offset = Math.abs(nose.x - jawMidX) / jawWidthPx;
  if (offset > 0.2) {
    throw new FaceAnalysisError("not-frontal", "얼굴이 너무 옆으로 돌아가 있습니다. 카메라를 정면으로 보고 다시 촬영해주세요.");
  }

  // Face shape
  const { shape, reason: shapeReason, metrics, facialIndex } = classifyFaceShape(points);
  const koreanShape = classifyKoreanShape(facialIndex);
  const legacyId = toLegacyShapeId(koreanShape.id);
  // Prefer geometric shape (heart/diamond) if detected, else fall back to korean mapping
  const finalShape = (shape.id === "heart" || shape.id === "diamond")
    ? shape
    : (FACE_SHAPES.find((s) => s.id === legacyId) ?? shape);

  // Skin regions
  const { regions, allPixels, ctx, w, h } = sampleSkinRegions(img, points);
  if (allPixels.length < 80) {
    throw new FaceAnalysisError("too-dark", "피부 영역을 충분히 검출하지 못했습니다. 더 밝은 조명에서 다시 시도해주세요.");
  }

  // Gray-world illumination correction over all skin pixels
  const { gains, corrected } = grayWorldCorrect(allPixels);

  // Corrected mean per region (apply same gains)
  const regionStats: RegionStat[] = regions.map((rg) => {
    const r = Math.min(255, rg.mean.r * gains.r);
    const g = Math.min(255, rg.mean.g * gains.g);
    const b = Math.min(255, rg.mean.b * gains.b);
    const lab = rgbToLab(r, g, b);
    return { region: rg.region, r: Math.round(r), g: Math.round(g), b: Math.round(b), L: +lab.L.toFixed(1), a: +lab.a.toFixed(1), bAxis: +lab.b.toFixed(1) };
  });

  // Overall corrected skin
  const meanCorrected = meanRGB(corrected);
  const skinLab = rgbToLab(meanCorrected.r, meanCorrected.g, meanCorrected.b);
  const skinHsv = rgbToHsv(meanCorrected.r, meanCorrected.g, meanCorrected.b);
  const chroma = Math.hypot(skinLab.a, skinLab.b);
  const warmth = Math.max(-1, Math.min(1, (skinLab.b - 14) / 12));

  // Hair sampling for contrast
  const hairMean = sampleHair(ctx, points, w, h);
  let hairLab: Lab | null = null;
  let contrast = 0;
  if (hairMean) {
    const r = Math.min(255, hairMean.r * gains.r);
    const g = Math.min(255, hairMean.g * gains.g);
    const b = Math.min(255, hairMean.b * gains.b);
    hairLab = rgbToLab(r, g, b);
    contrast = Math.abs(skinLab.L - hairLab.L);
  }

  // Season from Teachable Machine model
  const { predictSeason } = await import("./tm-season");
  const tmSeason = await predictSeason(img);

  // Personal color classification
  const { pc, reason: colorReason, probabilities, seasonProbs } = classifyPersonalColor({
    L: skinLab.L,
    a: skinLab.a,
    b: skinLab.b,
    chroma,
    hue: skinHsv.h,
    contrast,
    warmth,
    tmSeason,
  });

  // Confidence
  const detScore = det.detection.score;
  const sampleQ = Math.min(1, allPixels.length / 1500);
  const frontalQ = Math.max(0, 1 - offset / 0.2);
  const topProb = probabilities[0]?.prob ?? 0.5;
  const confidence = Math.round((detScore * 0.4 + sampleQ * 0.2 + frontalQ * 0.2 + topProb * 0.2) * 100);

  return {
    personalColor: pc,
    faceShape: finalShape,
    confidence: Math.max(70, Math.min(99, confidence)),
    imageUrl: dataUrl,
    analyzedAt: new Date().toISOString(),
    gender,
    reasons: { color: colorReason, shape: shapeReason },
    skin: {
      r: Math.round(meanCorrected.r),
      g: Math.round(meanCorrected.g),
      b: Math.round(meanCorrected.b),
      warmth: +warmth.toFixed(3),
      brightness: +skinHsv.v.toFixed(3),
      saturation: +skinHsv.s.toFixed(3),
      L: +skinLab.L.toFixed(1),
      a: +skinLab.a.toFixed(1),
      bAxis: +skinLab.b.toFixed(1),
      chroma: +chroma.toFixed(1),
    },
    metrics,
    facialIndex: +facialIndex.toFixed(1),
    koreanShape,
    hairRecommendation: koreanShape.hair[gender],
    glassesRecommendation: koreanShape.glasses[gender],
    regions: regionStats,
    hair: hairMean
      ? {
          r: Math.round(Math.min(255, hairMean.r * gains.r)),
          g: Math.round(Math.min(255, hairMean.g * gains.g)),
          b: Math.round(Math.min(255, hairMean.b * gains.b)),
          L: hairLab ? +hairLab.L.toFixed(1) : 0,
        }
      : null,
    contrast: +contrast.toFixed(1),
    probabilities,
    seasonProbabilities: Object.entries(seasonProbs).map(([season, prob]) => ({ season, prob })),
    whiteBalanceGains: { r: +gains.r.toFixed(3), g: +gains.g.toFixed(3), b: +gains.b.toFixed(3) },
  };
}
