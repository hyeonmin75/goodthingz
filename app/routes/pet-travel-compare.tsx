import { Link } from "react-router";

import type { Route } from "./+types/pet-travel-compare";
import { canonicalUrl, socialMeta } from "../seo";

export function meta({}: Route.MetaArgs) {
	const title = "반려동물 동반 장소 비교 - GoodThingz";
	const description =
		"사용자가 선택한 반려동물 동반 장소 조합 비교 화면입니다. 조합별 대량 색인을 막기 위해 noindex를 적용합니다.";

	return [
		{ title },
		{ name: "description", content: description },
		...socialMeta({ title, description, path: "/pet-travel/compare" }),
		{ name: "robots", content: "noindex,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl("/pet-travel") },
	];
}

export default function PetTravelCompareNoindex() {
	return (
		<main className="content-page compact-content">
			<nav className="breadcrumb" aria-label="현재 위치">
				<Link to="/">홈</Link>
				<span aria-hidden="true">/</span>
				<Link to="/pet-travel">반려동물 여행</Link>
				<span aria-hidden="true">/</span>
				<span>후보 비교</span>
			</nav>
			<section className="content-hero">
				<p className="eyebrow">NOINDEX</p>
				<h1>비교 조합은 색인하지 않습니다.</h1>
				<p className="lead">
					비교 화면은 사용자가 고른 장소 조합마다 달라지므로 검색 노출 대상이
					아닙니다. 대표 검색 화면에서 후보를 선택해 비교해 주세요.
				</p>
				<Link className="button button-primary" to="/pet-travel">
					장소 비교 시작하기
				</Link>
			</section>
		</main>
	);
}
