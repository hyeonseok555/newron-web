# Newron Web 디버깅 환경 가이드

> 작성일: 2026-06-08  
> 대상: Next.js 16 App Router + TypeScript + pnpm

---

## 1. 기본 실행

이 프로젝트의 `pnpm`은 전역 PATH에 등록되어 있지 않을 수 있습니다. 터미널을 새로 열면 먼저 아래 명령을 실행합니다.

```bash
export PATH="/home/hs-2/.local/share/pnpm/bin:$PATH"
```

개발 서버:

```bash
pnpm dev
```

접속 주소는 터미널 명령어가 아니라 브라우저 주소창에 입력합니다.

```text
http://localhost:3000
```

헬스체크:

```bash
curl http://localhost:3000/api/health
```

---

## 2. 자주 헷갈리는 실행 상황

### `rt PATH=...` 오류

`rt`는 명령어가 아닙니다. PATH 등록은 아래처럼 `export`로 실행합니다.

```bash
export PATH="/home/hs-2/.local/share/pnpm/bin:$PATH"
```

### `http://localhost:3000`을 터미널에 입력한 경우

URL은 셸 명령어가 아니므로 터미널에 직접 입력하면 `그런 파일이나 디렉터리가 없습니다`가 나옵니다. 아래 주소는 브라우저 주소창에 입력합니다.

```text
http://localhost:3000
```

터미널에서 서버 상태만 확인하려면 `curl`을 사용합니다.

```bash
curl http://localhost:3000/api/health
```

### `Another next dev server is already running`

이미 같은 프로젝트의 개발 서버가 떠 있다는 뜻입니다. 이 경우 새로 `pnpm dev`를 실행하지 않아도 됩니다.

먼저 헬스체크를 확인합니다.

```bash
curl http://localhost:3000/api/health
```

`{"status":"ok"}`가 나오면 기존 서버를 그대로 사용하면 됩니다. 브라우저에서 `http://localhost:3000`을 열면 됩니다.

서버를 완전히 재시작해야 할 때만 로그에 나온 PID를 종료합니다.

```bash
kill <PID>
pnpm dev
```

예시:

```bash
kill 2076865
pnpm dev
```

---

## 3. VS Code 디버깅

`.vscode/launch.json`에 다음 구성을 제공합니다.

| 구성 | 용도 |
|---|---|
| `Next.js: debug server` | 서버 컴포넌트, Route Handler, API 프록시 디버깅 |
| `Next.js: debug client` | 브라우저 UI, Client Component 디버깅 |
| `Next.js: full stack` | 서버와 브라우저를 함께 실행 |

권장 사용 순서:

1. VS Code의 Run and Debug 패널을 연다.
2. `Next.js: full stack`을 선택한다.
3. 서버 코드는 `app/api/*`, `auth.ts`, `lib/api/*`에 breakpoint를 둔다.
4. 클라이언트 코드는 `app/(main)/*`, `components/*`에 breakpoint를 둔다.

---

## 4. 명령어 기반 디버깅

서버 디버거 포트를 직접 열고 싶으면 아래 스크립트를 사용합니다.

```bash
pnpm dev:debug
```

Node inspector 기본 포트:

```text
9229
```

Chrome에서 직접 붙을 때:

```text
chrome://inspect
```

---

## 5. API 프록시 확인

브라우저는 외부 백엔드를 직접 호출하지 않고 Next.js 프록시만 호출해야 합니다.

```text
/api/proxy/main/*
/api/proxy/pers/*
/api/proxy/ai/*
/api/proxy/brief/*
```

예시:

```bash
curl "http://localhost:3000/api/proxy/main/categories"
```

SSE 응답은 `Content-Type: text/event-stream`을 유지해야 합니다.

---

## 6. 자주 보는 파일

| 파일 | 확인할 내용 |
|---|---|
| `app/api/proxy/[...path]/route.ts` | 프록시 URL, 헤더 전달, SSE 중계 |
| `lib/api/clients.ts` | SSR/CSR baseURL 분기, 인증 헤더 |
| `auth.ts` | Google OAuth, Newron 토큰 교환 |
| `app/globals.css` | 디자인 토큰, Tailwind utility |
| `next.config.ts` | standalone 빌드, 이미지 remotePatterns |

---

## 7. 디버깅 체크리스트

- `.env.local`에 `NEXTAUTH_SECRET`, API URL, Google OAuth 값이 있는지 확인한다.
- 로그인 문제는 `auth.ts`의 `jwt` 콜백과 `POST /auth/google` 응답을 먼저 본다.
- API 호출 문제는 브라우저 Network 탭에서 `/api/proxy/*`로 호출되는지 확인한다.
- 이미지가 보이지 않으면 `resolveImage.ts`와 `next.config.ts`의 `remotePatterns`를 확인한다.
- 홈 피드/북마크/추천 목록은 TanStack Query Devtools 도입 전까지 Network 탭과 console 로그로 확인한다.
- 서버 Route Handler breakpoint가 잡히지 않으면 `pnpm dev:debug` 또는 VS Code `Next.js: debug server`로 실행한다.
