export type PersonalColorId =
  | "spring-light" | "spring-warm" | "spring-clear"
  | "summer-light" | "summer-cool" | "summer-soft"
  | "autumn-soft" | "autumn-warm" | "autumn-deep"
  | "winter-cool" | "winter-deep" | "winter-clear";

export type PersonalColor = {
  id: PersonalColorId | string;
  name: string;
  season: "spring" | "summer" | "autumn" | "winter";
  tone: "warm" | "cool";
  dominant: "light" | "deep" | "warm" | "cool" | "soft" | "clear";
  description: string;
  palette: string[];
  fashion: string[];
  avoid: string[];
  makeup: { lip: string; cheek: string; eye: string };
  metals: string[];
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
    id: "spring-light", name: "봄 라이트 (Light Spring)", season: "spring", tone: "warm", dominant: "light",
    description: "밝고 가벼운 따뜻함. 파스텔 톤의 웜이 가장 잘 어울립니다.",
    palette: ["#FFE5B4", "#FFD1A9", "#FFE7E1", "#F8E5A1", "#C8E6C9", "#FFC9A8"],
    fashion: ["아이보리", "라이트 피치", "샴페인", "민트"],
    avoid: ["블랙", "버건디", "차콜"],
    makeup: { lip: "피치 누드", cheek: "샤벳 피치", eye: "샴페인 골드" },
    metals: ["로즈골드", "샴페인 골드"],
  },
  {
    id: "spring-warm", name: "봄 웜 (Warm Spring)", season: "spring", tone: "warm", dominant: "warm",
    description: "따뜻함이 가장 강한 타입. 황금빛 코랄과 옐로우가 매력 포인트.",
    palette: ["#FFB347", "#FFD27F", "#F8C8DC", "#A8E6A1", "#FFE066", "#FF8C66"],
    fashion: ["코랄", "골든 옐로우", "라이트 카멜", "피치"],
    avoid: ["블루베이스 핑크", "퓨어 화이트"],
    makeup: { lip: "코랄 핑크", cheek: "피치 살구", eye: "골드 브라운" },
    metals: ["옐로우 골드", "브론즈"],
  },
  {
    id: "spring-clear", name: "봄 클리어 (Clear Spring)", season: "spring", tone: "warm", dominant: "clear",
    description: "선명한 채도와 밝은 명도. 비비드한 웜 컬러가 화사하게 어울립니다.",
    palette: ["#FF6F61", "#FFD400", "#00B894", "#FF8FA3", "#FFA500", "#48D1CC"],
    fashion: ["비비드 코랄", "에메랄드", "선플라워", "터쿼이즈"],
    avoid: ["탁한 베이지", "다크 카키"],
    makeup: { lip: "비비드 코랄", cheek: "선명한 피치", eye: "브론즈 옐로우" },
    metals: ["옐로우 골드", "샴페인 골드"],
  },
  {
    id: "summer-light", name: "여름 라이트 (Light Summer)", season: "summer", tone: "cool", dominant: "light",
    description: "밝고 부드러운 쿨. 라이트 파스텔과 소프트 블루가 매력적입니다.",
    palette: ["#E0F0FF", "#D9D7F1", "#F3E5F5", "#CDE7BE", "#FAD4D4", "#B6CFE2"],
    fashion: ["베이비 블루", "라일락", "라이트 그레이", "파우더 핑크"],
    avoid: ["오렌지", "토피", "다크 브라운"],
    makeup: { lip: "로즈 누드", cheek: "콜드 핑크", eye: "라일락 그레이" },
    metals: ["실버", "화이트 골드"],
  },
  {
    id: "summer-cool", name: "여름 쿨 (Cool Summer)", season: "summer", tone: "cool", dominant: "cool",
    description: "차가움이 가장 강한 여름. 푸른 기가 도는 핑크와 블루가 잘 어울립니다.",
    palette: ["#A7C7E7", "#C9B6E4", "#F4B6C2", "#B5EAD7", "#E0BBE4", "#9BB7D4"],
    fashion: ["스카이 블루", "라벤더", "로즈 핑크", "민트"],
    avoid: ["오렌지", "황색", "올리브"],
    makeup: { lip: "로즈 핑크", cheek: "쿨 핑크", eye: "라벤더 그레이" },
    metals: ["실버", "플래티넘"],
  },
  {
    id: "summer-soft", name: "여름 소프트 (Soft Summer)", season: "summer", tone: "cool", dominant: "soft",
    description: "채도가 가장 낮은 부드러운 쿨. 흐릿한 모브와 그레이쉬 톤이 매력.",
    palette: ["#B0A8B9", "#A89BB0", "#C8B6A6", "#9CAFB7", "#B8B5A2", "#D7BAA8"],
    fashion: ["모브", "더스티 로즈", "세이지", "토프"],
    avoid: ["비비드 컬러", "퓨어 화이트", "블랙"],
    makeup: { lip: "모브 핑크", cheek: "더스티 로즈", eye: "토프 그레이" },
    metals: ["새틴 실버", "브러쉬드 골드"],
  },
  {
    id: "autumn-soft", name: "가을 소프트 (Soft Autumn)", season: "autumn", tone: "warm", dominant: "soft",
    description: "채도가 낮고 부드러운 웜. 흙빛과 머스타드가 차분하게 어울립니다.",
    palette: ["#C2B280", "#A89F68", "#BFAE9E", "#9C8F73", "#D7B98E", "#A47551"],
    fashion: ["베이지", "올리브 카키", "더스티 머스타드", "토프"],
    avoid: ["비비드 핑크", "퓨어 화이트", "블랙"],
    makeup: { lip: "테라코타 누드", cheek: "샌드 베이지", eye: "올리브 브라운" },
    metals: ["매트 골드", "앤틱 브론즈"],
  },
  {
    id: "autumn-warm", name: "가을 웜 (Warm Autumn)", season: "autumn", tone: "warm", dominant: "warm",
    description: "따뜻함이 강한 가을. 황금빛 카멜과 머스타드가 풍부하게 어울립니다.",
    palette: ["#B5651D", "#8B5E3C", "#C68642", "#556B2F", "#D2691E", "#A0522D"],
    fashion: ["카멜", "머스타드", "올리브", "버건디"],
    avoid: ["블루베이스 핑크", "퓨어 화이트"],
    makeup: { lip: "벽돌 레드", cheek: "테라코타", eye: "카퍼 브라운" },
    metals: ["옐로우 골드", "브론즈"],
  },
  {
    id: "autumn-deep", name: "가을 딥 (Deep Autumn)", season: "autumn", tone: "warm", dominant: "deep",
    description: "깊고 진한 웜. 다크 브라운과 와인이 고급스럽게 어울립니다.",
    palette: ["#5D2E1F", "#8B0000", "#3E2723", "#5C4033", "#7B3F00", "#2F4F2F"],
    fashion: ["다크 초콜릿", "와인", "포레스트 그린", "딥 머스타드"],
    avoid: ["파스텔", "라이트 그레이"],
    makeup: { lip: "딥 와인", cheek: "벽돌 브라운", eye: "다크 브론즈" },
    metals: ["앤틱 골드", "코퍼"],
  },
  {
    id: "winter-cool", name: "겨울 쿨 (Cool Winter)", season: "winter", tone: "cool", dominant: "cool",
    description: "차갑고 선명한 겨울. 푸시아와 아이스 블루가 시크합니다.",
    palette: ["#1F4E79", "#C8102E", "#E60073", "#0F1A2B", "#6F2DA8", "#00A6FB"],
    fashion: ["딥 네이비", "푸시아", "퓨어 화이트", "아이스 블루"],
    avoid: ["오렌지", "옐로우 베이지"],
    makeup: { lip: "푸시아 핑크", cheek: "쿨 로즈", eye: "스모키 블루" },
    metals: ["실버", "플래티넘"],
  },
  {
    id: "winter-deep", name: "겨울 딥 (Deep Winter)", season: "winter", tone: "cool", dominant: "deep",
    description: "깊고 강한 쿨. 진한 버건디와 다크 네이비가 압도적으로 어울립니다.",
    palette: ["#0F1A2B", "#2C003E", "#5B0E2D", "#13294B", "#3B0918", "#1B1B1B"],
    fashion: ["블랙", "딥 버건디", "차콜", "다크 에메랄드"],
    avoid: ["파스텔", "베이지"],
    makeup: { lip: "다크 베리", cheek: "플럼", eye: "차콜 스모키" },
    metals: ["블랙 실버", "건메탈"],
  },
  {
    id: "winter-clear", name: "겨울 클리어 (Clear Winter)", season: "winter", tone: "cool", dominant: "clear",
    description: "선명하고 대비가 강한 쿨. 비비드한 원색이 또렷하게 어울립니다.",
    palette: ["#FFFFFF", "#000000", "#FF0033", "#00B4D8", "#9D4EDD", "#39FF14"],
    fashion: ["퓨어 화이트", "블랙", "트루 레드", "일렉트릭 블루"],
    avoid: ["베이지", "탁한 머스타드"],
    makeup: { lip: "트루 레드", cheek: "쿨 핑크", eye: "블랙 스모키" },
    metals: ["실버", "크롬"],
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
  {
    id: "heart",
    name: "하트형",
    description: "이마가 넓고 턱이 좁은 V라인. 턱 주변에 볼륨을 더하면 좋습니다.",
    hair: ["턱선 보브", "사이드 뱅", "C컬 아래 볼륨"],
    glasses: ["보텀 헤비", "라운드", "오벌"],
  },
  {
    id: "diamond",
    name: "다이아형",
    description: "광대가 가장 넓은 입체적인 얼굴형. 이마와 턱에 균형을 더하세요.",
    hair: ["사이드 뱅", "레이어드 단발", "이마 볼륨"],
    glasses: ["캣아이", "오벌", "탑 헤비"],
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
