export type Gender = "male" | "female";

export type KoreanFaceShape = {
  id: "ultra-long" | "long" | "oval" | "round" | "ultra-short";
  name: string;
  range: string;
  hair: Record<Gender, string>;
  glasses: Record<Gender, string>;
  makeup?: Record<Gender, string>;
};

export const KOREAN_FACE_SHAPES: KoreanFaceShape[] = [
  {
    id: "ultra-long",
    name: "초장안 (매우 긴 얼굴)",
    range: "안면지수 ≥ 95",
    hair: {
      male: "옆머리 볼륨을 살린 댄디컷, 앞머리를 내리는 스타일을 추천합니다.",
      female: "옆볼륨이 풍성한 S컬 펌과 풀뱅 앞머리를 추천합니다.",
    },
    glasses: {
      male: "두꺼운 프레임의 웰링턴, 보스턴 안경",
      female: "오버사이즈 라운드, 두꺼운 뿔테 안경",
    },
  },
  {
    id: "long",
    name: "장안 (긴 얼굴)",
    range: "안면지수 90 ~ 95",
    hair: {
      male: "리프컷이나 가르마펌으로 시선을 분산시키세요. 옆머리 다운펌은 비추천합니다.",
      female: "턱선 길이의 단발이나 굵은 웨이브로 가로 폭을 보완하세요.",
    },
    glasses: {
      male: "가로로 긴 직사각형 프레임, 에비에이터",
      female: "라운드, 캣아이로 곡선을 더하세요",
    },
  },
  {
    id: "oval",
    name: "중안 (계란형)",
    range: "안면지수 85 ~ 90",
    hair: {
      male: "아이비리그컷부터 가일컷까지 어떤 스타일도 완벽 소화 가능합니다.",
      female: "숏컷부터 긴 생머리까지 자유롭게 시도해보세요.",
    },
    glasses: {
      male: "거의 모든 프레임이 잘 어울립니다",
      female: "거의 모든 프레임이 잘 어울립니다",
    },
  },
  {
    id: "round",
    name: "단안 (둥근형)",
    range: "안면지수 80 ~ 85",
    hair: {
      male: "리젠트컷이나 포마드로 이마를 드러내어 얼굴을 길어 보이게 하세요.",
      female: "사선 가르마나 롱 레이어드 컷으로 갸름한 실루엣을 만드세요.",
    },
    glasses: {
      male: "각진 스퀘어, 직사각형 프레임",
      female: "캣아이, 각진 프레임으로 또렷한 인상",
    },
  },
  {
    id: "ultra-short",
    name: "초단안 (각진형)",
    range: "안면지수 < 80",
    hair: {
      male: "소프트 투블럭이나 6:4 가르마로 부드러운 인상을 연출하세요.",
      female: "턱선을 감싸는 레이어드 컷이나 시스루 뱅을 추천합니다.",
    },
    glasses: {
      male: "라운드, 오벌 프레임으로 곡선 보완",
      female: "라운드, 오벌 프레임으로 부드럽게",
    },
  },
];

export function classifyKoreanShape(facialIndex: number): KoreanFaceShape {
  if (facialIndex >= 95) return KOREAN_FACE_SHAPES[0];
  if (facialIndex >= 90) return KOREAN_FACE_SHAPES[1];
  if (facialIndex >= 85) return KOREAN_FACE_SHAPES[2];
  if (facialIndex >= 80) return KOREAN_FACE_SHAPES[3];
  return KOREAN_FACE_SHAPES[4];
}

/** Map Korean 5-category shape to the existing 4-category FaceShape id. */
export function toLegacyShapeId(id: KoreanFaceShape["id"]): "oval" | "round" | "square" | "long" {
  switch (id) {
    case "ultra-long":
    case "long":
      return "long";
    case "oval":
      return "oval";
    case "round":
      return "round";
    case "ultra-short":
      return "square";
  }
}
