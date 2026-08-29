import type { Route } from "./+types/home";
import { Link } from "react-router";
import {
	canonicalUrl,
	DATA_PROVIDER,
	DATA_UPDATED,
	SITE_NAME,
	webPageJsonLd,
} from "../seo";

const HERO_IMAGE_PATH = "/goodthingz-pet-travel-hero.webp";
const HERO_IMAGE_FALLBACK_PATH = "/goodthingz-pet-travel-hero.png";

export const links: Route.LinksFunction = () => [
	{
		rel: "preload",
		as: "image",
		href: HERO_IMAGE_PATH,
	},
];

export function meta({}: Route.MetaArgs) {
	const title = "GoodThingz - 반려동물 동반 장소 검색";
	const description =
		"한국관광공사 공공데이터로 반려동물 동반 장소의 조건, 거리, 지도, 정보 부족 여부를 빠르게 비교하는 무료 검색 서비스입니다.";

	return [
		{ title },
		{
			name: "description",
			content: description,
		},
		{ name: "robots", content: "index,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl("/") },
		{
			"script:ld+json": [
				{
					"@context": "https://schema.org",
					"@type": "WebSite",
					name: SITE_NAME,
					url: canonicalUrl("/"),
					inLanguage: "ko-KR",
				},
				{
					"@context": "https://schema.org",
					"@type": "Organization",
					name: SITE_NAME,
					url: canonicalUrl("/"),
				},
				webPageJsonLd({
					name: title,
					description,
					path: "/",
				}),
				{
					"@context": "https://schema.org",
					"@type": "ImageObject",
					contentUrl: canonicalUrl(HERO_IMAGE_PATH),
					caption:
						"반려동물 동반 장소를 조건과 위치 기준으로 확인하는 GoodThingz 메인 이미지",
					inLanguage: "ko-KR",
				},
			],
		},
	];
}

export function loader({ context }: Route.LoaderArgs) {
	return { configured: Boolean(context.cloudflare.env.VALUE_FROM_CLOUDFLARE) };
}

export default function Home({}: Route.ComponentProps) {
	return (
		<main className="home-page">
			<nav className="top-nav" aria-label="주요 메뉴">
				<Link className="brand" to="/">
					<span className="brand-mark" aria-hidden="true">
						G
					</span>
					<span>GoodThingz</span>
				</Link>
				<div className="nav-links">
					<a href="/pet-travel">반려동물 여행</a>
					<Link className="optional-nav-link" to="/data-sources/kto-pet-tour">
						데이터 출처
					</Link>
					<Link className="optional-nav-link" to="/about">
						소개
					</Link>
				</div>
			</nav>

			<section className="home-hero" aria-labelledby="home-title">
				<picture>
					<source srcSet={HERO_IMAGE_PATH} type="image/webp" />
					<img
						className="home-hero-image"
						src={HERO_IMAGE_FALLBACK_PATH}
						alt="반려동물과 함께 갈 장소를 지도와 조건으로 확인하는 장면"
					/>
				</picture>
				<div className="home-copy">
					<p className="eyebrow">무료 공공데이터 전문 서비스</p>
					<h1 id="home-title">
						<span>반려동물 동반,</span>
						<span>바로 확인.</span>
					</h1>
					<p className="lead">조건·거리·지도를 한눈에.</p>
					<div className="hero-actions">
						<Link className="button button-primary" to="/pet-travel">
							반려동물 여행지 찾기
						</Link>
						<Link className="button button-secondary" to="/pet-travel">
							현재 위치로 찾기
						</Link>
					</div>
					<p className="hero-source">
						출처: {DATA_PROVIDER} · 기준: {DATA_UPDATED} 갱신
					</p>
				</div>
			</section>

			<section className="home-quick" aria-label="GoodThingz 핵심 기능">
				<Link to="/pet-travel">
					<strong>가까운 후보 찾기</strong>
					<span>현재 위치와 반경으로 탐색</span>
				</Link>
				<Link to="/pet-travel">
					<strong>동반 조건 확인</strong>
					<span>가능·확인 필요·정보 부족 구분</span>
				</Link>
				<Link to="/pet-travel">
					<strong>장소 비교</strong>
					<span>후보를 저장하고 공유</span>
				</Link>
			</section>

			<section className="seo-value-section" aria-labelledby="value-title">
				<div>
					<p className="eyebrow">GoodThingz가 더하는 가치</p>
					<h2 id="value-title">목록보다 중요한 것은 갈 수 있는지 판단하는 일입니다.</h2>
				</div>
				<div className="seo-value-grid">
					<div>
						<strong>검색 시간을 줄입니다.</strong>
						<p>
							장소명, 유형, 현재 위치를 기준으로 반려동물 동반 후보를 한 화면에
							모읍니다.
						</p>
					</div>
					<div>
						<strong>비교 시간을 줄입니다.</strong>
						<p>
							주소, 거리, 지도, 이미지, 동반 조건 상태를 같은 기준으로 정리합니다.
						</p>
					</div>
					<div>
						<strong>판단을 쉽게 만듭니다.</strong>
						<p>
							공식 데이터에 없는 전화, 실시간 영업, 가격, 예약 정보는 추측하지
							않습니다.
						</p>
					</div>
				</div>
			</section>

			<section id="source" className="source-section">
				<p className="eyebrow">데이터 기준</p>
				<h2>공식 출처와 한계를 함께 보여줍니다.</h2>
				<p>
					GoodThingz는 {DATA_PROVIDER} 반려동물 동반여행 공공데이터를 사용합니다.
					데이터는 제공기관 기준으로 {DATA_UPDATED} 갱신되며, 실시간 영업 여부와
					가격 정보는 원본 API에 없으면 표시하지 않습니다.
				</p>
				<Link className="text-button" to="/data-sources/kto-pet-tour">
					데이터 출처와 한계 보기
				</Link>
			</section>
		</main>
	);
}
