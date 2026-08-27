import { fetchAreaBasedPetTourPlaces } from "./adapters/area-based-list";
import { fetchLocationBasedPetTourPlaces } from "./adapters/location-based-list";
import { fetchPetTourPlaceDetail } from "./adapters/place-detail";
import { fetchKeywordPetTourPlaces } from "./adapters/search-keyword";
import type {
	ApiPayload,
	KtoPetTourPlaceDetail,
	KtoPetTourPlacesResponse,
} from "./types";

const CONTENT_TYPE_IDS = new Set(["12", "14", "15", "28", "32", "38", "39"]);
const ARRANGE_VALUES = new Set(["A", "C", "D", "E", "O", "Q", "R", "S"]);

export async function handlePetTourPlacesRequest(request: Request, env: Env) {
	if (request.method !== "GET") {
		return jsonResponse(
			{
				ok: false,
				error: {
					code: "METHOD_NOT_ALLOWED",
					message: "GET method만 지원합니다.",
				},
			},
			405,
			{ Allow: "GET" },
		);
	}

	const url = new URL(request.url);
	const validation = parsePlacesQuery(url.searchParams);

	if (!validation.ok) {
		return jsonResponse(
			{
				ok: false,
				error: {
					code: "INVALID_REQUEST",
					message: "요청 parameter가 올바르지 않습니다.",
					details: validation.errors,
				},
			},
			400,
		);
	}

	const result =
		validation.value.latitude !== undefined &&
		validation.value.longitude !== undefined
			? await fetchLocationBasedPetTourPlaces(env, {
					...validation.value,
					latitude: validation.value.latitude,
					longitude: validation.value.longitude,
					radius: validation.value.radius ?? 5000,
					arrange: toLocationArrange(validation.value.arrange),
				})
			: validation.value.keyword
				? await fetchKeywordPetTourPlaces(env, {
						...validation.value,
						keyword: validation.value.keyword,
						arrange: toBasicArrange(validation.value.arrange),
					})
				: await fetchAreaBasedPetTourPlaces(env, {
						...validation.value,
						arrange: toBasicArrange(validation.value.arrange),
					});

	if (!result.ok) {
		return jsonResponse(
			{
				ok: false,
				error: {
					code: result.code,
					message: result.message,
					details: result.details,
				},
			},
			result.status,
		);
	}

	return jsonResponse({
		ok: true,
		data: result.data,
	});
}

export async function handlePetTourPlaceDetailRequest(
	request: Request,
	env: Env,
) {
	if (request.method !== "GET") {
		return jsonResponse(
			{
				ok: false,
				error: {
					code: "METHOD_NOT_ALLOWED",
					message: "GET method만 지원합니다.",
				},
			},
			405,
			{ Allow: "GET" },
		);
	}

	const url = new URL(request.url);
	const validation = parsePlaceDetailQuery(url.searchParams);

	if (!validation.ok) {
		return jsonResponse(
			{
				ok: false,
				error: {
					code: "INVALID_REQUEST",
					message: "상세 조회 요청 parameter가 올바르지 않습니다.",
					details: validation.errors,
				},
			},
			400,
		);
	}

	const result = await fetchPetTourPlaceDetail(env, validation.value);

	if (!result.ok) {
		return jsonResponse(
			{
				ok: false,
				error: {
					code: result.code,
					message: result.message,
					details: result.details,
				},
			},
			result.status,
		);
	}

	return jsonResponse({
		ok: true,
		data: result.data,
	});
}

function parsePlacesQuery(searchParams: URLSearchParams) {
	const errors: string[] = [];
	const page = readInteger(searchParams, "page", 1, errors);
	const pageSize = readInteger(searchParams, "pageSize", 10, errors);
	const arrange = searchParams.get("arrange")?.trim().toUpperCase();
	const keyword = searchParams.get("keyword")?.trim();
	const contentTypeId = searchParams.get("contentTypeId")?.trim();
	const regionCode = searchParams.get("regionCode")?.trim();
	const districtCode = searchParams.get("districtCode")?.trim();
	const modifiedDate = searchParams.get("modifiedDate")?.trim();
	const latitude = readOptionalNumber(searchParams, "latitude", errors);
	const longitude = readOptionalNumber(searchParams, "longitude", errors);
	const radius = readOptionalInteger(searchParams, "radius", errors);

	if (page < 1 || page > 1000) {
		errors.push("page는 1 이상 1000 이하의 정수여야 합니다.");
	}

	if (pageSize < 1 || pageSize > 20) {
		errors.push("pageSize는 1 이상 20 이하의 정수여야 합니다.");
	}

	if (arrange && !ARRANGE_VALUES.has(arrange)) {
		errors.push("arrange는 A, C, D, E, O, Q, R, S 중 하나여야 합니다.");
	}

	if (keyword && keyword.length > 50) {
		errors.push("keyword는 50자 이하여야 합니다.");
	}

	if (contentTypeId && !CONTENT_TYPE_IDS.has(contentTypeId)) {
		errors.push(
			"contentTypeId는 12, 14, 15, 28, 32, 38, 39 중 하나여야 합니다.",
		);
	}

	if (regionCode && !/^\d{2}$/.test(regionCode)) {
		errors.push("regionCode는 2자리 숫자여야 합니다.");
	}

	if (districtCode && !regionCode) {
		errors.push("districtCode를 사용하려면 regionCode가 필요합니다.");
	}

	if (districtCode && !/^\d{3}$/.test(districtCode)) {
		errors.push("districtCode는 3자리 숫자여야 합니다.");
	}

	if (modifiedDate && !/^\d{8}$/.test(modifiedDate)) {
		errors.push("modifiedDate는 YYYYMMDD 형식이어야 합니다.");
	}

	if ((latitude === undefined) !== (longitude === undefined)) {
		errors.push("latitude와 longitude는 함께 전달해야 합니다.");
	}

	if (latitude === undefined && (arrange === "E" || arrange === "S")) {
		errors.push("거리순 arrange는 latitude와 longitude가 있을 때만 사용할 수 있습니다.");
	}

	if (latitude !== undefined && (latitude < 33 || latitude > 39)) {
		errors.push("latitude는 대한민국 위도 범위 안의 숫자여야 합니다.");
	}

	if (longitude !== undefined && (longitude < 124 || longitude > 132)) {
		errors.push("longitude는 대한민국 경도 범위 안의 숫자여야 합니다.");
	}

	if (radius !== undefined && (radius < 100 || radius > 20000)) {
		errors.push("radius는 100 이상 20000 이하의 정수여야 합니다.");
	}

	if (errors.length > 0) {
		return { ok: false as const, errors };
	}

	return {
		ok: true as const,
		value: {
			page,
			pageSize,
			arrange: arrange as
				| "A"
				| "C"
				| "D"
				| "E"
				| "O"
				| "Q"
				| "R"
				| "S"
				| undefined,
			keyword,
			contentTypeId: contentTypeId as
				| "12"
				| "14"
				| "15"
				| "28"
				| "32"
				| "38"
				| "39"
				| undefined,
			regionCode,
			districtCode,
			modifiedDate,
			latitude,
			longitude,
			radius,
		},
	};
}

function parsePlaceDetailQuery(searchParams: URLSearchParams) {
	const errors: string[] = [];
	const contentId = searchParams.get("contentId")?.trim();
	const contentTypeId = searchParams.get("contentTypeId")?.trim();

	if (!contentId || !/^\d{1,20}$/.test(contentId)) {
		errors.push("contentId는 1~20자리 숫자여야 합니다.");
	}

	if (!contentTypeId || !CONTENT_TYPE_IDS.has(contentTypeId)) {
		errors.push(
			"contentTypeId는 12, 14, 15, 28, 32, 38, 39 중 하나여야 합니다.",
		);
	}

	if (errors.length > 0) {
		return { ok: false as const, errors };
	}

	return {
		ok: true as const,
		value: {
			contentId: contentId as string,
			contentTypeId: contentTypeId as
				| "12"
				| "14"
				| "15"
				| "28"
				| "32"
				| "38"
				| "39",
		},
	};
}

function readInteger(
	searchParams: URLSearchParams,
	name: string,
	defaultValue: number,
	errors: string[],
) {
	const value = searchParams.get(name);

	if (value === null || value.trim() === "") {
		return defaultValue;
	}

	if (!/^\d+$/.test(value.trim())) {
		errors.push(`${name}는 정수여야 합니다.`);
		return defaultValue;
	}

	return Number(value);
}

function readOptionalInteger(
	searchParams: URLSearchParams,
	name: string,
	errors: string[],
) {
	const value = searchParams.get(name);

	if (value === null || value.trim() === "") {
		return undefined;
	}

	if (!/^\d+$/.test(value.trim())) {
		errors.push(`${name}는 정수여야 합니다.`);
		return undefined;
	}

	return Number(value);
}

function readOptionalNumber(
	searchParams: URLSearchParams,
	name: string,
	errors: string[],
) {
	const value = searchParams.get(name);

	if (value === null || value.trim() === "") {
		return undefined;
	}

	const parsed = Number(value);

	if (!Number.isFinite(parsed)) {
		errors.push(`${name}는 숫자여야 합니다.`);
		return undefined;
	}

	return parsed;
}

function toBasicArrange(
	arrange: "A" | "C" | "D" | "E" | "O" | "Q" | "R" | "S" | undefined,
) {
	return arrange === "E" || arrange === "S" ? undefined : arrange;
}

function toLocationArrange(
	arrange: "A" | "C" | "D" | "E" | "O" | "Q" | "R" | "S" | undefined,
) {
	return arrange ?? "E";
}

function jsonResponse<TData>(
	payload:
		| ApiPayload<TData>
		| { ok: true; data: KtoPetTourPlacesResponse | KtoPetTourPlaceDetail },
	status = 200,
	headers?: HeadersInit,
) {
	return Response.json(payload, {
		status,
		headers: {
			"Cache-Control": "no-store",
			...headers,
		},
	});
}
