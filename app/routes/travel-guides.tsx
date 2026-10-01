import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, BookOpen, Search, X } from "lucide-react";
import type { Route } from "./+types/travel-guides";
import { SiteNav } from "../components/site-nav";
import { TRAVEL_GUIDES, GUIDE_CATEGORIES, GUIDE_PATH, GUIDE_UPDATED, guidePath } from "../content/travel-guides";
import { breadcrumbJsonLd, canonicalUrl, socialMeta, webPageJsonLd } from "../seo";

export function meta({ location }: Route.MetaArgs) {
  const title = "반려동물 여행 가이드 36편 | 조건·식사·숙박·일정 - GoodThingz";
  const description = "동반 조건, 식사·카페, 숙박, 이동·현장, 일정·예산, 데이터 판단. 36편의 사례·비교 기준·문의 질문을 읽고 실제 장소와 내 방문 계획에 적용하세요.";
  return [{ title }, { name: "description", content: description }, ...socialMeta({ title, description, path: GUIDE_PATH }),
    { name: "robots", content: location.search ? "noindex,follow" : "index,follow" },
    { tagName: "link", rel: "canonical", href: canonicalUrl(GUIDE_PATH) },
    { "script:ld+json": [webPageJsonLd({ name: title, description, path: GUIDE_PATH, dateModified: GUIDE_UPDATED }), breadcrumbJsonLd([{ name: "홈", path: "/" }, { name: "방문 가이드", path: GUIDE_PATH }])] }];
}

export default function TravelGuides() {
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const term = query.trim().toLocaleLowerCase("ko");
  const groups = GUIDE_CATEGORIES.filter(group => !category || group.id === category).map(group => ({
    ...group,
    guides: group.ids.map(id => TRAVEL_GUIDES.find(guide => guide.id === id)!).filter(guide => !term || `${guide.title} ${guide.question} ${guide.intro} ${guide.steps.map(step => step.title).join(" ")}`.toLocaleLowerCase("ko").includes(term)),
  }));
  const count = groups.reduce((total, group) => total + group.guides.length, 0);
  return <main className="library-page" id="top">
    <SiteNav />
    <nav className="breadcrumb" aria-label="현재 위치"><Link reloadDocument to="/">홈</Link><span aria-hidden="true">/</span><span>방문 가이드</span></nav>
    <header className="library-intro"><p className="eyebrow">GOODTHINGZ 여행 자료실</p><h1>반려동물 여행 가이드</h1><p className="lead">지금 결정할 문제부터 찾아보세요.</p><p>우리 동물의 조건을 맞추고, 식사와 숙박을 고른 뒤, 이동과 예산을 연결합니다. 6개 주제의 36편에 확인 순서·판단 사례·비교 기준을 담았습니다.</p><p className="editor-byline">작성·운영: 굳띵즈 · 수정 <time dateTime={GUIDE_UPDATED}>{GUIDE_UPDATED}</time> · <Link to="/about#editorial">작성 원칙</Link></p></header>
    <nav className="topic-nav" aria-label="가이드 카테고리">{GUIDE_CATEGORIES.map((group, i) => <a key={group.id} href={`#category-${group.id}`} onClick={() => { setCategory(""); setQuery(""); }}><span>{String(i + 1).padStart(2, "0")}</span>{group.name}<small>{group.ids.length}편</small></a>)}</nav>
    <section className="reading-path" aria-labelledby="reading-path-title"><h2 id="reading-path-title">처음 준비한다면</h2><ol><li><Link to={guidePath("size")}>우리 동물 조건 정하기</Link></li><li><Link to={guidePath("compare-rules")}>같은 기준으로 후보 비교</Link></li><li><Link to={guidePath("day-plan")}>하루 일정에 연결하기</Link></li><li><Link to="/pet-travel/plan">확인한 내용 기록하기</Link></li></ol></section>
    <div className="catalog-controls"><label><span><Search size={16} aria-hidden="true" /> 가이드 안에서 찾기</span><input type="search" value={query} maxLength={80} onChange={event => setQuery(event.target.value)} placeholder="예: 조식, 이동장, 보증금" /></label><label>지금 준비하는 것<select value={category} onChange={event => setCategory(event.target.value)}><option value="">전체 주제</option>{GUIDE_CATEGORIES.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label><p role="status">{count}편</p></div>
    <div className="catalog-sections">{count ? groups.filter(group => group.guides.length).map(group => <section key={group.id} id={`category-${group.id}`} className={`catalog-section topic-${group.id}`} aria-labelledby={`heading-${group.id}`}><header><h2 id={`heading-${group.id}`}>{group.name}</h2><p>{group.description}</p></header><div className="catalog-grid">{group.guides.map(guide => <article id={guide.id} key={guide.id} className="guide-summary"><h3><Link to={guidePath(guide.id)}>{guide.title}</Link></h3><p>{guide.question}</p><Link className="text-button" to={guidePath(guide.id)}><BookOpen size={16} aria-hidden="true" /> 사례와 판단 기준 읽기 <ArrowRight size={16} aria-hidden="true" /></Link></article>)}</div></section>) : <section className="catalog-empty"><h2>맞는 가이드를 찾지 못했습니다.</h2><p>짧은 단어로 다시 찾거나 전체 주제에서 확인해 보세요. 장소명을 찾고 있다면 장소 검색을 이용할 수 있습니다.</p><button className="text-button" type="button" onClick={() => { setCategory(""); setQuery(""); }}><X size={16} aria-hidden="true" /> 조건 초기화</button><Link to="/pet-travel">장소 검색으로</Link></section>}</div>
    <section className="library-method"><h2>읽고 나서 실제 후보에 적용하기</h2><div className="guide-actions"><Link to="/pet-travel/data-notes">실제 12곳 원문과 해석</Link><Link to="/pet-travel/guides/visit-checklist">출발 체크리스트</Link><Link to="/pet-travel">장소 검색·비교</Link><Link to="/contact">잘못된 정보 알리기</Link></div><p>가이드는 공공데이터 항목을 방문 결정 순서로 재구성한 편집 자료입니다. 가상 사례는 실제 후기와 구분하며, 전국 공통 입장 규정이나 의료·법률 판단을 대신하지 않습니다. <Link to="/data-sources/kto-pet-tour">출처와 이용 범위</Link></p></section>
  </main>;
}
