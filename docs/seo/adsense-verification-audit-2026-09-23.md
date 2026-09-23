# AdSense 연결 및 ads.txt 검사

검사일: 2026-09-23. 운영 도메인: https://goodthingfor.com. 사용자는 AdSense 사이트 연결 방식으로 코드 스니펫을 선택했다고 확인했다.

## 발견한 문제와 수정

- 배포된 홈페이지에는 계정 메타 태그가 있었지만, 이전 정책 점검에서 광고 스크립트 실행을 보류해 사용자가 선택한 코드 스니펫이 없었다. 메타 태그도 Google이 지원하는 별도 확인 방법이지만, 이번에는 선택한 방식과 코드를 일치시킨다.
- `app/adsense.ts`에 제공받은 공개 게시자 번호의 스크립트 주소와 홈페이지 전용 조건을 정의하고 `app/root.tsx`에서 정상 홈페이지의 최초 HTML head에 async 스크립트 1개를 출력한다. 검색 문자열이 있는 홈, 검색, 개인 방문 계획, 안내 및 오류 페이지는 제외한다. 기존 계정 메타 태그는 유지한다.
- 홈의 본문·메뉴·하단 링크로 나갈 때 새 문서를 불러오도록 하여 광고 스크립트의 실행 상태가 개인 계획이나 검색 화면으로 이어지지 않게 했다. 화면 디자인·API·검색 색인 URL은 바꾸지 않았다.
- 개인정보 안내에 스크립트를 불러오는 범위와 Google에 전달될 수 있는 통신 정보를 반영하고 실제 수정일을 변경했다. 스크립트가 단순한 무통신 확인 표식인 것처럼 설명하지 않는다. 자동 광고·동의 설정은 계정에서 별도 확인이 필요하다.
- `scripts/check-adsense.cjs`와 `npm run test:adsense`를 추가했다. 기존 정책·접근성 검사도 실제 광고 요청 없이 동작하도록 변경했다.

## ads.txt 공개 상태

수정 전 실제 HTTP 요청으로 다음 조합을 확인했다. ads.txt 경로와 내용은 정상이라 삭제하거나 재생성하지 않았다.

| 대상 | 결과 |
| --- | --- |
| HTTPS/HTTP, www 유무의 4개 주소에서 `/ads.txt` | 모두 200, `text/plain; charset=utf-8`, 동일한 게시자 레코드 |
| 위 4개 주소에서 홈페이지와 `/robots.txt` | 모두 200, 확인 요청에서 차단 페이지 없음 |
| Googlebot·Mediapartners-Google·AdsBot-Google User-Agent로 HTTPS 기본 도메인 요청 | 홈·robots·ads.txt 모두 200 |
| robots.txt | 전체 공개 경로 허용, `/api/`만 차단, ads.txt 차단 없음 |

레코드: `google.com, pub-1998974659917167, DIRECT, f08c47fec0942fa0`

User-Agent 검사란 요청의 브라우저 이름을 바꾼 검사이며, 실제 Google의 IP에서 방문한 기록을 확인한 것은 아니다. 따라서 이 검사만으로 Google 크롤러의 모든 접근이나 계정 화면의 상태 갱신까지 보장하지 않는다. 코드 스니펫 누락과 ads.txt 상태 표시는 서로 다른 검사이므로, 코드 누락이 ads.txt 상태의 원인이라고 단정하지 않는다.

## 로컬 배포 빌드 검사

- PASS: TypeScript 및 production build. 빌드에 임시 생성되는 로컬 비밀 파일은 기존 후처리에서 제거됨.
- PASS: ads.txt 정확한 본문·형식·200 응답, 최초 HTML head의 게시자 번호·script URL·async·crossorigin, 스크립트 1회 출력.
- PASS: 검색·개인 계획·검색 문자열 홈·404 등 제외 경로에 스크립트 없음.
- PASS: Chrome 360px/1280px에서 홈 진입 시 코드 로드, 메뉴·하단·가이드 링크 이동 시 이전 실행 상태 제거, 다시 홈으로 이동 시 1회 로드. 브라우저 실행 오류 0건.
- PASS: 기존 정책 검사. 실제 API 목록·상세·페이지 이동·반경·잘못된 입력, SSR·canonical·robots·sitemap·404, 360px/390px/1280px 검색·공유·비교·빈 결과·오류·동의 취소/수락.
- PASS: 접근성 자동 검사 8개 페이지 × 2개 화면 폭에서 WCAG 2 A/AA 및 2.1 AA 위반 0건. 키보드 본문 이동 및 가로 넘침 검사 통과. 자동 검사는 모든 접근성을 보장하지 않음.
- PASS: `test:private`에서 실제 Secret의 Git 추적 및 빌드 포함 없음.

자동 브라우저 검사에서는 광고 스크립트를 무해한 시험용 응답으로 대체했다. 실제 광고 노출·클릭을 발생시키거나 Google의 광고 실행 결과를 시험한 것이 아니다.

## 운영자가 확인할 사항

1. GitHub 자동 배포 후 홈페이지의 최초 HTML에 코드가 반영되었는지 확인한다. GitHub push와 운영 반영은 별개다.
2. AdSense의 사이트 목록에서 `goodthingfor.com`을 열고 ads.txt 상태의 `업데이트 확인`을 사용한다. 연결 코드 확인이나 검토 요청이 별도로 표시될 때만 해당 절차를 진행한다.
3. Google 안내상 변경 인식에는 며칠이 걸릴 수 있고, 광고 요청이 적으면 최대 한 달까지 걸릴 수 있다. 이 기간은 성공 보장이 아니다.
4. 계속 찾을 수 없음이면 Cloudflare 보안 이벤트에서 실제 Google 방문 차단 여부와 AdSense 계정의 등록 주소·상태를 추가 확인한다. 보안 기능을 전체 해제하지 않는다.
5. 광고를 실제 운영하기 전 자동 광고 및 방문 지역에 필요한 동의 설정을 확인한다. 이번 검사는 연결 코드와 파일 접근성 검사이며, 콘텐츠 품질 승인이나 개인정보 규정 준수 전체에 대한 보장이 아니다.

## 공식 근거

- [사이트 연결: 코드·ads.txt·메타 태그](https://support.google.com/adsense/answer/7584263?hl=ko)
- [ads.txt 문제 해결: 루트 경로, 응답, 크롤링 및 반영 시간](https://support.google.com/adsense/answer/7679060?hl=ko)
- [ads.txt 업데이트 확인 요청](https://support.google.com/adsense/answer/12171612?hl=ko)
- [ads.txt 상태 안내](https://support.google.com/adsense/answer/12171244?hl=ko)
