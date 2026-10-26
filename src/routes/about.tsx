import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Code2, Cpu, Layers } from "lucide-react";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ISAAC — AI · 코딩 · 테크 동아리" },
      { name: "description", content: "아이작(ISAAC)은 AI, 코딩, 테크 서비스를 연구하는 개발 동아리입니다." }, { property: "og:title", content: "About ISAAC — AI · 코딩 · 테크 동아리" }, { property: "og:description", content: "아이작(ISAAC)은 AI, 코딩, 테크 서비스를 연구하는 개발 동아리입니다." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  { icon: Brain, title: "AI 프로젝트 연구", desc: "비전·언어·추천 모델을 직접 학습하고 실험합니다." },
  { icon: Code2, title: "웹 / 앱 개발", desc: "프로덕트 단위로 풀스택 서비스를 만듭니다." },
  { icon: Cpu, title: "머신러닝 서비스", desc: "모델을 실제 사용자 가치로 연결합니다." },
  { icon: Layers, title: "다양한 테크 프로젝트", desc: "디자인·DevOps·해커톤까지 폭넓게." },
];

function AboutPage() {
  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-primary">About ISAAC</p>
            <h1 className="mt-3 font-display text-5xl font-bold md:text-7xl">
              We <span className="text-gradient">build</span>,<br />we learn.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
              아이작(ISAAC)은 AI, 코딩, 테크 서비스를 연구하는 개발 동아리입니다.
              우리는 작은 프로토타입에서 시작해 실제 사용자에게 닿는 프로덕트를 만듭니다.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl border border-border bg-card p-6 transition-all hover:shadow-glow"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Mission</p>
            <h2 className="mt-2 font-display text-2xl font-bold">기술로 일상을 더 가깝게</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              우리는 어려운 기술을 단순한 사용자 경험으로 번역합니다.
              ISAAC AI 프로젝트는 그 첫 번째 결과물입니다.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Stack</p>
            <h2 className="mt-2 font-display text-2xl font-bold">우리가 쓰는 기술</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["React", "TypeScript", "Tailwind", "PyTorch", "FastAPI", "TensorFlow", "Figma", "Vercel"].map((t) => (
                <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-3xl bg-gradient-primary p-10 text-center text-primary-foreground">
          <h2 className="font-display text-2xl font-bold md:text-3xl">함께 만들고 싶다면</h2>
          <p className="mt-2 text-sm opacity-90">아이작은 새로운 멤버를 기다립니다.</p>
          <Link
            to="/analyze"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background"
          >
            먼저 ISAAC AI 체험하기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
