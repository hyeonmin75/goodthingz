import type {
	KtoPetTourPagination,
	KtoPetTourPlaceDetail,
	KtoPetTourPlaceSummary,
	RawKtoPetTourCommonDetailItem,
	RawKtoPetTourImageItem,
	RawKtoPetTourIntroDetailItem,
	RawKtoPetTourListItem,
	RawKtoPetTourPetDetailItem,
} from "./types";

const CONTENT_TYPE_NAMES: Record<string, string> = {
	"12": "관광지",
	"14": "문화시설",
	"15": "행사/공연/축제",
	"28": "레포츠",
	"32": "숙박",
	"38": "쇼핑",
	"39": "음식점",
};

export function normalizePlaceSummary(
	item: RawKtoPetTourListItem,
): KtoPetTourPlaceSummary | null {
	const id = normalizeString(item.contentid);
	const title = normalizeString(item.title);
	const contentTypeId = normalizeString(item.contenttypeid);

	if (!id || !title || !contentTypeId) {
		return null;
	}

	const line1 = normalizeString(item.addr1);
	const line2 = normalizeString(item.addr2);
	const primaryImageUrl = normalizeString(item.firstimage);
	const thumbnailImageUrl = normalizeString(item.firstimage2);
	const tel = normalizeString(item.tel);

	return {
		id,
		contentTypeId,
		contentTypeName: CONTENT_TYPE_NAMES[contentTypeId] ?? "UNKNOWN",
		title,
		address: {
			full: [line1, line2].filter(Boolean).join(" ") || null,
			line1,
			line2,
			zipcode: normalizeString(item.zipcode),
		},
		contact: {
			tel,
			hasTel: Boolean(tel),
		},
		location: {
			longitude: normalizeNumber(item.mapx),
			latitude: normalizeNumber(item.mapy),
			mapLevel: normalizeNumber(item.mlevel),
			distanceMeters: normalizeNumber(item.dist),
		},
		media: {
			primaryImageUrl,
			thumbnailImageUrl,
			copyrightType: normalizeString(item.cpyrhtDivCd),
			hasImage: Boolean(primaryImageUrl || thumbnailImageUrl),
		},
		codes: {
			regionCode: normalizeString(item.lDongRegnCd),
			districtCode: normalizeString(item.lDongSignguCd),
			classification1: normalizeString(item.lclsSystm1),
			classification2: normalizeString(item.lclsSystm2),
			classification3: normalizeString(item.lclsSystm3),
		},
		dates: {
			createdAtRaw: normalizeString(item.createdtime),
			modifiedAtRaw: normalizeString(item.modifiedtime),
		},
		source: {
			contentId: id,
		},
	};
}

export function normalizePagination(input: {
	pageNo?: number | string;
	numOfRows?: number | string;
	totalCount?: number | string;
	fallbackPage: number;
	fallbackPageSize: number;
}): KtoPetTourPagination {
	const page = normalizePositiveInteger(input.pageNo) ?? input.fallbackPage;
	const pageSize =
		normalizePositiveInteger(input.numOfRows) ?? input.fallbackPageSize;
	const totalCount = normalizeNonNegativeInteger(input.totalCount) ?? 0;

	return {
		page,
		pageSize,
		totalCount,
		hasNextPage: page * pageSize < totalCount,
	};
}

export function normalizeItems<TItem>(item: TItem | TItem[] | "" | undefined) {
	if (!item) {
		return [];
	}

	return Array.isArray(item) ? item : [item];
}

export function normalizePlaceDetail(input: {
	contentId: string;
	contentTypeId: string;
	common: RawKtoPetTourCommonDetailItem | null;
	intro: RawKtoPetTourIntroDetailItem | null;
	pet: RawKtoPetTourPetDetailItem | null;
	images: RawKtoPetTourImageItem[];
}) {
	const summary = input.common ? normalizePlaceSummary(input.common) : null;
	const title = normalizeText(input.common?.title);
	const tel = normalizeText(input.common?.tel);
	const petPolicy = normalizePetPolicy(input.pet);
	const visitInfo = normalizeVisitInfo(input.intro);
	const normalizedImages = input.images
		.map((image) => ({
			name: normalizeText(image.imgname),
			originImageUrl: normalizeUrl(image.originimgurl),
			thumbnailImageUrl: normalizeUrl(image.smallimageurl),
			copyrightType: normalizeText(image.cpyrhtDivCd),
		}))
		.filter((image) => image.originImageUrl || image.thumbnailImageUrl);

	const detail: KtoPetTourPlaceDetail = {
		id: input.contentId,
		title,
		homepageUrl: extractFirstUrl(input.common?.homepage),
		overview: normalizeText(input.common?.overview),
		contact: {
			tel,
			telName: normalizeText(input.common?.telname),
			infoCenter: firstText(
				input.intro?.infocenter,
				input.intro?.infocenterculture,
				input.intro?.infocenterfood,
				input.intro?.infocenterleports,
				input.intro?.infocenterlodging,
				input.intro?.infocentershopping,
			),
		},
		address: summary?.address ?? {
			full: null,
			line1: null,
			line2: null,
			zipcode: null,
		},
		location: summary?.location ?? {
			longitude: null,
			latitude: null,
			mapLevel: null,
			distanceMeters: null,
		},
		visitInfo,
		petPolicy,
		images: normalizedImages,
		source: {
			provider: "한국관광공사",
			service: "반려동물 동반여행 서비스",
			operations: [
				"detailCommon2",
				"detailIntro2",
				"detailPetTour2",
				"detailImage2",
			],
			dataUpdated: "일 1회",
			retrievedAt: new Date().toISOString(),
		},
		warnings: [],
	};

	if (!detail.overview) {
		detail.warnings.push("공식 데이터에 장소 개요가 없습니다.");
	}

	if (!detail.petPolicy.hasPetPolicy) {
		detail.warnings.push("공식 데이터에 반려동물 상세 조건이 없습니다.");
	}

	if (!detail.contact.tel && !detail.contact.infoCenter) {
		detail.warnings.push("공식 데이터에 연락처가 없습니다.");
	}

	return detail;
}

export function normalizeString(value: unknown) {
	if (value === undefined || value === null) {
		return null;
	}

	const normalized = String(value).trim();
	return normalized.length > 0 ? normalized : null;
}

export function normalizeNumber(value: unknown) {
	const normalized = normalizeString(value);

	if (!normalized) {
		return null;
	}

	const numberValue = Number(normalized);
	return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeText(value: unknown) {
	const normalized = normalizeString(value);

	if (!normalized) {
		return null;
	}

	return stripHtml(normalized).replace(/\s+/g, " ").trim() || null;
}

function normalizeUrl(value: unknown) {
	const normalized = normalizeText(value);

	if (!normalized || !/^https?:\/\//i.test(normalized)) {
		return null;
	}

	return normalized;
}

function extractFirstUrl(value: unknown) {
	const normalized = normalizeString(value);

	if (!normalized) {
		return null;
	}

	const hrefMatch = normalized.match(/href=["']([^"']+)["']/i);
	const candidate = hrefMatch?.[1] ?? normalized;
	const clean = stripHtml(candidate).trim();

	return /^https?:\/\//i.test(clean) ? clean : null;
}

function firstText(...values: unknown[]) {
	for (const value of values) {
		const normalized = normalizeText(value);

		if (normalized) {
			return normalized;
		}
	}

	return null;
}

function collectNotes(
	entries: Array<{ label: string; value: unknown }>,
	limit = 4,
) {
	return entries
		.map((entry) => {
			const value = normalizeText(entry.value);
			return value ? `${entry.label}: ${value}` : null;
		})
		.filter((entry): entry is string => entry !== null)
		.slice(0, limit);
}

function normalizeVisitInfo(raw: RawKtoPetTourIntroDetailItem | null) {
	const checkIn = normalizeText(raw?.checkintime);
	const checkOut = normalizeText(raw?.checkouttime);

	return {
		hours: firstText(
			raw?.usetime,
			raw?.usetimeculture,
			raw?.usetimeleports,
			raw?.opentime,
			raw?.opentimefood,
			raw?.playtime,
		),
		closedDays: firstText(
			raw?.restdate,
			raw?.restdateculture,
			raw?.restdateleports,
			raw?.restdateshopping,
			raw?.restdatefood,
		),
		parking: firstText(
			raw?.parking,
			raw?.parkingculture,
			raw?.parkingleports,
			raw?.parkingshopping,
			raw?.parkingfood,
			raw?.parkinglodging,
			raw?.parkingfee,
			raw?.parkingfeeleports,
		),
		reservation: firstText(
			raw?.reservation,
			raw?.reservationfood,
			raw?.reservationlodging,
			raw?.reservationurl,
			raw?.bookingplace,
		),
		fee: firstText(
			raw?.usefee,
			raw?.usefeeleports,
			raw?.usetimefestival,
			raw?.saleitemcost,
		),
		checkInOut:
			checkIn || checkOut
				? [checkIn ? `입실 ${checkIn}` : null, checkOut ? `퇴실 ${checkOut}` : null]
						.filter(Boolean)
						.join(" / ")
				: null,
		eventPeriod:
			raw?.eventstartdate || raw?.eventenddate
				? [formatYmd(raw.eventstartdate), formatYmd(raw.eventenddate)]
						.filter(Boolean)
						.join(" ~ ") || null
				: null,
		mainMenu: firstText(raw?.firstmenu, raw?.treatmenu, raw?.saleitem),
		additionalNotes: collectNotes([
			{ label: "수용 규모", value: raw?.accomcount ?? raw?.accomcountculture ?? raw?.accomcountleports ?? raw?.accomcountlodging },
			{ label: "이용 시기", value: raw?.useseason ?? raw?.openperiod },
			{ label: "체험 연령", value: raw?.expagerange ?? raw?.expagerangeleports ?? raw?.agelimit },
			{ label: "좌석/객실", value: raw?.seat ?? raw?.roomcount ?? raw?.roomtype },
			{ label: "부대시설", value: raw?.subfacility ?? raw?.foodplace },
		]),
	};
}

function normalizePetPolicy(raw: RawKtoPetTourPetDetailItem | null) {
	const policy: KtoPetTourPlaceDetail["petPolicy"] = dedupeTextFields({
		hasPetPolicy: false,
		companionshipType: normalizeText(raw?.acmpyTypeCd),
		allowedPets: normalizeText(raw?.acmpyPsblCpam),
		requiredItems: normalizeText(raw?.acmpyNeedMtr),
		policyNotes: normalizeText(raw?.etcAcmpyInfo),
		facilities: normalizeText(raw?.relaPosesFclty),
		providedItems: normalizeText(raw?.relaFrnshPrdlst),
		purchasableItems: normalizeText(raw?.relaPurcPrdlst),
		rentalItems: normalizeText(raw?.relaRntlPrdlst),
		riskNotes: normalizeText(raw?.relaAcdntRiskMtr),
	});

	policy.hasPetPolicy = Object.entries(policy).some(
		([key, value]) => key !== "hasPetPolicy" && Boolean(value),
	);

	return policy;
}

function dedupeTextFields<TFields extends Record<string, string | null | boolean>>(
	fields: TFields,
) {
	const seen = new Set<string>();
	const next = { ...fields };

	for (const [key, value] of Object.entries(next)) {
		if (typeof value !== "string") {
			continue;
		}

		const fingerprint = normalizeForDuplicateCheck(value);

		if (seen.has(fingerprint)) {
			next[key as keyof TFields] = null as TFields[keyof TFields];
			continue;
		}

		seen.add(fingerprint);
	}

	return next;
}

function normalizeForDuplicateCheck(value: string) {
	return value.replace(/\s+/g, "").replace(/[.,·ㆍ]/g, "").toLowerCase();
}

function stripHtml(value: string) {
	return value
		.replace(/<br\s*\/?>/gi, " ")
		.replace(/<\/p>/gi, " ")
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

function formatYmd(value: unknown) {
	const normalized = normalizeString(value);

	if (!normalized || !/^\d{8}$/.test(normalized)) {
		return null;
	}

	return `${normalized.slice(0, 4)}.${normalized.slice(4, 6)}.${normalized.slice(6, 8)}`;
}

function normalizePositiveInteger(value: unknown) {
	const numberValue = normalizeNumber(value);

	if (!numberValue || !Number.isInteger(numberValue) || numberValue < 1) {
		return null;
	}

	return numberValue;
}

function normalizeNonNegativeInteger(value: unknown) {
	const numberValue = normalizeNumber(value);

	if (
		numberValue === null ||
		!Number.isInteger(numberValue) ||
		numberValue < 0
	) {
		return null;
	}

	return numberValue;
}
