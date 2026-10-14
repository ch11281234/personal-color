// Teachable Machine season classifier (browser-only; import dynamically).
export type Season = "spring" | "summer" | "autumn" | "winter";

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/CAktPOFDw/";

const LABEL_MAP: Record<string, Season> = {
  spring: "spring", 봄: "spring",
  summer: "summer", 여름: "summer",
  fall: "autumn", autumn: "autumn", 가을: "autumn",
  winter: "winter", 겨울: "winter",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let modelPromise: Promise<any> | null = null;

export function loadSeasonModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tmImage = await import("@teachablemachine/image");
      return tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
    })().catch((e) => {
      modelPromise = null;
      throw e;
    });
  }
  return modelPromise;
}

export async function predictSeason(
  img: HTMLImageElement | HTMLCanvasElement,
): Promise<{ top: Season; probs: Record<Season, number> }> {
  const model = await loadSeasonModel();
  const preds: { className: string; probability: number }[] = await model.predict(img);
  const probs: Record<Season, number> = { spring: 0, summer: 0, autumn: 0, winter: 0 };
  for (const p of preds) {
    const s = LABEL_MAP[p.className.trim().toLowerCase()] ?? LABEL_MAP[p.className.trim()];
    if (s) probs[s] += p.probability;
  }
  const top = (Object.keys(probs) as Season[]).reduce((a, b) => (probs[b] > probs[a] ? b : a));
  return { top, probs };
}
