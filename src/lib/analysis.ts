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
    fashion: ["비비드 코랄", "에메랄드", "선플라