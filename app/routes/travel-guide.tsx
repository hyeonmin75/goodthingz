import { useEffect, useState } from "react";
import { data, Link } from "react-router";
import { ArrowLeft, ArrowRight, Copy, ListChecks } from "lucide-react";
import type { Route } from "./+types/travel-guide";
import { SiteNav } from "../components/site-nav";
import { PetFeeCalculator } from "../components/pet-fee-calculator";
import { TRAVEL_GUIDES, GUIDE_CATEGORIES, GUIDE_DETAILS, GUIDE_UPDATED, GUIDE_PATH, guidePath, guideCategory } from "../content/travel-guides";
import { GUIDE_READING, guideOfficialSources } from "../content/guide-reading";
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
    { "script:ld+json": [{ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description, url: canonicalUrl(path), mainEntityOfPage: canonicalUrl(path), inLanguage: "ko-KR", datePublished: publicationDate(guide.id), dateModified: GUIDE_UPDATED, author: { "@type": "Organization", name: "굳띵즈", url: canonicalUrl("/about") }, publisher: { "@type": "Organization", name: "GoodThingz", url: canonicalUrl("/") }, articleSection: category.name, citation: guideOfficialSources(guide.id).map(source => source.url) }, breadcrumbJsonLd([{ name: "홈", path: "/" }, { name: "방문 가이드", path: GUIDE_PATH }, { name: category.name, path: `${GUIDE_PATH}#category-${category.id}` }, { name: guide.title, path }])] }];
}

function publicationDate(id: string) { return ["dining", "overnight", "size", "multiple", "rain", "arrival", "equipment", "timing", "budget", "uncertain"].includes(id) ? "2026-09-15" : "2026-10-01"; }

export default function TravelGuide({ loaderData }: Route.ComponentProps) {
  const [message, setMessage] = useState("");
  const guide = loaderData.guide;
  useEffect(() => setMessage(""), [guide?.id]);
  if (!guide) return <NotFound />;
  const category = guideCategory(guide.id);
  const detail = GUIDE_DETAILS[guide.id];
  const reading = GUIDE_READING[guide.id];
  const ordered: readonly string[] = GUIDE_CATEGORIES.flatMap(group => group.ids);
  const position = ordered.indexOf(guide.id);
  const previous = TRAVEL_GUIDES.find(item => item.id === ordered[position - 1]);
  const next = TRAVEL_GUIDES.find(item => item.id === ordered[position + 1]);
  const related = detail.related.map(id => TRAVEL_GUIDES.find(item => item.id === id)!);
  async function copyQuestions() {
    try { await navigator.clipboard.writeText(guide!.asks.join("\n")); setMessage("문의 문장을 복사했습니다. 내 방문 조건에 맞게 바꿔서 보내세요."); }
    catch { setMessage("자동 복사를 사용할 수 없습니다. 아래 문의 문장을 선택해 복사하세요."); }
  }
  return <main className="article-page" key={guide.id}>
    <SiteNav />
    <nav className="breadcrumb" aria-label="현재 위치"><Link reloadDocument to="/">홈</Link><span aria-hidden="true">/</span><Link to={GUIDE_PATH}>방문 가이드</Link><span aria-hidden="true">/</span><Link to={`${GUIDE_PATH}#category-${category.id}`}>{category.name}</Link></nav>
    <header className="article-heading"><p className="eyebrow">{category.name}</p><h1>{guide.title}</h1><p className="lead">{guide.question}</p><p className="editor-byline">글 <Link to="/about">굳띵즈</Link> · 발행 <time dateTime={publicationDate(guide.id)}>{publicationDate(guide.id)}</time> · 수정 <time dateTime={GUIDE_UPDATED}>{GUIDE_UPDATED}</time></p></header>
    <div className="article-layout">
      <aside className="article-sidebar">
        <nav aria-label="이 글의 목차">
          <h2>이 글에서</h2>
          <a href="#decision">확인 순서</a>
          {reading.sections.map((section, index) => <a key={section.title} href={`#read-${index + 1}`}>{section.title}</a>)}
          <a href="#criteria">비교 기준</a><a href="#example">판단 사례</a><a href="#questions">문의할 질문</a><a href="#sources">공식 자료</a><a href="#related">관련 글</a>
        </nav>
        <Link className="text-button" to={`${GUIDE_PATH}#category-${category.id}`}>{category.name} 전체 <ArrowRight size={16} aria-hidden="true" /></Link>
      </aside>
      <article className="guide-body decision-article">
        <p className="guide-answer"><strong>먼저 알아둘 점</strong>{reading.answer}</p>
        <p className="article-intro" data-article-prose>{guide.intro}</p>
        <section id="decision"><h2>어떤 순서로 확인할까요?</h2><ol className="decision-steps">{guide.steps.map(step => <li key={step.title}><h3>{step.title}</h3><p data-article-prose>{step.body}</p></li>)}</ol></section>
        {reading.sections.map((section, index) => <section id={`read-${index + 1}`} className="guide-reading-section" key={section.title} aria-labelledby={`read-heading-${index + 1}`}>
          <h2 id={`read-heading-${index + 1}`}>{section.title}</h2>
          {section.paragraphs.map((paragraph, paragraphIndex) => <p data-article-prose key={paragraphIndex}>{paragraph}</p>)}
        </section>)}
        <section id="criteria"><h2>상황을 같은 기준으로 비교하기</h2><div className="article-table-wrap" role="region" aria-label="상황별 판단 기준" tabIndex={0}><table><caption>{guide.title}의 판단 기준</caption><thead><tr><th scope="col">현재 상황</th><th scope="col">확인할 근거</th><th scope="col">결정할 때 주의점</th></tr></thead><tbody>{detail.decisions.map(row => <tr key={row[0]}><th scope="row">{row[0]}</th><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></table></div></section>
        <section id="example" className="worked-example"><h2>가상 상황에 적용해 보기</h2><p data-article-prose>{guide.example.situation}</p><p data-article-prose>{guide.example.decision}</p><p className="muted-copy">설명용 예시이며 실제 장소의 이용 조건은 아닙니다.</p></section>
        {detail.studyIds?.length ? <section className="guide-real-cases"><h2>실제 원자료에서는 어떻게 보일까요?</h2><p><time dateTime={STUDY_DATE}>{STUDY_DATE}</time> 조회 표본입니다. 현재 입장을 확인한 기록은 아닙니다.</p>{detail.studyIds.map(id => { const note = CASE_NOTES.find(item => item.id === id)!; return <div className="article-case" key={id}><h3><Link to={`${STUDY_PATH}#record-${id}`}>{findStudyRecord(id).title}</Link></h3><p>{note.heading}</p><Link className="text-button" to={`${STUDY_PATH}#record-${id}`}>원문·해석·추가 질문 대조하기 <ArrowRight size={16} aria-hidden="true" /></Link></div>; })}</section> : null}
        {["budget", "stay-fees"].includes(guide.id) ? <PetFeeCalculator /> : null}
        <section id="questions" className="guide-enquiry"><h2>확인할 질문</h2><ul>{guide.asks.map(ask => <li data-article-prose key={ask}>{ask}</li>)}</ul><button type="button" className="text-button" onClick={() => void copyQuestions()}><Copy size={16} aria-hidden="true" /> 문의 문장 복사</button><p role="status">{message}</p></section>
        <section id="sources" className="article-sources">
          <h2>공식 자료와 방문 전 확인</h2>
          <ul className="source-list official-sources">{guideOfficialSources(guide.id).map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<span className="sr-only"> (새 창)</span></a><p>{source.note}</p></li>)}</ul>
          <p>공식 자료는 제공 정보와 현재 안내를 확인하는 경로입니다. 이 글의 여행 준비 제안이 모든 장소의 공통 규정은 아닙니다.</p>
          <div className="source-links"><Link to="/data-sources/kto-pet-tour">데이터 출처·이용 범위</Link>{guide.id === "share-plan" ? <Link to="/privacy">공유·저장과 개인정보</Link> : null}<Link className="text-button" to={`/contact?topic=content&guide=${encodeURIComponent(guide.id)}`}>이 글의 오류·빠진 정보 알리기</Link></div>
        </section>
        <section id="related" className="related-reading"><h2>이어서 해결할 질문</h2>{related.map(item => <Link className="related-guide" key={item.id} to={guidePath(item.id)}><span><strong>{item.title}</strong><small>{item.question}</small></span><ArrowRight size={18} aria-hidden="true" /></Link>)}</section>
        <section className="article-next"><h2>내 후보에 적용하기</h2><div className="guide-actions"><Link className="button button-primary" to={`/pet-travel${guide.searchType ? `?contentTypeId=${guide.searchType}` : ""}`}>조건에 맞는 장소 찾기</Link><Link className="button button-secondary" to="/pet-travel/plan"><ListChecks size={18} aria-hidden="true" /> 확인 내용 기록하기</Link></div></section>
        <nav className="guide-sequence" aria-label="가이드 이전·다음 글">
          {previous ? <Link rel="prev" to={guidePath(previous.id)}><span><ArrowLeft size={16} aria-hidden="true" /> 이전 글</span><strong>{previous.title}</strong></Link> : null}
          {next ? <Link rel="next" to={guidePath(next.id)}><span>다음 글 <ArrowRight size={16} aria-hidden="true" /></span><strong>{next.title}</strong></Link> : null}
          <Link className="guide-catalog-return" to={`${GUIDE_PATH}#category-${category.id}`}>전체 가이드에서 다른 주제 찾기 <ArrowRight size={16} aria-hidden="true" /></Link>
        </nav>
      </article></div>
  </main>;
}
