import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Camera, Eye, Palette, ScanFace, Sparkles, Wand2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import heroImg from "@/assets/hero-ai.jpg";
import { PERSONAL_COLORS } from "@/lib/analysis";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ISAAC AI — AI 퍼스널컬러 & 얼굴형 진단" },
      { name: "description", content: "사진 한 장으로 퍼스널 컬러와 얼굴형을 분석하고 어울리는 스타일을 추천받는 AI 서비스." },
      { property: "og:title", content: "ISAAC AI — AI 퍼스널컬러 & 얼굴형 진단" },
      { property: "og:description", content: "사진 한 장으로 퍼스널 컬러와 얼굴형을 분석하고 어울리는 스타일을 추천받는 AI 서비스." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Layout>
      <Hero />
      <Features />
      <HowItWorks />
      <ResultPreview />
      <AboutBlurb />
    </Layout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
      <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              ISAAC AI · v1.0 Live
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              AI가 당신의<br />
              <span className="text-gradient">퍼스널 컬러와 얼굴형</span>을<br />
              분석합니다
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              사진 한 장으로 나만의 스타일을 찾아보세요. 얼굴 인식 AI가 톤·형·이미지를 정밀 분석하고,
              어울리는 컬러·헤어·안경 스타일까지 추천합니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/analyze"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
              >
                무료 분석 시작하기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/examples"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                결과 예시 보기
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <Stat value="98%" label="평균 분석 정확도" />
              <Stat value="2.4s" label="평균 분석 시간" />
              <Stat value="12K+" label="누적 분석" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl glow-ring">
              <img
                src={heroImg}
                alt="AI 얼굴 분석"
                width={1024}
                height={1280}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="glass absolute left-4 top-4 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <span className="text-primary">●</span> Scanning · 128pt
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="glass absolute bottom-4 left-4 right-4 rounded-2xl p-3"
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Personal Color</span>
                  <span className="text-primary">Summer Cool · 96%</span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {PERSONAL_COLORS[1].palette.slice(0, 6).map((c) => (
                    <span key={c} className="h-6 flex-1 rounded-md" style={{ background: c }} />
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-primary/20 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-xl font-bold text-foreground">{value}</p>
      <p>{label}</p>
    </div>
  );
}

const features = [
  { icon: ScanFace, title: "얼굴 인식 AI 분석", desc: "128개 랜드마크 기반 정밀 인식." },
  { icon: Palette, title: "퍼스널컬러 진단", desc: "사계절 톤 분석과 추천 팔레트." },
  { icon: Eye, title: "얼굴형 분석", desc: "비율·각도 분석으로 4가지 얼굴형 분류." },
  { icon: Wand2, title: "스타일 추천", desc: "헤어·안경·메이크업까지 큐레이션." },
];

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader eyebrow="What we analyze" title="AI가 보는 4가지 차원" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-glow"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", icon: Camera, title: "사진 업로드", desc: "정면 사진을 드래그 또는 카메라로 촬영하세요." },
    { n: "02", icon: ScanFace, title: "AI 분석 진행", desc: "수 초 내 얼굴 랜드마크와 톤을 분석합니다." },
    { n: "03", icon: Sparkles, title: "결과 확인", desc: "맞춤형 컬러·스타일 리포트를 받아보세요." },
  ];
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16">
      <SectionHeader eyebrow="How it works" title="3단계로 끝나는 진단" />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-3xl border border-border bg-gradient-to-b from-card to-surface p-7"
          >
            <span className="font-mono text-xs text-primary">{s.n}</span>
            <s.icon className="mt-3 h-7 w-7 text-foreground" />
            <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ResultPreview() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader eyebrow="Result preview" title="실제 리포트는 이런 모습" />
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {PERSONAL_COLORS.slice(0, 3).map((pc, i) => (
          <motion.div
            key={pc.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-elegant"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-semibold">{pc.name}</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {88 + i * 3}% match
              </span>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-1.5">
              {pc.palette.map((c) => (
                <span key={c} className="aspect-square rounded-lg" style={{ background: c }} />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{pc.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {pc.fashion.map((t) => (
                <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs">{t}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link to="/examples" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          전체 결과 예시 보기 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function AboutBlurb() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 text-primary-foreground md:p-16">
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
        <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest opacity-80">About ISAAC</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              AI · 코딩 · 테크 서비스를 연구하는<br />개발 동아리, ISAAC.
            </h2>
            <p className="mt-4 max-w-xl text-sm opacity-90 md:text-base">
              머신러닝, 웹·앱 개발, 프로덕트 디자인까지 — 우리는 만들면서 배웁니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:scale-105"
            >
              동아리 소개 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">{title}</h2>
    </div>
  );
}
