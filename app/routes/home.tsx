import type { Route } from "./+types/home";
import { Link } from "react-router";
import { SiteNav } from "../components/site-nav";
import { TRAVEL_GUIDES, GUIDE_PATH } from "../content/travel-guides";
import { loadInitialPlaces } from "../pet-tour.server";
import { formatRetrievalTime } from "../visit-evidence";
import {
  canonicalUrl,
  DATA_PROVIDER,
  DATA_UPDATED,
  PAGE_LAST_MODIFIED,
  SITE_NAME,
  socialMeta,
  webPageJsonLd,
} from "../seo";

const HERO_IMAGE_PATH = "/goodthingz-pet-travel-hero.webp";
const HERO_IMAGE_FALLBACK_PATH = "/goodthingz-pet-travel-hero.png";

export const links: Route.LinksFunction = () => [
  {
    rel: "preload",
    as: "image",
    href: HERO_IMAGE_PATH,
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "GoodThingz | 반려동물 동반 장소 조건·거리·지도 확인";
  const description =
    "반려동물과 갈 곳을 정할 때 필요한 동반 조건, 위치와 거리, 공식 방문 정보를 한 화면에서 확인하세요. 확인되지 않은 정보는 추측하지 않습니다.";

  return [
    { title },
    {
      name: "description",
      content: description,
    },
    ...socialMeta({
      title,
      description,
      path: "/",
      imagePath: HERO_IMAGE_PATH,
      imageAlt: "반려동물 동반 여행을 표현한 AI 제작 소개 이미지",
    }),
    { name: "robots", content: "index,follow" },
    { tagName: "link", rel: "canonical", href: canonicalUrl("/") },
    {
      "script:ld+json": [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          description,
          url: canonicalUrl("/"),
          inLanguage: "ko-KR",
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          description,
          url: canonicalUrl("/"),
        },
        webPageJsonLd({
          name: title,
          description,
          path: "/",
          dateModified: PAGE_LAST_MODIFIED.home,
        }),
        {
          "@context": "https://schema.org",
          "@type": "ImageObject",
          contentUrl: canonicalUrl(HERO_IMAGE_PATH),
          caption:
            "반려동물 동반 장소를 조건과 위치 기준으로 확인하는 GoodThingz 메인 이미지",
          inLanguage: "ko-KR",
        },
      ],
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  return { places: await loadInitialPlaces(context) };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="home-page">
      <SiteNav />

      <section className="home-hero" aria-labelledby="home-title">
        <picture>
          <source srcSet={HERO_IMAGE_PATH} type="image/webp" />
          <img
            className="home-hero-image"
            src={HERO_IMAGE_FALLBACK_PATH}
            alt="반려동물과 함께 갈 장소를 지도와 조건으로 확인하는 장면"
          />
        </picture>
        <div className="home-copy">
          <p className="eyebrow">함께 갈 곳, 확실하게</p>
          <h1 id="home-title">
            <span>GoodThingz</span>
            <span>반려동물 동반여행</span>
          </h1>
          <p className="lead">동반 조건과 위치를 한눈에.</p>
          <form
            action="/pet-travel"
            method="get"
            className="home-search"
            role="search"
          >
            <label htmlFor="home-keyword">어떤 장소를 찾으세요?</label>
            <div>
              <input
                id="home-keyword"
                name="keyword"
                type="search"
                maxLength={50}
                placeholder="장소명이나 검색어"
              />
              <button className="button button-primary" type="submit">
                검색
              </button>
            </div>
          </form>
          <div className="hero-actions">
            <Link className="button button-secondary" to="/pet-travel">
              지도에서 후보 찾기
            </Link>
          </div>
          <p className="hero-source">
            출처: {DATA_PROVIDER} · 기준: {DATA_UPDATED} 갱신
            <br />
            소개 이미지는 AI로 제작했으며 특정 여행지의 실제 사진이 아닙니다.
          </p>
        </div>
      </section>

      <section className="editorial-section" aria-labelledby="candidate-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">장소 탐색</p>
            <h2 id="candidate-title">어디를 살펴볼까요?</h2>
          </div>
          <Link className="text-button" to="/pet-travel">
            전체 후보 찾기
          </Link>
        </div>
        <p className="section-context">
          공식 자료의 수정일순 일부입니다. 인기순·추천순이 아니며, 등록만으로
          모든 반려동물의 입장을 보장하지 않습니다.
        </p>
        {loaderData.places?.items.length ? (
          <>
            <div className="home-place-grid">
              {loaderData.places.items.slice(0, 6).map((place) => {
                const image = ["Type1", "Type3"].includes(
                  place.media.copyrightType ?? "",
                )
                  ? place.media.primaryImageUrl
                  : null;
                return (
                  <article className="home-place" key={place.id}>
                    <a
                      href={`/pet-travel?keyword=${encodeURIComponent(place.title)}`}
                    >
                      <div className="candidate-media">
                        {image ? (
                          <img
                            src={image}
                            alt={place.title}
                            loading="lazy"
                            width={400}
                            height={240}
                          />
                        ) : (
                          <span>
                            {place.contentTypeName}
                            <small>이용 가능한 사진 없음</small>
                          </span>
                        )}
                      </div>
                      <div className="candidate-body">
                        <p className="eyebrow">{place.contentTypeName}</p>
                        <h3>{place.title}</h3>
                        <p>{place.address.full || "주소 정보 없음"}</p>
                        <span className="candidate-action">동반 조건 확인</span>
                      </div>
                    </a>
                    {image ? (
                      <small className="image-credit">
                        한국관광공사 제공 ·{" "}
                        {place.media.copyrightType === "Type3"
                          ? "출처표시·변경금지"
                          : "출처표시"}
                      </small>
                    ) : null}
                  </article>
                );
              })}
            </div>
            <p className="source-inline">
              자료 조회:{" "}
              {formatRetrievalTime(loaderData.places.source.retrievedAt)} · 현장
              확인 시각이 아닙니다.
            </p>
          </>
        ) : (
          <div className="home-data-state">
            <p>
              현재 장소 자료를 불러오지 못했습니다. 아래 가이드에서 방문 조건을
              먼저 정리하거나 검색에서 다시 시도하세요.
            </p>
            <Link className="text-button" to="/pet-travel">
              장소 검색 다시 시도
            </Link>
          </div>
        )}
      </section>
      <section
        className="editorial-section"
        aria-labelledby="home-guides-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">상황별 판단 가이드</p>
            <h2 id="home-guides-title">내 여행에서 놓치기 쉬운 질문</h2>
          </div>
          <Link className="text-button" to={GUIDE_PATH}>
            가이드 전체 보기
          </Link>
        </div>
        <div className="home-guide-grid">
          {TRAVEL_GUIDES.map((guide, index) => (
            <Link
              className="home-guide"
              to={`${GUIDE_PATH}#${guide.id}`}
              key={guide.id}
            >
              <span className="guide-number">
                {String(index + 1).padStart(2, "0")} / {guide.category}
              </span>
              <h3>{guide.title}</h3>
              <p>{guide.question}</p>
              <span className="candidate-action">확인 순서와 문의 문장</span>
            </Link>
          ))}
        </div>
      </section>
      <section
        className="editorial-section home-plan-band"
        aria-labelledby="home-plan-title"
      >
        <div>
          <p className="eyebrow">결정한 내용은 한곳에</p>
          <h2 id="home-plan-title">확인한 후보로 방문 계획 만들기</h2>
          <p>
            우리 반려동물의 조건, 방문일 운영, 요금 중 아직 모르는 항목을
            남겨두세요. 확인한 금액만 합산하고, 동행자에게는 장소와 확인 상태만
            전달할 수 있습니다.
          </p>
          <p className="muted-copy">
            자동 경로·가격 예측이 아닌 직접 작성하는 방문 후보 계획입니다.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" to="/pet-travel/plan">
            내 방문 계획
          </Link>
          <Link
            className="button button-secondary"
            to="/pet-travel/guides/visit-checklist"
          >
            출발 체크리스트
          </Link>
        </div>
      </section>
      <section className="editorial-section source-summary">
        <h2>자료와 직접 확인한 사실을 구분합니다.</h2>
        <p>
          {DATA_PROVIDER} 동반여행 자료를 바탕으로 장소를 찾고, GoodThingz의
          편집 가이드로 확인할 질문을 정리합니다. 데이터 갱신 기준은{" "}
          {DATA_UPDATED}이며, 빈 항목·실시간 운영·현장 입장 조건은 추측하지
          않습니다. 이 사이트의 글은 현장 방문 후기나 입장 보증이 아닙니다.
        </p>
        <div className="source-links">
          <Link to="/data-sources/kto-pet-tour">데이터 출처와 한계</Link>
          <Link to="/about">작성 원칙·오류 제보</Link>
          <Link to="/privacy">개인정보와 저장 자료</Link>
        </div>
      </section>
    </main>
  );
}
