# GoodThingz SEO 정보구조 전략

작성일: 2026-08-27

기준 문서:

- `project.config.yaml`
- `docs/api/api-spec.md`
- `docs/value/user-problems.md`
- `docs/value/value-map.md`
- `docs/product/service-design.md`

참고한 검색엔진 기준:

- Google Search Central robots.txt guide: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Google Search Central canonical guide: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google Search Central technical SEO guide: https://developers.google.com/search/docs/fundamentals/get-started
- Google Search Central structured data guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Search Central Breadcrumb structured data: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb

이 문서는 GoodThingz의 SEO를 “페이지 수 늘리기”가 아니라 “독립 방문자가 실제 문제를 해결할 수 있는 고가치 페이지만 검색 노출 후보로 삼기” 위한 정보구조 전략으로 정의한다. API 레코드 수만큼 페이지를 만들거나, 검색어만 바꾼 페이지를 만들거나, 필터 조합별 페이지를 만들거나, 지역 이름만 바꾼 빈약한 페이지를 만들지 않는다.

## 1. SEO 원칙

GoodThingz의 SEO 기준은 value-gated indexing이다. value-gated indexing은 검색 색인 후보를 만들기 전에 그 페이지가 독립적으로 사용자의 문제를 해결하는지 확인하는 방식이다. 쉽게 말해, 검색엔진용 얇은 종이를 많이 붙이는 것이 아니라, 사용자가 혼자 들어와도 “여기서 판단이 끝난다”고 느낄 만한 페이지에만 문을 열어주는 것이다.

INDEX 후보는 다음 조건을 모두 만족해야 한다.

1. 실제 검색 목적이 있다.
2. 다른 페이지와 독립적인 목적이 있다.
3. 충분한 데이터가 있다.
4. API 원본보다 추가 가치가 있다.
5. 사용자 판단에 도움을 준다.
6. 출처와 기준일을 표시할 수 있다.
7. 중복 페이지가 아니다.

## 2. 정보구조 개요

첫 버전의 정보구조는 검색 시작, 사용자 판단, 제한 설명, 출처 신뢰를 중심으로 한다. 검색 결과와 장소 상세는 서비스 이용에는 필요하지만 대량 색인 대상이 아니다. 지역 페이지는 나중에 충분한 데이터와 분석이 있을 때만 제한적으로 INDEX 후보가 된다.

```text
/
/pet-travel
/pet-travel/search
/pet-travel/places/:contentId
/pet-travel/compare
/pet-travel/regions/:regionSlug
/pet-travel/guides/:guideSlug
/data-sources/kto-pet-tour
/about
/privacy
/robots.txt
/sitemap.xml
```

## 3. URL 구조

| URL 유형 | 예시 | 목적 | 색인 기본값 |
| --- | --- | --- | --- |
| 홈 | `/` | GoodThingz의 서비스 정체성과 주요 데이터 서비스 진입 | INDEX |
| 반려동물 여행 검색 시작 | `/pet-travel` | 반려동물 동반여행 검색, 지역 선택, 현위치 탐색 진입 | INDEX |
| 검색 결과 | `/pet-travel/search?region=11&type=food` | 사용자 조건에 따른 동적 결과 확인 | NOINDEX |
| 장소 상세 | `/pet-travel/places/:contentId` | 특정 장소의 방문 판단 카드와 공유 | NOINDEX |
| 비교 | `/pet-travel/compare?ids=...` | 후보 2~3개 비교 | NOINDEX |
| 지역 분석 | `/pet-travel/regions/:regionSlug` | 지역별 반려동물 여행 가능성 분석 | 조건부 INDEX |
| 편집형 가이드 | `/pet-travel/guides/:guideSlug` | 특정 문제 해결형 가이드 | 조건부 INDEX |
| 데이터 출처 | `/data-sources/kto-pet-tour` | 데이터 제공기관, 기준일, 한계, 이용 범위 설명 | INDEX |
| 소개 | `/about` | 서비스 목적, 무료 정책, 품질 원칙 설명 | INDEX |
| 개인정보 | `/privacy` | 위치정보, 로컬 저장, 개인정보 처리 설명 | INDEX |

`/pet-travel/search`는 사용자의 query parameter를 유지할 수 있지만 검색 색인은 막는다. 사용자가 공유한 링크로 같은 조건을 다시 볼 수는 있어야 하므로 페이지 자체는 존재할 수 있다. 반대로 필터 조합별 정적 URL, 키워드 치환 URL, API 레코드 기반 자동 상세 색인 페이지는 만들지 않는다.

## 4. Canonical 정책

canonical은 중복되거나 비슷한 페이지 중 검색엔진에 대표 URL을 알려주는 장치다. 비유하면 같은 문서 사본이 여러 장 있을 때 “원본은 이 파일입니다”라고 붙이는 표지다. GoodThingz에서는 canonical을 색인 허용 페이지의 대표 주소를 명확히 하는 데만 사용한다.

| 페이지 유형 | canonical 정책 |
| --- | --- |
| `/` | `https://goodthingz.com/` 자기 자신 |
| `/pet-travel` | `https://goodthingz.com/pet-travel` 자기 자신 |
| `/pet-travel/search?...` | canonical은 `/pet-travel`로 지정하고 `noindex`를 함께 적용 |
| `/pet-travel/places/:contentId` | 자기 자신 canonical은 가능하지만 기본은 `noindex`; sitemap에는 넣지 않음 |
| `/pet-travel/compare?...` | canonical은 `/pet-travel` 또는 비교 기본 화면으로 지정하고 `noindex` |
| `/pet-travel/regions/:regionSlug` | INDEX 승인된 지역 분석 페이지만 자기 자신 |
| `/pet-travel/guides/:guideSlug` | INDEX 승인된 편집형 가이드만 자기 자신 |
| `/data-sources/kto-pet-tour` | 자기 자신 |

canonical은 `noindex`를 대신하지 않는다. 색인에서 제외해야 하는 검색 결과, 비교, 대량 상세 페이지는 `noindex`를 사용한다. canonical은 보조 신호이고, 색인 제외 결정은 페이지 정책에서 명확히 처리한다.

## 5. Robots 정책

robots.txt는 크롤러가 접근할 URL 범위를 안내하는 파일이다. 한 줄 정의로는 “검색 로봇에게 어디를 봐도 되는지 알려주는 안내판”이다. 다만 robots.txt로 막은 URL은 페이지 안의 `noindex`를 검색엔진이 읽지 못할 수 있으므로, 검색 결과나 상세 페이지의 색인 제외는 기본적으로 페이지의 robots meta 또는 HTTP header `noindex`로 처리한다.

초기 robots.txt 정책은 다음처럼 단순하게 둔다.

```text
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://goodthingz.com/sitemap.xml
```

`/pet-travel/search`, `/pet-travel/places/:contentId`, `/pet-travel/compare`는 robots.txt로 막지 않고 페이지에서 `noindex,follow`를 적용한다. 이렇게 해야 검색엔진이 페이지를 볼 수는 있지만 색인에는 넣지 않고, 내부 링크 흐름은 이해할 수 있다. API endpoint는 사용자용 페이지가 아니므로 `/api/` 아래에 둔다면 robots.txt에서 차단한다.

## 6. Sitemap 정책

sitemap은 검색엔진에 “색인 후보로 봐야 할 대표 URL 목록”을 알려주는 지도다. GoodThingz sitemap에는 INDEX로 승인된 canonical URL만 넣는다.

초기 sitemap 포함 대상은 다음으로 제한한다.

- `https://goodthingz.com/`
- `https://goodthingz.com/pet-travel`
- `https://goodthingz.com/data-sources/kto-pet-tour`
- `https://goodthingz.com/about`
- `https://goodthingz.com/privacy`
- INDEX 승인된 `/pet-travel/regions/:regionSlug`
- INDEX 승인된 `/pet-travel/guides/:guideSlug`

sitemap에 넣지 않는 대상은 검색 결과 URL, 필터 조합 URL, 장소 상세 URL, 비교 URL, 사용자 위치 기반 URL, 내부 API URL이다. 특히 API 레코드 수만큼 장소 상세 URL을 sitemap에 넣지 않는다.

## 7. 내부링크 정책

내부링크는 사용자가 문제 해결 흐름을 따라 이동하도록 설계한다. 홈과 `/pet-travel`은 가장 중요한 검색 시작점으로 연결하고, 검색 결과에서는 상세 판단 카드와 비교 기능으로 연결한다. 지역 분석 페이지가 나중에 INDEX 승인되면 해당 지역의 검색 시작 상태로 연결하되, 필터 조합별 색인 URL을 만들지 않는다.

| 출발 페이지 | 연결 대상 | 목적 |
| --- | --- | --- |
| `/` | `/pet-travel`, `/data-sources/kto-pet-tour`, `/about` | 서비스의 핵심 데이터 서비스와 신뢰 정보로 이동 |
| `/pet-travel` | 검색 결과, 지역 선택, 현위치 탐색 | 사용자의 첫 검색 행동 유도 |
| 검색 결과 | 장소 상세, 비교, 새 검색 | 후보 판단과 비교 |
| 장소 상세 | 검색 결과로 돌아가기, 비교 추가, 출처 정보 | 판단 유지와 출처 신뢰 |
| 지역 분석 | 해당 지역 검색 시작, 대표 장소 유형, 출처 정보 | 독립 방문자의 다음 행동 제공 |
| 데이터 출처 | `/pet-travel`, 공식 출처 링크 | 데이터 기준과 한계 이해 후 검색으로 이동 |

내부링크 문구는 키워드 반복보다 사용자 행동을 우선한다. 예를 들어 “서울 반려동물 여행지 더 보기”처럼 지역명만 반복하는 링크보다 “서울에서 숙소 주변 후보 찾기”처럼 실제 행동을 설명하는 링크가 더 적합하다.

## 8. Breadcrumb 정책

breadcrumb는 사용자가 현재 페이지가 사이트 안에서 어디에 있는지 이해하게 하는 길 안내다. 한자식으로 보면 breadcrumb는 공식 한국어 용어라기보다 웹에서 쓰는 길찾기 표시이며, 실제 사례는 `홈 > 반려동물 여행 > 지역 분석 > 제주` 같은 구조다. 사용자가 뒤로 갈 곳을 빨리 찾고, 검색엔진도 페이지 구조를 이해할 수 있어 중요하다.

기본 breadcrumb 구조는 다음과 같다.

| 페이지 | Breadcrumb |
| --- | --- |
| `/pet-travel` | 홈 > 반려동물 여행 |
| `/pet-travel/search` | 홈 > 반려동물 여행 > 검색 결과 |
| `/pet-travel/places/:contentId` | 홈 > 반려동물 여행 > 장소 상세 |
| `/pet-travel/compare` | 홈 > 반려동물 여행 > 후보 비교 |
| `/pet-travel/regions/:regionSlug` | 홈 > 반려동물 여행 > 지역 분석 > 지역명 |
| `/pet-travel/guides/:guideSlug` | 홈 > 반려동물 여행 > 가이드 > 가이드명 |
| `/data-sources/kto-pet-tour` | 홈 > 데이터 출처 > 한국관광공사 반려동물 동반여행 |

검색 결과, 장소 상세, 비교 페이지는 `NOINDEX`라도 사용자 길찾기에는 breadcrumb가 필요하다. structured data는 INDEX 후보 페이지에 우선 적용하고, NOINDEX 페이지에는 검색 노출 목적의 구조화 데이터를 넣지 않는 쪽이 안전하다.

## 9. Structured Data 후보

structured data는 검색엔진이 페이지 내용을 더 잘 이해하도록 정해진 형식으로 붙이는 설명표다. 쉬운 비유로는 택배 상자 겉면에 “보낸 사람, 받는 사람, 물건 종류”를 붙이는 라벨이다. GoodThingz는 구조화 데이터를 검색 노출을 부풀리는 용도가 아니라, 실제 페이지 성격을 정확히 알리는 용도로만 사용한다.

| 페이지 유형 | 후보 schema.org 타입 | 적용 조건 | 주의점 |
| --- | --- | --- | --- |
| `/` | `WebSite`, `Organization` | GoodThingz 기본 소개와 사이트 검색 진입이 있을 때 | `SearchAction`은 실제 사이트 검색 URL이 안정적으로 동작할 때만 추가 |
| `/pet-travel` | `WebPage`, `SearchAction`, `BreadcrumbList` | 반려동물 여행 검색 시작 페이지가 독립 가치가 있을 때 | 검색 결과 자체를 색인시키는 신호처럼 보이지 않게 한다 |
| `/data-sources/kto-pet-tour` | `Dataset`, `WebPage`, `BreadcrumbList` | 제공기관, 기준일, 갱신 기준, 이용 제한, 데이터 한계를 명확히 표시할 때 | GoodThingz가 원 제공기관처럼 보이면 안 된다 |
| 지역 분석 페이지 | `WebPage`, `BreadcrumbList`, 제한적 `Dataset` 참조 | 지역별 분석과 기준일, 집계 기준이 충분할 때 | 장소 수만 나열한 페이지에는 적용하지 않는다 |
| 편집형 가이드 | `Article` 또는 `WebPage`, `BreadcrumbList` | 실제 문제 해결형 설명과 데이터 기반 판단 기준이 있을 때 | AI로 부풀린 일반론에는 적용하지 않는다 |
| 장소 상세 페이지 | 기본은 적용하지 않음 | 나중에 INDEX 정책이 바뀔 때만 검토 | `LocalBusiness`, `Place`는 실시간 영업, 소유권, 정확한 사업자 정보가 부족할 수 있어 신중히 검토 |

## 10. INDEX 후보 페이지 설계

### 10.1 `/pet-travel`

`/pet-travel`은 첫 버전의 핵심 INDEX 페이지다. 이 페이지는 반려동물 동반여행 검색 시작점이며, 현위치 검색, 지역 검색, 키워드 검색, 주요 판단 기준을 제공한다. 독립 방문자는 이 페이지에서 바로 검색을 시작할 수 있어야 한다.

필수 포함 정보는 서비스 목적, 데이터 출처, 기준일, 반려동물 조건 확인 방식, API에 없는 정보의 한계, 검색 시작 UI다. 단순 소개문만 있는 랜딩 페이지로 만들면 가치가 낮아진다.

### 10.2 `/data-sources/kto-pet-tour`

데이터 출처 페이지는 신뢰를 만드는 INDEX 페이지다. 한국관광공사 반려동물 동반여행 서비스의 제공기관, endpoint 범위, 데이터 갱신 기준, 이용 제한, GoodThingz의 정규화 방식, API에 없는 정보를 설명한다.

이 페이지는 사용자가 “이 정보 믿어도 되나?”를 판단하게 돕는다. 공공데이터 원본보다 추가 가치가 있으려면 API field를 그대로 복사하지 않고, GoodThingz에서 어떤 의미로 바꾸어 쓰는지와 어떤 부분을 추측하지 않는지 설명해야 한다.

### 10.3 조건부 지역 분석 페이지

지역 분석 페이지는 처음부터 대량 생성하지 않는다. 특정 지역이 충분한 데이터를 가지고 있고, 사용자가 독립적으로 방문해도 판단할 수 있는 분석이 있을 때만 INDEX 후보가 된다.

INDEX 가능한 지역 페이지는 지역별 반려동물 동반 장소 수, 타입 다양성, 숙박 주변 후보 구성, 정보 부족 비율, 기준일, 출처, 검색 시작 링크를 포함해야 한다. 지역 이름만 바꾸고 장소 목록만 붙인 페이지는 만들지 않는다.

## 11. NOINDEX 페이지 설계

검색 결과, 장소 상세, 비교 페이지는 사용자의 실제 서비스 이용에는 중요하지만 기본적으로 NOINDEX다. 이 페이지들은 query parameter, 사용자 위치, 선택한 후보 ID에 따라 매우 많이 생길 수 있고, 검색엔진에서 독립 페이지로 노출될 때 중복과 얇은 콘텐츠 문제가 생기기 쉽다.

NOINDEX 페이지도 품질을 낮게 만들어도 된다는 뜻은 아니다. 사용자가 링크를 공유하거나 앱 안에서 이동할 때는 정확한 제목, 설명, breadcrumb, 내부 링크, 출처 표시를 제공해야 한다. 다만 sitemap에는 넣지 않고, meta robots는 `noindex,follow`를 기본으로 한다.

## 12. DO NOT CREATE 유형

다음 페이지는 만들지 않는다.

- API 레코드 수만큼 자동 생성하는 장소 SEO 페이지
- 필터 조합별 정적 페이지
- 키워드만 바꾼 페이지
- 지역 이름만 바꾼 빈약한 페이지
- AI가 실제 데이터 없이 내용을 부풀린 페이지
- 가격, 예약 가능 여부, 실시간 영업 여부처럼 API에 없는 정보를 전제로 한 페이지
- “대형견 가능 지역 TOP 10”처럼 원본에서 명확히 검증되지 않는 순위 페이지

## 13. 운영 기준

새 URL 유형을 만들기 전에는 `docs/seo/index-policy.md`에 먼저 판정을 추가한다. INDEX 후보는 데이터 충분성, 독립 목적, 추가 가치, 출처와 기준일 표시 가능 여부를 확인한 뒤 승인한다. 승인되지 않은 URL은 sitemap에 넣지 않는다.

색인 정책은 기능 구현보다 먼저 정해야 한다. 기능을 먼저 만들고 나중에 SEO 페이지로 열어두면 대량 중복 페이지가 생기기 쉽다. GoodThingz는 검색엔진보다 사용자의 판단 시간을 줄이는 것을 먼저 본다.
