import type { Route } from "./+types/home";
import { Link } from "react-router";
import {
	canonicalUrl,
	DATA_PROVIDER,
	DATA_UPDATED,
	PAGE_LAST_MODIFIED,
	SITE_NAME,
	socialMeta,
	webPageJsonLd,
} from "../seo";

const HERO_IMAGE_PATH = "/goodthingz-pet-travel-hero.webp";
const HERO_IMAGE_FALLBACK_PATH = "/goodthingz-pet-travel-hero.png";

const VISIT_CHECKS = [
	{
		label: "01",
		title: "동반 조건",
		description:
			"입장 가능 여부와 예방접종 증빙, 이동장 등 준비 조건을 먼저 확인합니다.",
	},
	{
		label: "02",
		title: "위치와 거리",
		description:
			"현재 위치와 지도로 이동 부담을 가늠하고, 가까운 후보부터 비교합니다.",
	},
	{
		label: "03",
		title: "현장 확인 항목",
		description:
			"실시간 영업, 가격, 예약 가능 여부는 확인되지 않으면 분명하게 알려드립니다.",
	},
];

const DATA_CHECKS = [
	"장소명, 유형, 주소, 좌표",
	"공식 이미지와 기본 방문 정보",
	"반려동물 동반 조건과 준비 사항",
];

export const links: Route.LinksFunction = () => [
	{
		rel: "preload",
		as: "image",
		href: HERO_IMAGE_PATH,
	},
];

export function meta({}: Route.MetaArgs) {
	const title = "GoodThingz | 반려동물 동반 장소 조건·거리·지도 확인";
	const description =
		"반려동물과 갈 곳을 정할 때 필요한 동반 조건, 위치와 거리, 공식 방문 정보를 한 화면에서 확인하세요. 확인되지 않은 정보는 추측하지 않습니다.";

	return [
		{ title },
		{
			name: "description",
			content: description,
		},
		...socialMeta({
			title,
			description,
			path: "/",
			imagePath: HERO_IMAGE_PATH,
			imageAlt:
				"반려동물과 함께 갈 장소를 조건, 거리, 지도 기준으로 확인하는 GoodThingz 화면",
		}),
		{ name: "robots", content: "index,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl("/") },
		{
			"script:ld+json": [
				{
					"@context": "https://schema.org",
					"@type": "WebSite",
					name: SITE_NAME,
					description,
					url: canonicalUrl("/"),
					inLanguage: "ko-KR",
				},
				{
					"@context": "https://schema.org",
					"@type": "Organization",
					name: SITE_NAME,
					description,
					url: canonicalUrl("/"),
				},
				webPageJsonLd({
					name: title,
					description,
					path: "/",
					dateModified: PAGE_LAST_MODIFIED.home,
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
					<p className="eyebrow">공식 데이터 기반 반려동물 동반 장소 찾기</p>
					<h1 id="home-title">
						<span>반려동물과 함께 갈 곳</span>
						<span>확인하고 출발하세요</span>
					</h1>
					<p className="lead">동반 조건·거리·지도, 한 화면에서.</p>
					<div className="hero-actions">
						<Link className="button button-primary" to="/pet-travel">
							반려동물 여행지 찾기
						</Link>
						<Link className="button button-secondary" to="/pet-travel">
							내 주변에서 찾기
						</Link>
					</div>
					<p className="hero-source">
						출처: {DATA_PROVIDER} · 기준: {DATA_UPDATED} 갱신
					</p>
				</div>
			</section>

			<section
				className="decision-strip"
				aria-label="반려동물 동반 장소를 고를 때 확인할 세 가지"
			>
				{VISIT_CHECKS.map((step) => (
					<Link className="decision-card" key={step.label} to="/pet-travel">
						<span>{step.label}</span>
						<strong>{step.title}</strong>
						<p>{step.description}</p>
					</Link>
				))}
			</section>

			<section className="seo-value-section" aria-labelledby="value-title">
				<div className="section-heading">
					<p className="eyebrow">방문 전 확인</p>
					<h2 id="value-title">데이터가 알려주는 것과 직접 확인할 것을 구분합니다.</h2>
					<p>
						공식 데이터로 확인되는 정보는 정리해 보여주고, 실시간으로 바뀔 수 있는
						정보는 확인되지 않았다고 표시합니다.
					</p>
				</div>
				<div className="evidence-board">
					<ul>
						{DATA_CHECKS.map((point) => (
							<li key={point}>{point}</li>
						))}
					</ul>
					<div className="source-note-card">
						<strong>방문 전 직접 확인이 필요한 정보</strong>
						<p>
							실시간 영업 여부, 가격, 예약 가능 여부, 현장 정책 변경은 데이터에
							없으면 표시하지 않습니다. 중요한 일정은 방문 전 장소에 확인하세요.
						</p>
					</div>
				</div>
			</section>

			<section id="source" className="evidence-section">
				<div className="section-heading">
					<p className="eyebrow">데이터 출처</p>
					<h2>정보의 기준과 한계를 함께 공개합니다.</h2>
				</div>
				<div className="evidence-board">
					<ul>
						{[
							"제공기관: 한국관광공사",
							"서비스: 반려동물 동반여행",
							`갱신 기준: ${DATA_UPDATED}`,
						].map((point) => (
							<li key={point}>{point}</li>
						))}
					</ul>
					<div className="source-note-card">
						<strong>{DATA_PROVIDER} 반려동물 동반여행 서비스</strong>
						<p>
							데이터는 제공기관 기준으로 {DATA_UPDATED} 갱신됩니다. 실시간
							영업, 가격, 예약 가능 여부는 원본 API에 없으면 표시하지 않습니다.
						</p>
						<Link className="text-button" to="/data-sources/kto-pet-tour">
							데이터 출처와 한계 보기
						</Link>
						<Link className="text-button" to="/pet-travel/guides/visit-checklist">
							출발 전 확인 가이드
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
