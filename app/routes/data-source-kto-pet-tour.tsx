import { Link } from "react-router";

import type { Route } from "./+types/data-source-kto-pet-tour";
import {
	breadcrumbJsonLd,
	canonicalUrl,
	DATA_PROVIDER,
	DATA_SERVICE,
	DATA_SPEC_DATE,
	DATA_UPDATED,
	PAGE_LAST_MODIFIED,
	socialMeta,
	webPageJsonLd,
} from "../seo";

export function meta({}: Route.MetaArgs) {
	const title = "한국관광공사 반려동물 동반여행 데이터 출처 - GoodThingz";
	const description =
		"GoodThingz가 사용하는 한국관광공사 반려동물 동반여행 공공데이터의 제공기관, 갱신 기준, 활용 범위와 한계를 설명합니다.";

	return [
		{ title },
		{ name: "description", content: description },
		...socialMeta({
			title,
			description,
			path: "/data-sources/kto-pet-tour",
		}),
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
					dateModified: PAGE_LAST_MODIFIED.dataSource,
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
					주소·동물 조건·장비·운영 안내를 같은 기준으로 나누고 반복 문장을 줄입니다. 자료에 있는 사실과 GoodThingz의 해석은 분리합니다. 원자료의 ‘일부 구역’을 실내 허용으로 바꾸거나, 안내가 없는 요금을 무료로 계산하지 않습니다.
				</p>
			</section>
			<section className="content-section">
				<h2>사진 출처와 이용조건</h2>
				<p>장소 사진은 한국관광공사 반려동물 동반여행 서비스에서 제공한 자료입니다. 이미지별 이용조건이 제1유형(출처표시) 또는 제3유형(출처표시·변경금지)으로 확인된 사진만 표시하며, 사진을 자르거나 변형하지 않고 전체 비율을 유지합니다. 이용조건이 누락되거나 다른 유형인 사진은 확인 전까지 표시하지 않습니다.</p>
				<a href="https://www.kogl.or.kr/info/userGuide.do" rel="noreferrer" target="_blank">공공누리 이용조건 확인</a>
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
			<section className="content-section">
				<h2>세 가지 날짜는 뜻이 다릅니다.</h2>
				<dl className="policy-list"><div><dt>원본 수정일</dt><dd>제공기관의 장소 기록이 수정된 날짜입니다. 모든 조건을 그날 현장에서 검증했다는 뜻은 아닙니다.</dd></div><div><dt>자료 조회 시각</dt><dd>사이트가 자료를 받아온 시각입니다. 기록 자체는 더 오래된 자료일 수 있습니다.</dd></div><div><dt>글의 수정일</dt><dd>GoodThingz가 분석이나 설명을 고친 날짜입니다. <Link to="/pet-travel/data-notes#method">12곳 분석의 조사 방법</Link>처럼 수집일과 편집일을 따로 표시합니다.</dd></div></dl>
			</section>
			<section className="content-section">
				<h2>빈칸과 자료 오류를 읽는 방법</h2>
				<p>같은 문장을 여러 항목에서 한 번만 표시하도록 정리하기 때문에, 한 항목이 비어 있으면 전체 동반 안내도 함께 확인해야 합니다. 전체 문장에 근거가 없으면 미확인 상태입니다. 별도 안내가 없다는 것은 허용·금지·무료를 뜻하지 않습니다.</p>
				<p>주소 표기, 구역, 연락처가 공식 홈페이지와 다르면 일치한다고 자동 처리하지 않습니다. 장소명과 자료 번호, 두 출처의 확인 시점을 남겨 <Link to="/about">오류 제보</Link>로 전달할 수 있습니다. 현재 조건은 실제 이용할 구역과 방문일을 지정해 운영자에게 확인하세요.</p>
			</section>
		</main>
	);
}

function SiteNav() {
	return (
		<nav className="top-nav" aria-label="주요 메뉴">
			<Link reloadDocument className="brand" to="/">
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
					<Link reloadDocument={item.to === "/"} to={item.to}>{item.label}</Link>
				</span>
			))}
		</nav>
	);
}
