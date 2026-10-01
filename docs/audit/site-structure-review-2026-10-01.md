# GoodThingz 사이트 구조·콘텐츠 개선 검수

검수일: 2026-10-01. 기준은 광고 심사 수량 맞추기가 아니라 사용자가 자료를 이해하고 후보를 비교해 실제 방문을 준비할 수 있는지다. 개발 기준 커밋은 `57e1e7c`이며 이번 변경은 기존 React Router SSR·Cloudflare Worker API Adapter·비밀키 구조를 유지한다. 커밋 번호와 운영 배포 결과는 작업 완료 보고에서 별도로 확인한다.

## 1. 요청과 구현

| 요청 | 이번 변경 | 사용자에게 남는 결과 |
| --- | --- | --- |
| 사이트 주제와 동선 정리 | 홈 → 6개 주제 → 독립 글 → 실제 데이터 분석·장소 검색 → 방문 계획 | 읽은 기준을 실제 후보에 적용 |
| 30~50개의 정보성 콘텐츠 | 기존 10개 보강, 26개 신규 작성. 합계 36개 | 서로 다른 방문 판단 문제를 찾고 읽기 |
| 카테고리 정리 | 동반 조건, 식사·카페, 숙박, 이동·현장, 일정·예산, 데이터·판단에 6개씩 | 목적에 맞는 글을 분류·검색 |
| 내부 연결 | 각 글의 다음 질문 3개, 총 108개 관련 글 연결 | 반복 검색 없이 다음 확인으로 이동 |
| 원문보다 추가 가치 | 단계별 확인, 상황별 비교 표, 명시적 가상 사례, 질문 복사, 실제 표본과 도구 연결 | 정보의 빈칸과 결정에 필요한 근거 구분 |
| 소개·문의·개인정보 강화 | 운영자 굳띵즈와 공개 이메일, 작성·정정 원칙, 실제 처리·삭제 범위 | 책임 주체와 비공개 문의 방법 확인 |
| 매번 요청하지 않아도 Git 반영 | AGENTS.md에 검증 후 선택 커밋·정상 push·배포 확인을 기본 절차로 명시 | 수정 요청만으로 안전 점검과 반영까지 진행 |

36개는 이번 편집 범위이며 Google의 최소 글 수나 승인 조건이 아니다. 별도의 기존 방문 체크리스트와 12개 실제 자료 분석도 유지한다. 기존 10개 본문을 한 화면에 전부 펼치던 방식 대신 카탈로그의 요약과 독립 본문으로 분리한다.

## 2. 발행 목록과 분류

| 분류 | 독립 가이드 slug (각 6개) |
| --- | --- |
| 동반 조건 | size, multiple, equipment, carrier-vs-stroller, indoor-scope, proof-documents |
| 식사·카페 | dining, solo-dining, terrace-weather, meal-time, seat-reservation, dining-plan-b |
| 숙박 | overnight, room-booking, shared-spaces, stay-fees, overnight-meals, checkin-handoff |
| 이동·현장 | arrival, parking-access, car-free, last-mile, location-search, walking-route |
| 일정·예산 | rain, timing, budget, day-plan, two-day-plan, change-plan |
| 데이터·판단 | uncertain, missing-data, source-dates, compare-rules, contact-evidence, share-plan |

각 본문 주소는 `/pet-travel/guides/{slug}`다. 카테고리는 카탈로그 안의 앵커이며 별도의 지역·키워드·필터 SEO 페이지로 늘리지 않았다. 기존 `#dining` 같은 링크도 요약 항목을 통해 본문으로 이어진다.

각 글에 확인 단계 3개, 상황·근거·판단 표 3행, 가상 사례, 문의 질문 2개, 근거와 한계, 관련 글 3개를 제공한다. 글별 편집 텍스트 합계는 검사 대상 기준 35,713자(공백 포함)다. 내비게이션·공통 하단 문구로 분량을 부풀리지 않았으며 문자 수 자체를 품질 기준으로 삼지 않는다. 본문 단계·도입·사례 문단의 완전 중복도 검사했다. 동일 문장이 없다는 검사만으로 의미의 독창성 전체가 입증되는 것은 아니다.

## 3. Google 기준과 대응

| 공식 기준 | 이번 대응 | 판정과 한계 |
| --- | --- | --- |
| 게시자 콘텐츠의 유용성·독창적 가치 | 단순 장소 나열을 넘어 조건 판독, 비교 근거, 질문, 사용자 기록 도구를 연결 | 개선. 승인 여부는 Google 심사 대상 |
| 충분한 콘텐츠와 사용 경험 | 36개 독립 문제를 6개 분류에서 탐색하고 모바일에서 읽도록 구성 | 브라우저 검사 PASS. 글 수만으로 충분함을 보장하지 않음 |
| 복사·얇은 반복 콘텐츠 위험 | 지역명 치환, 뉴스 복사, API 레코드별 페이지 생성을 하지 않음. 실사·전문가 검수를 허위로 표시하지 않음 | 편집 점검 완료. 실제 현장 경험과 지속적 정정은 별도 운영 과제 |
| 검색 스팸 방지 | 확정된 편집 목록만 라우팅, 알 수 없는 slug 404, query 변형 noindex, sitemap에 canonical만 포함 | 기술 검사 PASS |
| 사람 중심의 작성·출처 | 작성 주체·AI 보조 작성·원자료와 가상 사례·한계·날짜 구분 | 반영. 가상 사례는 실제 방문 후기나 장소 승인 증거가 아님 |
| 의미 있는 내부 링크 | 제목과 다음 질문으로 이어지는 108개 관련 글 링크, 분석·검색·계획 연결 | 전체 내부 링크와 앵커 검사 PASS |

참고한 공식 문서:

- [Google AdSense 게시자 정책](https://support.google.com/adsense/answer/10502938?hl=ko)
- [콘텐츠 및 사용자 경험 안내](https://support.google.com/adsense/answer/10015918?hl=ko)
- [수동 조치와 가치가 낮은 콘텐츠 안내](https://support.google.com/webmasters/answer/9044175?hl=ko)
- [Google 게시자 정책의 검색 스팸 관련 안내](https://support.google.com/publisherpolicies/answer/11035931?hl=ko)
- [유용하고 신뢰할 수 있는 사용자 우선 콘텐츠](https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=ko)
- [크롤링 가능한 링크](https://developers.google.com/search/docs/crawling-indexing/links-crawlable?hl=ko)

## 4. 운영 정보와 개인정보

운영자명 `굳띵즈`, 공개 이메일 `goodthingz57775@gmail.com`은 사용자가 공개용으로 지정한 정보다. 소개에는 서비스의 목적, 데이터와 편집의 구분, AI 보조 작성, 현장 실사·전문가 검수 주장을 하지 않는 원칙, 정정 경로와 변경 기록을 추가했다.

문의는 사이트가 자동 접수했다고 표시하는 폼이 아니다. 입력은 현재 화면에서만 처리하고 이메일 앱에서 사용자가 직접 전송한다. 이메일 앱이 없는 경우 초안과 주소를 복사할 수 있고 복사가 차단됐을 때 직접 선택할 수 있다. 공개 GitHub 제보와 비공개 개인정보 문의를 구분하며, 특정 응답 시간을 보장하지 않는다.

개인정보처리방침에는 위치 권한과 전달 대상, 검색, 브라우저 저장·삭제, 계획 공유와 백업 파일의 차이, 이메일 처리, 외부 리소스·로그·광고와 권리 요청을 반영했다. 운영하지 않는 자동 삭제나 완전한 미수집을 약속하지 않는다. 개인정보보호위원회 [2026.4 작성지침 안내](https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=I030010000&nttId=12018), Cloudflare 및 Google의 공개 처리 안내를 참고했다. 법률 검토 완료 또는 해외 처리·보관 설정 검증 완료를 의미하지 않는다.

## 5. 기술·화면·SEO 검사

로컬 배포용 빌드를 `http://127.0.0.1:8790`에서 Chrome 기반 실제 브라우저 자동화로 검사했다. 광고 실행은 외부 광고를 요청하지 않도록 시험 대역을 사용했고 API 응답 검사는 실제 Worker 경로를 사용했다. 일부 지도·장소 동작은 기존 재현용 응답을 함께 사용한다.

| 검사 | 결과 | 확인 범위 |
| --- | --- | --- |
| `npm run typecheck` | PASS | 라우트·본문·문의·응답 헤더 타입 |
| `npm run build` | PASS | 클라이언트·SSR 빌드, 산출물의 로컬 비밀 파일 제거 |
| `npm run test:editorial` | PASS | 36개 SSR 본문, 6개 분류, 고유 제목·질문, 관련 링크, query·404, 검색·복사·문의 초안 |
| `npm run test:publisher` | PASS | 45개 승인 페이지, SEO·광고·404, 실제 API 목록·상세·페이지 이동·위치 반경·잘못된 입력, 검색·비교·empty·error |
| `npm run test:plan` | PASS | 저장·복원·공유·파일·금액·재정렬·삭제 |
| `npm run test:value` | PASS | 실제 표본과 사진, 비용 계산의 빈값·단위, 문의 질문 |
| `npm run test:workspace` | PASS | 후보 검토·비교·CSV 정보 제외·저장 실패·미저장 이탈 경고·생성 이미지 |
| `npm run test:a11y` | PASS | 12개 화면 × 모바일360·PC1280, WCAG A/AA 자동 검사 위반 0, 본문 건너뛰기 키보드 |
| `npm run test:adsense` | PASS | ads.txt 200·text/plain, 정확한 pub 코드, 홈 head의 SSR 스크립트 1개, 나머지 화면 제외·이동 후 실행 분리 |
| `npm run test:links` | PASS | JavaScript 없이 46개 화면, canonical 45개, 내부 링크 1,563개와 앵커 |
| `npm run test:private` | PASS | 소스·추적 대상·신규 파일·빌드에서 실제 로컬 Secret 값 미포함 |
| `git diff --check` | PASS | 공백 오류 없음. Windows 줄바꿈 변환 안내는 기능 오류 아님 |

새 화면은 360·390·768·1280 너비에서 홈·목록·본문·소개·개인정보·문의를 확인했다. 가로 넘침과 브라우저 실행 오류는 없었다. 별도 기존 도구 검사는 1920 너비까지 포함한다. `.wrangler/editorial-audit/`와 기존 검사 폴더의 캡처는 로컬 검수용이며 Git에 넣지 않는다. PC·모바일 캡처를 직접 확인했다.

검색용 canonical은 기존 8개 + 독립 글 36개 + 문의 1개 = 45개다. 개인 계획·검색 조합은 계속 제외한다. 신규 글 공개일은 2026-10-01, 기존 10개 공개일은 2026-09-15, 실제 표본 조회일은 2026-09-26을 유지한다.

## 6. 발견 후 수정한 문제

1. 새 글의 loader에서 만든 검색 제외 헤더가 HTML 응답에 전달되지 않아 라우트의 `headers` 반환을 추가했다. 없는 slug의 404와 noindex를 재검사했다.
2. 가상 사례 상자의 작은 글씨 대비가 4.39:1로 기준에 부족했다. 해당 본문의 보조 글자 색을 진하게 바꿔 재검사했다.
3. 소개·개인정보의 목차 폭이 본문보다 넓어 읽기 폭에 맞췄다.
4. 기존 검사는 한 페이지에 10개 글이 있는 구조를 전제로 해 새 카탈로그·본문 이동 구조에 맞췄다. 비용 글 전환을 기다리지 않던 검사도 보정했고 전체 재실행을 통과했다.
5. 배포 안내의 폴더 통째 업로드 권장과 별도 push 요청 문구를 제거하고 사용자가 승인한 완료 후 자동 반영 절차로 맞췄다.
6. 실행 중인 미리보기 서버가 Windows 빌드 폴더를 잠근 실패가 있었다. 이번 검수용 서버만 종료해 빌드한 후 다시 시작했으며 최종 빌드는 성공했다.

## 7. 남아 있는 위험과 운영할 일

- 기술 검사에서 해결되지 않은 FAIL은 0개다. 이는 AdSense 콘텐츠 심사 PASS라는 뜻이 아니며, 재신청 결과와 Google 내부 판단은 확인할 수 없다.
- 독립 글은 실제 현장 방문·운영자 인터뷰를 대신하지 않는다. 확인한 자료와 판단 방법이 중심이며 실시간 영업·예약·가격·허용 여부를 제공하지 않는다. 실제 이용자의 누락 질문과 오류를 지속적으로 수정해야 한다.
- 공개 이메일의 주소·초안 연결은 검사했으나 운영자의 받은편지함 전달·회신은 시험 메일을 보내지 않아 확인하지 않았다. 받은 문의를 처리·삭제하는 운영 절차도 실제로 이행해야 한다.
- 해외 이용자 광고 동의, Google 계정·Cloudflare 로그·Gmail 보관 설정, 국외 처리 및 실제 보존 필요 범위는 운영자 계정과 법적 적용 상황 확인이 남는다. 개인정보 문서만으로 해결되는 것은 아니다.
- 접근성 자동 검사와 키보드 확인은 전체 보조기술·실물 휴대전화 시험을 대신하지 않는다. 장기 API 장애·제공자 정책 변경·데이터 갱신은 지속적인 점검 대상이다.
- 무관한 사용자 파일 `README - 복사본.md`는 변경하거나 커밋에 포함하지 않는다. 비밀키 파일·검사 로그·화면 캡처 역시 업로드하지 않는다.

## 8. 주요 변경 파일

- 규칙·반영 절차: `AGENTS.md`, `docs/deploy/github-cloudflare-workflow.md`
- 콘텐츠·운영 정보: `app/content/travel-guides.ts`, `app/site-info.ts`
- 화면: `app/routes/home.tsx`, `travel-guides.tsx`, `travel-guide.tsx`, `about.tsx`, `contact.tsx`, `privacy.tsx`, `data-notes.tsx`
- 공통·연결: `app/app.css`, `app/root.tsx`, `app/routes.ts`, `app/seo.ts`, `app/components/plan-review-board.tsx`
- 재검사: `scripts/check-editorial.cjs`, 기존 6개 검사 스크립트, `package.json`
- 기준 문서: 제품·UI·SEO 설계 및 본 검수 보고서
