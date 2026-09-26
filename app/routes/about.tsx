import { Link } from "react-router";
import { SiteNav } from "../components/site-nav";

import type { Route } from "./+types/about";
import {
	breadcrumbJsonLd,
	canonicalUrl,
	PAGE_LAST_MODIFIED,
	socialMeta,
	webPageJsonLd,
} from "../seo";

export function meta({}: Route.MetaArgs) {
	const title = "GoodThingz 소개 | 반려동물 여행 자료의 작성·검증 원칙";
	const description =
		"반려동물 여행 자료의 출처, 독립 운영과 편집 방식, 실제 조사와 가상 예시의 구분, 수정 내역과 오류 제보 방법을 공개합니다.";

	return [
		{ title },
		{ name: "description", content: description },
		...socialMeta({ title, description, path: "/about" }),
		{ name: "robots", content: "index,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl("/about") },
		{
			"script:ld+json": [
				webPageJsonLd({
					name: title,
					description,
					path: "/about",
					dateModified: PAGE_LAST_MODIFIED.about,
				}),
				breadcrumbJsonLd([
					{ name: "홈", path: "/" },
					{ name: "소개", path: "/about" },
				]),
			],
		},
	];
}

export default function About() {
	return (
		<main className="content-page">
			<SiteNav />
			<nav className="breadcrumb" aria-label="현재 위치">
				<Link reloadDocument to="/">홈</Link>
				<span aria-hidden="true">/</span>
				<span>소개</span>
			</nav>
			<section className="content-hero" aria-labelledby="about-title">
				<p className="eyebrow">서비스 소개</p>
				<h1 id="about-title">GoodThingz의 자료는 이렇게 만듭니다.</h1>
				<p className="lead">
					반려동물과 갈 장소의 동반 조건을 읽고, 확인한 사실로 방문을 준비하는 독립 서비스입니다.
				</p>
			</section>
			<section className="content-section">
				<h2>운영 원칙</h2>
				<p>
					검색·비교·계산·저장 기능은 로그인 없이 무료로 이용합니다. 예약을 중개하거나 장소의 입장을 보증하지 않습니다. 이번 데이터 분석에 수록된 장소는 유형별 수정일 기준으로 선택했으며, 협찬 순위나 현장 방문 추천이 아닙니다.
				</p>
			</section>
			<section className="content-section">
				<h2>현재 제공 서비스</h2>
				<p>GoodThingz는 한국관광공사나 Google이 운영하거나 공식 보증하는 사이트가 아닌 독립 서비스입니다. 데이터 제공기관과 사이트 운영자는 다릅니다.</p>
				<p>
					첫 서비스는 한국관광공사 반려동물 동반여행 공공데이터를 활용한
					반려동물 동반 장소 검색입니다. 위치, 장소 유형, 지도, 동반 조건,
					방문 전 확인 정보를 함께 보여줍니다.
				</p>
				<Link className="button button-primary" to="/pet-travel">
					반려동물 동반 장소 찾기
				</Link>
			</section>
			<section className="content-section">
				<h2>작성·수정 원칙</h2>
				<p>장소의 주소·동반 안내·방문 정보는 한국관광공사 자료를 정리한 것입니다. 상황별 가이드, 문의 문장과 비교 예시는 GoodThingz가 작성한 판단 보조 자료이며, 직접 방문한 후기나 인기 순위가 아닙니다. 가상 예시는 실제 장소 정보와 구분해 표시합니다.</p>
				<p>안내가 있다는 사실만으로 입장 가능을 확정하지 않습니다. 빠진 항목은 정보 없음으로 표시하고, 자료를 불러온 시각·원본 수정일·콘텐츠 수정일을 구분합니다. 제공기관의 갱신 주기는 개별 장소의 현장 검증 주기를 뜻하지 않습니다.</p>
			</section>
			<section className="content-section">
				<h2>운영과 데이터 오류 제보</h2>
				<p>
					GoodThingz 운영자는 공식 데이터의 출처와 한계를 공개하고, 잘못된
					표시나 개선 제안을 검토합니다. 장소 정보는 제공기관의 원본 데이터에
					따라 달라질 수 있으므로, 오류 제보에는 장소명과 확인한 내용을 함께
					남겨 주세요.
				</p>
				<a
					className="text-button"
					href="https://github.com/hyeonmin75/goodthingz/issues"
					target="_blank"
					rel="noreferrer"
				>
					데이터 오류와 개선 제안 남기기
				</a>
				<p className="muted-copy">
					공개 제보 공간에는 전화번호, 현재 위치, 인증키 같은 개인정보를 남기지
					마세요. 제보 작성에는 GitHub 로그인이 필요하며, 장소 검색과 비교에는 로그인이 필요하지 않습니다.
				</p>
			</section>
			<section className="content-section">
				<h2>원자료와 편집 내용을 분리합니다.</h2>
				<ol className="decision-steps"><li><h3>대상과 날짜를 정합니다.</h3><p>분석 전에 표본 선택 방법과 조회 시점을 정합니다. 일부 자료를 전국 통계로 확대하거나, 자료를 읽은 날을 현장 검증일로 바꾸지 않습니다.</p></li><li><h3>원문과 나의 해석을 나눕니다.</h3><p>동물 종류·구역·장비에 적힌 사실을 먼저 보존하고, 그 사실에서 이용자가 판단할 수 있는 범위만 설명합니다. 빈칸과 조건 없는 허용은 다른 상태로 다룹니다.</p></li><li><h3>다음 행동을 연결합니다.</h3><p>아직 답이 없는 부분은 문의 문장으로 남깁니다. 검색의 현재 자료, 비교, 방문 계획과 연결하되 자동 입장 판정이나 근거 없는 추천 점수는 제공하지 않습니다.</p></li></ol>
			</section>
			<section className="content-section">
				<h2>최근 편집 내역</h2>
				<p><time dateTime="2026-09-26">2026-09-26</time> · 관광지·문화시설·숙박·음식점 12곳을 조사한 <Link className="text-button" to="/pet-travel/data-notes">동반 조건 분석</Link>을 발행했습니다. 표본별 원문·해석·질문과 세 가지 일정 비교를 공개하고, 장소별 문의 초안과 추가비 단위 계산을 추가했습니다.</p>
				<p>가이드의 가상 예시는 실제 후기나 조사 실적에 포함하지 않습니다. 내용이 잘못된 경우 위 오류 제보 경로로 장소명·자료 번호·틀린 항목·공개 근거 링크를 알려주세요. 인증서나 개인 연락처는 공개 제보에 올리지 마세요.</p>
			</section>
		</main>
	);
}
