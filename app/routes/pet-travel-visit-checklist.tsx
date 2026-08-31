import { Link } from "react-router";

import type { Route } from "./+types/pet-travel-visit-checklist";
import {
	breadcrumbJsonLd,
	canonicalUrl,
	DATA_PROVIDER,
	DATA_SERVICE,
	DATA_SPEC_DATE,
	DATA_UPDATED,
	PAGE_LAST_MODIFIED,
	SITE_NAME,
	socialMeta,
	webPageJsonLd,
} from "../seo";

const GUIDE_PATH = "/pet-travel/guides/visit-checklist";

const CHECKS = [
	{
		title: "장소 유형과 주소를 먼저 맞춥니다.",
		body: "관광지, 숙박, 음식점처럼 방문 목적에 맞는 유형인지 보고 주소를 확인합니다. 이름이 비슷한 장소가 있을 수 있으므로, 장소명만 보고 출발하지 않는 것이 좋습니다.",
		data: "공식 데이터에서 확인: 장소명, 장소 유형, 주소, 우편번호",
	},
	{
		title: "내 위치 기준 거리와 지도를 봅니다.",
		body: "현재 위치 조회 뒤 반경을 정하면 가까운 후보부터 볼 수 있습니다. 거리는 이동 부담을 가늠하는 기준일 뿐이며, 실제 이동 시간이나 도로 상황을 뜻하지는 않습니다.",
		data: "공식 데이터에서 확인: 좌표, 위치 기반 거리",
	},
	{
		title: "동반 조건이 있는지 상세 화면에서 확인합니다.",
		body: "반려동물 동반 가능 동물, 필요사항, 시설, 비치·대여 품목 같은 정보가 있으면 상세 조건으로 묶어 보여줍니다. 조건이 비어 있으면 '가능'이라고 추측하지 않습니다.",
		data: "공식 데이터에서 확인: 반려동물 동반 조건과 필요사항",
	},
	{
		title: "준비물이 있으면 출발 전에 챙깁니다.",
		body: "상세 정보에 준비물이나 유의사항이 있을 때만 표시합니다. 예방접종 증빙, 이동장처럼 장소마다 달라질 수 있는 조건은 해당 장소의 공식 안내와 함께 최종 확인하세요.",
		data: "공식 데이터에 안내가 있는 경우에만 표시",
	},
	{
		title: "연락처와 홈페이지로 마지막 확인을 합니다.",
		body: "공식 데이터에 연락처나 홈페이지가 있으면 바로 연결할 수 있습니다. 운영시간, 휴무, 예약, 요금은 최신성이 중요하므로 출발 직전에 확인하는 편이 안전합니다.",
		data: "공식 데이터에서 확인: 연락처, 홈페이지, 방문 정보",
	},
	{
		title: "없는 정보는 없는 상태로 판단합니다.",
		body: "실시간 영업 여부, 예약 가능 여부, 현재 가격, 혼잡도, 실제 입장 성공 여부는 이 데이터만으로 알 수 없습니다. GoodThingz는 빈 정보를 추천 점수나 확정 문구로 바꾸지 않습니다.",
		data: "공식 데이터만으로 확인 불가: 실시간 상태와 현장 정책",
	},
];

export function meta({}: Route.MetaArgs) {
	const title = "반려동물 동반 장소 출발 전 확인 가이드 | GoodThingz";
	const description =
		"반려동물과 갈 장소를 고를 때 주소, 거리, 동반 조건, 준비물, 연락처, 실시간 확인 항목을 어떤 순서로 봐야 하는지 안내합니다.";

	return [
		{ title },
		{ name: "description", content: description },
		...socialMeta({
			title,
			description,
			path: GUIDE_PATH,
			imageAlt: "반려동물 동반 장소를 출발 전 확인하는 GoodThingz 가이드",
		}),
		{ name: "robots", content: "index,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl(GUIDE_PATH) },
		{
			"script:ld+json": [
				webPageJsonLd({
					name: title,
					description,
					path: GUIDE_PATH,
					dateModified: PAGE_LAST_MODIFIED.visitChecklist,
				}),
				{
					"@context": "https://schema.org",
					"@type": "Article",
					headline: title,
					description,
					inLanguage: "ko-KR",
					datePublished: PAGE_LAST_MODIFIED.visitChecklist,
					dateModified: PAGE_LAST_MODIFIED.visitChecklist,
					mainEntityOfPage: canonicalUrl(GUIDE_PATH),
					author: {
						"@type": "Organization",
						name: SITE_NAME,
					},
					publisher: {
						"@type": "Organization",
						name: SITE_NAME,
					},
				},
				breadcrumbJsonLd([
					{ name: "홈", path: "/" },
					{ name: "반려동물 여행", path: "/pet-travel" },
					{ name: "출발 전 확인 가이드", path: GUIDE_PATH },
				]),
			],
		},
	];
}

export default function PetTravelVisitChecklist() {
	return (
		<main className="content-page guide-page">
			<nav className="top-nav" aria-label="주요 메뉴">
				<Link className="brand" to="/">
					<span className="brand-mark" aria-hidden="true">
						G
					</span>
					<span>GoodThingz</span>
				</Link>
				<div className="nav-links">
					<Link to="/pet-travel">반려동물 여행</Link>
					<Link className="optional-nav-link" to="/data-sources/kto-pet-tour">
						데이터 출처
					</Link>
					<Link className="optional-nav-link" to="/about">
						소개
					</Link>
				</div>
			</nav>

			<nav className="breadcrumb" aria-label="현재 위치">
				<Link to="/">홈</Link>
				<span aria-hidden="true">/</span>
				<Link to="/pet-travel">반려동물 여행</Link>
				<span aria-hidden="true">/</span>
				<span>출발 전 확인 가이드</span>
			</nav>

			<article>
				<section className="content-hero" aria-labelledby="guide-title">
					<p className="eyebrow">반려동물 동반여행 가이드</p>
					<h1 id="guide-title">반려동물 동반 장소, 출발 전 이렇게 확인하세요.</h1>
					<p className="lead">
						장소를 많이 찾는 것보다 중요한 것은 실제로 함께 갈 수 있는지
						확인하는 일입니다. 주소부터 현장 확인 항목까지, 헛걸음을 줄이는
						순서를 정리했습니다.
					</p>
					<div className="hero-actions">
						<Link className="button button-primary" to="/pet-travel">
							장소 조건 확인 시작하기
						</Link>
						<Link className="button button-secondary" to="/data-sources/kto-pet-tour">
							데이터 기준 보기
						</Link>
					</div>
				</section>

				<section className="content-section" aria-labelledby="guide-purpose-title">
					<h2 id="guide-purpose-title">이 가이드가 해결하는 문제</h2>
					<p>
						반려동물 동반 장소는 이름이나 사진만 보고 정하면 현장에서 조건을
						다시 확인해야 할 수 있습니다. GoodThingz는 공식 데이터에 있는
						정보와 없는 정보를 나누어 보여주므로, 사용자는 먼저 후보를 좁히고
						마지막 확인이 필요한 항목을 놓치지 않을 수 있습니다.
					</p>
				</section>

				<section className="content-section" aria-labelledby="guide-steps-title">
					<h2 id="guide-steps-title">출발 전 6단계 확인 순서</h2>
					<ol className="guide-steps">
						{CHECKS.map((check, index) => (
							<li key={check.title}>
								<span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
								<div>
									<h3>{check.title}</h3>
									<p>{check.body}</p>
									<strong>{check.data}</strong>
								</div>
							</li>
						))}
					</ol>
				</section>

				<section className="content-section" aria-labelledby="guide-source-title">
					<h2 id="guide-source-title">이 가이드의 데이터 기준</h2>
					<dl className="policy-list">
						<div>
							<dt>제공기관</dt>
							<dd>{DATA_PROVIDER}</dd>
						</div>
						<div>
							<dt>사용 서비스</dt>
							<dd>{DATA_SERVICE}</dd>
						</div>
						<div>
							<dt>갱신 기준</dt>
							<dd>{DATA_UPDATED}</dd>
						</div>
						<div>
							<dt>문서 기준일</dt>
							<dd>{DATA_SPEC_DATE}</dd>
						</div>
						<div>
							<dt>작성·검토일</dt>
							<dd>{PAGE_LAST_MODIFIED.visitChecklist}</dd>
						</div>
					</dl>
					<p>
						이 페이지는 장소를 순위로 추천하지 않습니다. 실시간 영업, 예약,
						가격, 혼잡도처럼 원본 데이터만으로 확인할 수 없는 정보는 최종
						방문 전에 장소에 직접 확인해야 합니다.
					</p>
					<Link className="text-button" to="/data-sources/kto-pet-tour">
						데이터 출처와 한계 자세히 보기
					</Link>
				</section>
			</article>
		</main>
	);
}
