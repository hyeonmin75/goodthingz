import { Link, data } from "react-router";

export function loader() {
	return data(null, { status: 404 });
}

import type { Route } from "./+types/pet-travel-place";
import { canonicalUrl, socialMeta } from "../seo";

export function meta({ params }: Route.MetaArgs) {
	const contentId = params.contentId ?? "unknown";
	const title = `반려동물 동반 장소 상세 ${contentId} - GoodThingz`;
	const description =
		"공공데이터 개별 장소 상세는 공유와 서비스 이용을 위한 화면이며 검색 색인 대상이 아닙니다.";

	return [
		{ title },
		{ name: "description", content: description },
		...socialMeta({
			title,
			description,
			path: `/pet-travel/places/${contentId}`,
		}),
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
				<p className="eyebrow">404</p>
				<h1>이 주소의 장소 상세 페이지는 제공하지 않습니다.</h1>
				<p className="lead">
					장소의 동반 조건과 방문 정보는 검색 화면에서 장소를 선택하면 확인할 수 있습니다.
				</p>
				<Link className="button button-primary" to="/pet-travel">
					검색 화면으로 돌아가기
				</Link>
			</section>
		</main>
	);
}
