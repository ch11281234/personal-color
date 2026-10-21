import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Image as ImageIcon, RefreshCw, Sparkles, Upload, User, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { saveGender, saveImage } from "@/lib/analysis-store";
import type { Gender } from "@/lib/hair-recommendations";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "AI 분석 — ISAAC AI" },
      { name: "description", content: "정면 사진을 업로드하면 AI가 퍼스널 컬러와 얼굴형을 분석합니다." },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCapture = useCallback((dataUrl: string) => {
    setPreview(dataUrl);
    setCameraOpen(false);
  }, []);

  const startAnalysis = () => {
    if (!preview || !gender) return;
    saveImage(preview);
    saveGender(gender);
    navigate({ to: "/analyzing" });
  };

  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Step 01 · Upload</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">사진을 업로드하세요</h1>
          <p className="mt-3 text-muted-foreground">정면, 밝은 조명, 필터 없는 사진을 권장합니다.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10"
        >
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all ${
              dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-card"
            }`}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="미리보기" className="mx-auto max-h-[480px] w-auto" />
                <button
                  onClick={() => setPreview(null)}
                  className="absolute right-3 top-3 glass flex h-9 w-9 items-center justify-center rounded-full"
                  aria-label="제거"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-4 px-6 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-display text-xl font-semibold">클릭 또는 드래그하여 업로드</p>
                  <p className="mt-1 text-sm text-muted-foreground">JPG, PNG · 최대 10MB</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              <ImageIcon className="h-4 w-4" /> 갤러리에서 선택
            </button>
            <button
              onClick={() => cameraRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              <Camera className="h-4 w-4" /> 카메라 촬영
            </button>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Tip text="정면을 바라보는 사진" />
            <Tip text="밝고 균일한 조명" />
            <Tip text="필터·메이크업 최소화" />
          </div>

          <div className="mt-10">
            <p className="text-center text-xs font-mono uppercase tracking-widest text-primary">Step 02 · 성별 선택</p>
            <p className="mt-1 text-center text-sm text-muted-foreground">성별에 맞춘 헤어/안경 추천을 제공합니다.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md sm:mx-auto">
              <button
                onClick={() => setGender("male")}
                className={`group flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 transition-all ${
                  gender === "male"
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <User className={`h-7 w-7 ${gender === "male" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold">남성 (Male)</span>
              </button>
              <button
                onClick={() => setGender("female")}
                className={`group flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 transition-all ${
                  gender === "female"
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <UserRound className={`h-7 w-7 ${gender === "female" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold">여성 (Female)</span>
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              disabled={!preview || !gender}
              onClick={startAnalysis}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all enabled:hover:scale-[1.03] disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              AI 분석 시작
            </button>
            {!gender && preview && (
              <p className="text-xs text-muted-foreground">성별을 선택해주세요</p>
            )}
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {text}
    </div>
  );
}
