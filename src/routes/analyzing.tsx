import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { loadGender, loadImage, saveAnalysis } from "@/lib/analysis-store";

export const Route = createFileRoute("/analyzing")({
  head: () => ({ meta: [{ title: "분석 중 — ISAAC AI" }] }),
  component: AnalyzingPage,
});

const STAGES = [
  "AI 모델 로딩 중...",
  "얼굴 랜드마크 검출 중...",
  "피부 픽셀 샘플링 중...",
  "얼굴 비율 계산 중...",
  "퍼스널 컬러 매칭 중...",
];

function AnalyzingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const img = loadImage();
    if (!img) {
      navigate({ to: "/analyze" });
      return;
    }
    setImage(img);

    let p = 0;
    tickRef.current = setInterval(() => {
      p = Math.min(95, p + (95 - p) * 0.06 + 0.5);
      setProgress(p);
      setStage(Math.min(STAGES.length - 1, Math.floor((p / 100) * STAGES.length)));
    }, 100);

    (async () => {
      try {
        const { analyzeFace, loadModels } = await import("@/lib/face-analyzer");
        const { loadTMModel } = await import("@/lib/tm-season");
        await Promise.all([loadModels(), loadTMModel()]);
        const result = await analyzeFace(img, loadGender() ?? "male");
        saveAnalysis(result);
        if (tickRef.current) clearInterval(tickRef.current);
        setProgress(100);
        setStage(STAGES.length - 1);
        setTimeout(() => navigate({ to: "/result" }), 400);
      } catch (e: unknown) {
        if (tickRef.current) clearInterval(tickRef.current);
        const msg = e instanceof Error ? e.message : "분석 중 오류가 발생했습니다.";
        setError(msg);
      }
    })();
    // No cleanup that cancels the work — React 18 StrictMode would otherwise
    // kill the interval/analyze immediately on the dev-only double-invoke.
  }, [navigate]);

  const r = 88;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;

  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Step 02 · Analyzing</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          AI가 얼굴형과 피부 톤을 분석 중입니다
        </h1>

        <div className="relative mx-auto mt-12 h-[280px] w-[280px]">
          {image && (
            <div className="absolute inset-6 overflow-hidden rounded-full glow-ring">
              <img src={image} alt="" className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_var(--color-primary)] animate-scan" />
              <div className="pointer-events-none absolute inset-0 bg-primary/10 mix-blend-overlay" />
            </div>
          )}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={r} fill="none" stroke="var(--color-border)" strokeWidth="4" />
            <circle
              cx="100" cy="100" r={r} fill="none"
              stroke="url(#g)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.2s linear" }}
            />
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-primary-glow)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {error ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-destructive/40 bg-destructive/5 p-5 text-left">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">분석 실패</span>
            </div>
            <p className="mt-2 text-sm text-foreground">{error}</p>
            <Link to="/analyze" className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
              다시 시도하기
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 font-mono text-2xl font-bold text-gradient">
              {Math.floor(progress)}%
            </div>
            <motion.p
              key={stage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              {STAGES[stage]}
            </motion.p>

            <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-2 text-xs text-muted-foreground">
              <Metric label="Landmarks" value="68" />
              <Metric label="Skin px" value="∼2k" />
              <Metric label="Models" value="2" />
            </div>
          </>
        )}
      </section>
    </Layout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <p className="font-mono text-base font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider">{label}</p>
    </div>
  );
}
