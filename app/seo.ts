export const SITE_URL = "https://goodthingfor.com";
export const SITE_NAME = "GoodThingz";
export const LANGUAGE = "ko-KR";
export const DATA_PROVIDER = "한국관광공사";
export const DATA_SERVICE = "반려동물 동반여행 서비스";
export const DATA_UPDATED = "일 1회";
export const DATA_SPEC_DATE = "2026-02-25";
export const LAST_SIGNIFICANT_UPDATE = "2026-08-27";
export const DEFAULT_SOCIAL_IMAGE_PATH = "/goodthingz-pet-travel-hero.webp";

export const INDEX_URLS = [
	"/",
	"/pet-travel",
	"/data-sources/kto-pet-tour",
	"/about",
	"/privacy",
] as const;

export function canonicalUrl(path: string) {
	const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+/, "")}`;
	return `${SITE_URL}${normalizedPath}`;
}

export function breadcrumbJsonLd(
	items: Array<{ name: string; path: string }>,
) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: canonicalUrl(item.path),
		})),
	};
}

export function webPageJsonLd(input: {
	name: string;
	description: string;
	path: string;
}) {
	return {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: input.name,
		description: input.description,
		url: canonicalUrl(input.path),
		inLanguage: LANGUAGE,
		isPartOf: {
			"@type": "WebSite",
			name: SITE_NAME,
			url: SITE_URL,
		},
		dateModified: LAST_SIGNIFICANT_UPDATE,
	};
}

export function socialMeta(input: {
	title: string;
	description: string;
	path: string;
	imagePath?: string;
	imageAlt?: string;
}) {
	const imagePath = input.imagePath ?? DEFAULT_SOCIAL_IMAGE_PATH;
	const imageUrl = canonicalUrl(imagePath);
	const imageAlt =
		input.imageAlt ??
		"GoodThingz 반려동물 동반 장소 검색 서비스 대표 이미지";

	return [
		{ property: "og:site_name", content: SITE_NAME },
		{ property: "og:locale", content: "ko_KR" },
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: input.title },
		{ property: "og:description", content: input.description },
		{ property: "og:url", content: canonicalUrl(input.path) },
		{ property: "og:image", content: imageUrl },
		{ property: "og:image:alt", content: imageAlt },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: input.title },
		{ name: "twitter:description", content: input.description },
		{ name: "twitter:image", content: imageUrl },
		{ name: "twitter:image:alt", content: imageAlt },
	];
}
