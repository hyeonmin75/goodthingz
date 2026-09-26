import type { Route } from "./+types/home";
import { Link } from "react-router";
import { ArrowRight, BookOpen, Coffee, BedDouble, Trees, Search, ListChecks } from "lucide-react";
import { SiteNav } from "../components/site-nav";
import { TRAVEL_GUIDES, GUIDE_PATH } from "../content/travel-guides";
import { loadInitialPlaces } from "../pet-tour.server";
import { formatRetrievalTime } from "../visit-evidence";
import { CASE_NOTES, STUDY_PATH, STUDY_DATE, findStudyRecord } from "../content/field-study";
import {
  canonicalUrl,
  DATA_PROVIDER,
  DATA_UPDATED,
  PAGE_LAST_MODIFIED,
  SITE_NAME,
  socialMeta,
  webPageJsonLd,
} from "../seo";

const HERO_IMAGE_PATH = "/illustrations/pet-travel-studio-1536.webp";
const HERO_MOBILE_IMAGE_PATH = "/illustrations/pet-travel-studio-768.webp";

export const links: Route.LinksFunction = () => [
  {
    rel: "preload",
    as: "image",
    href: HERO_IMAGE_PATH,
    imageSrcSet: `${HERO_MOBILE_IMAGE_PATH} 768w, ${HERO_IMAGE_PATH} 1536w`,
    imageSizes: "(max-width: 640px) 100vw, 780px",
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "GoodThingz | 반려동물 여행, 동반 조건부터 비교";
  const description =
    "실제 장소의 동반 구역·체중·이동장 조건을 비교하고, 내 동물 조건에 맞는 문의와 방문 계획을 준비하세요. 12곳 데이터 분석, 상황별 가이드, 주변 장소 검색을 제공합니다.";

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
          <img
            className="home-hero-image"
            src={HERO_IMAGE_PATH}
            srcSet={`${HERO_MOBILE_IMAGE_PATH} 768w, ${HERO_IMAGE_PATH} 1536w`}
            sizes="(max-width: 640px) 100vw, 780px"
            width={1536}
            height={1024}
            fetchPriority="high"
            alt="이동장과 물그릇을 준비한 반려견의 여행을 그린 AI 제작 일러스트"
          />
        </picture>
        <div className="home-copy">
          <p className="eyebrow">함께 갈 곳, 조건부터</p>
          <h1 id="home-title">
            <span>GoodThingz</span>
            <span>반려동물 동반여행</span>
          </h1>
          <p className="lead">갈 곳을 찾고, 우리 조건으로 비교하세요.</p>
          <form
            action="/pet-travel"
            method="get"
            className="home-search"
            role="search"
          >
            <label htmlFor="home-keyword">어떤 장소를 찾으세요?</label>
            <div className="home-search-fields">
              <label className="home-type"><span className="sr-only">장소 유형</span><select aria-label="장소 유형" name="contentTypeId" defaultValue=""><option value="">전체 유형</option><option value="39">음식점</option><option value="32">숙박</option><option value="12">관광지</option><option value="14">문화시설</option></select></label>
              <input
                id="home-keyword"
                name="keyword"
                type="search"
                maxLength={50}
                placeholder="장소명이나 검색어"
              />
              <button className="button button-primary" type="submit">
                <Search size={18} aria-hidden="true" /><span>검색</span>
              </button>
            </div>
          </form>
          <div className="hero-actions">
            <Link reloadDocument className="button button-secondary" to="/pet-travel">
              지도에서 후보 찾기
            </Link>
            <Link reloadDocument className="text-button" to="/pet-travel/plan"><ListChecks size={18} aria-hidden="true" /> 내 준비 보드</Link>
          </div>
          <p className="hero-source">
            소개 이미지: AI 제작 · 특정 장소의 실제 사진이 아닙니다.
          </p>
        </div>
      </section>

      <nav className="purpose-nav" aria-label="여행 목적별 장소 찾기">
        <Link reloadDocument to="/pet-travel?contentTypeId=39"><Coffee size={22} aria-hidden="true" /><span>같이 식사할 곳<small>좌석·계절 조건 확인</small></span><ArrowRight size={18} aria-hidden="true" /></Link>
        <Link reloadDocument to="/pet-travel?contentTypeId=32"><BedDouble size={22} aria-hidden="true" /><span>하룻밤 머물 곳<small>객실·공용공간 비교</small></span><ArrowRight size={18} aria-hidden="true" /></Link>
        <Link reloadDocument to="/pet-travel?contentTypeId=12"><Trees size={22} aria-hidden="true" /><span>함께 둘러볼 곳<small>동반 구역·입구 확인</small></span><ArrowRight size={18} aria-hidden="true" /></Link>
      </nav>

      <section className="editorial-section home-investigation" aria-labelledby="investigation-title">
        <div className="section-heading"><div><p className="eyebrow">GoodThingz 데이터 읽기 · {STUDY_DATE}</p><h2 id="investigation-title">‘동반 가능’ 뒤에 남는 조건</h2></div><Link reloadDocument className="text-button" to={STUDY_PATH}>12곳 분석 전체 보기 <ArrowRight size={16} aria-hidden="true" /></Link></div>
        <p className="section-context">같은 목록에 있어도 실내 출입과 숙박 조건은 달랐습니다. 원문을 실제 여행 상황에 대입해 읽었습니다.</p>
        <div className="investigation-grid">{["129894", "2804371", "736117"].map(id => {
          const record = findStudyRecord(id);
          const note = CASE_NOTES.find(item => item.id === id)!;
          return <article className="investigation-card" key={id}>
            <p className="eyebrow">{record.type}</p><h3><Link reloadDocument to={`${STUDY_PATH}#record-${id}`}>{note.heading}</Link></h3>
            <p className="record-venue">{record.title}</p><p>{id === "129894" ? "목록에는 있지만 내부 동반은 불가. 실내 전시를 함께 보는 일정과는 다른 조건입니다." : id === "2804371" ? "객실당 체중·증빙·레스토랑 제한이 함께 있습니다. 체중 하나로 예약을 결정할 수 없습니다." : "대형견의 계절별 좌석과 겨울철 켄넬 조건을 나누어 읽어야 합니다."}</p>
            <Link reloadDocument className="text-button" to={`${STUDY_PATH}#record-${id}`}><BookOpen size={16} aria-hidden="true" /> 근거와 다음 질문</Link>
          </article>;
        })}</div>
        <p className="source-inline">한국관광공사 자료 12곳의 비대표 표본 분석 · 현장 방문 후기나 현재 입장 보증이 아닙니다.</p>
      </section>

      <section className="editorial-section" aria-labelledby="candidate-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">장소 탐색</p>
            <h2 id="candidate-title">지금 자료에서 찾아볼 후보</h2>
          </div>
          <Link reloadDocument className="text-button" to="/pet-travel">
            전체 후보 찾기
          </Link>
        </div>
        <p className="section-context">
          한국관광공사 자료의 수정일순 일부입니다. 인기순이 아니며 각 장소의 상세 조건을 대조해야 합니다.
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
            <Link reloadDocument className="text-button" to="/pet-travel">
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
          <Link reloadDocument className="text-button" to={GUIDE_PATH}>
            가이드 전체 보기
          </Link>
        </div>
        <div className="home-guide-grid">
          {TRAVEL_GUIDES.map((guide, index) => (
            <Link
              reloadDocument
              className="home-guide"
              to={`${GUIDE_PATH}#${guide.id}`}
              key={guide.id}
            >
              <span className="guide-number">
                {String(index + 1).padStart(2, "0")} / {guide.category}
              </span>
              <h3>{guide.title}</h3>
              <span className="candidate-action">{guide.id === "budget" ? "추가비 계산과 비교" : "확인 순서와 문의 문장"} <ArrowRight size={16} aria-hidden="true" /></span>
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
          <h2 id="home-plan-title">아직 확인하지 못한 조건이 있나요?</h2>
          <p>
            우리 반려동물의 조건, 방문일 운영, 요금 중 아직 모르는 항목을
            남겨두세요. 조건 불일치와 미확인 항목부터 정리하고, 동행자와 같은 비교표로 결정하세요.
          </p>
        </div>
        <div className="hero-actions">
          <Link reloadDocument className="button button-primary" to="/pet-travel/plan">
            <ListChecks size={18} aria-hidden="true" /> 내 준비 보드 열기
          </Link>
          <Link
            reloadDocument
            className="button button-secondary"
            to="/pet-travel/guides/visit-checklist"
          >
            출발 체크리스트
          </Link>
        </div>
      </section>
      <section className="editorial-section source-summary">
        <h2>누가, 어떤 자료로 만들었나요?</h2>
        <p>
          장소 정보는 {DATA_PROVIDER}, 비교 사례와 판단 가이드는 독립 운영자인 GoodThingz가 작성합니다. 원자료 서비스의 갱신 기준은 {DATA_UPDATED}이며 개별 장소의 현장 확인일과는 다릅니다.
        </p>
        <div className="source-links">
          <Link reloadDocument to="/data-sources/kto-pet-tour">데이터 출처와 한계</Link>
          <Link reloadDocument to="/about">작성 원칙·오류 제보</Link>
          <Link reloadDocument to="/privacy">개인정보와 저장 자료</Link>
        </div>
      </section>
    </main>
  );
}
