import type { Route } from "./+types/home";
import { Link } from "react-router";
import {
	canonicalUrl,
	SITE_NAME,
	webPageJsonLd,
} from "../seo";

export function meta({}: Route.MetaArgs) {
	const title = "GoodThingz - 무료 공공데이터 생활 검색 서비스";
	const description =
		"GoodThingz는 공공데이터를 생활에서 바로 쓰기 쉽도록 검색, 비교, 판단 기준으로 정리하는 무료 데이터 서비스입니다.";

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
					<Link to="/data-sources/kto-pet-tour">데이터 출처</Link>
					<Link to="/about">소개</Link>
				</div>
			</nav>

			<section className="home-hero" aria-labelledby="home-title">
				<div className="home-copy">
					<p className="eyebrow">무료 공공데이터 전문 서비스</p>
					<h1 id="home-title">
						반려동물과 갈 수 있는 곳을 조건까지 확인하세요.
					</h1>
					<p className="lead">
						GoodThingz는 한국관광공사 반려동물 동반여행 데이터를
						검색하기 쉬운 형태로 정리해, 위치·유형·연락처·정보 부족 여부를
						빠르게 비교하게 돕습니다.
					</p>
					<div className="hero-actions">
						<Link className="button button-primary" to="/pet-travel">
							반려동물 여행지 찾기
						</Link>
						<Link className="button button-secondary" to="/pet-travel">
							현재 위치로 찾기
						</Link>
					</div>
				</div>

				<div className="hero-panel" aria-label="GoodThingz에서 확인할 수 있는 결과">
					<div className="mini-search">
						<span>무엇을 입력하나요?</span>
						<strong>지역, 장소명, 현재 위치</strong>
					</div>
					<div className="answer-grid">
						<div>
							<strong>가까운 후보</strong>
							<span>거리와 주소를 먼저 확인</span>
						</div>
						<div>
							<strong>조건 상태</strong>
							<span>정보 없음과 확인 필요 구분</span>
						</div>
						<div>
							<strong>비교</strong>
							<span>후보 2~3개를 나란히 판단</span>
						</div>
					</div>
				</div>
			</section>

			<section className="value-strip" aria-label="핵심 가치">
				<div>
					<strong>검색 시간 감소</strong>
					<span>지도 앱과 블로그를 오가는 시간을 줄입니다.</span>
				</div>
				<div>
					<strong>판단 기준 명확화</strong>
					<span>전화 확인이 필요한 장소를 숨기지 않습니다.</span>
				</div>
				<div>
					<strong>무료 핵심 기능</strong>
					<span>결제, 구독, 잠금 기능 없이 제공합니다.</span>
				</div>
			</section>

			<section id="source" className="source-section">
				<p className="eyebrow">데이터 기준</p>
				<h2>한국관광공사 반려동물 동반여행 공공데이터를 사용합니다.</h2>
				<p>
					데이터는 제공기관 기준으로 일 1회 갱신됩니다. 실시간 영업 여부,
					예약 가능 여부, 가격, 리뷰는 현재 API에 없으므로 GoodThingz는
					이를 있는 것처럼 표시하지 않습니다.
				</p>
				<Link className="text-button" to="/data-sources/kto-pet-tour">
					데이터 출처와 한계 보기
				</Link>
			</section>
		</main>
	);
}
