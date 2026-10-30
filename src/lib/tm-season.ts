import type { PersonalColor } from "./analysis";

export const TM_MODEL_URL = "https://teachablemachine.withgoogle.com/models/peK9bvLnO/";
export type Season = PersonalColor["season"];
type Prediction = { className: string; probability: number };
type TMModel = { predict: (input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, flipped?: boolean) => Promise<Prediction[]> };
type TMWindow = Window & { tmImage?: { load: (model: string, metadata: string) => Promise<TMModel> } };
const classes: Record<string, Season> = {
  "Class 1": "spring", "Class 2": "summer", "Class 3": "autumn", "Class 4": "winter",
  "봄": "spring", "여름": "summer", "가을": "autumn", "겨울": "winter",
};

export function selectSeason(predictions: Prediction[]): Season {
  const top = [...predictions].sort((a, b) => b.probability - a.probability)[0];
  const season = top && classes[top.className.trim()];
  if (!season) throw new Error("TM 모델의 계절 분류를 확인할 수 없습니다.");
  return season;
}

let modelPromise: Promise<TMModel> | undefined;
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); reject(new Error("TM 모델 스크립트를 불러오지 못했습니다. 다시 시도해주세요.")); };
    document.head.appendChild(script);
  });
}

export function loadTMModel(): Promise<TMModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const browser = window as TMWindow;
      if (!browser.tmImage) {
        // Separate script runtime keeps face-api.js's bundled TensorFlow unchanged.
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.7.4/dist/tf.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js");
      }
      if (!browser.tmImage) throw new Error("TM 모델을 초기화하지 못했습니다.");
      return browser.tmImage.load(`${TM_MODEL_URL}model.json`, `${TM_MODEL_URL}metadata.json`);
    })().catch((error: unknown) => { modelPromise = undefined; throw error; });
  }
  return modelPromise;
}

export async function predictSeason(input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Season> {
  const model = await loadTMModel();
  return selectSeason(await model.predict(input, false));
}