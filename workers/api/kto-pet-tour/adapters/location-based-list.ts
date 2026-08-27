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

export interface LocationBasedListParams {
	latitude: number;
	longitude: number;
	radius: number;
	page: number;
	pageSize: number;
	arrange?: "A" | "C" | "D" | "E" | "O" | "Q" | "R" | "S";
	contentTypeId?: "12" | "14" | "15" | "28" | "32" | "38" | "39";
}

export async function fetchLocationBasedPetTourPlaces(
	env: Env,
	params: LocationBasedListParams,
) {
	const searchParams = new URLSearchParams({
		mapX: String(params.longitude),
		mapY: String(params.latitude),
		radius: String(params.radius),
		pageNo: String(params.page),
		numOfRows: String(params.pageSize),
		arrange: params.arrange ?? "E",
	});

	if (params.contentTypeId) {
		searchParams.set("contentTypeId", params.contentTypeId);
	}

	const response = await requestKtoPetTourJson<RawKtoPetTourListItem>(
		env,
		"locationBasedList2",
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
	const warnings: string[] = [];

	if (rawItems.length !== items.length) {
		warnings.push("필수 field가 부족한 원본 항목은 응답에서 제외했습니다.");
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
			operation: "locationBasedList2",
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
