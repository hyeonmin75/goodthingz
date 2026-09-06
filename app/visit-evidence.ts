import type { KtoPetTourPlaceDetail } from "../workers/api/kto-pet-tour/types";

export function visitEvidence(detail: KtoPetTourPlaceDetail) {
	return [
		{ label: "동반 가능 동물", value: detail.petPolicy.allowedPets },
		{ label: "동반 유형", value: detail.petPolicy.companionshipType },
		{ label: "필요사항", value: detail.petPolicy.requiredItems },
		{ label: "운영시간", value: detail.visitInfo.hours },
		{ label: "주차", value: detail.visitInfo.parking },
	];
}

export function formatRetrievalTime(value: string) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "불러온 시각 확인 불가" : new Intl.DateTimeFormat("ko-KR", {
		timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short",
	}).format(date) + " (한국시간)";
}
