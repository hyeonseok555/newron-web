# Newron Web

Android 앱 `newron-client-android_v1`의 웹 클라이언트. 새 백엔드나 DB를 구축하지 않고 기존 Newron API 서버 4개를 Next.js App Router로 연결하는 구조다.

---

## 기술 스택

| 분류 | 라이브러리 | 버전 |
|------|-----------|------|
| 프레임워크 | Next.js (App Router) | 16.2.7 |
| 언어 | TypeScript | ^5 |
| 스타일 | Tailwind CSS v4 | ^4 |
| UI 컴포넌트 | shadcn/ui + lucide-react | - |
| 인증 | NextAuth.js v5 beta | 5.0.0-beta.31 |
| HTTP | Axios | ^1.17 |
| 서버 상태 | TanStack Query | ^5.101 |
| 클라이언트 상태 | Zustand | ^5.0 |
| SSE | @microsoft/fetch-event-source | ^2.0 |
| 무한스크롤 | react-intersection-observer | ^10.0 |
| 토스트 | Sonner | ^2.0 |
| 린터 | Biome | ^2.4 |

기술 스택은 차후에 바뀔수있음 (기획의 방향에 따라 달라짐)

---

## 백엔드 서버 구조

| 이름 | 실제 URL | 프록시 경로 | 용도 |
|------|---------|-----------|------|
| 메인 | `https://newron.shop/api/v1/` | `/api/proxy/main/*` | 뉴스 피드, 검색, 인증, AI Q&A |
| 개인화 | `http://121.134.239.75:7000/` | `/api/proxy/pers/*` | 북마크, 히스토리, 추천, 통계 |
| AI 가속 | `http://121.134.239.75:8024/api/v1/` | `/api/proxy/ai/*` | AI 추천 질문 (SSE) |
| 브리핑 | `http://121.134.239.75:9000/` | `/api/proxy/brief/*` | AI 브리핑, 구독, 피드백 |

브라우저에서 HTTP 백엔드에 직접 접근하면 Mixed Content 에러가 발생하므로 **반드시 `/api/proxy/*` 경로를 통해야 한다**.

---

## 아키텍처

```
Browser
  └─ Next.js App Router (/api/proxy/*)
       ├─ main  →  https://newron.shop/api/v1/
       ├─ pers  →  http://121.134.239.75:7000/
       ├─ ai    →  http://121.134.239.75:8024/api/v1/  (SSE)
       └─ brief →  http://121.134.239.75:9000/
```

SSE(`text/event-stream`) 응답은 프록시에서 스트리밍으로 그대로 전달된다.

---

## 폴더 구조

```
newron-web/
├── app/
│   ├── (auth)/login/             # Google 로그인 페이지
│   ├── (main)/
│   │   ├── layout.tsx            # 하단 탭 네비게이션 (홈/브리핑/렌즈/북마크/프로필)
│   │   ├── page.tsx              # 홈 피드 (정적 목업 → API 교체 예정)
│   │   ├── news/[id]/            # 뉴스 상세 (SSR, 미구현)
│   │   ├── briefing/             # 브리핑 탭 (미구현)
│   │   ├── lens/                 # 렌즈 탭 (미구현)
│   │   ├── bookmarks/            # 북마크 (미구현)
│   │   ├── history/              # 히스토리 (미구현)
│   │   ├── profile/              # 프로필 (미구현)
│   │   └── settings/             # 설정 (미구현)
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth 핸들러
│   │   ├── proxy/[...path]/      # 4개 백엔드 CORS 프록시
│   │   └── health/               # Docker 헬스체크
│   ├── globals.css               # 브랜드 디자인 토큰 (Tailwind @theme)
│   └── layout.tsx                # 루트 레이아웃
├── components/
│   ├── ui/                       # shadcn/ui 기본 컴포넌트 (button, card, skeleton 등 10종)
│   ├── news/                     # 뉴스 카드, 목록 컴포넌트 (미구현)
│   ├── ai/                       # AI Q&A 패널 컴포넌트 (미구현)
│   └── briefing/                 # 브리핑 컴포넌트 (미구현)
├── lib/
│   ├── api/
│   │   ├── clients.ts            # Axios 인스턴스 4개 (SSR/CSR 자동 분기)
│   │   ├── news.ts               # 뉴스/검색/AI Q&A/북마크/히스토리/통계
│   │   ├── briefing.ts           # 브리핑/구독/피드백
│   │   └── auth.ts               # Google 토큰 교환
│   ├── hooks/                    # 커스텀 훅 (미구현)
│   ├── resolveImage.ts           # 이미지 URL 정규화 + 카테고리 폴백
│   ├── guestId.ts                # 비로그인 UUID 관리 (localStorage)
│   └── utils.ts                  # clsx + tailwind-merge 유틸
├── store/                        # Zustand 스토어 (미구현)
├── types/
│   ├── api.ts                    # MainResponse<T>, PersResponse<T>
│   ├── news.ts                   # NewsItem, NewsDetail, Briefing 등
│   └── next-auth.d.ts            # Session/JWT 타입 확장
├── scripts/
│   └── watch-network-link.sh     # LAN 링크 다운/속도 저하 감시
├── logs/                         # 런타임 로그 (gitignored)
├── docs/planning/                # 기획 문서
│   ├── product-plan.md
│   ├── why-this-stack.md
│   └── debugging-environment.md
├── daily_reports/                # 세션별 작업 기록
│   └── docs/
│       ├── web-design-spec.md    # API 명세 + Android 디자인 시스템
│       └── tech-stack-report.md
├── auth.ts                       # NextAuth 설정 (Google OAuth)
├── Dockerfile
├── docker-compose.yml
└── .env.example                  # 환경 변수 템플릿
```

---

## 개발 환경 설정

### 환경 변수

`.env.example`을 복사해 `.env.local`을 생성한다.

```bash
cp .env.example .env.local
```

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<임의 문자열>
AUTH_GOOGLE_ID=<Google Cloud Console 발급>
AUTH_GOOGLE_SECRET=<Google Cloud Console 발급>
MAIN_API_URL=https://newron.shop/api/v1
PERS_API_URL=http://121.134.239.75:7000
AI_API_URL=http://121.134.239.75:8024/api/v1
BRIEF_API_URL=http://121.134.239.75:9000
```

> `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`은 [Google Cloud Console](https://console.cloud.google.com/)에서 발급받아야 로그인이 활성화된다.

### pnpm 경로 등록

```bash
export PATH="/home/hs-2/.local/share/pnpm/bin:$PATH"
```

PATH에 자동 등록되지 않으므로 터미널 명령 실행 전 위 export를 먼저 실행한다.

### 개발 서버 실행

```bash
pnpm dev
# → http://localhost:3000
```

외부 디바이스에서 접속할 때:

```bash
pnpm dev --hostname 0.0.0.0
# → http://192.168.0.13:3000 (LAN)
# → http://100.76.147.3:3000  (Tailscale)
```

### 헬스체크

```bash
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"..."}
```

### 기타 명령어

```bash
pnpm build        # .next/ 프로덕션 빌드
pnpm start        # 프로덕션 서버
pnpm dev:debug    # 디버그 모드 (NODE_OPTIONS=--inspect)
pnpm typecheck    # tsc --noEmit
```

---

## Docker

```bash
# 프로덕션
docker compose up --build

# 개발 (핫리로드)
docker compose --profile dev up web-dev

# 헬스체크
curl http://localhost:3000/api/health
```

---

## 인증 흐름

1. `/login` → "Google로 시작하기" 클릭
2. Google OAuth → `id_token` 수신
3. NextAuth `jwt` 콜백에서 `POST /auth/google` → newron 서버 토큰 교환
4. `newron_access_token` + `user_id` → Session 저장
5. 이후 API 요청에 Bearer 토큰 자동 첨부 (`lib/api/clients.ts` 인터셉터)

**게스트 모드**: 비로그인 시 `lib/guestId.ts`가 `crypto.randomUUID()`를 localStorage에 저장해 `user_id`로 사용.

---

## 구현 현황

### 완료

| 항목 | 비고 |
|------|------|
| Next.js 16 + TypeScript + Tailwind v4 세팅 | |
| 4개 백엔드 CORS 프록시 | SSE 스트리밍 포함 |
| Axios 클라이언트 4개 + 인증 인터셉터 | SSR/CSR 자동 분기 |
| API 함수 레이어 | news, briefing, auth |
| NextAuth Google OAuth + newron 토큰 교환 | |
| 게스트 UUID 관리 | |
| 브랜드 디자인 토큰 | Android Color.kt 기반 CSS 변수 |
| 타입 정의 | api.ts, news.ts, next-auth.d.ts |
| 이미지 URL 정규화 유틸 | |
| 헬스체크 엔드포인트 | |
| 로그인 페이지 UI | |
| 하단 탭 네비게이션 레이아웃 | |
| 홈 피드 정적 목업 | 하드코딩 데이터 |
| shadcn/ui 기본 컴포넌트 10종 | button, card, skeleton 등 |
| Docker 설정 | 멀티스테이지 빌드 |
| VS Code 디버깅 환경 | launch.json |

### 미완료

| 항목 | 우선순위 |
|------|---------|
| 홈 피드 실제 API 연동 (`/news`, `/categories`) | 높음 |
| TanStack Query Provider + 홈 피드 쿼리 | 높음 |
| 뉴스 카드 / 스켈레톤 UI 컴포넌트 | 높음 |
| Zustand 스토어 (`audioStore`, `authStore`) | 높음 |
| 뉴스 상세 페이지 (SSR + TTS) | 중간 |
| AI Q&A 패널 (SSE 스트리밍) | 중간 |
| 브리핑 탭 | 중간 |
| 북마크 / 히스토리 / 프로필 페이지 | 낮음 |
| Google OAuth 클라이언트 발급 | 선행 조건 |

---

## 기획 문서

| 문서 | 링크 |
|------|------|
| 서비스 기획서 | [docs/planning/product-plan.md](./docs/planning/product-plan.md) |
| 기술 스택 선택 근거 | [docs/planning/why-this-stack.md](./docs/planning/why-this-stack.md) |
| 디버깅 환경 가이드 | [docs/planning/debugging-environment.md](./docs/planning/debugging-environment.md) |
| API/디자인 명세 | [daily_reports/docs/web-design-spec.md](./daily_reports/docs/web-design-spec.md) |
| 기술 스택 보고서 | [daily_reports/docs/tech-stack-report.md](./daily_reports/docs/tech-stack-report.md) |

---

## 네트워크 링크 감시

SSH 끊김이나 LAN 속도 저하(100Mbps downshift) 추적용 스크립트.

```bash
bash scripts/watch-network-link.sh
# 로그: logs/network-link-watch.log
```
