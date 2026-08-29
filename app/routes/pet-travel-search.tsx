import { Link } from "react-router";

import type { Route } from "./+types/pet-travel-search";
import { canonicalUrl, socialMeta } from "../seo";

export function meta({}: Route.MetaArgs) {
	const title = "반려동물 동반여행 검색 결과 - GoodThingz";
	const description =
		"사용자 검색 조건에 따라 달라지는 반려동물 동반여행 검색 결과입니다.";

	return [
		{ title },
		{ name: "description", content: description },
		...socialMeta({ title, description, path: "/pet-travel/search" }),
		{ name: "robots", content: "noindex,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl("/pet-travel") },
	];
}

export default function PetTravelSearchNoindex() {
	return (
		<main className="content-page compact-content">
			<nav className="breadcrumb" aria-label="현재 위치">
				<Link to="/">홈</Link>
				<span aria-hidden="true">/</span>
				<Link to="/pet-travel">반려동물 여행</Link>
				<span aria-hidden="true">/</span>
				<span>검색 결과</span>
			</nav>
			<section className="content-hero">
				<p className="eyebrow">NOINDEX</p>
				<h1>검색 결과는 색인하지 않습니다.</h1>
				<p className="lead">
					검색어와 필터 조합은 너무 많이 생길 수 있어 sitemap에 넣지
					않습니다. 반려동물 동반 장소 검색은 대표 페이지에서 시작해 주세요.
				</p>
				<Link className="button button-primary" to="/pet-travel">
					검색 시작하기
				</Link>
			</section>
		</main>
	);
}
