# Newron Web

Android 앱 `newron-client-android_v1`의 웹 클라이언트입니다. 새 백엔드나 DB를 만들지 않고 기존 Newron API 서버 4개를 Next.js 웹 앱에서 연결하는 구조입니다.

## Planning

- [서비스 기획서](./docs/planning/product-plan.md)
- [디버깅 환경 가이드](./docs/planning/debugging-environment.md)
- [API/디자인 명세](./daily_reports/docs/web-design-spec.md)
- [기술 스택 보고서](./daily_reports/docs/tech-stack-report.md)

## Getting Started

`pnpm` 경로가 등록되어 있지 않으면 먼저 실행합니다.

```bash
export PATH="/home/hs-2/.local/share/pnpm/bin:$PATH"
```

개발 서버:

```bash
pnpm dev
```

이미 개발 서버가 실행 중이면 `Another next dev server is already running` 메시지가 나올 수 있습니다. 이때는 새로 실행하지 않아도 되며, 아래 헬스체크가 정상인지 확인합니다.

```bash
curl http://localhost:3000/api/health
```

디버그 서버:

```bash
pnpm dev:debug
```

타입 체크:

```bash
pnpm typecheck
```

Open [http://localhost:3000](http://localhost:3000) with your browser. URL은 터미널 명령어가 아니라 브라우저 주소창에 입력하는 주소입니다.

서버를 재시작해야 할 때는 `pnpm dev` 출력에 표시된 PID를 종료한 뒤 다시 실행합니다.

```bash
kill <PID>
pnpm dev
```

## Architecture

```text
Browser
  -> Next.js App Router
  -> /api/proxy/{main|pers|ai|brief}
  -> Existing Newron APIs
```

브라우저에서는 외부 API 서버를 직접 호출하지 않고 `/api/proxy/*`를 통해 호출합니다. 이는 CORS, Mixed Content, 인증 헤더 전달, SSE 중계를 한곳에서 통제하기 위한 선택입니다.

## Current Status

- Next.js 16 + TypeScript + Tailwind v4 프로젝트 골격 구성
- 4개 백엔드 API 프록시 구성
- Axios API 클라이언트 레이어 구성
- NextAuth Google OAuth 설정
- 디자인 토큰 및 정적 홈 UI 구성
- 실제 데이터 홈 피드, 뉴스 상세, 브리핑, 북마크, AI Q&A는 구현 예정

## Docker

```bash
docker compose up --build
docker compose --profile dev up web-dev
```

헬스체크:

```bash
curl http://localhost:3000/api/health
```

## 네트워크 링크 감시

SSH 끊김 원인을 확인할 때 커널의 랜 링크 다운/업, 1Gbps/100Mbps downshift 로그를 실시간으로 감시합니다.

```bash
bash scripts/watch-network-link.sh
```

로그 파일:

```text
logs/network-link-watch.log
```

중지할 때는 `Ctrl+C`를 누릅니다.
# newron_web
