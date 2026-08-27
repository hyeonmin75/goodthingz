import { Link } from "react-router";

import type { Route } from "./+types/data-source-kto-pet-tour";
import {
	breadcrumbJsonLd,
	canonicalUrl,
	DATA_PROVIDER,
	DATA_SERVICE,
	DATA_SPEC_DATE,
	DATA_UPDATED,
	webPageJsonLd,
} from "../seo";

export function meta({}: Route.MetaArgs) {
	const title = "한국관광공사 반려동물 동반여행 데이터 출처 - GoodThingz";
	const description =
		"GoodThingz가 사용하는 한국관광공사 반려동물 동반여행 공공데이터의 제공기관, 갱신 기준, 활용 범위와 한계를 설명합니다.";

	return [
		{ title },
		{ name: "description", content: description },
		{ name: "robots", content: "index,follow" },
		{
			tagName: "link",
			rel: "canonical",
			href: canonicalUrl("/data-sources/kto-pet-tour"),
		},
		{
			"script:ld+json": [
				webPageJsonLd({
					name: title,
					description,
					path: "/data-sources/kto-pet-tour",
				}),
				{
					"@context": "https://schema.org",
					"@type": "Dataset",
					name: `${DATA_PROVIDER} ${DATA_SERVICE}`,
					description:
						"반려동물과 함께 이용 가능한 관광지, 숙박, 음식점, 문화시설, 레포츠, 쇼핑 등의 공공 관광정보 데이터입니다.",
					creator: {
						"@type": "Organization",
						name: DATA_PROVIDER,
					},
					isAccessibleForFree: true,
					inLanguage: "ko-KR",
					temporalCoverage: DATA_SPEC_DATE,
					variableMeasured: [
						"장소명",
						"주소",
						"좌표",
						"장소 유형",
						"방문 정보",
						"반려동물 동반 조건",
					],
				},
				breadcrumbJsonLd([
					{ name: "홈", path: "/" },
					{ name: "데이터 출처", path: "/data-sources/kto-pet-tour" },
				]),
			],
		},
	];
}

export default function DataSourceKtoPetTour() {
	return (
		<main className="content-page">
			<SiteNav />
			<Breadcrumb
				items={[
					{ label: "홈", to: "/" },
					{ label: "데이터 출처", to: "/data-sources/kto-pet-tour" },
				]}
			/>
			<section className="content-hero" aria-labelledby="source-title">
				<p className="eyebrow">데이터 출처</p>
				<h1 id="source-title">{DATA_PROVIDER} 반려동물 동반여행</h1>
				<p className="lead">
					GoodThingz는 공공데이터를 그대로 나열하지 않고, 사용자가 방문 전
					판단할 수 있도록 동반 조건과 방문 정보를 정규화합니다.
				</p>
			</section>
			<section className="content-section">
				<h2>사용하는 데이터</h2>
				<dl className="policy-list">
					<div>
						<dt>제공기관</dt>
						<dd>{DATA_PROVIDER}</dd>
					</div>
					<div>
						<dt>서비스명</dt>
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
				</dl>
			</section>
			<section className="content-section">
				<h2>GoodThingz가 더하는 가치</h2>
				<p>
					원본 field를 UI에 그대로 노출하지 않고, 장소명, 주소, 좌표,
					방문 정보, 반려동물 동반 조건, 이미지처럼 사용자가 판단하기 쉬운
					구조로 바꿉니다. 같은 안내가 여러 field에 반복될 때는 중복을 줄여
					한 번만 읽어도 이해되게 처리합니다.
				</p>
			</section>
			<section className="content-section">
				<h2>제공하지 않는 정보</h2>
				<p>
					실시간 영업 여부, 예약 가능 여부, 현재 가격, 리뷰, 혼잡도는 현재
					API로 확인되지 않습니다. GoodThingz는 API에 없는 정보를 추측해
					표시하지 않으며, 중요한 조건은 방문 전 최종 확인이 필요하다고
					알립니다.
				</p>
				<Link className="button button-primary" to="/pet-travel">
					반려동물 동반 장소 찾기
				</Link>
			</section>
		</main>
	);
}

function SiteNav() {
	return (
		<nav className="top-nav" aria-label="주요 메뉴">
			<Link className="brand" to="/">
				<span className="brand-mark" aria-hidden="true">
					G
				</span>
				<span>GoodThingz</span>
			</Link>
			<div className="nav-links">
				<Link to="/pet-travel">반려동물 여행</Link>
				<Link to="/about">소개</Link>
				<Link to="/privacy">개인정보</Link>
			</div>
		</nav>
	);
}

function Breadcrumb({
	items,
}: {
	items: Array<{ label: string; to: string }>;
}) {
	return (
		<nav className="breadcrumb" aria-label="현재 위치">
			{items.map((item, index) => (
				<span key={item.to}>
					{index > 0 ? <span aria-hidden="true">/</span> : null}
					<Link to={item.to}>{item.label}</Link>
				</span>
			))}
		</nav>
	);
}
