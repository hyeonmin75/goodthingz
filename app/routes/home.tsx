import type { Route } from "./+types/home";
import { Link } from "react-router";
import { HomeDecisionContent } from "../components/home-decision-content";
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
								"반려동물 동반 여행을 표현한 AI 제작 소개 이미지",
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
					<p className="lead">동반 조건과 위치를 한눈에.</p>
					<form action="/pet-travel" method="get" className="home-search" role="search">
						<label htmlFor="home-keyword">어떤 장소를 찾으세요?</label>
						<div><input id="home-keyword" name="keyword" type="search" maxLength={50} placeholder="장소명이나 검색어" /><button className="button button-primary" type="submit">검색</button></div>
					</form>
					<div className="hero-actions">
						<Link className="button button-secondary" to="/pet-travel">
							지도에서 후보 찾기
						</Link>
					</div>
					<p className="hero-source">
						출처: {DATA_PROVIDER} · 기준: {DATA_UPDATED} 갱신
						<br />소개 이미지는 AI로 제작했으며 특정 여행지의 실제 사진이 아닙니다.
					</p>
				</div>
			</section>

			<HomeDecisionContent />
		</main>
	);
}
