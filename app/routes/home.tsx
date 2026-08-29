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

const DECISION_STEPS = [
	{
		label: "01",
		title: "가까운 후보",
		description: "현재 위치와 반경으로 이동 부담이 적은 장소부터 봅니다.",
	},
	{
		label: "02",
		title: "동반 조건",
		description: "입장 가능, 증빙 필요, 정보 부족을 같은 기준으로 구분합니다.",
	},
	{
		label: "03",
		title: "비교 저장",
		description: "후보를 모아 주소, 거리, 조건을 나란히 확인하고 공유합니다.",
	},
];

const VALUE_CARDS = [
	{
		kicker: "검색 시간",
		title: "블로그와 지도 앱을 오가는 시간을 줄입니다.",
		description:
			"장소명, 지역, 현재 위치를 기준으로 반려동물 동반 후보를 먼저 모아 보여줍니다.",
	},
	{
		kicker: "비교 시간",
		title: "후보마다 확인해야 할 항목을 같은 순서로 정리합니다.",
		description:
			"주소, 거리, 지도, 이미지, 동반 조건 상태를 같은 기준으로 보게 해 선택 시간을 줄입니다.",
	},
	{
		kicker: "판단 기준",
		title: "갈 수 있는지 애매한 정보는 숨기지 않습니다.",
		description:
			"공식 데이터에 없는 전화, 실시간 영업, 가격, 예약 정보는 추측하지 않고 부족하다고 표시합니다.",
	},
];

const CHECK_POINTS = [
	"반려동물 동반 가능 여부",
	"예방접종·증빙·이동장 조건",
	"현재 위치 기준 이동 거리",
	"공식 데이터에 없는 정보",
];

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
					<p className="eyebrow">공식 데이터 기반 반려동물 동반 검색</p>
					<h1 id="home-title">
						<span>반려동물 동반, </span>
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

			<section className="decision-strip" aria-label="GoodThingz 이용 흐름">
				{DECISION_STEPS.map((step) => (
					<Link className="decision-card" key={step.label} to="/pet-travel">
						<span>{step.label}</span>
						<strong>{step.title}</strong>
						<p>{step.description}</p>
					</Link>
				))}
			</section>

			<section className="seo-value-section" aria-labelledby="value-title">
				<div className="section-heading">
					<p className="eyebrow">방문 전 판단 기준</p>
					<h2 id="value-title">목록이 아니라, 오늘 갈 수 있는지를 판단합니다.</h2>
					<p>
						GoodThingz는 반려동물 동반 장소를 단순히 많이 보여주기보다 이동,
						동반 조건, 정보 부족 여부를 먼저 비교하게 돕습니다.
					</p>
				</div>
				<div className="seo-value-grid">
					{VALUE_CARDS.map((card) => (
						<article key={card.kicker}>
							<span>{card.kicker}</span>
							<strong>{card.title}</strong>
							<p>{card.description}</p>
						</article>
					))}
				</div>
			</section>

			<section id="source" className="evidence-section">
				<div className="section-heading">
					<p className="eyebrow">데이터로 확인하는 것</p>
					<h2>방문 전에 꼭 봐야 할 항목만 먼저 정리합니다.</h2>
				</div>
				<div className="evidence-board">
					<ul>
						{CHECK_POINTS.map((point) => (
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
					</div>
				</div>
			</section>
		</main>
	);
}
