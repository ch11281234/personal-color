import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Copy, Download, RefreshCw, Share2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import type { RealAnalysisResult } from "@/lib/face-analyzer";
import { loadAnalysis } from "@/lib/analysis-store";

export const Route = createFileRoute("/result")({
  head: () => ({ meta: [{ title: "분석 결과 — ISAAC AI" }] }),
  component: ResultPage,
});

function ResultPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<RealAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const r = loadAnalysis();
    if (!r) navigate({ to: "/analyze" });
    else setData(r);
  }, [navigate]);

  if (!data) return null;
  const { personalColor: pc, faceShape: fs, confidence, imageUrl } = data;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `isaac-ai-${pc.id}.png`;
    a.click();
  };

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Result · {new Date(data.analyzedAt).toLocaleString("ko-KR")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-5xl">
              당신의 <span className="text-gradient">스타일 리포트</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadImage} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
              <Download className="h-4 w-4" /> 이미지 저장
            </button>
            <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              {copied ? "복사됨" : "링크 복사"}
            </button>
            <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
              <Share2 className="h-4 w-4" /> 공유
            </button>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Left: photo + confidence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border bg-card p-5 shadow-elegant"
          >
            <div className="relative overflow-hidden rounded-2xl glow-ring">
              <img src={imageUrl} alt="분석된 사진" className="aspect-[4/5] w-full object-cover" />
              <div className="absolute left-3 top-3 glass rounded-full px-3 py-1 text-xs font-medium">
                <Sparkles className="mr-1 inline h-3 w-3 text-primary" /> Analyzed
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">AI Confidence</span>
                <span className="font-mono font-bold text-primary">{confidence}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-primary shadow-glow"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                얼굴 랜드마크 68점과 피부 픽셀 샘플을 종합한 분석 정확도입니다.
              </p>
            </div>

            {/* Skin RGB swatch */}
            <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">측정된 피부톤</p>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-xl border border-border shadow-elegant"
                  style={{ background: `rgb(${data.skin.r}, ${data.skin.g}, ${data.skin.b})` }}
                />
                <div className="font-mono text-xs text-muted-foreground">
                  <p>RGB({data.skin.r}, {data.skin.g}, {data.skin.b})</p>
                  <p>Warmth {data.skin.warmth} · Bright {(data.skin.brightness * 100).toFixed(0)}% · Sat {(data.skin.saturation * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>

            <Link
              to="/analyze"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" /> 다시 분석하기
            </Link>
          </motion.div>

          {/* Right: details */}
          <div className="grid gap-6">
            {/* Personal color */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-3xl border border-border bg-card p-7 shadow-elegant"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-primary">Personal Color</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                  {pc.tone} tone
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">{pc.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{pc.description}</p>
              <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
                <span className="font-mono text-primary">AI 근거 · </span>{data.reasons.color}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">추천 컬러 팔레트</p>
                <div className="grid grid-cols-6 gap-2">
                  {pc.palette.map((c: string) => (
                    <div key={c} className="group">
                      <div className="aspect-square rounded-xl shadow-elegant transition-transform group-hover:scale-105" style={{ background: c }} />
                      <p className="mt-1.5 text-center font-mono text-[10px] text-muted-foreground">{c}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">패션</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pc.fashion.map((t: string) => (
                      <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">메이크업</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li><span className="text-muted-foreground">립</span> · {pc.makeup.lip}</li>
                    <li><span className="text-muted-foreground">치크</span> · {pc.makeup.cheek}</li>
                    <li><span className="text-muted-foreground">아이</span> · {pc.makeup.eye}</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Face shape */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-border bg-card p-7 shadow-elegant"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-primary">Face Shape · {data.gender === "male" ? "남성" : "여성"}</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {data.koreanShape.id}
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">{data.koreanShape.name}</h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{data.koreanShape.range}</p>
              <p className="mt-2 text-sm text-muted-foreground">{fs.description}</p>
              <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
                <span className="font-mono text-primary">AI 근거 · </span>{data.reasons.shape}
              </div>

              {/* Facial Index gauge */}
              <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-muted-foreground">안면지수 (Facial Index)</span>
                  <span className="font-mono text-lg font-bold text-gradient">{data.facialIndex}</span>
                </div>
                <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-emerald-400 to-rose-500 opacity-30" />
                  <motion.div
                    initial={{ left: "0%" }}
                    animate={{ left: `${Math.min(100, Math.max(0, ((data.facialIndex - 75) / 25) * 100))}%` }}
                    transition={{ duration: 0.8 }}
                    className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded bg-primary shadow-glow"
                  />
                </div>
                <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  <span>75 초단안</span><span>85 중안</span><span>100 초장안</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 text-center font-mono text-[10px] text-muted-foreground">
                <Stat label="Index" value={data.facialIndex.toString()} />
                <Stat label="L/W" value={data.metrics.lengthRatio.toString()} />
                <Stat label="Jaw°" value={data.metrics.jawAngleDeg.toString()} />
                <Stat label="Cheek" value={`${data.metrics.cheekWidth}px`} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    추천 헤어스타일 · {data.gender === "male" ? "남성" : "여성"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{data.hairRecommendation}</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">추천 안경</p>
                  <p className="mt-2 text-sm leading-relaxed">{data.glassesRecommendation}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function RecBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-2 py-1.5">
      <p className="text-foreground">{value}</p>
      <p className="text-[9px] uppercase tracking-wider">{label}</p>
    </div>
  );
}
