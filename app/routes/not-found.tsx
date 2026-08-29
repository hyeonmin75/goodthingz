import { data, Link } from "react-router";

import type { Route } from "./+types/not-found";
import { canonicalUrl, socialMeta } from "../seo";

export function loader({}: Route.LoaderArgs) {
	return data(null, { status: 404 });
}

export function meta({}: Route.MetaArgs) {
	const title = "페이지를 찾을 수 없습니다 - GoodThingz";
	const description =
		"요청한 GoodThingz 페이지를 찾을 수 없습니다. 반려동물 동반여행 검색으로 이동해 필요한 정보를 다시 확인하세요.";

	return [
		{ title },
		{ name: "description", content: description },
		...socialMeta({ title, description, path: "/" }),
		{ name: "robots", content: "noindex,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl("/") },
	];
}

export default function NotFound() {
	return (
		<main className="content-page">
			<section className="content-hero">
				<p className="eyebrow">404</p>
				<h1>페이지를 찾을 수 없습니다.</h1>
				<p>
					주소가 바뀌었거나 아직 만들지 않은 페이지입니다. 검색 노출을 위한 빈
					페이지를 만들지 않는 정책에 따라, 필요한 기능이 있는 화면으로 안내합니다.
				</p>
				<div className="hero-actions">
					<Link className="button button-primary" to="/pet-travel">
						반려동물 동반여행 검색
					</Link>
					<Link className="button button-secondary" to="/">
						홈으로
					</Link>
				</div>
			</section>
		</main>
	);
}
