import { requestKtoPetTourJson } from "../client";
import {
	normalizeItems,
	normalizePagination,
	normalizePlaceSummary,
} from "../normalizers";
import type {
	KtoPetTourPlacesResponse,
	RawKtoPetTourListItem,
} from "../types";

export interface AreaBasedListParams {
	page: number;
	pageSize: number;
	arrange?: "A" | "C" | "D" | "O" | "Q" | "R";
	contentTypeId?: "12" | "14" | "15" | "28" | "32" | "38" | "39";
	regionCode?: string;
	districtCode?: string;
	modifiedDate?: string;
}

export async function fetchAreaBasedPetTourPlaces(
	env: Env,
	params: AreaBasedListParams,
) {
	const searchParams = new URLSearchParams({
		pageNo: String(params.page),
		numOfRows: String(params.pageSize),
		arrange: params.arrange ?? "A",
	});

	if (params.contentTypeId) {
		searchParams.set("contentTypeId", params.contentTypeId);
	}

	if (params.regionCode) {
		searchParams.set("lDongRegnCd", params.regionCode);
	}

	if (params.districtCode) {
		searchParams.set("lDongSignguCd", params.districtCode);
	}

	if (params.modifiedDate) {
		searchParams.set("modifiedtime", params.modifiedDate);
	}

	const response = await requestKtoPetTourJson<RawKtoPetTourListItem>(
		env,
		"areaBasedList2",
		searchParams,
	);

	if (!response.ok) {
		return response;
	}

	const body = response.data.response?.body;
	const rawItems = normalizeItems(body?.items?.item);
	const items = rawItems
		.map((item) => normalizePlaceSummary(item))
		.filter((item) => item !== null);
	const pagination = normalizePagination({
		pageNo: body?.pageNo,
		numOfRows: body?.numOfRows,
		totalCount: body?.totalCount,
		fallbackPage: params.page,
		fallbackPageSize: params.pageSize,
	});
	const warnings: string[] = [];

	if (rawItems.length !== items.length) {
		warnings.push("필수 field가 부족한 원본 항목은 응답에서 제외했습니다.");
	}

	const data: KtoPetTourPlacesResponse = {
		items,
		pagination,
		empty: items.length === 0,
		source: {
			provider: "한국관광공사",
			service: "반려동물 동반여행 서비스",
			operation: "areaBasedList2",
			dataUpdated: "일 1회",
			retrievedAt: new Date().toISOString(),
		},
		warnings,
	};

	return {
		ok: true as const,
		data,
	};
}
