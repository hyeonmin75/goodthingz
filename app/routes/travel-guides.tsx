import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/travel-guides";
import { SiteNav } from "../components/site-nav";
import {
  TRAVEL_GUIDES,
  GUIDE_PATH,
  GUIDE_UPDATED,
} from "../content/travel-guides";
import {
  breadcrumbJsonLd,
  canonicalUrl,
  socialMeta,
  webPageJsonLd,
} from "../seo";

export function meta({}: Route.MetaArgs) {
  const title = "반려동물 여행 판단 가이드 10가지 | GoodThingz";
  const description =
    "식사·숙박·체중 제한·다견·우천·입구·준비물·예약·추가비·정보 불일치까지. 상황별 확인 순서와 문의 문장으로 방문 계획을 구체화하세요.";
  return [
    { title },
    { name: "description", content: description },
    ...socialMeta({ title, description, path: GUIDE_PATH }),
    { name: "robots", content: "index,follow" },
    { tagName: "link", rel: "canonical", href: canonicalUrl(GUIDE_PATH) },
    {
      "script:ld+json": [
        webPageJsonLd({
          name: title,
          description,
          path: GUIDE_PATH,
          dateModified: GUIDE_UPDATED,
        }),
        breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "방문 가이드", path: GUIDE_PATH },
        ]),
      ],
    },
  ];
}

export default function TravelGuides() {
  const [message, setMessage] = useState("");
  async function copyQuestions(title: string, questions: string[]) {
    try {
      await navigator.clipboard.writeText(questions.join("\n"));
      setMessage(`${title}: 문의 문장을 복사했습니다.`);
    } catch {
      setMessage(
        "자동 복사를 사용할 수 없습니다. 본문의 문의 문장을 선택해 복사하세요.",
      );
    }
  }
  return (
    <main className="library-page" id="top">
      <SiteNav />
      <nav className="breadcrumb" aria-label="현재 위치">
        <Link to="/">홈</Link>
        <span aria-hidden="true">/</span>
        <span>방문 가이드</span>
      </nav>
      <header className="library-intro">
        <p className="eyebrow">GOODTHINGZ FIELD NOTES</p>
        <h1>반려동물 여행 판단 가이드</h1>
        <p className="lead">내 상황에 맞는 질문부터, 출발 전에 정리하세요.</p>
        <p>
          자료를 읽는 것에서 방문 결정을 내리는 것까지. 아래 10개 상황은 서로
          다른 판단 문제를 다룹니다. 방문 후기나 장소별 허용 규정이 아닌
          GoodThingz의 편집 가이드이며, 모든 사례는 설명을 위한 가상 상황입니다.
        </p>
        <p className="editor-byline">
          작성: GoodThingz · 공개·수정일{" "}
          <time dateTime={GUIDE_UPDATED}>{GUIDE_UPDATED}</time> ·{" "}
          <Link to="/about">작성·수정 원칙</Link>
        </p>
      </header>
      <div className="library-layout">
        <nav className="guide-index" aria-label="상황별 목차">
          <h2>어떤 상황인가요?</h2>
          {TRAVEL_GUIDES.map((guide, index) => (
            <a href={`#${guide.id}`} key={guide.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {guide.title}
            </a>
          ))}
          <Link to="/pet-travel/guides/visit-checklist">출발 체크리스트</Link>
          <Link to="/pet-travel/plan">내 방문 계획</Link>
        </nav>
        <div className="guide-articles">
          {TRAVEL_GUIDES.map((guide, index) => (
            <article
              className="decision-article"
              id={guide.id}
              key={guide.id}
              aria-labelledby={`${guide.id}-title`}
            >
              <header>
                <p className="eyebrow">
                  {String(index + 1).padStart(2, "0")} / {guide.category}
                </p>
                <h2 id={`${guide.id}-title`}>{guide.title}</h2>
                <p className="guide-question">{guide.question}</p>
              </header>
              <p>{guide.intro}</p>
              <ol className="decision-steps">
                {guide.steps.map((step) => (
                  <li key={step.title}>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </li>
                ))}
              </ol>
              <section className="worked-example" aria-label="판단 예시">
                <h3>상황에 적용해 보기</h3>
                <p>{guide.example.situation}</p>
                <p>
                  <strong>판단:</strong> {guide.example.decision}
                </p>
              </section>
              <section
                className="guide-enquiry"
                aria-label="장소에 확인할 질문"
              >
                <h3>장소에 이렇게 물어보세요</h3>
                <ul>
                  {guide.asks.map((ask) => (
                    <li key={ask}>{ask}</li>
                  ))}
                </ul>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => void copyQuestions(guide.title, guide.asks)}
                >
                  문의 문장 복사
                </button>
              </section>
              <dl className="guide-evidence">
                <div>
                  <dt>데이터에서 볼 항목</dt>
                  <dd>{guide.data}</dd>
                </div>
                <div>
                  <dt>판단의 한계</dt>
                  <dd>{guide.limit}</dd>
                </div>
              </dl>
              <div className="guide-actions">
                <a
                  className="button button-primary"
                  href={`/pet-travel${guide.searchType ? `?contentTypeId=${guide.searchType}` : ""}`}
                >
                  {guide.searchType === "32" ? "숙박 후보 찾기" : guide.searchType === "39" ? "음식점 후보 찾기" : guide.searchType === "12" ? "관광지 후보 찾기" : "장소 후보 찾기"}
                </a>
                <Link className="button button-secondary" to="/pet-travel/plan">
                  확인 내용 기록하기
                </Link>
                <a href="#top" className="text-button">
                  목차로
                </a>
              </div>
            </article>
          ))}
          <section className="library-method">
            <h2>이 자료를 만든 기준</h2>
            <p>
              한국관광공사 반려동물 동반여행 서비스의 동반·운영·주차·예약·요금
              안내 항목을 실제 방문 결정 순서로 재구성했습니다. 빈 항목은
              허용이나 금지로 바꾸지 않고, 최신 현장 조건은 운영자에게
              확인하도록 구분했습니다. 자료를 열람한 날짜와 장소가 현장 검증된
              날짜는 같지 않습니다.
            </p>
            <p>
              <Link to="/data-sources/kto-pet-tour">
                데이터 출처와 이용조건
              </Link>{" "}
              ·{" "}
              <a
                href="https://www.weather.go.kr/"
                target="_blank"
                rel="noreferrer"
              >
                기상청 날씨누리
              </a>{" "}
              · <Link to="/about">오류 제보</Link>
            </p>
          </section>
        </div>
      </div>
      <p role="status" className="copy-feedback">
        {message}
      </p>
    </main>
  );
}
