# GoodThingz GitHub and Cloudflare Workflow

이 프로젝트의 권장 배포 흐름은 GitHub에 변경사항을 올리면 Cloudflare가 자동으로 감지해서 배포하는 방식이다.

## 전체 흐름

1. Codex 또는 사용자가 프로젝트 파일을 수정한다.
2. 수정된 파일을 GitHub 저장소 `main` 브랜치에 반영한다.
3. Cloudflare Workers Builds가 GitHub의 변경을 감지한다.
4. Cloudflare가 자동으로 설치, 빌드, 배포를 실행한다.
5. `https://goodthingfor.com/`에 최신 결과가 반영된다.

## 초보자에게 가장 쉬운 사용 방식

가장 쉬운 방식은 GitHub 웹사이트에서 파일을 통째로 업로드하거나 수정한 뒤 `Commit changes` 버튼을 누르는 것이다. 이 버튼은 GitHub에 변경사항을 저장하는 역할을 한다.

Cloudflare GitHub 연동이 정상이라면 GitHub에서 직접 push하거나 로컬에서 `npm run deploy`를 실행하지 않아도 된다. GitHub의 `main` 브랜치에 새 commit이 생기면 Cloudflare가 자동 배포를 시작한다.

## Codex에게 요청할 때

Codex에게는 다음처럼 요청하는 것이 가장 안전하다.

```text
수정하고, 필요한 검사 후 GitHub에 커밋/푸시까지 해줘.
```

이렇게 요청하면 Codex가 수정 파일을 확인하고, 비밀 파일이 포함되지 않았는지 점검한 뒤 GitHub에 반영한다. Cloudflare 배포는 GitHub 변경을 보고 자동으로 진행된다.

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
