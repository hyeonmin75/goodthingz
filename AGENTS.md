# GoodThingz Development Rules

이 프로젝트는 개발 초보자가 관리하는 프로젝트다. Codex는 항상 사용자의 질문 의도와 목적을 먼저 파악한 뒤 작업해야 하며, 중요한 작업 전에는 무엇을 변경할지 사용자에게 설명한다. 기존 구조는 불필요하게 변경하지 않고, 필요한 프로젝트 dependency는 자동으로 설치한다. 관리자 권한이나 로그인 필요한 작업은 실행 전에 사용자에게 이유와 영향을 설명한다.

## 기술 스택

- React
- React Router
- Vite
- TypeScript
- Cloudflare Workers
- SSR

## 공공데이터

- 외부 API는 Worker에서 호출한다.
- API Key를 브라우저에 노출하지 않는다.
- API별 Adapter를 만든다.
- API 원본 field를 UI에서 직접 사용하지 않는다.
- 데이터를 정규화한 후 UI에 전달한다.
- API 명세를 추측하지 않는다.

## 사용자 가치

공공데이터 목록 표시만으로 완료라고 판단하지 않는다.

반드시 먼저 다음 내용을 분석한다.

- 사용자의 실제 문제
- 검색 시간을 줄이는 방법
- 비교 시간을 줄이는 방법
- 판단을 쉽게 만드는 방법

검색, 필터, 지도, 비교, 계산, 차트, 요약 등은 실제 사용자 가치가 있을 경우에만 추가한다.

## 서비스 품질

모든 기능은 무료다.

하지만 사용자가 "유료 서비스라도 사용할 만하다"고 느낄 정도의 품질을 목표로 한다.

결제, 구독, Paywall, Premium 잠금 기능은 만들지 않는다.

## SEO

SEO 페이지 수를 늘리는 것을 목표로 하지 않는다.

사용자가 독립적으로 방문해도 충분한 가치가 있는 페이지만 검색 index 후보로 만든다.

각 URL 유형은 반드시 다음 중 하나로 결정한다.

- INDEX
- NOINDEX
- DO NOT CREATE

API 레코드 수만큼 자동 페이지를 생성하지 않는다.
필터 조합별 대량 페이지를 생성하지 않는다.
키워드만 바꾼 페이지를 생성하지 않는다.

## 완료 기준

중요 작업 후 다음 항목을 검사한다.

- TypeScript
- build
- API
- SEO
- 모바일
- 접근성

마지막에는 다음 내용을 보고한다.

- 수정 파일
- 실행한 검사
- 발견한 문제
- 남아 있는 위험

작업이 끝났지만 사용자가 아직 Git 반영을 요청하지 않은 경우, 마지막에 다음 문장을 안내한다.

```text
변경사항을 실제 사이트 반영 흐름까지 이어가려면 "커밋하고 GitHub에 push까지 해줘"라고 요청하세요.
```

# Cloudflare Workers

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Commands

| Command | Purpose |
|---------|---------|
| `npx wrangler dev` | Local development |
| `npx wrangler deploy` | Deploy to Cloudflare |
| `npx wrangler types` | Generate TypeScript types |

Run `wrangler types` after changing bindings in wrangler.jsonc.

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

## Best Practices (conditional)

If the application uses Durable Objects or Workflows, refer to the relevant best practices:

- Durable Objects: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
- Workflows: https://developers.cloudflare.com/workflows/build/rules-of-workflows/
