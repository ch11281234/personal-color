import * as faceapi from "face-api.js";
import { FACE_SHAPES, PERSONAL_COLORS, type AnalysisResult } from "./analysis";
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
    } catch (error) {
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

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Classify face shape from 68-point landmarks.
 * Jaw line: 0-16, left/right cheek peaks ~1-2 / 14-15, chin: 8, brow line ~17-26.
 */
function classifyFaceShape(landmarks: Point[]) {
  const jaw = landmarks.slice(0, 17);
  const leftBrow = landmarks.slice(17, 22);
  const rightBrow = landmarks.slice(22, 27);

  const chin = jaw[8];
  const leftCheek = jaw[2];
  const rightCheek = jaw[14];
  const leftJaw = jaw[5];
  const rightJaw = jaw[11];

  // approximate forehead top by mirroring brow above the eye line
  const browLeft = leftBrow[0];
  const browRight = rightBrow[rightBrow.length - 1];
  const browMid = {
    x: (browLeft.x + browRight.x) / 2,
    y: (browLeft.y + browRight.y) / 2,
  };
  const foreheadTop = {
    x: browMid.x,
    y: browMid.y - dist(leftCheek, rightCheek) * 0.35,
  };

  const faceLength = dist(foreheadTop, chin);
  const cheekWidth = dist(leftCheek, rightCheek);
  const jawWidth = dist(leftJaw, rightJaw);
  const foreheadWidth = dist(browLeft, browRight);

  const lengthRatio = faceLength / cheekWidth;
  const jawCheek = jawWidth / cheekWidth;
  const foreheadJaw = foreheadWidth / jawWidth;

  // jaw angle: angle at point 5-8-11
  const v1 = { x: leftJaw.x - chin.x, y: leftJaw.y - chin.y };
  const v2 = { x: rightJaw.x - chin.x, y: rightJaw.y - chin.y };
  const jawAngleDeg =
    (Math.acos(
      (v1.x * v2.x + v1.y * v2.y) /
        (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y))
    ) *
      180) /
    Math.PI;

  // Korean 안면지수 (facial index) — Python reference:
  //   h = ||p[8] - p[27]||  (chin -> between-brows / nose root)
  //   w = ||p[16] - p[0]||  (jaw width)
  //   idx = (h / w) * 100
  const noseRoot = landmarks[27];
  const noseToChin = dist(noseRoot, chin);
  const fullJawWidth = dist(landmarks[0], landmarks[16]);
  const facialIndex = (noseToChin / fullJawWidth) * 100;

  let id: string;
  let reason: string;
  if (facialIndex >= 95) {
    id = "long";
    reason = `안면지수 ${facialIndex.toFixed(1)} — 세로가 가로보다 매우 깁니다 (초장안).`;
  } else if (facialIndex >= 90) {
    id = "long";
    reason = `안면지수 ${facialIndex.toFixed(1)} — 세로 비율이 긴 편입니다 (장안).`;
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

  const shape = FACE_SHAPES.find((s) => s.id === id) ?? FACE_SHAPES[0];
  return {
    shape,
    reason,
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
      facialIndex: +facialIndex.toFixed(1),
    },
  };
}

/**
 * Sample skin pixels from cheek + forehead regions and compute average HSV/YCbCr.
 */
function analyzeSkin(
  img: HTMLImageElement,
  landmarks: Point[]
) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);

  const samplePoints: Point[] = [
    landmarks[2], landmarks[3], landmarks[4], // left cheek
    landmarks[12], landmarks[13], landmarks[14], // right cheek
    { // forehead (above brow midpoint)
      x: (landmarks[19].x + landmarks[24].x) / 2,
      y: landmarks[19].y - (landmarks[8].y - landmarks[27].y) * 0.25,
    },
    landmarks[29], // nose bridge
  ];

  let r = 0, g = 0, b = 0, count = 0;
  const radius = Math.max(4, Math.round(dist(landmarks[0], landmarks[16]) * 0.02));

  for (const p of samplePoints) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    if (x < radius || y < radius || x > canvas.width - radius || y > canvas.height - radius) continue;
    const data = ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2).data;
    for (let i = 0; i < data.length; i += 4) {
      const pr = data[i], pg = data[i + 1], pb = data[i + 2];
      // simple YCbCr skin filter
      const Y = 0.299 * pr + 0.587 * pg + 0.114 * pb;
      const Cb = 128 - 0.168736 * pr - 0.331264 * pg + 0.5 * pb;
      const Cr = 128 + 0.5 * pr - 0.418688 * pg - 0.081312 * pb;
      if (Y < 40 || Y > 240) continue;
      if (Cb < 77 || Cb > 127) continue;
      if (Cr < 133 || Cr > 173) continue;
      r += pr; g += pg; b += pb; count++;
    }
  }

  if (count < 50) {
    throw new FaceAnalysisError("too-dark", "피부 영역을 충분히 검출하지 못했습니다. 더 밝은 조명에서 다시 시도해주세요.");
  }

  r = r / count;
  g = g / count;
  b = b / count;

  // HSV
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

  // ITA (Individual Typology Angle) for skin warmth/cool: uses Lab b*-axis.
  // Quick warm/cool: compare R-G vs B. Warm if (r-b) high & h closer to yellow (20-50).
  const warmth = (r - b) / 255; // -1..1
  const isWarm = warmth > 0.05 && h >= 15 && h <= 55;

  const brightness = v; // 0..1
  const saturation = s;

  return { r, g, b, h, s: saturation, v: brightness, warmth, isWarm, sampleCount: count };
}

function classifyPersonalColor(skin: ReturnType<typeof analyzeSkin>) {
  const { isWarm, v: brightness, s: saturation, warmth } = skin;
  let id: string;
  let reason: string;

  if (isWarm && brightness > 0.62) {
    id = "spring-warm";
    reason = `피부에 노란기(warmth ${warmth.toFixed(2)})가 있고 밝기 ${(brightness * 100).toFixed(0)}%로 화사합니다.`;
  } else if (isWarm) {
    id = "autumn-warm";
    reason = `따뜻한 톤(warmth ${warmth.toFixed(2)})에 깊이 있는 밝기 ${(brightness * 100).toFixed(0)}%입니다.`;
  } else if (brightness > 0.6 && saturation < 0.35) {
    id = "summer-cool";
    reason = `차가운 언더톤에 부드러운 채도(${(saturation * 100).toFixed(0)}%)와 밝은 피부입니다.`;
  } else {
    id = "winter-cool";
    reason = `차가운 언더톤(warmth ${warmth.toFixed(2)})에 또렷한 대비감을 가집니다.`;
  }

  const pc = PERSONAL_COLORS.find((p) => p.id === id) ?? PERSONAL_COLORS[0];
  return { pc, reason };
}

export type RealAnalysisResult = AnalysisResult & {
  reasons: { color: string; shape: string };
  skin: { r: number; g: number; b: number; warmth: number; brightness: number; saturation: number };
  metrics: {
    faceLength: number;
    cheekWidth: number;
    jawWidth: number;
    foreheadWidth: number;
    lengthRatio: number;
    jawAngleDeg: number;
  };
};

export async function analyzeFace(dataUrl: string): Promise<RealAnalysisResult> {
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
    if (result.length > 0) {
      detections = result;
      break;
    }
  }

  if (detections.length === 0) {
    throw new FaceAnalysisError("no-face", "얼굴을 찾지 못했습니다. 얼굴이 크게 보이는 밝은 정면 사진으로 다시 시도해주세요.");
  }
  if (detections.length > 1) {
    throw new FaceAnalysisError("multi-face", "여러 명이 감지되었습니다. 한 명만 나오는 사진을 사용해주세요.");
  }

  const det = detections[0];
  const points: Point[] = det.landmarks.positions.map((p) => ({ x: p.x, y: p.y }));

  // frontal check: nose tip (30) should be near horizontal center of jaw (0..16)
  const jawLeft = points[0], jawRight = points[16], nose = points[30];
  const jawMidX = (jawLeft.x + jawRight.x) / 2;
  const jawWidth = Math.abs(jawRight.x - jawLeft.x);
  const offset = Math.abs(nose.x - jawMidX) / jawWidth;
  if (offset > 0.2) {
    throw new FaceAnalysisError("not-frontal", "얼굴이 너무 옆으로 돌아가 있습니다. 카메라를 정면으로 보고 다시 촬영해주세요.");
  }

  const { shape, reason: shapeReason, metrics } = classifyFaceShape(points);
  const skin = analyzeSkin(img, points);
  const { pc, reason: colorReason } = classifyPersonalColor(skin);

  // confidence: face-api detector score + sample count quality
  const detScore = det.detection.score; // 0..1
  const sampleQ = Math.min(1, skin.sampleCount / 1500);
  const frontalQ = Math.max(0, 1 - offset / 0.2);
  const confidence = Math.round((detScore * 0.5 + sampleQ * 0.25 + frontalQ * 0.25) * 100);

  return {
    personalColor: pc,
    faceShape: shape,
    confidence: Math.max(70, Math.min(99, confidence)),
    imageUrl: dataUrl,
    analyzedAt: new Date().toISOString(),
    reasons: { color: colorReason, shape: shapeReason },
    skin: {
      r: Math.round(skin.r),
      g: Math.round(skin.g),
      b: Math.round(skin.b),
      warmth: +skin.warmth.toFixed(3),
      brightness: +skin.v.toFixed(3),
      saturation: +skin.s.toFixed(3),
    },
    metrics,
  };
}
