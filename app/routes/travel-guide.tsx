import { useEffect, useState } from "react";
import { data, Link } from "react-router";
import { ArrowRight, Copy, ListChecks } from "lucide-react";
import type { Route } from "./+types/travel-guide";
import { SiteNav } from "../components/site-nav";
import { PetFeeCalculator } from "../components/pet-fee-calculator";
import { TRAVEL_GUIDES, GUIDE_DETAILS, GUIDE_UPDATED, GUIDE_PATH, guidePath, guideCategory } from "../content/travel-guides";
import { CASE_NOTES, STUDY_PATH, STUDY_DATE, findStudyRecord } from "../content/field-study";
import { breadcrumbJsonLd, canonicalUrl, socialMeta } from "../seo";
import NotFound from "./not-found";

export function loader({ params, request }: Route.LoaderArgs) {
  const guide = TRAVEL_GUIDES.find(item => item.id === params.guideSlug);
  return data({ guide: guide ?? null }, { status: guide ? 200 : 404, headers: { "X-Robots-Tag": !guide || new URL(request.url).search ? "noindex, follow" : "index, follow" } });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export function meta({ data: loaderData, location }: Route.MetaArgs) {
  const guide = loaderData?.guide;
  if (!guide) return [{ title: "가이드를 찾을 수 없습니다 | GoodThingz" }, { name: "robots", content: "noindex,follow" }, { name: "description", content: "요청한 가이드가 없습니다. 방문 가이드 목록에서 필요한 질문을 찾아주세요." }];
  const category = guideCategory(guide.id);
  const title = `${guide.title} | GoodThingz`;
  const description = `${guide.question} ${guide.intro.split(". ")[0]}. 확인 순서, 비교 기준과 문의 질문을 정리했습니다.`;
  const path = guidePath(guide.id);
  return [{ title }, { name: "description", content: description }, ...socialMeta({ title, description, path }),
    { name: "robots", content: location.search ? "noindex,follow" : "index,follow" }, { tagName: "link", rel: "canonical", href: canonicalUrl(path) },
    { "script:ld+json": [{ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description, url: canonicalUrl(path), mainEntityOfPage: canonicalUrl(path), inLanguage: "ko-KR", datePublished: publicationDate(guide.id), dateModified: GUIDE_UPDATED, author: { "@type": "Organization", name: "굳띵즈", url: canonicalUrl("/about") }, publisher: { "@type": "Organization", name: "GoodThingz", url: canonicalUrl("/") }, articleSection: category.name }, breadcrumbJsonLd([{ name: "홈", path: "/" }, { name: "방문 가이드", path: GUIDE_PATH }, { name: category.name, path: `${GUIDE_PATH}#category-${category.id}` }, { name: guide.title, path }])] }];
}

function publicationDate(id: string) { return ["dining", "overnight", "size", "multiple", "rain", "arrival", "equipment", "timing", "budget", "uncertain"].includes(id) ? "2026-09-15" : "2026-10-01"; }

export default function TravelGuide({ loaderData }: Route.ComponentProps) {
  const [message, setMessage] = useState("");
  const guide = loaderData.guide;
  useEffect(() => setMessage(""), [guide?.id]);
  if (!guide) return <NotFound />;
  const category = guideCategory(guide.id);
  const detail = GUIDE_DETAILS[guide.id];
  const related = detail.related.map(id => TRAVEL_GUIDES.find(item => item.id === id)!);
  async function copyQuestions() {
    try { await navigator.clipboard.writeText(guide!.asks.join("\n")); setMessage("문의 문장을 복사했습니다. 내 방문 조건에 맞게 바꿔서 보내세요."); }
    catch { setMessage("자동 복사를 사용할 수 없습니다. 아래 문의 문장을 선택해 복사하세요."); }
  }
  return <main className="article-page" key={guide.id}>
    <SiteNav />
    <nav className="breadcrumb" aria-label="현재 위치"><Link reloadDocument to="/">홈</Link><span aria-hidden="true">/</span><Link to={GUIDE_PATH}>방문 가이드</Link><span aria-hidden="true">/</span><Link to={`${GUIDE_PATH}#category-${category.id}`}>{category.name}</Link></nav>
    <header className="article-heading"><p className="eyebrow">{category.name}</p><h1>{guide.title}</h1><p className="lead">{guide.question}</p><p className="editor-byline">작성·운영: <Link to="/about#editorial">굳띵즈</Link> · 최초 공개 <time dateTime={publicationDate(guide.id)}>{publicationDate(guide.id)}</time> · 내용 수정 <time dateTime={GUIDE_UPDATED}>{GUIDE_UPDATED}</time></p></header>
    <div className="article-layout"><aside className="article-sidebar"><nav aria-label="이 글의 목차"><h2>이 글에서</h2><a href="#decision">확인 순서</a><a href="#criteria">비교 기준</a><a href="#example">판단 사례</a><a href="#questions">문의할 질문</a><a href="#sources">출처와 한계</a><a href="#related">이어 읽기</a></nav><Link className="text-button" to={`${GUIDE_PATH}#category-${category.id}`}>{category.name} 전체 <ArrowRight size={16} aria-hidden="true" /></Link></aside>
      <article className="guide-body decision-article"><p className="article-intro">{guide.intro}</p><section id="decision"><h2>어떤 순서로 확인할까요?</h2><ol className="decision-steps">{guide.steps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol></section>
        <section id="criteria"><h2>상황을 같은 기준으로 비교하기</h2><div className="article-table-wrap" role="region" aria-label="상황별 판단 기준" tabIndex={0}><table><caption>{guide.title}의 판단 기준</caption><thead><tr><th scope="col">현재 상황</th><th scope="col">확인할 근거</th><th scope="col">결정할 때 주의점</th></tr></thead><tbody>{detail.decisions.map(row => <tr key={row[0]}><th scope="row">{row[0]}</th><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></table></div></section>
        <section id="example" className="worked-example"><h2>가상 상황에 적용해 보기</h2><p>{guide.example.situation}</p><p><strong>판단:</strong> {guide.example.decision}</p><p className="muted-copy">설명을 위해 구성한 사례입니다. 실제 업장의 현재 조건이나 방문 후기가 아닙니다.</p></section>
        {detail.studyIds?.length ? <section className="guide-real-cases"><h2>실제 원자료에서는 어떻게 보일까요?</h2><p><time dateTime={STUDY_DATE}>{STUDY_DATE}</time> 조회 표본입니다. 현재 입장을 확인한 기록은 아닙니다.</p>{detail.studyIds.map(id => { const note = CASE_NOTES.find(item => item.id === id)!; return <div className="article-case" key={id}><h3><Link to={`${STUDY_PATH}#record-${id}`}>{findStudyRecord(id).title}</Link></h3><p>{note.heading}</p><Link className="text-button" to={`${STUDY_PATH}#record-${id}`}>원문·해석·추가 질문 대조하기 <ArrowRight size={16} aria-hidden="true" /></Link></div>; })}</section> : null}
        {["budget", "stay-fees"].includes(guide.id) ? <PetFeeCalculator /> : null}
        <section id="questions" className="guide-enquiry"><h2>확인할 질문</h2><ul>{guide.asks.map(ask => <li key={ask}>{ask}</li>)}</ul><button type="button" className="text-button" onClick={() => void copyQuestions()}><Copy size={16} aria-hidden="true" /> 문의 문장 복사</button><p role="status">{message}</p></section>
        <section id="sources" className="article-sources"><h2>근거와 판단의 한계</h2><dl className="guide-evidence"><div><dt>어떤 항목을 읽었나요?</dt><dd>{guide.data}</dd></div><div><dt>이 글로 확정할 수 없는 것</dt><dd>{guide.limit}</dd></div></dl><p>한국관광공사 반려동물 동반여행 서비스 활용매뉴얼 v4.1(2026-02-25)의 항목 정의와 GoodThingz의 공개 기능을 바탕으로 판단 순서를 재구성했습니다. 법률·의료·교통 규정의 전문 해설이나 현장 실사 보고서가 아닙니다.</p><ul className="source-list"><li><Link to="/data-sources/kto-pet-tour">원자료의 제공 범위·갱신 기준·이용조건</Link></li><li><a href="https://api.visitkorea.or.kr/" target="_blank" rel="noreferrer">한국관광공사 TourAPI 공식 서비스</a></li>{["rain", "terrace-weather", "walking-route", "change-plan"].includes(guide.id) ? <li><a href="https://www.weather.go.kr/w/index.do" target="_blank" rel="noreferrer">기상청 날씨누리: 출발 전 최신 기상정보</a></li> : null}{guide.id === "share-plan" ? <li><Link to="/privacy">실제 공유·저장 처리 범위</Link></li> : null}</ul><Link className="text-button" to={`/contact?topic=content&guide=${encodeURIComponent(guide.id)}`}>이 글의 오류·빠진 정보 알리기</Link></section>
        <section id="related" className="related-reading"><h2>이어서 해결할 질문</h2>{related.map(item => <Link className="related-guide" key={item.id} to={guidePath(item.id)}><span><strong>{item.title}</strong><small>{item.question}</small></span><ArrowRight size={18} aria-hidden="true" /></Link>)}</section>
        <section className="article-next"><h2>내 후보에 적용하기</h2><div className="guide-actions"><Link className="button button-primary" to={`/pet-travel${guide.searchType ? `?contentTypeId=${guide.searchType}` : ""}`}>조건에 맞는 장소 찾기</Link><Link className="button button-secondary" to="/pet-travel/plan"><ListChecks size={18} aria-hidden="true" /> 확인 내용 기록하기</Link></div></section>
      </article></div>
  </main>;
}
