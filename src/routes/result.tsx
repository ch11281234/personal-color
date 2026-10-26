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

const REGION_LABEL: Record<string, string> = {
  forehead: "이마",
  leftCheek: "왼쪽 볼",
  rightCheek: "오른쪽 볼",
  noseBridge: "콧등",
  chin: "턱",
};

const SEASON_LABEL: Record<string, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
};

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

  const topProbs = data.probabilities.slice(0, 4);
  const seasonProbs = [...data.seasonProbabilities].sort((a, b) => b.prob - a.prob);

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
          {/* Left: photo + measurements */}
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
                얼굴 랜드마크 68점 · 5개 피부 영역 LAB 측정 · Gray-world 조명 보정을 종합한 정확도입니다.
              </p>
            </div>

            {/* Skin (calibrated) */}
            <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">측정된 피부톤 (조명 보정 후)</p>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-xl border border-border shadow-elegant"
                  style={{ background: `rgb(${data.skin.r}, ${data.skin.g}, ${data.skin.b})` }}
                />
                <div className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                  <p>RGB({data.skin.r}, {data.skin.g}, {data.skin.b})</p>
                  <p>LAB L*{data.skin.L} a*{data.skin.a} b*{data.skin.bAxis} · Chroma {data.skin.chroma}</p>
                  <p>Warmth {data.skin.warmth} · WB gain {data.whiteBalanceGains.r}/{data.whiteBalanceGains.g}/{data.whiteBalanceGains.b}</p>
                </div>
              </div>
            </div>

            {/* Region swatches */}
            <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">영역별 피부 측정값</p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {data.regions.map((rg) => (
                  <div key={rg.region} className="text-center">
                    <div
                      className="aspect-square w-full rounded-lg border border-border shadow-elegant"
                      style={{ background: `rgb(${rg.r}, ${rg.g}, ${rg.b})` }}
                      title={`L*${rg.L} a*${rg.a} b*${rg.bAxis}`}
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">{REGION_LABEL[rg.region]}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">L{Math.round(rg.L)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contrast / Hair */}
            {data.hair && (
              <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">피부–머리카락 대비</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex">
                    <div className="h-10 w-10 rounded-l-lg border border-border" style={{ background: `rgb(${data.skin.r}, ${data.skin.g}, ${data.skin.b})` }} />
                    <div className="h-10 w-10 rounded-r-lg border border-l-0 border-border" style={{ background: `rgb(${data.hair.r}, ${data.hair.g}, ${data.hair.b})` }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ΔL*</span>
                      <span className="font-mono font-bold text-primary">{data.contrast}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${Math.min(100, (data.contrast / 60) * 100)}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {data.contrast > 35 ? "강한 대비 (Clear/Deep 계열)" : data.contrast < 20 ? "낮은 대비 (Soft 계열)" : "중간 대비"}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                <span className="font-mono text-xs uppercase tracking-widest text-primary">Personal Color · 12-type</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                  {pc.tone === "warm" ? "웜톤" : "쿨톤"} · {pc.dominant}
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">{pc.name}</h2>
              {data.seasonPrediction && <p className="mt-2 text-sm font-semibold text-primary">계절 모델 · {SEASON_LABEL[data.seasonPrediction.season]} · {(data.seasonPrediction.confidence * 100).toFixed(0)}% 분류 점수</p>}
              <p className="mt-2 text-sm text-muted-foreground">{pc.description}</p>
              <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
                <span className="font-mono text-primary">AI 근거 · </span>{data.reasons.color}
              </div>

              {/* Season probabilities */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{data.seasonPrediction ? "계절 모델 분류 점수" : "계절 확률 분포"}</p>
                <div className="space-y-1.5">
                  {seasonProbs.map((s) => (
                    <div key={s.season} className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-muted-foreground">{SEASON_LABEL[s.season] ?? s.season}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.prob * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-primary"
                        />
                      </div>
                      <span className="w-10 text-right font-mono font-bold text-primary">{(s.prob * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top sub-types */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{data.seasonPrediction ? `${SEASON_LABEL[pc.season]} 세부 유형 매칭` : "Top 4 세부 유형"}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {topProbs.map((t, i) => (
                    <div key={t.id} className={`flex items-center justify-between rounded-lg border px-2 py-1.5 text-[11px] ${i === 0 ? "border-primary/40 bg-primary/5" : "border-border bg-surface"}`}>
                      <span className="truncate">{t.name}</span>
                      <span className="ml-2 shrink-0 font-mono font-bold text-primary">{(t.prob * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">패션 컬러</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pc.fashion.map((t: string) => (
                      <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">메탈/액세서리</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pc.metals.map((t: string) => (
                      <span key={t} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{t}</span>
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
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">피해야 할 컬러</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pc.avoid.map((t: string) => (
                      <span key={t} className="rounded-full border border-destructive/40 bg-destructive/5 px-2.5 py-1 text-xs text-destructive">{t}</span>
                    ))}
                  </div>
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
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">{fs.name} · {data.koreanShape.name}</h2>
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
                <Stat label="Curve" value={data.metrics.jawCurvature.toString()} />
                <Stat label="F/C" value={data.metrics.foreheadCheek.toString()} />
                <Stat label="J/C" value={data.metrics.jawCheek.toString()} />
                <Stat label="F/J" value={data.metrics.foreheadJaw.toString()} />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-2 py-1.5">
      <p className="text-foreground">{value}</p>
      <p className="text-[9px] uppercase tracking-wider">{label}</p>
    </div>
  );
}
