import { Link } from "react-router";

import type { Route } from "./+types/privacy";
import {
	breadcrumbJsonLd,
	canonicalUrl,
	PAGE_LAST_MODIFIED,
	socialMeta,
	webPageJsonLd,
} from "../seo";

export function meta({}: Route.MetaArgs) {
	const title = "개인정보 처리 안내 - GoodThingz";
	const description =
		"GoodThingz의 위치 권한, 브라우저 저장, 공유 기능, Google 광고 데이터 처리, 공공데이터 API 처리 방식을 설명합니다.";

	return [
		{ title },
		{ name: "description", content: description },
		...socialMeta({ title, description, path: "/privacy" }),
		{ name: "robots", content: "index,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl("/privacy") },
		{
			"script:ld+json": [
				webPageJsonLd({
					name: title,
					description,
					path: "/privacy",
					dateModified: PAGE_LAST_MODIFIED.privacy,
				}),
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
					핵심 기능은 로그인 없이 이용할 수 있습니다. 위치 사용 여부는 직접 선택하며, 저장한 장소는 사용 중인 브라우저에서 관리합니다.
				</p>
			</section>
			<section className="content-section">
				<h2>위치 권한</h2>
				<p>
					내 위치 조회를 누르면 사용 목적과 전달 대상을 먼저 안내합니다. 이에 동의하고 브라우저 권한을 허용하면 좌표를 받아 주변 장소 검색과 지도 표시에 사용합니다. 좌표는 HTTPS 연결로 GoodThingz의 Cloudflare 서버를 거쳐 한국관광공사에 전달됩니다. 지도에 현재 위치를 표시할 때는 OpenStreetMap에, 길찾기를 열 때는 지도 및 경로 제공자에 출발지와 목적지가 전달됩니다.
				</p>
				<p>현재 위치 자체는 브라우저 저장소에 저장하지 않고 현재 화면에서 사용합니다. 새로고침하거나 화면을 닫으면 다시 조회해야 합니다. 위치는 광고 타겟팅에 사용하지 않습니다. 동의를 취소해도 장소명 검색은 가능하며, 브라우저의 사이트 설정에서 위치 권한을 철회할 수 있습니다.</p>
			</section>
			<section className="content-section">
				<h2>브라우저 저장</h2>
				<p>
					저장한 장소의 이름, 주소, 장소 좌표, 이미지 주소와 조회 당시 거리 등은 같은 브라우저에서 다시 보기 위해 기기의 사이트 저장공간에 보관됩니다. 서버 계정으로 동기화하지 않습니다. 별도 자동 만료는 없으며 장소의 저장을 해제하거나 브라우저 설정에서 이 사이트의 데이터를 삭제하면 지울 수 있습니다.
				</p>
			</section>
			<section className="content-section">
				<h2>공유 기능</h2>
				<p>
					공유 버튼은 선택한 장소명, 주소와 서비스 링크를 텍스트로 전달합니다. 현재 위치와 현재 위치에서의 거리는 공유 내용에서 제외합니다. 기기의 공유 화면에서 사용자가 선택한 앱이나 상대에게 전달되며, 공유 기능을 지원하지 않으면 클립보드에 복사합니다.
				</p>
			</section>
			<section className="content-section">
				<h2>Google 광고 서비스</h2>
				<p>
					현재는 AdSense 심사용 계정 메타 태그와 ads.txt를 제공하며 광고 스크립트 실행은 보류하고 있습니다. 이 두 확인 표시는 자체적으로 광고 쿠키를 설치하거나 광고 요청을 보내지 않습니다.
				</p>
				<p>
					광고 제공을 시작할 때는 해당 상태와 필요한 동의 절차를 반영합니다. Google과 광고 파트너는 광고 제공·측정·부정 사용 방지 및 동의에 따른 개인화를 위해 브라우저에 쿠키를 설치하거나 읽고, 웹 비콘, IP 주소, 기기 식별자 등을 처리할 수 있습니다. Google의 실제 데이터 이용과 사용자 선택에 관한 안내는 다음 링크에서 확인할 수 있습니다.
				</p>
				<a
					className="text-button"
					href="https://policies.google.com/technologies/partner-sites?hl=ko"
					target="_blank"
					rel="noreferrer"
				>
					Google 광고 데이터 처리 안내
				</a>
				<p><a href="https://myadcenter.google.com/" rel="noreferrer" target="_blank">Google 광고 개인화 설정</a></p>
			</section>
			<section className="content-section">
				<h2>외부 서비스와 접속 기록</h2>
				<p>
					사이트 전송은 Cloudflare, 글꼴 제공은 jsDelivr, 지도는 OpenStreetMap, 장소 이미지 제공은 해당 이미지 서버를 사용합니다. 이 리소스를 불러오면 제공자에게 IP 주소와 브라우저 정보 등 통신에 필요한 정보가 전달될 수 있습니다. 외부 링크를 열면 방문한 서비스의 처리방침이 적용됩니다.
				</p>
				<p>검색어와 위치를 포함한 요청 주소가 인프라 제공자의 접속·보안 기록에 포함될 수 있습니다. GoodThingz는 별도 사용자 계정이나 위치 이력 데이터베이스를 운영하지 않지만, 외부 제공자의 기록 보관기간은 각 제공자의 정책과 설정에 따릅니다. 확인하지 않은 보관기간이나 완전한 미수집을 보장하지 않습니다.</p>
			</section>
			<section className="content-section">
				<h2>문의와 변경 안내</h2>
				<p>운영: GoodThingz · 시행 및 수정일: 2026년 9월 5일. <Link to="/about">운영 안내와 오류 제보</Link>에서 연락 경로를 확인할 수 있습니다. 공개 제보 공간에는 실제 위치, 연락처나 인증정보를 작성하지 마세요.</p>
			</section>
		</main>
	);
}
