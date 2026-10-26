import { selectSeason, type SeasonPrediction } from "./season-policy";

export const SEASON_MODEL_URL = "https://teachablemachine.withgoogle.com/models/CAktPOFDw/";
let modelPromise: Promise<import("@teachablemachine/image").CustomMobileNet> | null = null;

function loadSeasonModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tm = await import("@teachablemachine/image");
      return tm.load(`${SEASON_MODEL_URL}model.json`, `${SEASON_MODEL_URL}metadata.json`);
    })().catch(() => {
      modelPromise = null;
      throw new Error("계절 분석 모델을 불러오지 못했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.");
    });
  }
  return modelPromise;
}

export async function predictSeason(source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, flipped = false): Promise<SeasonPrediction> {
  const model = await loadSeasonModel();
  return selectSeason(await model.predict(source, flipped));
}

export async function predictPhotoSeason(dataUrl: string): Promise<SeasonPrediction> {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  return predictSeason(image);
}