import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { generateAnalysis } from "@/lib/analysis";
import { loadImage, saveAnalysis } from "@/lib/analysis-store";

export const Route = createFileRoute("/analyzing")({
  head: () => ({ meta: [{ title: "분석 중 — ISAAC AI" }] }),
  component: AnalyzingPage,
});

const STAGES = [
  "얼굴 랜드마크 검출 중...",
  "피부 톤 샘플링 중...",
  "골격 비율 분석 중...",
  "퍼스널 컬러 매칭 중...",
  "스타일 추천 생성 중...",
];

function AnalyzingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const img = loadImage();
    if (!img) {
      navigate({ to: "/analyze" });
      return;
    }
    setImage(img);

    const total = 3200;
    const start = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / total) * 100);
      setProgress(p);
      setStage(Math.min(STAGES.length - 1, Math.floor((p / 100) * STAGES.length)));
      if (p >= 100) {
        clearInterval(tick);
        const result = generateAnalysis(img);
        saveAnalysis(result);
        setTimeout(() => navigate({ to: "/result" }), 300);
      }
    }, 60);
    return () => clearInterval(tick);
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
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-primary-glow)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

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
          <Metric label="Landmarks" value="128" />
          <Metric label="Tone Bands" value="32" />
          <Metric label="Models" value="4" />
        </div>
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
