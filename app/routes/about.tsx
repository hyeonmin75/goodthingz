import { Link } from "react-router";

import type { Route } from "./+types/about";
import { breadcrumbJsonLd, canonicalUrl, webPageJsonLd } from "../seo";

export function meta({}: Route.MetaArgs) {
	const title = "GoodThingz 소개 - 무료 공공데이터 생활 서비스";
	const description =
		"GoodThingz는 공공데이터를 검색, 비교, 판단 기준으로 정리해 실제 생활에서 바로 활용할 수 있게 돕는 무료 서비스입니다.";

	return [
		{ title },
		{ name: "description", content: description },
		{ name: "robots", content: "index,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl("/about") },
		{
			"script:ld+json": [
				webPageJsonLd({ name: title, description, path: "/about" }),
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
			<nav className="top-nav" aria-label="주요 메뉴">
				<Link className="brand" to="/">
					<span className="brand-mark" aria-hidden="true">
						G
					</span>
					<span>GoodThingz</span>
				</Link>
				<div className="nav-links">
					<Link to="/pet-travel">반려동물 여행</Link>
					<Link to="/data-sources/kto-pet-tour">데이터 출처</Link>
					<Link to="/privacy">개인정보</Link>
				</div>
			</nav>
			<nav className="breadcrumb" aria-label="현재 위치">
				<Link to="/">홈</Link>
				<span aria-hidden="true">/</span>
				<span>소개</span>
			</nav>
			<section className="content-hero" aria-labelledby="about-title">
				<p className="eyebrow">서비스 소개</p>
				<h1 id="about-title">공공데이터를 생활의 판단 도구로 바꿉니다.</h1>
				<p className="lead">
					GoodThingz는 무료 공공데이터를 사용자가 빠르게 검색하고 비교하고
					결정할 수 있는 형태로 정리하는 전문 데이터 서비스입니다.
				</p>
			</section>
			<section className="content-section">
				<h2>운영 원칙</h2>
				<p>
					모든 핵심 기능은 무료입니다. 결제, 구독, Paywall, 핵심 기능 이용을
					위한 로그인 강요는 만들지 않습니다. 목표는 무료지만 유료 서비스처럼
					정돈된 검색, 비교, 판단 경험을 제공하는 것입니다.
				</p>
			</section>
			<section className="content-section">
				<h2>현재 제공 서비스</h2>
				<p>
					첫 서비스는 한국관광공사 반려동물 동반여행 공공데이터를 활용한
					반려동물 동반 장소 검색입니다. 위치, 장소 유형, 지도, 동반 조건,
					방문 전 확인 정보를 함께 보여줍니다.
				</p>
				<Link className="button button-primary" to="/pet-travel">
					반려동물 동반 장소 찾기
				</Link>
			</section>
		</main>
	);
}
