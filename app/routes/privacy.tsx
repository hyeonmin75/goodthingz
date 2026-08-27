import { Link } from "react-router";

import type { Route } from "./+types/privacy";
import { breadcrumbJsonLd, canonicalUrl, webPageJsonLd } from "../seo";

export function meta({}: Route.MetaArgs) {
	const title = "개인정보 처리 안내 - GoodThingz";
	const description =
		"GoodThingz의 위치 권한, 브라우저 저장, 공유 기능, 공공데이터 API 처리 방식을 설명합니다.";

	return [
		{ title },
		{ name: "description", content: description },
		{ name: "robots", content: "index,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl("/privacy") },
		{
			"script:ld+json": [
				webPageJsonLd({ name: title, description, path: "/privacy" }),
				breadcrumbJsonLd([
					{ name: "홈", path: "/" },
					{ name: "개인정보", path: "/privacy" },
				]),
			],
		},
	];
}

export default function Privacy() {
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
					<Link to="/about">소개</Link>
				</div>
			</nav>
			<nav className="breadcrumb" aria-label="현재 위치">
				<Link to="/">홈</Link>
				<span aria-hidden="true">/</span>
				<span>개인정보</span>
			</nav>
			<section className="content-hero" aria-labelledby="privacy-title">
				<p className="eyebrow">개인정보 처리 안내</p>
				<h1 id="privacy-title">위치와 저장 정보는 필요한 만큼만 사용합니다.</h1>
				<p className="lead">
					GoodThingz는 핵심 기능 이용을 위해 로그인을 요구하지 않으며, API
					Key는 브라우저에 노출하지 않습니다.
				</p>
			</section>
			<section className="content-section">
				<h2>위치 권한</h2>
				<p>
					`내 위치 조회`를 누를 때만 브라우저 위치 권한을 요청합니다. 위치는
					주변 반려동물 동반 장소를 찾는 요청에 사용되며, 현재 구현에서는
					GoodThingz 계정에 저장하지 않습니다.
				</p>
			</section>
			<section className="content-section">
				<h2>브라우저 저장</h2>
				<p>
					저장한 장소는 사용자의 브라우저 localStorage에 보관됩니다. 같은
					브라우저에서 다시 볼 수 있게 하기 위한 기능이며, 서버 계정 저장이나
					유료 잠금 기능으로 사용하지 않습니다.
				</p>
			</section>
			<section className="content-section">
				<h2>공유 기능</h2>
				<p>
					공유 버튼은 선택한 장소명, 주소, 거리 같은 최소 정보를 텍스트로
					전달합니다. 브라우저가 공유 기능을 지원하지 않으면 클립보드 복사를
					사용합니다.
				</p>
			</section>
			<section className="content-section">
				<h2>공공데이터 API Key</h2>
				<p>
					공공데이터 API Key는 Cloudflare Worker Secret으로 관리합니다.
					브라우저 JavaScript에는 Key를 넣지 않고, 외부 API 호출은 Worker
					내부에서 처리합니다.
				</p>
			</section>
		</main>
	);
}
