# CLAUDE.md — newron-web

## 프로젝트 개요

Android 앱(newron-client-android_v1)의 웹 버전. DB 없이 기존 4개 백엔드 API를 그대로 사용한다.
디자인 시스템 및 API 명세: `daily_reports/docs/web-design-spec.md`

---

## 기술 스택

| 분류 | 라이브러리 | 버전 |
|------|-----------|------|
| 프레임워크 | Next.js (App Router) | 16.2.7 |
| 언어 | TypeScript | ^5 |
| 스타일 | Tailwind CSS v4 | ^4 |
| 인증 | NextAuth.js v5 beta | 5.0.0-beta.31 |
| HTTP | Axios | ^1.17 |
| 서버 상태 | TanStack Query | ^5.101 |
| 클라이언트 상태 | Zustand | ^5.0 |
| SSE | @microsoft/fetch-event-source | ^2.0 |
| 무한스크롤 | react-intersection-observer | ^10.0 |
| 린터 | Biome | ^2.4 |

---

## 개발 환경

### pnpm 경로 (PATH 미등록)

```bash
export PATH="/home/hs-2/.local/share/pnpm/bin:$PATH"
```

터미널 명령 실행 전 항상 위 export를 먼저 실행해야 한다.

### 주요 명령어

```bash
pnpm dev          # 개발 서버 → http://localhost:3000
pnpm build        # .next/ 빌드
pnpm start        # 프로덕션 서버
pnpm add <pkg>    # 패키지 설치
```

### Docker

```bash
docker compose up --build                    # 프로덕션
docker compose --profile dev up web-dev      # 개발(핫리로드)
curl http://localhost:3000/api/health        # 헬스체크
```

### pnpm-workspace.yaml 주의사항

`onlyBuiltDependencies: [sharp, unrs-resolver]`만 유지. `allowBuilds` 키를 넣으면 YAML 파싱 에러가 발생한다.

---

## 백엔드 서버 구조

| 이름 | 실제 URL | 프록시 경로 | 용도 |
|------|---------|-----------|------|
| 메인 | `https://newron.shop/api/v1/` | `/api/proxy/main/*` | 뉴스 피드, 검색, 인증, AI Q&A |
| 개인화 | `http://121.134.239.75:7000/` | `/api/proxy/pers/*` | 북마크, 히스토리, 추천, 통계 |
| AI 가속 | `http://121.134.239.75:8024/api/v1/` | `/api/proxy/ai/*` | AI 추천 질문 (SSE) |
| 브리핑 | `http://121.134.239.75:9000/` | `/api/proxy/brief/*` | AI 브리핑, 구독, 피드백 |

브라우저에서 HTTP 백엔드에 직접 접근하면 Mixed Content 에러가 발생하므로 **반드시 프록시 경로를 통해야 한다**.
SSE(`text/event-stream`) 응답은 프록시에서 스트리밍으로 그대로 전달된다.

---

## 폴더 구조

```
newron-web/
├── app/
│   ├── (auth)/login/page.tsx              # Google 로그인 페이지
│   ├── (main)/
│   │   ├── layout.tsx                     # 하단 탭 네비게이션 (홈/브리핑/렌즈/북마크/프로필)
│   │   ├── page.tsx                       # 홈 피드 (플레이스홀더)
│   │   ├── news/[id]/                     # 뉴스 상세 (SSR)
│   │   ├── briefing/, lens/
│   │   ├── bookmarks/, history/
│   │   └── profile/, settings/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # NextAuth 핸들러
│   │   ├── proxy/[...path]/route.ts       # CORS 프록시 (4개 백엔드)
│   │   └── health/route.ts               # Docker 헬스체크
│   ├── globals.css                        # 브랜드 디자인 토큰 (Tailwind @theme)
│   └── layout.tsx                         # 루트 레이아웃
├── lib/
│   ├── api/
│   │   ├── clients.ts    # Axios 인스턴스 4개 (SSR/CSR 자동 분기)
│   │   ├── news.ts       # 뉴스/검색/AI Q&A/북마크/히스토리/통계
│   │   ├── briefing.ts   # 브리핑/구독/피드백
│   │   └── auth.ts       # Google 토큰 교환 API
│   ├── resolveImage.ts   # 이미지 URL 정규화 + 카테고리 폴백
│   └── guestId.ts        # 비로그인 UUID 관리 (localStorage)
├── types/
│   ├── api.ts            # MainResponse<T>, PersResponse<T>
│   ├── news.ts           # NewsItem, NewsDetail, Briefing 등
│   └── next-auth.d.ts    # Session/JWT 타입 확장
├── store/                # Zustand 스토어 (미구현)
├── components/           # UI 컴포넌트 (미구현)
├── auth.ts               # NextAuth 설정 (Google OAuth)
├── daily_reports/
│   ├── docs/
│   │   ├── web-design-spec.md    # API 명세 + 디자인 시스템
│   │   └── tech-stack-report.md  # 기술 스택 결정 보고서
│   └── YYYY-MM-DD.md             # 데일리 작업 기록
├── Dockerfile
├── docker-compose.yml
├── .env.example          # 환경 변수 템플릿 (커밋됨)
└── .env.local            # 실제 환경 변수 (gitignore)
```

---

## 인증 흐름 (NextAuth v5)

1. `/login` 페이지 → "Google로 시작하기" 클릭
2. Google OAuth → `id_token` 수신
3. NextAuth `jwt` 콜백에서 `POST /auth/google` → newron 서버 토큰 교환
4. `newron_access_token` + `user_id` → Session에 저장
5. 이후 API 요청에 Bearer 토큰 자동 첨부 (`clients.ts` 인터셉터)

**게스트 모드**: 비로그인 사용자는 `lib/guestId.ts`가 `crypto.randomUUID()`를 localStorage에 저장해 `user_id`로 사용.

---

## API 클라이언트 (`lib/api/clients.ts`)

- SSR 환경: `process.env.*`로 백엔드 직접 접근
- CSR 환경: `/api/proxy/*` 경유 (Mixed Content 방지)
- 인증 인터셉터: `sessionStorage`의 `newron_access_token` 자동 주입

---

## 디자인 토큰

`app/globals.css`에 CSS 변수로 정의 → Tailwind v4 `@theme` 블록으로 유틸리티 클래스 연결.

- 컬러: `bg-brand-navy`, `text-brand-muted` 등 (Android `Color.kt` 기준)
- 타이포그래피: `text-brand-headline`, `text-brand-preview` 등
- 다크모드: `@media (prefers-color-scheme: dark)` 자동 대응
- 라운딩: `rounded-card` 등

---

## 환경 변수

```
NEXTAUTH_URL
NEXTAUTH_SECRET
AUTH_GOOGLE_ID       ← Google Cloud Console 발급 필요 (미완)
AUTH_GOOGLE_SECRET   ← Google Cloud Console 발급 필요 (미완)
MAIN_API_URL
PERS_API_URL
AI_API_URL
BRIEF_API_URL
```

---

## 현재 구현 상태

### 완료

- 프로젝트 스캐폴딩 (Next.js 16 + TypeScript + Tailwind v4)
- Docker 설정 (멀티스테이지 빌드, 개발/프로덕션 프로파일)
- 4개 백엔드 CORS 프록시 (`app/api/proxy/[...path]/route.ts`)
- Axios 클라이언트 4개 + 인증 인터셉터
- API 함수 레이어 (뉴스, 브리핑, 인증)
- NextAuth Google OAuth + newron 토큰 교환
- 게스트 UUID 관리
- 브랜드 디자인 토큰 (CSS 변수 → Tailwind)
- 타입 정의 (api.ts, news.ts, next-auth.d.ts)
- 이미지 URL 정규화 유틸
- 헬스체크 엔드포인트
- 로그인 페이지 UI
- 하단 탭 네비게이션 레이아웃

### 미완료 (다음 작업)

- Google Cloud Console OAuth 클라이언트 발급 → `.env.local` 입력
- `store/` Zustand 스토어 구현
- `components/` UI 컴포넌트 (뉴스 카드, 탭, 스켈레톤 등)
- 홈 피드 무한스크롤 구현
- 뉴스 상세 페이지 (SSR + TTS)
- AI Q&A 패널 (SSE 스트리밍)
- 브리핑 탭

---

## 데일리 리포트 규칙

- 작업 후 `daily_reports/YYYY-MM-DD.md`에 기록
- 작성자 표기: `작성자: 클로드코드` 또는 `작성자: 코덱스`
- 기존 파일이 있으면 아래에 추가, 없으면 새로 생성

# [저장] 현재 세션 작업 내역 저장
현재까지 작업 내용들을 면밀히 기록해서 데일리 리포트 폴더에 오늘 날짜로된 파일이 먼저 있는지 확인하고 있다면 기록을 밑으로 추가해서 기록하고 없다면 새로 만들어서 작업해줘
기록 할 땐 지금까지의 작업을 카테고리화 시켜서 시간 순차별로 작성해서 빠짐없이 기록해야해
그리고 클로드, 코덱스를 같이 사용함으로 작업자가 누군지 알려야해
작성자: 클로드코드 or 작성자: 코덱스이런식으로

# [불러오기] WEB 이전 세션 작업 내역 확인 
데일리 리포트 파일을 확인해서 이전 세션 대화내역을 파악하고 어떤 작업이 이루어졌는지 확인해볼래? 
코덱스, 클로드 코드 작성자는 같은 작업을 하는거고 나눠논 이유는 토큰값때문에 그런거니 가리지말고 참고해줘
