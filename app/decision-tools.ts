import type { KtoPetTourPlaceDetail } from "../workers/api/kto-pet-tour/types";

export function placeQuestions(detail: KtoPetTourPlaceDetail) {
  return [
    { key: "animal", label: "동물·체중·마릿수", evidence: detail.petPolicy.allowedPets,
      question: "우리 동물의 종류·체중·마릿수로 이용 가능한가요? 기준은 한 마리당인가요, 일행 또는 객실당인가요?" },
    { key: "space", label: "이용 구역", evidence: detail.petPolicy.companionshipType,
      question: "이용하려는 구역에 함께 들어갈 수 있나요? 주문·대기·공용공간에서 별도 제한이 있나요?" },
    { key: "equipment", label: "장비·증빙", evidence: detail.petPolicy.requiredItems,
      question: "필요한 장비와 증빙은 무엇인가요? 이동장이나 유모차를 이용 시간 내내 사용해야 하나요?" },
    { key: "schedule", label: "운영·예약", evidence: detail.visitInfo.hours || detail.visitInfo.checkInOut,
      question: "방문일 운영시간과 마지막 입장, 동반 예약 필요 여부를 알려주세요." },
    { key: "fee", label: "추가 비용", evidence: detail.visitInfo.fee,
      question: "이번 방문의 반려동물 추가비·청소비·보증금은 각각 얼마이며 마리당·박당 중 어떤 단위인가요?" },
    { key: "arrival", label: "입구·주차", evidence: detail.visitInfo.parking,
      question: "주차장과 동반 가능한 입구는 어디인가요? 주차장에서 이용 구역까지 함께 이동할 수 있나요?" },
  ];
}

export type FeeUnit = "visit" | "pet" | "night" | "pet-night";
export function calculatePetFee(amount: string, pets: string, nights: string, unit: FeeUnit) {
  if (!["visit", "pet", "night", "pet-night"].includes(unit)) return null;
  if (!/^\d{1,8}$/.test(amount)) return null;
  const count = /^\d{1,2}$/.test(pets) ? Number(pets) : 0;
  const stay = /^\d{1,2}$/.test(nights) ? Number(nights) : 0;
  if ((unit === "pet" || unit === "pet-night") && (count < 1 || count > 20)) return null;
  if ((unit === "night" || unit === "pet-night") && (stay < 1 || stay > 30)) return null;
  const multiplier = (unit === "pet" || unit === "pet-night" ? count : 1) * (unit === "night" || unit === "pet-night" ? stay : 1);
  return { multiplier, total: Number(amount) * multiplier };
}
