export type PersonalColor = {
  id: string;
  name: string;
  season: "spring" | "summer" | "autumn" | "winter";
  tone: "warm" | "cool";
  description: string;
  palette: string[];
  fashion: string[];
  makeup: { lip: string; cheek: string; eye: string };
};

export type FaceShape = {
  id: string;
  name: string;
  description: string;
  hair: string[];
  glasses: string[];
};

export const PERSONAL_COLORS: PersonalColor[] = [
  {
    id: "spring-warm",
    name: "봄 웜톤 (Spring Warm)",
    season: "spring",
    tone: "warm",
    description: "맑고 화사한 피부톤. 따뜻하고 밝은 컬러가 잘 어울립니다.",
    palette: ["#FFB347", "#FFD27F", "#F8C8DC", "#A8E6A1", "#FFE066", "#FF8C66"],
    fashion: ["코랄", "아이보리", "라이트 카멜", "피치"],
    makeup: { lip: "코랄 핑크", cheek: "피치 살구", eye: "골드 브라운" },
  },
  {
    id: "summer-cool",
    name: "여름 쿨톤 (Summer Cool)",
    season: "summer",
    tone: "cool",
    description: "부드럽고 시원한 피부톤. 파스텔과 라벤더가 매력을 살려줍니다.",
    palette: ["#A7C7E7", "#C9B6E4", "#F4B6C2", "#B5EAD7", "#E0BBE4", "#9BB7D4"],
    fashion: ["스카이 블루", "라벤더", "로즈 핑크", "민트"],
    makeup: { lip: "로즈 핑크", cheek: "쿨 핑크", eye: "라벤더 그레이" },
  },
  {
    id: "autumn-warm",
    name: "가을 웜톤 (Autumn Warm)",
    season: "autumn",
    tone: "warm",
    description: "차분하고 깊이 있는 피부톤. 머스타드, 카멜이 고급스럽게 어울립니다.",
    palette: ["#B5651D", "#8B5E3C", "#C68642", "#556B2F", "#D2691E", "#A0522D"],
    fashion: ["카멜", "머스타드", "올리브", "버건디"],
    makeup: { lip: "벽돌 레드", cheek: "테라코타", eye: "카퍼 브라운" },
  },
  {
    id: "winter-cool",
    name: "겨울 쿨톤 (Winter Cool)",
    season: "winter",
    tone: "cool",
    description: "선명하고 차가운 피부톤. 강한 대비의 컬러가 시크하게 어울립니다.",
    palette: ["#0F1A2B", "#FFFFFF", "#C8102E", "#1F4E79", "#6F2DA8", "#E60073"],
    fashion: ["블랙", "퓨어 화이트", "딥 네이비", "푸시아"],
    makeup: { lip: "체리 레드", cheek: "쿨 로즈", eye: "스모키 그레이" },
  },
];

export const FACE_SHAPES: FaceShape[] = [
  {
    id: "oval",
    name: "계란형",
    description: "이상적인 비율의 얼굴형. 대부분의 스타일이 잘 어울립니다.",
    hair: ["롱 레이어드", "사이드 파트", "자연스러운 웨이브"],
    glasses: ["라운드", "웰링턴", "스퀘어"],
  },
  {
    id: "round",
    name: "둥근형",
    description: "부드럽고 친근한 인상. 세로 라인을 강조하면 좋습니다.",
    hair: ["롱 스트레이트", "사이드 뱅", "하이 포니테일"],
    glasses: ["스퀘어", "직사각형", "각진 프레임"],
  },
  {
    id: "square",
    name: "각진형",
    description: "또렷하고 강한 인상. 곡선 라인으로 부드럽게 보완하면 좋습니다.",
    hair: ["사이드 파트 웨이브", "롱 보브", "C컬"],
    glasses: ["라운드", "오벌", "캣아이"],
  },
  {
    id: "long",
    name: "긴형",
    description: "세련되고 성숙한 인상. 가로 볼륨이 중요합니다.",
    hair: ["풀 뱅", "숄더 보브", "볼륨 펌"],
    glasses: ["오버사이즈", "두꺼운 프레임", "에비에이터"],
  },
];

export type AnalysisResult = {
  personalColor: PersonalColor;
  faceShape: FaceShape;
  confidence: number;
  imageUrl: string;
  analyzedAt: string;
};

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateAnalysis(imageUrl: string): AnalysisResult {
  return {
    personalColor: pickRandom(PERSONAL_COLORS),
    faceShape: pickRandom(FACE_SHAPES),
    confidence: 87 + Math.floor(Math.random() * 11),
    imageUrl,
    analyzedAt: new Date().toISOString(),
  };
}
