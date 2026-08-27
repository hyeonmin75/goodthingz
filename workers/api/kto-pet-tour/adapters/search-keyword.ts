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

export interface SearchKeywordParams {
	keyword: string;
	page: number;
	pageSize: number;
	arrange?: "A" | "C" | "D" | "O" | "Q" | "R";
	contentTypeId?: "12" | "14" | "15" | "28" | "32" | "38" | "39";
	regionCode?: string;
	districtCode?: string;
}

export async function fetchKeywordPetTourPlaces(
	env: Env,
	params: SearchKeywordParams,
) {
	const searchParams = new URLSearchParams({
		keyword: params.keyword,
		pageNo: String(params.page),
		numOfRows: String(params.pageSize),
		arrange: params.arrange ?? "A",
	});

	if (params.regionCode) {
		searchParams.set("lDongRegnCd", params.regionCode);
	}

	if (params.districtCode) {
		searchParams.set("lDongSignguCd", params.districtCode);
	}

	const response = await requestKtoPetTourJson<RawKtoPetTourListItem>(
		env,
		"searchKeyword2",
		searchParams,
	);

	if (!response.ok) {
		return response;
	}

	const body = response.data.response?.body;
	const rawItems = normalizeItems(body?.items?.item);
	const normalizedItems = rawItems
		.map((item) => normalizePlaceSummary(item))
		.filter((item) => item !== null);
	const items = params.contentTypeId
		? normalizedItems.filter((item) => item.contentTypeId === params.contentTypeId)
		: normalizedItems;
	const warnings: string[] = [];

	if (rawItems.length !== normalizedItems.length) {
		warnings.push("필수 field가 부족한 원본 항목은 응답에서 제외했습니다.");
	}

	if (params.contentTypeId) {
		warnings.push(
			"키워드 API는 관광타입 요청 parameter를 사용하지 않아 응답 후 타입을 좁혔습니다.",
		);
	}

	const data: KtoPetTourPlacesResponse = {
		items,
		pagination: normalizePagination({
			pageNo: body?.pageNo,
			numOfRows: body?.numOfRows,
			totalCount: body?.totalCount,
			fallbackPage: params.page,
			fallbackPageSize: params.pageSize,
		}),
		empty: items.length === 0,
		source: {
			provider: "한국관광공사",
			service: "반려동물 동반여행 서비스",
			operation: "searchKeyword2",
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
