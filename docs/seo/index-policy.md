# GoodThingz Index Policy

작성일: 2026-08-27

기준 문서:

- `docs/seo/seo-strategy.md`
- `docs/product/service-design.md`
- `docs/value/value-map.md`

이 문서는 GoodThingz에서 가능한 페이지 유형을 `INDEX`, `NOINDEX`, `DO NOT CREATE` 중 하나로 결정하기 위한 정책 문서다. 기본 원칙은 “사용자가 검색엔진에서 바로 들어와도 충분히 문제를 해결할 수 있는가”다.

## 1. 판정 정의

| 판정 | 의미 | 처리 |
| --- | --- | --- |
| INDEX | 검색엔진 색인 후보로 허용 | canonical 자기 자신, sitemap 포함 가능, 출처와 기준일 표시 필수 |
| NOINDEX | 페이지는 존재하지만 검색 색인 제외 | `noindex,follow`, sitemap 제외, 공유와 앱 흐름은 허용 |
| DO NOT CREATE | 해당 URL 유형 자체를 만들지 않음 | 라우트, sitemap, 내부링크 모두 만들지 않음 |

## 2. INDEX 승인 조건

INDEX가 되려면 다음 조건을 모두 만족해야 한다.

| 조건 | 확인 질문 |
| --- | --- |
| 실제 검색 목적 | 사용자가 검색엔진에서 이 주제로 찾을 가능성이 분명한가 |
| 독립 목적 | 다른 페이지의 얇은 변형이 아니라 독립적으로 해결하는 문제가 있는가 |
| 충분한 데이터 | API 데이터가 양과 품질 면에서 페이지를 지탱할 수 있는가 |
| 추가 가치 | API 원본 목록보다 요약, 비교, 계산, 설명, 기준 제공이 있는가 |
| 판단 도움 | 사용자가 방문, 검색, 비교, 확인 중 하나의 결정을 내릴 수 있는가 |
| 출처와 기준일 | 제공기관, 데이터 기준일, 갱신 기준, 한계를 표시할 수 있는가 |
| 중복 아님 | 지역명, 키워드, 필터만 바꾼 중복 페이지가 아닌가 |

하나라도 만족하지 못하면 기본값은 `NOINDEX` 또는 `DO NOT CREATE`다.

## 3. 페이지 유형별 결정

| 페이지 유형 | 예시 URL | 결정 | 이유 | 필수 조건 |
| --- | --- | --- | --- | --- |
| 홈 | `/` | INDEX | GoodThingz 전체 서비스의 대표 진입점이며 독립 방문 가치가 있다. | 서비스 목적, 무료 정책, 주요 데이터 서비스 연결, 출처 페이지 링크 |
| 반려동물 여행 검색 시작 | `/pet-travel` | INDEX | 현위치·지역·키워드 검색을 시작할 수 있어 실제 문제 해결 가치가 있다. | 검색 UI, 핵심 판단 기준, 데이터 출처와 기준일, API 한계 |
| 데이터 출처 설명 | `/data-sources/kto-pet-tour` | INDEX | 공공데이터의 제공기관, 갱신 기준, 한계, GoodThingz 정규화 방식을 설명해 신뢰 판단에 도움을 준다. | 제공기관, 기준일, 갱신 주기, 이용 제한, 원본보다 추가 설명 |
| 소개 | `/about` | INDEX | 서비스 목적, 무료 정책, 품질 기준을 설명하는 독립 페이지다. | 결제 없음, 구독 없음, Paywall 없음, 핵심 기능 로그인 강요 없음 |
| 개인정보 | `/privacy` | INDEX | 위치정보와 로컬 저장 등 사용자 신뢰에 필요한 필수 정책 페이지다. | 위치 권한, 공유 URL, 로컬 즐겨찾기, 로그 보관 기준 |
| 검색 결과 | `/pet-travel/search?keyword=카페` | NOINDEX | query와 필터에 따라 무한히 생성될 수 있고 독립 페이지라기보다 앱 상태다. | `noindex,follow`, canonical `/pet-travel`, sitemap 제외 |
| 현위치 검색 결과 | `/pet-travel/search?lat=...&lng=...` | NOINDEX | 개인 위치 기반 URL이며 개인정보와 중복 위험이 크다. | 좌표 공유 최소화, `noindex,follow`, sitemap 제외 |
| 지역 검색 결과 | `/pet-travel/search?region=...` | NOINDEX | 검색 상태는 필요하지만 지역명만으로 충분한 독립 분석을 제공하지 않는다. | INDEX 지역 분석 페이지와 분리 |
| 필터 적용 결과 | `/pet-travel/search?region=...&type=food&parking=true` | DO NOT CREATE | 필터 조합별 페이지는 대량 생성과 중복 위험이 크다. | 정적 라우트 생성 금지 |
| 정렬 결과 | `/pet-travel/search?sort=distance` | NOINDEX | 사용자 보기 상태이며 독립 검색 목적이 약하다. | canonical `/pet-travel`, sitemap 제외 |
| 장소 상세 | `/pet-travel/places/:contentId` | NOINDEX | 서비스 이용과 공유에는 필요하지만 API 레코드 수만큼 자동 색인하면 정책 위반이다. | `noindex,follow`, sitemap 제외, 출처와 기준일 표시 |
| 비교 | `/pet-travel/compare?ids=...` | NOINDEX | 선택 후보 조합별로 무한히 생성될 수 있어 색인 가치가 낮다. | `noindex,follow`, sitemap 제외 |
| 즐겨찾기 | `/pet-travel/favorites` | NOINDEX | 개인 브라우저 상태에 가까워 검색엔진 독립 가치가 없다. | 로그인 강요 없음, sitemap 제외 |
| 공유 후보 | `/pet-travel/share/:shareId` | NOINDEX | 특정 사용자가 공유한 상태이며 중복과 개인정보 위험이 있다. | 만료 또는 최소 정보, `noindex,follow` |
| 지역 분석 | `/pet-travel/regions/:regionSlug` | 조건부 INDEX | 충분한 데이터와 분석이 있으면 여행 지역 선택 문제를 독립적으로 해결할 수 있다. | 아래 지역 분석 승인 기준 충족 |
| 지역별 단순 목록 | `/pet-travel/regions/seoul/list` | DO NOT CREATE | 지역 이름만 바꾼 목록은 API 원본보다 추가 가치가 약하다. | 만들지 않음 |
| 지역+장소유형 페이지 | `/pet-travel/regions/seoul/food` | DO NOT CREATE | 필터 조합별 페이지에 가까워 대량 생성 위험이 있다. | 만들지 않음 |
| 키워드 SEO 페이지 | `/pet-travel/keyword/애견카페` | DO NOT CREATE | 검색어만 바꾼 페이지가 되기 쉽고 API 근거가 약하다. | 만들지 않음 |
| 편집형 가이드 | `/pet-travel/guides/pet-travel-checklist` | 조건부 INDEX | 특정 문제를 해결하는 원본 이상의 설명과 체크 기준이 있으면 가치가 있다. | 데이터 근거, 사용자 판단 기준, 출처 표시 |
| 순위 페이지 | `/pet-travel/best/...` | DO NOT CREATE | 리뷰, 만족도, 예약, 실시간 품질 데이터가 없어 순위 근거가 부족하다. | 만들지 않음 |
| 실시간 영업 페이지 | `/pet-travel/open-now` | DO NOT CREATE | API에 실시간 영업 정보가 없다. | 만들지 않음 |
| 예약/가격 페이지 | `/pet-travel/booking`, `/pet-travel/price` | DO NOT CREATE | API에 예약 가능 여부와 가격이 없다. | 만들지 않음 |
| API 프록시 | `/api/...` | NOINDEX | 사용자용 콘텐츠가 아니며 검색 노출 대상이 아니다. | robots.txt 차단 가능, sitemap 제외 |
| robots.txt | `/robots.txt` | INDEX 대상 아님 | 검색엔진 제어 파일이다. | `/api/` 차단, sitemap 위치 명시 |
| sitemap.xml | `/sitemap.xml` | INDEX 대상 아님 | INDEX 승인 URL 목록 파일이다. | canonical INDEX URL만 포함 |

## 4. 지역 분석 페이지 승인 기준

지역 분석 페이지는 SEO에 유용할 수 있지만 가장 위험한 유형이기도 하다. 지역 이름만 바꾼 페이지가 되면 GoodThingz의 정책에 맞지 않는다.

INDEX 가능한 지역 분석 페이지는 다음을 모두 포함해야 한다.

| 기준 | 필요한 내용 |
| --- | --- |
| 데이터 충분성 | 해당 지역의 장소 수가 너무 적지 않고, 숙박·음식점·관광지 등 타입 구성이 설명 가능해야 한다. 최소 기준은 실제 API 검증 후 정한다. |
| 추가 분석 | 단순 목록이 아니라 장소 유형 분포, 정보 부족 비율, 반려동물 조건 확인 가능 비율, 숙소 주변 후보 구성 같은 분석이 있어야 한다. |
| 판단 도움 | “이 지역으로 여행지를 잡아도 되는가”, “숙소 주변 일정이 성립하는가” 같은 결정을 도와야 한다. |
| 출처와 기준일 | 한국관광공사 반려동물 동반여행 서비스, 데이터 조회일, 갱신 기준을 표시해야 한다. |
| 중복 방지 | 지역명만 바꾼 템플릿 문장 사용 금지. 지역별로 실제 데이터 차이가 설명되어야 한다. |
| 검색 시작 연결 | 해당 지역을 기준으로 검색을 시작할 수 있는 명확한 행동이 있어야 한다. |

지역 분석 페이지가 위 기준을 만족하지 못하면 만들지 않는다. 임시로 필요하면 검색 결과 URL로 처리하고 `NOINDEX`를 적용한다.

## 5. 편집형 가이드 승인 기준

편집형 가이드는 공공데이터 원본을 해석해 사용자의 판단을 돕는 경우에만 INDEX 후보가 된다. 예를 들어 “반려동물 동반 여행지 고를 때 확인할 기준”은 가능하지만, “전국 애견 여행 추천”처럼 데이터 근거 없이 부풀린 글은 만들지 않는다.

INDEX 가능한 가이드는 다음을 충족해야 한다.

- 특정 사용자 문제가 분명해야 한다.
- GoodThingz 데이터로 확인 가능한 기준을 설명해야 한다.
- API에 없는 정보는 없다고 명확히 말해야 한다.
- 검색 또는 비교 기능으로 자연스럽게 이어져야 한다.
- 출처와 기준일을 표시해야 한다.

## 6. Meta Robots 정책

| 결정 | robots meta 또는 header | sitemap 포함 |
| --- | --- | --- |
| INDEX | `index,follow` 또는 기본값 | 포함 가능 |
| NOINDEX | `noindex,follow` | 제외 |
| DO NOT CREATE | 없음 | 제외 |

검색 결과, 장소 상세, 비교, 즐겨찾기, 공유 후보 페이지는 `noindex,follow`를 기본으로 한다. robots.txt로 이 페이지들을 막아버리면 검색엔진이 `noindex`를 읽지 못할 수 있으므로, 페이지 접근은 허용하고 색인만 막는 방식을 우선한다.

## 7. Canonical 정책

| 페이지 유형 | canonical |
| --- | --- |
| 홈 | `https://goodthingz.com/` |
| 반려동물 여행 검색 시작 | `https://goodthingz.com/pet-travel` |
| 데이터 출처 | `https://goodthingz.com/data-sources/kto-pet-tour` |
| 소개 | `https://goodthingz.com/about` |
| 개인정보 | `https://goodthingz.com/privacy` |
| 검색 결과 | `https://goodthingz.com/pet-travel` |
| 비교 | `https://goodthingz.com/pet-travel` 또는 비교 기본 URL |
| 장소 상세 | 자기 자신 가능, 단 sitemap 제외와 `noindex` 유지 |
| 지역 분석 | 승인된 INDEX 페이지만 자기 자신 |
| 편집형 가이드 | 승인된 INDEX 페이지만 자기 자신 |

canonical은 중복 대표 URL 신호일 뿐이다. `NOINDEX`가 필요한 페이지에는 canonical만 두지 말고 반드시 `noindex`를 함께 둔다.

## 8. Sitemap 정책

sitemap에는 INDEX 승인 URL만 들어간다. 동적 검색 결과, 필터 조합, 장소 상세, 비교, 즐겨찾기, 공유 URL은 넣지 않는다.

초기 sitemap 후보는 다음이다.

```text
https://goodthingz.com/
https://goodthingz.com/pet-travel
https://goodthingz.com/data-sources/kto-pet-tour
https://goodthingz.com/about
https://goodthingz.com/privacy
```

지역 분석과 편집형 가이드는 `INDEX` 승인 절차를 통과한 URL만 sitemap에 추가한다.

## 9. 내부링크 정책

INDEX 페이지는 서로 신뢰와 행동을 연결해야 한다. 홈은 `/pet-travel`과 데이터 출처로 연결하고, `/pet-travel`은 검색 행동으로 연결한다. 데이터 출처 페이지는 API의 한계를 설명한 뒤 검색 시작 페이지로 연결한다.

NOINDEX 페이지도 사용자 흐름에는 중요하므로 내부링크는 허용한다. 검색 결과에서 장소 상세와 비교로 이동하고, 장소 상세에서 검색 결과와 비교로 돌아갈 수 있어야 한다. 다만 NOINDEX 페이지를 SEO 목적으로 대량 링크하지 않는다.

## 10. Breadcrumb 정책

| 페이지 유형 | Breadcrumb |
| --- | --- |
| `/` | 없음 또는 홈 |
| `/pet-travel` | 홈 > 반려동물 여행 |
| `/pet-travel/search` | 홈 > 반려동물 여행 > 검색 결과 |
| `/pet-travel/places/:contentId` | 홈 > 반려동물 여행 > 장소 상세 |
| `/pet-travel/compare` | 홈 > 반려동물 여행 > 후보 비교 |
| `/pet-travel/regions/:regionSlug` | 홈 > 반려동물 여행 > 지역 분석 > 지역명 |
| `/pet-travel/guides/:guideSlug` | 홈 > 반려동물 여행 > 가이드 > 가이드명 |
| `/data-sources/kto-pet-tour` | 홈 > 데이터 출처 > 한국관광공사 반려동물 동반여행 |

Breadcrumb structured data는 INDEX 후보 페이지에 우선 적용한다. NOINDEX 페이지에는 사용자 UI breadcrumb는 제공하되, 검색 노출 확대 목적의 structured data는 신중히 적용한다.

## 11. Structured Data 정책

| 페이지 유형 | 사용 후보 | 결정 |
| --- | --- | --- |
| 홈 | `WebSite`, `Organization` | 가능 |
| `/pet-travel` | `WebPage`, `SearchAction`, `BreadcrumbList` | 실제 검색 기능 구현 후 가능 |
| 데이터 출처 | `Dataset`, `WebPage`, `BreadcrumbList` | 출처, 기준일, 라이선스, 갱신 기준 표시 후 가능 |
| 지역 분석 | `WebPage`, `BreadcrumbList` | INDEX 승인 후 가능 |
| 편집형 가이드 | `Article` 또는 `WebPage`, `BreadcrumbList` | 사람에게 유용한 편집 콘텐츠일 때만 가능 |
| 장소 상세 | `Place`, `LocalBusiness` | 기본 보류 |

장소 상세에 `Place`나 `LocalBusiness`를 넣는 것은 신중해야 한다. GoodThingz가 해당 장소의 소유자도 아니고, 실시간 영업·가격·예약·리뷰 정보를 제공하지 않기 때문이다. 장소 상세는 기본적으로 `NOINDEX`이므로 structured data도 검색 노출 목적보다는 내부 UI 품질에 집중한다.

## 12. 새 페이지 생성 전 체크리스트

새 페이지 유형을 만들기 전에는 다음 질문에 모두 답해야 한다.

1. 이 페이지를 검색해서 들어오는 사용자의 실제 목적은 무엇인가?
2. 같은 목적을 `/pet-travel` 검색 화면에서 해결할 수는 없는가?
3. API 원본 목록보다 무엇을 더 계산, 비교, 요약, 설명하는가?
4. 출처와 데이터 기준일을 표시할 수 있는가?
5. 비슷한 페이지가 대량으로 생길 위험은 없는가?
6. API에 없는 정보를 있는 것처럼 말하지 않는가?
7. sitemap에 넣을 만큼 독립 가치가 있는가?

답이 불분명하면 `INDEX`로 열지 않는다. GoodThingz의 SEO 품질은 많은 페이지가 아니라 적은 수의 신뢰 가능한 페이지에서 나온다.
