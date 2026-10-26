import { SEASON_LABELS, type SeasonPrediction as Prediction } from "@/lib/season-policy";

export function SeasonPrediction({ prediction, error }: { prediction: Prediction | null; error?: string | null }) {
  return (
    <div className="border-t border-border bg-card px-5 py-4" aria-live="polite">
      <p className="text-sm font-semibold">{error ? "계절 분석 실패" : prediction ? `${SEASON_LABELS[prediction.season]} · ${Math.round(prediction.confidence * 100)}%` : "계절 분석 중…"}</p>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {prediction && <div className="mt-3 grid grid-cols-4 gap-3">
        {prediction.probabilities.map((p) => <div key={p.season} className="min-w-0 text-xs">
          <div className="flex flex-wrap justify-between gap-1"><span>{SEASON_LABELS[p.season]}</span><span className="font-mono text-primary">{Math.round(p.prob * 100)}%</span></div>
          <progress className="mt-1 h-1.5 w-full accent-primary" value={p.prob} max={1} />
        </div>)}
      </div>}
    </div>
  );
}