import { requestKtoPetTourJson } from "../client";
import { normalizeItems, normalizePlaceDetail } from "../normalizers";
import type {
	RawKtoPetTourCommonDetailItem,
	RawKtoPetTourImageItem,
	RawKtoPetTourIntroDetailItem,
	RawKtoPetTourPetDetailItem,
} from "../types";

export interface PlaceDetailParams {
	contentId: string;
	contentTypeId: "12" | "14" | "15" | "28" | "32" | "38" | "39";
}

export async function fetchPetTourPlaceDetail(
	env: Env,
	params: PlaceDetailParams,
) {
	const [common, intro, pet, images] = await Promise.all([
		fetchDetailCommon(env, params.contentId),
		fetchDetailIntro(env, params.contentId, params.contentTypeId),
		fetchDetailPetTour(env, params.contentId),
		fetchDetailImages(env, params.contentId),
	]);
	const failed = [common, intro, pet, images].find((result) => !result.ok);

	if (failed && !failed.ok) {
		return failed;
	}

	const data = normalizePlaceDetail({
		contentId: params.contentId,
		contentTypeId: params.contentTypeId,
		common: common.ok ? (common.item ?? null) : null,
		intro: intro.ok ? (intro.item ?? null) : null,
		pet: pet.ok ? (pet.item ?? null) : null,
		images: images.ok ? images.items : [],
	});

	return {
		ok: true as const,
		data,
	};
}

async function fetchDetailCommon(env: Env, contentId: string) {
	const response = await requestKtoPetTourJson<RawKtoPetTourCommonDetailItem>(
		env,
		"detailCommon2",
		new URLSearchParams({
			contentId,
			pageNo: "1",
			numOfRows: "1",
		}),
	);

	if (!response.ok) {
		return response;
	}

	return {
		ok: true as const,
		item: normalizeItems(response.data.response?.body?.items?.item)[0] ?? null,
	};
}

async function fetchDetailIntro(
	env: Env,
	contentId: string,
	contentTypeId: PlaceDetailParams["contentTypeId"],
) {
	const response = await requestKtoPetTourJson<RawKtoPetTourIntroDetailItem>(
		env,
		"detailIntro2",
		new URLSearchParams({
			contentId,
			contentTypeId,
			pageNo: "1",
			numOfRows: "1",
		}),
	);

	if (!response.ok) {
		return response;
	}

	return {
		ok: true as const,
		item: normalizeItems(response.data.response?.body?.items?.item)[0] ?? null,
	};
}

async function fetchDetailPetTour(env: Env, contentId: string) {
	const response = await requestKtoPetTourJson<RawKtoPetTourPetDetailItem>(
		env,
		"detailPetTour2",
		new URLSearchParams({
			contentId,
			pageNo: "1",
			numOfRows: "1",
		}),
	);

	if (!response.ok) {
		return response;
	}

	return {
		ok: true as const,
		item: normalizeItems(response.data.response?.body?.items?.item)[0] ?? null,
	};
}

async function fetchDetailImages(env: Env, contentId: string) {
	const response = await requestKtoPetTourJson<RawKtoPetTourImageItem>(
		env,
		"detailImage2",
		new URLSearchParams({
			contentId,
			imageYN: "Y",
			pageNo: "1",
			numOfRows: "6",
		}),
	);

	if (!response.ok) {
		return response;
	}

	return {
		ok: true as const,
		items: normalizeItems(response.data.response?.body?.items?.item),
	};
}
