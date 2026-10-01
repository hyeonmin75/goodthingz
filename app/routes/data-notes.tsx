import { Link } from "react-router";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import type { Route } from "./+types/data-notes";
import { SiteNav } from "../components/site-nav";
import { CASE_NOTES, STUDY_COMPARISONS, STUDY_DATE, STUDY_INSIGHTS, STUDY_PATH, STUDY_SAMPLE, findStudyRecord } from "../content/field-study";
import { breadcrumbJsonLd, canonicalUrl, socialMeta } from "../seo";
import { formatRetrievalTime } from "../visit-evidence";

export function meta({}: Route.MetaArgs) {
  const title = "반려동물 동반 조건, 실제 12곳 데이터로 비교 | GoodThingz";
  const description = "박물관 내부 출입, 계절별 좌석, 안내견과 일반 반려견, 객실당 체중까지. 실제 12곳의 관광공사 안내를 읽고 3가지 여행 상황에서 무엇을 확인해야 하는지 비교합니다.";
  return [
    { title }, { name: "description", content: description },
    { name: "robots", content: "index,follow" },
    { tagName: "link", rel: "canonical", href: canonicalUrl(STUDY_PATH) },
    ...socialMeta({ title, description, path: STUDY_PATH }),
    { "script:ld+json": [
      { "@context": "https://schema.org", "@type": "Article", headline: title, description,
        datePublished: STUDY_DATE, dateModified: STUDY_DATE, inLanguage: "ko-KR",
        author: { "@type": "Organization", name: "GoodThingz", url: canonicalUrl("/about") },
        mainEntityOfPage: canonicalUrl(STUDY_PATH),
        citation: canonicalUrl("/data-sources/kto-pet-tour") },
      breadcrumbJsonLd([{ name: "홈", path: "/" }, { name: "데이터 읽기", path: STUDY_PATH }]),
    ] },
  ];
}

export default function DataNotes() {
  return <main className="study-page">
    <SiteNav />
    <nav className="breadcrumb" aria-label="현재 위치"><Link reloadDocument to="/">홈</Link><span aria-hidden="true">/</span><span>데이터 읽기</span></nav>
    <header className="library-intro study-intro">
      <p className="eyebrow">GOODTHINGZ 데이터 읽기 · 01</p>
      <h1>같은 ‘동반 가능’,<br />실제로는 다른 조건</h1>
      <p className="lead">12곳의 실제 안내를 세 가지 여행 상황에 대입했습니다.</p>
      <p>목록의 동반 표시만으로는 함께 전시를 보거나, 식사하거나, 숙박할 수 있는지 알기 어렵습니다. 원문에서 읽은 사실과 GoodThingz의 해석을 분리해, 다음에 물어볼 질문까지 정리했습니다.</p>
      <p className="editor-byline">작성·분석: GoodThingz · 발행 <time dateTime={STUDY_DATE}>{STUDY_DATE}</time> · 원자료: 한국관광공사 · 현장 방문·전화 확인을 한 기사가 아닙니다.</p>
    </header>
    <section className="editorial-section study-findings" aria-labelledby="findings-title">
      <h2 id="findings-title">이번 12곳에서 확인한 차이</h2>
      <div className="finding-grid">{STUDY_INSIGHTS.map(insight => <div className="finding" key={insight.label}>
        <p><strong>{insight.value()}</strong><span> / {STUDY_SAMPLE.records.length}곳</span></p>
        <h3>{insight.label}</h3><p>{insight.meaning}</p>
      </div>)}</div>
      <p className="source-inline">4개 유형별 수정일순 3곳씩 선택한 표본입니다. 전국 비율·인기·품질 순위가 아니며 숫자의 분모는 이번 조사 12곳뿐입니다. <a href="#method">선정·집계 방법</a></p>
    </section>
    <nav className="study-jump editorial-section" aria-label="분석 목차">
      <a href="#comparisons">상황별 비교 3개</a><a href="#records">장소별 해석 12개</a><a href="#method">출처와 조사 방법</a>
    </nav>
    <section id="comparisons" className="editorial-section" aria-labelledby="comparison-title">
      <p className="eyebrow">내 일정에 대입하기</p><h2 id="comparison-title">같은 기준으로 놓고 비교해 봤습니다.</h2>
      {STUDY_COMPARISONS.map(comparison => <article className="study-comparison" id={comparison.id} key={comparison.id}>
        <header><p className="eyebrow">{comparison.scenario}</p><h3>{comparison.title}</h3></header>
        <div className="comparison-notes">{comparison.records.map((id, index) => {
          const record = findStudyRecord(id);
          return <div key={id}><a href={`#record-${id}`}><h4>{record.title}</h4></a><p>{comparison.decisions[index]}</p><a className="text-button" href={`#record-${id}`}>원문 근거 읽기 <ArrowRight size={16} aria-hidden="true" /></a></div>;
        })}</div>
        <p className="study-conclusion"><strong>이 비교에서의 결정 기준</strong>{comparison.conclusion}</p>
      </article>)}
    </section>
    <section id="records" className="editorial-section" aria-labelledby="records-title">
      <div className="section-heading"><div><p className="eyebrow">사실 → 해석 → 질문</p><h2 id="records-title">장소별로 무엇이 달랐을까?</h2></div><span className="editor-byline">{STUDY_DATE} 조사본</span></div>
      <p className="section-context">아래는 당시 수집한 자료를 보존한 분석입니다. 현재 조건은 ‘최신 자료 조회’와 장소의 공식 안내에서 다시 확인하세요. 동일 명칭의 장소라도 적용 구역·일정이 다르면 답변이 달라질 수 있습니다.</p>
      <nav className="study-record-index" aria-label="조사 장소 목차">{CASE_NOTES.map(note => <a key={note.id} href={`#record-${note.id}`}>{findStudyRecord(note.id).title}</a>)}</nav>
      <div className="study-records">{CASE_NOTES.map((note, index) => {
        const record = findStudyRecord(note.id);
        return <article id={`record-${note.id}`} className="study-record" key={note.id}>
          <header><p className="eyebrow">{String(index + 1).padStart(2, "0")} · {record.type}</p><h3>{note.heading}</h3><p className="record-venue">{record.title}</p></header>
          {record.image && [0, 3, 9].includes(index) ? <figure className="study-photo"><img src={record.image} alt={record.title} loading="lazy" width={640} height={400} /><figcaption>한국관광공사 제공 · {record.imageLicense === "Type3" ? "출처표시·변경금지" : "출처표시"} · 원본 비율 유지</figcaption></figure> : null}
          <div className="study-evidence"><h4>원자료의 동반 안내</h4><dl>
            <div><dt>구역</dt><dd>{record.scope || "별도 안내 없음"}</dd></div>
            <div><dt>동물</dt><dd>{record.animals || "별도 안내 없음"}</dd></div>
            <div><dt>장비</dt><dd>{record.equipment || "별도 안내 없음"}</dd></div>
            {record.notes ? <div><dt>추가 조건</dt><dd>{record.notes}</dd></div> : null}
            {record.hours || record.checkInOut ? <div><dt>운영 안내</dt><dd>{record.hours || record.checkInOut}</dd></div> : null}
          </dl></div>
          <div className="study-reading"><h4>GoodThingz가 읽은 의미</h4><p>{note.interpretation}</p></div>
          <div className="study-question"><h4>아직 답이 필요한 질문</h4><p>{note.question}</p></div>
          <p className="source-inline">한국관광공사 · 원본 수정일 {record.modifiedAt?.slice(0, 8).replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3") || "없음"} · 자료 번호 {record.id}. 현장 검증일이 아닙니다.</p>
          <div className="guide-actions">
            <Link className="text-button" to={`/pet-travel?keyword=${encodeURIComponent(record.title)}`}><Search size={16} aria-hidden="true" /> 최신 자료 조회</Link>
            <Link className="text-button" to={`/pet-travel/guides/${note.guide}`}><BookOpen size={16} aria-hidden="true" /> 상황별 준비 가이드</Link>
            {record.providerUrl ? <a className="text-button" href={record.providerUrl} target="_blank" rel="noreferrer">원자료에 등록된 홈페이지</a> : null}
          </div>
        </article>;
      })}</div>
    </section>
    <section id="method" className="editorial-section study-method" aria-labelledby="method-title">
      <h2 id="method-title">조사 방법과 해석의 한계</h2>
      <dl className="policy-list">
        <div><dt>수집 시각</dt><dd>{formatRetrievalTime(STUDY_SAMPLE.collectedAt)}</dd></div>
        <div><dt>선정</dt><dd>관광지·문화시설·숙박·음식점에서 각각 수정일순 첫 3곳, 총 12곳. 무작위 표본이나 지역별 대표 표본이 아닙니다. 같은 수정 시각의 자료 순서는 제공기관 응답에 따랐습니다.</dd></div>
        <div><dt>원자료</dt><dd>한국관광공사 반려동물 동반여행 서비스의 목록·공통·소개·동반 안내. 이번 집계는 GoodThingz가 중복 문장을 정리한 표시 항목 기준입니다. 빈 항목에 다른 항목으로 합쳐진 문장이 있을 수 있습니다.</dd></div>
        <div><dt>집계식</dt><dd>‘일부 구역’은 구역 안내가 ‘일부구역 동반가능’인 기록 수, ‘안내견’은 동물 안내가 정확히 ‘안내견’인 기록 수, ‘구역 없음’은 별도 구역 항목이 빈 기록 수입니다. 모두 12곳을 분모로 계산했습니다.</dd></div>
        <div><dt>할 수 없는 판단</dt><dd>현재 입장·예약·영업 보장, 전국 허용 비율, 방문객 만족도, 안전한 코스 여부. 자료의 최신 수정은 현장 전체 조건의 검증을 뜻하지 않습니다.</dd></div>
        <div><dt>수정 원칙</dt><dd>새 조사와 기존 조사일을 혼동하지 않도록 수집일을 보존합니다. 사실 오류가 확인되면 근거와 수정 내용을 함께 기록합니다. 이번 글은 최초 발행본입니다.</dd></div>
      </dl>
      <div className="source-links"><Link to="/data-sources/kto-pet-tour">원자료 출처·이용조건</Link><Link to="/about">작성 원칙·오류 제보</Link><Link to="/pet-travel/plan">내 방문 계획에 확인 내용 남기기</Link></div>
    </section>
  </main>;
}
