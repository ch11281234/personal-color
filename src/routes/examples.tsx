import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { FACE_SHAPES, PERSONAL_COLORS } from "@/lib/analysis";

export const Route = createFileRoute("/examples")({
  head: () => ({
    meta: [
      { title: "결과 예시 — ISAAC AI" },
      { name: "description", content: "ISAAC AI가 제공하는 퍼스널컬러·얼굴형 분석 결과 샘플." },
      { property: "og:title", content: "결과 예시 — ISAAC AI" },
      { property: "og:description", content: "ISAAC AI가 제공하는 퍼스널컬러·얼굴형 분석 결과 샘플." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExamplesPage,
});

function ExamplesPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Result examples</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
            모든 톤과 얼굴형의 <span className="text-gradient">샘플 리포트</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            ISAAC AI가 분석할 수 있는 사계절 퍼스널 컬러와 4가지 얼굴형을 한눈에.
          </p>
        </div>

        <h2 className="mt-14 font-display text-2xl font-bold">퍼스널 컬러</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {PERSONAL_COLORS.map((pc, i) => (
            <motion.div
              key={pc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-elegant"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">{pc.name}</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                  {pc.tone}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{pc.description}</p>
              <div className="mt-4 grid grid-cols-6 gap-1.5">
                {pc.palette.map((c) => (
                  <span key={c} className="aspect-square rounded-lg" style={{ background: c }} />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {pc.fashion.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <h2 className="mt-16 font-display text-2xl font-bold">얼굴형</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FACE_SHAPES.map((fs, i) => (
            <motion.div
              key={fs.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <div className="flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary-glow/10">
                <FaceShapeGlyph id={fs.id} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{fs.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{fs.description}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                <p><span className="text-foreground">헤어</span> · {fs.hair[0]}</p>
                <p><span className="text-foreground">안경</span> · {fs.glasses[0]}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-primary p-10 text-center text-primary-foreground">
          <h2 className="font-display text-2xl font-bold md:text-3xl">지금 내 얼굴은 어떤 톤일까?</h2>
          <p className="mt-2 text-sm opacity-90">사진 한 장이면 충분합니다.</p>
          <Link
            to="/analyze"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background"
          >
            무료 분석 시작 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function FaceShapeGlyph({ id }: { id: string }) {
  const common = "stroke-primary";
  return (
    <svg width="64" height="80" viewBox="0 0 64 80" fill="none" strokeWidth="2.5" className={common}>
      {id === "oval" && <ellipse cx="32" cy="40" rx="22" ry="32" />}
      {id === "round" && <circle cx="32" cy="40" r="26" />}
      {id === "square" && <rect x="8" y="10" width="48" height="60" rx="8" />}
      {id === "long" && <ellipse cx="32" cy="40" rx="18" ry="36" />}
    </svg>
  );
}
