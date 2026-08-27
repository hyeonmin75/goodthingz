import { Link } from "react-router";

import type { Route } from "./+types/pet-travel-place";
import { canonicalUrl } from "../seo";

export function meta({ params }: Route.MetaArgs) {
	const contentId = params.contentId ?? "unknown";

	return [
		{ title: `반려동물 동반 장소 상세 ${contentId} - GoodThingz` },
		{
			name: "description",
			content:
				"공공데이터 개별 장소 상세는 공유와 서비스 이용을 위한 화면이며 검색 색인 대상이 아닙니다.",
		},
		{ name: "robots", content: "noindex,follow" },
		{
			tagName: "link",
			rel: "canonical",
			href: canonicalUrl(`/pet-travel/places/${contentId}`),
		},
	];
}

export default function PetTravelPlaceNoindex({
	params,
}: Route.ComponentProps) {
	return (
		<main className="content-page compact-content">
			<nav className="breadcrumb" aria-label="현재 위치">
				<Link to="/">홈</Link>
				<span aria-hidden="true">/</span>
				<Link to="/pet-travel">반려동물 여행</Link>
				<span aria-hidden="true">/</span>
				<span>장소 상세</span>
			</nav>
			<section className="content-hero">
				<p className="eyebrow">NOINDEX</p>
				<h1>장소 상세는 대량 색인하지 않습니다.</h1>
				<p className="lead">
					장소 ID {params.contentId} 상세는 앱 안에서 확인하고 공유할 수
					있지만, API 레코드 수만큼 검색 페이지를 만들지 않기 위해 sitemap에
					넣지 않습니다.
				</p>
				<Link className="button button-primary" to="/pet-travel">
					검색 화면으로 돌아가기
				</Link>
			</section>
		</main>
	);
}
