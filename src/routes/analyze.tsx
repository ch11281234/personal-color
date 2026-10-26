import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Image as ImageIcon, RefreshCw, Sparkles, Upload, User, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { SeasonPrediction } from "@/components/SeasonPrediction";
import type { SeasonPrediction as Prediction } from "@/lib/season-policy";
import { saveGender, saveImage } from "@/lib/analysis-store";
import type { Gender } from "@/lib/hair-recommendations";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "AI 분석 — ISAAC AI" },
      { name: "description", content: "정면 사진을 업로드하면 AI가 퍼스널 컬러와 얼굴형을 분석합니다." }, { property: "og:title", content: "AI 분석 — ISAAC AI" }, { property: "og:description", content: "정면 사진을 업로드하면 AI가 퍼스널 컬러와 얼굴형을 분석합니다." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [seasonError, setSeasonError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setPrediction(null);
    setSeasonError(null);
    if (preview) {
      void import("@/lib/teachable-season").then((m) => m.predictPhotoSeason(preview)).then((result) => {
        if (!cancelled) setPrediction(result);
      }).catch((e: unknown) => {
        if (!cancelled) setSeasonError(e instanceof Error ? e.message : "계절 분석에 실패했습니다.");
      });
    }
    return () => { cancelled = true; };
  }, [preview]);

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
                <Button
                  onClick={() => setPreview(null)}
                  className="absolute right-3 top-3 glass flex h-9 w-9 items-center justify-center rounded-full"
                  aria-label="제거"
                >
                  <X className="h-4 w-4" />
                </Button>
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
              </label>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }} />
          {preview && <SeasonPrediction prediction={prediction} error={seasonError} />}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              <ImageIcon className="h-4 w-4" /> 갤러리에서 선택
            </Button>
            <Button
              onClick={() => setCameraOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              <Camera className="h-4 w-4" /> 카메라 촬영
            </Button>
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
              <Button
                onClick={() => setGender("male")}
                className={`group flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 transition-all ${
                  gender === "male"
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <User className={`h-7 w-7 ${gender === "male" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold">남성 (Male)</span>
              </Button>
              <Button
                onClick={() => setGender("female")}
                className={`group flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 transition-all ${
                  gender === "female"
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <UserRound className={`h-7 w-7 ${gender === "female" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold">여성 (Female)</span>
              </Button>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              disabled={!preview || !gender || !prediction}
              onClick={startAnalysis}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all enabled:hover:scale-[1.03] disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              AI 분석 시작
            </Button>
            {!gender && preview && (
              <p className="text-xs text-muted-foreground">성별을 선택해주세요</p>
            )}
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {cameraOpen && (
          <CameraModal onCapture={handleCapture} onClose={() => setCameraOpen(false)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}

function CameraModal({ onCapture, onClose }: { onCapture: (dataUrl: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [seasonError, setSeasonError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setError(null);
    setPrediction(null);
    setSeasonError(null);
    setReady(false);
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          if (cancelled) return;
          setReady(true);
          const classify = async () => {
            if (cancelled) return;
            const video = videoRef.current;
            if (!video || video.readyState < 2) {
              timer = setTimeout(classify, 500);
              return;
            }
            try {
              const { predictSeason } = await import("@/lib/teachable-season");
              const result = await predictSeason(video, facing === "user");
              if (!cancelled) { setPrediction(result); setSeasonError(null); }
            } catch (e: unknown) {
              if (!cancelled) setSeasonError(e instanceof Error ? e.message : "계절 분석에 실패했습니다.");
            }
            if (!cancelled) timer = setTimeout(classify, 700);
          };
          void classify();
        }
      } catch {
        if (!cancelled) setError("카메라에 접근할 수 없습니다. 브라우저 카메라 권한을 허용해주세요.");
      }
    };
    start();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL("image/jpeg", 0.92));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-glow"
      >
        <div className="flex items-center justify-between px-5 py-3">
          <p className="font-display text-sm font-semibold">카메라 촬영</p>
          <Button onClick={onClose} className="glass flex h-8 w-8 items-center justify-center rounded-full" aria-label="닫기">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative aspect-[4/3] bg-secondary">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`} />
              {/* 얼굴 가이드라인 */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[72%] w-[54%] rounded-[50%] border-2 border-dashed border-primary/70 shadow-glow" />
              </div>
              <p className="pointer-events-none absolute bottom-3 left-0 right-0 bg-background/80 py-1 text-center text-xs text-foreground">
                얼굴을 타원 안에 맞춰주세요
              </p>
            </>
          )}
        </div>
        {!error && <SeasonPrediction prediction={prediction} error={seasonError} />}

        <div className="flex items-center justify-center gap-3 px-5 py-4">
          <Button
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            <RefreshCw className="h-4 w-4" /> 전환
          </Button>
          <Button
            onClick={capture}
            disabled={!!error || !ready}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
          >
            <Camera className="h-4 w-4" /> 촬영
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {text}
    </div>
  );
}
