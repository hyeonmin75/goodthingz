# GoodThingz GitHub and Cloudflare Workflow

이 프로젝트의 권장 배포 흐름은 GitHub에 변경사항을 올리면 Cloudflare가 자동으로 감지해서 배포하는 방식이다.

## 전체 흐름

1. Codex 또는 사용자가 프로젝트 파일을 수정한다.
2. 수정된 파일을 GitHub 저장소 `main` 브랜치에 반영한다.
3. Cloudflare Workers Builds가 GitHub의 변경을 감지한다.
4. Cloudflare가 자동으로 설치, 빌드, 배포를 실행한다.
5. `https://goodthingfor.com/`에 최신 결과가 반영된다.

## 초보자에게 가장 쉬운 사용 방식

2026-10-01부터 사용자가 승인한 기본 방식은 Codex에게 필요한 수정을 설명하는 것이다. Codex가 작업을 끝내면 검사하고, 이번 변경만 커밋(변경 기록 저장)한 뒤 push(GitHub로 보내기)한다. 사용자는 매번 별도로 커밋·push를 요청하지 않아도 된다. 상세 규칙은 루트 `AGENTS.md`에 보관한다.

Cloudflare GitHub 연동이 정상이라면 GitHub에서 직접 push하거나 로컬에서 `npm run deploy`를 실행하지 않아도 된다. GitHub의 `main` 브랜치에 새 commit이 생기면 Cloudflare가 자동 배포를 시작한다.

## Codex에게 요청할 때

예를 들어 다음처럼 원하는 변경을 요청한다.

```text
방문 가이드에서 숙박 관련 글을 더 쉽게 찾을 수 있게 수정해줘.
```

1. 사용자는 바꾸려는 내용과 이유를 설명한다.
2. Codex가 수정하고 관련 기능·모바일·접근성·SEO·빌드를 검사한다.
3. Codex가 변경 내역과 비밀 파일 제외 여부를 확인한다. 무관한 사용자 파일은 포함하지 않는다.
4. 검사한 변경만 Git에 기록하고 GitHub의 해당 브랜치에 보낸다. 충돌이 있으면 강제로 덮어쓰지 않는다.
5. Cloudflare가 main의 변경을 감지해 자동 배포한다. 별도의 수동 배포는 보통 필요 없다.
6. Codex가 운영 사이트 반영 여부를 확인하고 커밋 번호·검사·배포 결과를 보고한다. push 완료와 배포 완료는 별개의 결과다.

아직 공개하고 싶지 않은 작업은 요청할 때 “이번에는 커밋·push·배포하지 말고 로컬에서만 수정해줘”라고 덧붙인다. 설명만 요청했거나 파일 변경이 없는 경우에는 빈 커밋을 만들지 않는다. 로그인·접근 승인·원격 충돌 또는 검사 실패가 발생하면 원인과 필요한 조치를 설명한다.

직접 GitHub 웹에서 고칠 때는 필요한 파일 하나를 편집하고 `Commit changes`로 main에 저장할 수 있다. 로컬 폴더를 통째로 업로드하는 방식은 비밀 파일·빌드 산출물 혼입 및 파일 삭제 누락 위험이 있어 권장하지 않는다. 웹에서 수정했다면 다음 로컬 작업 전에 원격 변경을 확인해야 한다.

## 직접 확인할 곳

GitHub에서는 저장소의 commit 목록에서 변경이 올라갔는지 확인한다.

Cloudflare에서는 Workers & Pages에서 GoodThingz 프로젝트의 Builds 또는 Deployments 화면을 확인한다. GitHub commit 직후 새 build가 생기면 자동 배포가 연결된 상태다.

## 주의할 파일

다음 파일은 절대 GitHub에 올리지 않는다.

- `.env`
- `.env.*`
- `.dev.vars`
- 실제 API Key
- Secret 값

예제 파일인 `.env.example`이나 `.dev.vars.example`은 이름만 적는 용도로 사용할 수 있다.

## 이 프로젝트의 Secret 기준

로컬 개발에서는 `.dev.vars`에 실제 값을 넣는다. 이 파일은 GitHub에 올리지 않는다.

production에서는 Cloudflare Worker Secret에 `PUBLIC_DATA_API_KEY`를 등록한다. GitHub 저장소에는 실제 공공데이터 API Key를 저장하지 않는다.

## 피해야 할 방식

파일이 저장될 때마다 자동으로 GitHub에 올라가게 만드는 방식은 피한다. 작업 중인 깨진 코드, 임시 파일, 비밀 파일이 함께 올라갈 위험이 있다.

GoodThingz에서는 수정 완료 후 검사하고 GitHub에 반영하는 방식을 기본으로 한다.
