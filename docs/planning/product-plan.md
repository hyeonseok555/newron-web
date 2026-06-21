# Newron Web 서비스 기획서

> 작성일: 2026-06-08  
> 대상 프로젝트: Android 앱 `newron-client-android_v1`의 웹 클라이언트 전환  
> 참고 문서: `daily_reports/docs/web-design-spec.md`, `daily_reports/docs/tech-stack-report.md`

---

## 1. 기획 배경

Newron은 AI 기반 뉴스 소비 경험을 제공하는 서비스입니다. 기존 Android 앱은 뉴스 피드, 기사 상세, TTS 청취, AI Q&A, 개인화 추천, 브리핑, 북마크/히스토리 기능을 이미 백엔드 API로 제공하고 있습니다.

웹 프로젝트의 목적은 새 서비스를 처음부터 다시 만드는 것이 아니라, 기존 모바일 앱의 핵심 가치를 웹 환경으로 확장하는 것입니다. 따라서 이번 웹 버전은 별도 DB나 신규 백엔드 구축보다, 이미 운영 중인 4개 서버를 안정적으로 연결하는 클라이언트 앱으로 기획합니다.

---

## 2. 제품 목표

1. 사용자가 웹에서도 최신 뉴스와 개인화 추천을 빠르게 탐색한다.
2. 뉴스 상세 페이지는 검색/공유에 유리한 웹 문서로 제공한다.
3. AI Q&A, 추천 질문, 브리핑처럼 Newron만의 지능형 기능을 웹에서도 사용할 수 있게 한다.
4. Android 앱의 브랜드 톤과 정보 구조를 유지하면서, 웹 화면 크기에 맞는 탐색 경험을 제공한다.

---

## 3. 이번 웹 버전이 해결해야 하는 문제

| 문제 | 웹에서의 해결 방향 |
|---|---|
| 앱 설치 없이 Newron 콘텐츠를 확인하기 어렵다 | 브라우저 접근 가능한 홈/상세/브리핑 화면 제공 |
| 뉴스 상세가 검색/공유에 취약하다 | SSR 기반 상세 페이지와 메타데이터 구성 |
| 여러 백엔드 서버가 흩어져 있다 | Next.js API Route Handler 프록시로 단일 진입점 제공 |
| HTTP 백엔드와 HTTPS 웹 간 Mixed Content/CORS 위험이 있다 | 브라우저는 `/api/proxy/*`만 호출하도록 제한 |
| 개인화 기능은 로그인/게스트 상태를 모두 고려해야 한다 | NextAuth + 게스트 UUID 전략 병행 |

---

## 4. 사용자와 주요 시나리오

### 주요 사용자

- 빠르게 주요 뉴스를 훑고 싶은 일반 사용자
- 관심 주제 기반으로 추천 뉴스를 보고 싶은 반복 사용자
- 기사 내용을 읽는 대신 듣거나 AI에게 질문하고 싶은 사용자
- 앱 설치 전 웹에서 서비스 품질을 확인하려는 신규 사용자

### 핵심 사용자 흐름

1. 홈에서 최신/추천 뉴스 피드를 탐색한다.
2. 카테고리 또는 검색으로 관심 뉴스를 찾는다.
3. 뉴스 상세에서 본문, 이미지, 원문 링크, TTS 스크립트를 확인한다.
4. 기사 맥락이 어려우면 AI Q&A 또는 추천 질문을 사용한다.
5. 마음에 드는 기사는 북마크하고, 읽기 히스토리는 추천 품질 개선에 사용한다.
6. 브리핑 탭에서 개인화된 요약/구독형 콘텐츠를 확인한다.

---

## 5. 기능 범위

| 영역 | 기능 | 우선순위 |
|---|---|---|
| 홈 | 최신 뉴스 피드, 카테고리 필터, 무한스크롤 | 높음 |
| 뉴스 상세 | SSR 상세, 이미지 처리, 원문 링크, TTS 스크립트 표시 | 높음 |
| 인증 | Google OAuth, Newron 토큰 교환, 세션 유지 | 높음 |
| 개인화 | 게스트 UUID, 북마크, 읽기 히스토리 | 높음 |
| AI | 기사 기반 Q&A, 추천 질문 SSE | 중간 |
| 브리핑 | 브리핑 목록, 구독/피드백 | 중간 |
| 프로필 | 사용자 정보, 통계, 최근 읽은 뉴스 | 중간 |

후순위 기능은 자체 관리자 페이지, 신규 백엔드/DB 설계, 결제, 푸시 알림, 고도화된 A/B 테스트입니다.

---

## 6. 왜 현재 기술 스택인가

이번 프로젝트의 기술 선택은 **"새 백엔드를 만들지 않고, 기존 4개 API 서버를 웹에 안정적으로 연결한다"** 는 기획에서 출발합니다. 이 전제가 스택 선택의 대부분을 결정합니다.

### 6-1. Next.js App Router — SSR이 필요한 페이지와 CSR이 필요한 페이지가 섞여 있다

뉴스 서비스는 두 가지 상반된 요구가 동시에 존재합니다.

| 페이지 | 방식 | 이유 |
|---|---|---|
| `/news/[id]` 뉴스 상세 | **SSR 필수** | 검색엔진 노출, OG 태그(카카오/Twitter 미리보기) |
| `/` 홈 피드 | **CSR 필수** | `user_id` 기반 개인화 → 서버에서 미리 렌더링 불가 |
| `/briefing` | **CSR 필수** | 당일 22시 생성 여부 분기 처리가 필요 |

React 단독(Vite/CRA)이면 SSR 불가, Express+React면 구성이 복잡해집니다. Next.js App Router는 **페이지별로 SSR/CSR을 자유롭게 섞을 수 있어** 이 요구를 가장 깔끔하게 해결합니다.

### 6-2. CORS 프록시 (`/api/proxy/*`) — 브라우저가 HTTP 서버에 직접 붙을 수 없다

개인화/AI/브리핑 서버가 `http://` (비암호화) 주소입니다. `https://` 사이트에서 `http://` 리소스를 불러오면 브라우저가 **Mixed Content 에러**로 차단합니다.

```
브라우저 → /api/proxy/pers/* → http://121.134.239.75:7000/   ✅
브라우저 → http://121.134.239.75:7000/ (직접)                ❌ Mixed Content
```

Next.js Route Handler를 프록시로 두면 서버사이드에서 HTTP 요청을 처리하고 브라우저는 HTTPS만 봅니다. SSE(`text/event-stream`)도 그대로 스트리밍 전달됩니다.

### 6-3. Axios + TanStack Query — 4개 서버, 응답 포맷이 제각각이다

4개 서버의 응답 형태가 다릅니다.

```
메인 서버:    { status: "success", data: [...], meta: { has_next: true } }
개인화 서버:  { code: 200, result: [...] }
```

Axios 인스턴스를 서버별로 4개 만들고 공통 인터셉터로 인증 헤더를 주입하면, 호출 코드에서 서버 차이를 신경 쓸 필요가 없습니다. TanStack Query는 무한스크롤(`useInfiniteQuery`)과 북마크 낙관적 업데이트(`useMutation + onMutate`)를 네이티브로 지원해 직접 구현하면 수백 줄이 될 로직을 몇 줄로 끝냅니다.

### 6-4. NextAuth.js v5 — Google OAuth → newron 자체 토큰 교환이라는 2단계 인증

일반적인 Google 로그인은 Google 토큰만 쓰면 끝입니다. 이 앱은 Google `id_token`을 newron 서버에 보내 자체 `access_token`으로 교환하는 과정이 추가됩니다.

```
Google OAuth → id_token → POST /auth/google → newron access_token + user_id
```

NextAuth `jwt` 콜백 안에서 이 교환 과정을 처리하고 Session에 `newron_access_token`을 담아두면, 이후 모든 API 요청에서 Bearer 토큰이 자동으로 붙습니다. 이 2단계 흐름을 직접 구현하면 복잡하지만, NextAuth가 콜백 구조로 자연스럽게 수용합니다.

### 6-5. Zustand — TanStack Query가 담당하지 않는 클라이언트 전역 상태

TanStack Query는 서버 상태(API 데이터)를 관리합니다. **오디오 재생 상태**(현재 재생 중인 뉴스, 문단 인덱스, 재생/일시정지)는 서버와 무관한 클라이언트 전역 상태입니다.

```
audioStore: { currentNewsId, currentParagraph, isPlaying, play(), pause() }
```

Redux 대비 보일러플레이트가 없고, Context API 대비 리렌더 범위 제어가 정밀합니다.

### 6-6. `@microsoft/fetch-event-source` — 브라우저 기본 `EventSource`의 한계

AI Q&A와 AI Lens는 SSE(`text/event-stream`)로 답변이 스트리밍됩니다. 브라우저 기본 `EventSource`는 **GET 요청만 지원**해 `Authorization` 헤더 전송이 불가하고, 에러 핸들링과 재연결 제어가 제한적입니다. `@microsoft/fetch-event-source`는 Fetch API 기반이라 **POST + 커스텀 헤더 + 중단 제어**가 모두 가능합니다.

### 6-7. Tailwind CSS v4 + CSS Variables — Android 디자인 토큰을 그대로 가져온다

Android 앱의 `Color.kt`에 정의된 컬러 시스템을 CSS 변수로 한 번만 정의하면, Tailwind 유틸리티(`bg-brand-navy`)와 다크모드(`@media prefers-color-scheme: dark`) 양쪽에서 자동으로 작동합니다. Android → 웹 디자인 일관성을 CSS 변수 하나로 유지하는 구조입니다.

### 6-8. 전체 기술 스택 목록

#### 프레임워크 / 언어

| 분류 | 라이브러리 | 버전 | 용도 |
|---|---|---|---|
| 프레임워크 | Next.js (App Router) | 16.2.7 | SSR + CSR 혼용, Route Handler 프록시 |
| 언어 | TypeScript | ^5 | API 응답 타입 안정성, 팀 협업 |
| 런타임 | Node.js | 22 (LTS) | Next.js 서버 실행 환경 |

#### 스타일 / UI

| 분류 | 라이브러리 | 버전 | 용도 |
|---|---|---|---|
| 스타일 | Tailwind CSS v4 | ^4 | 유틸리티 클래스, 브랜드 디자인 토큰 연결 |
| 컴포넌트 | shadcn/ui | latest | Tailwind 기반 헤드리스 UI 컴포넌트 |

#### 인증

| 분류 | 라이브러리 | 버전 | 용도 |
|---|---|---|---|
| 인증 | NextAuth.js v5 beta | 5.0.0-beta.31 | Google OAuth + newron 2단계 토큰 교환 |

#### 데이터 / 상태 관리

| 분류 | 라이브러리 | 버전 | 용도 |
|---|---|---|---|
| HTTP 클라이언트 | Axios | ^1.17 | 4개 서버별 인스턴스 + 인증 인터셉터 |
| 서버 상태 | TanStack Query | ^5.101 | 캐싱, 무한스크롤, 낙관적 업데이트 |
| 클라이언트 상태 | Zustand | ^5.0 | TTS 오디오 재생 상태, 전역 UI 상태 |

#### 실시간 / 스트리밍

| 분류 | 라이브러리 | 버전 | 용도 |
|---|---|---|---|
| SSE | @microsoft/fetch-event-source | ^2.0 | AI Q&A, AI Lens SSE 스트리밍 (인증 헤더 포함) |

#### 기타 기능

| 분류 | 라이브러리 | 버전 | 용도 |
|---|---|---|---|
| 무한스크롤 트리거 | react-intersection-observer | ^10.0 | 뉴스 피드 무한스크롤 뷰포트 감지 |
| 오디오 | HTML5 Audio API + Custom Hook | 브라우저 네이티브 | TTS 재생 + 문단 하이라이트 |

#### 개발 도구 / 인프라

| 분류 | 라이브러리 | 버전 | 용도 |
|---|---|---|---|
| 린터/포맷터 | Biome | ^2.4 | ESLint + Prettier 대체, 빠른 정적 분석 |
| 패키지 관리 | pnpm | latest | 빠른 설치, 디스크 효율 |
| 컨테이너 | Docker + docker-compose | - | 멀티스테이지 빌드, 개발/프로덕션 프로파일 분리 |
| IDE 디버깅 | VS Code launch.json | - | 서버/클라이언트/풀스택 디버깅 구성 |

---

### 6-9. 요약표

| 선택 | 선택 이유 | 기획과의 연결 |
|---|---|---|
| Next.js App Router | SSR과 CSR을 한 프로젝트에서 분리 운영 가능 | 뉴스 상세는 SSR, 홈/개인화는 CSR |
| TypeScript | API 응답 타입과 화면 상태를 명확히 관리 | 서버 4개, 응답 포맷이 달라 타입 안정성이 중요 |
| Tailwind CSS v4 + CSS Variables | Android 디자인 토큰을 웹 토큰으로 그대로 연결 | 앱과 웹의 브랜드 일관성 유지 |
| shadcn/ui | Tailwind 기반 커스터마이징, 소유권이 코드에 남음 | 뉴스/브리핑 UI를 제품 톤에 맞게 조정 가능 |
| Axios | 서버별 인스턴스와 인터셉터 구성이 단순 | main/pers/ai/brief API를 명확히 분리 |
| TanStack Query | 캐싱, 무한스크롤, 낙관적 업데이트에 강함 | 뉴스 피드, 북마크, 추천 목록에 적합 |
| NextAuth.js v5 | Google OAuth + 2단계 토큰 교환 흐름 수용 | newron access_token 교환 후 세션 유지 |
| Zustand | 오디오 재생, UI 전역 상태를 가볍게 관리 | TTS 플레이어와 전역 UI 상태에 적합 |
| fetch-event-source | SSE 스트리밍 + 인증 헤더 전송 가능 | AI 추천 질문/응답 스트리밍에 적합 |
| Docker | 개발/운영 환경 차이를 줄임 | API 프록시와 환경 변수 검증을 반복 가능하게 함 |
| pnpm | 빠른 설치와 효율적인 디스크 사용 | 소규모 팀에서 반복 설치/빌드 비용 절감 |

---

## 7. 아키텍처 방향

```text
Browser
  -> Next.js App
  -> /api/proxy/{main|pers|ai|brief}
  -> Existing Newron APIs
```

브라우저는 외부 API 서버를 직접 호출하지 않습니다. 모든 요청은 Next.js 프록시를 통과합니다. 이 구조는 CORS, Mixed Content, 인증 헤더 전달, SSE 중계를 한곳에서 통제하기 위한 선택입니다.

| 화면 | 렌더링 | 이유 |
|---|---|---|
| 홈 피드 | CSR | 사용자/카테고리/무한스크롤 상태에 따라 계속 변함 |
| 뉴스 상세 | SSR | 검색 노출, 공유 미리보기, 초기 로딩 안정성 |
| 로그인 | CSR 중심 | OAuth 버튼과 세션 상태 중심 |
| 브리핑/북마크/프로필 | CSR | 사용자 ID와 세션에 따라 데이터가 달라짐 |

---

## 8. 정보 구조

```text
/
  홈 피드
/news/[id]
  뉴스 상세
/briefing
  AI 브리핑
/lens
  AI Lens
/bookmarks
  북마크
/history
  읽기 기록
/profile
  프로필/통계
/settings
  설정
/login
  Google 로그인
```

모바일 웹에서는 하단 탭을 유지하고, 데스크톱에서는 상단 네비게이션과 넓은 그리드 레이아웃을 사용합니다.

---

## 9. 개발 단계

1. 기반 정리: 기획서, 디버깅 환경, README, 프록시 오류 처리
2. 실제 데이터 홈 피드: `/news`, `/categories`, 무한스크롤, 이미지 정규화
3. 상세/개인화: `/news/[id]`, 북마크, 읽기 히스토리, 게스트/로그인 분기
4. AI/브리핑: AI Q&A, SSE 추천 질문, 브리핑, 사용자 피드백

---

## 10. 성공 기준

| 기준 | 목표 |
|---|---|
| 홈 첫 로딩 | 주요 뉴스가 빠르게 표시되고 스켈레톤/에러 상태가 명확함 |
| 상세 공유 | 뉴스 상세 URL만으로 제목/요약/이미지 맥락 전달 |
| API 안정성 | 4개 서버 장애가 화면 전체 장애로 번지지 않음 |
| 개인화 | 게스트도 기본 사용 가능, 로그인 시 북마크/통계 연결 |
| 유지보수 | API, UI, 상태 관리 경계가 분리되어 기능 추가가 쉬움 |

---

## 11. 현재 상태 요약

현재 프로젝트는 Next.js 골격, API 프록시, Axios 클라이언트, NextAuth 설정, 디자인 토큰, 정적 홈 UI까지 구성되어 있습니다. 아직 실제 데이터 홈 피드, 뉴스 상세, 북마크 화면, 브리핑 화면, AI Q&A UI는 본격 구현 전입니다.

다음 작업은 기획서 기준에 맞춰 디버깅 환경을 먼저 갖춘 뒤, 홈 피드를 실제 API 기반으로 교체하는 것입니다.

