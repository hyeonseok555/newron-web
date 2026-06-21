# Why This Stack — 아키텍처 기획자를 위한 기술 선택 근거

> "왜 이 기술을 썼어요?" 라는 질문에 답하기 위한 문서  
> 각 결정은 이 프로젝트의 **핵심 제약**에서 시작한다:  
> **"새 백엔드 없이, 기존 4개 서버를 웹에 연결하는 클라이언트만 만든다"**

---

## 핵심 제약 요약

```
제약 1: 4개 백엔드 서버가 이미 존재하고, 그대로 쓴다
제약 2: 3개 서버가 http:// (비암호화) → 브라우저 직접 접근 불가
제약 3: 뉴스 상세는 검색 노출 필요 (SSR) + 홈은 개인화 (CSR) → 혼재
제약 4: Google 로그인 → newron 자체 토큰 교환 2단계 인증
제약 5: AI Q&A가 SSE 스트리밍으로 답변 (인증 헤더 필요)
제약 6: TTS 오디오 재생 상태가 앱 전역에서 공유됨
```

이 6개 제약이 스택 선택의 거의 전부를 결정한다.

---

## 1. Next.js App Router

### 이 프로젝트의 문제

뉴스 서비스는 두 가지 상반된 렌더링이 필요하다.

| 페이지 | 필요한 방식 | 이유 |
|---|---|---|
| `/news/[id]` 뉴스 상세 | **SSR** | Google 검색 노출, 카카오/Twitter 공유 미리보기 |
| `/` 홈 피드 | **CSR** | `user_id` 기반 개인화 → 서버가 미리 렌더링할 수 없음 |
| `/briefing` | **CSR** | 매일 22시 생성 여부 분기, 사용자별 구독 상태 |

### 대안과 왜 안 되나

| 대안 | 실패 이유 |
|---|---|
| **React SPA (Vite)** | SSR 없음 → 뉴스 상세를 Google이 크롤링 못 함. `<title>` + OG 태그 동적 생성 불가 |
| **Express + React** | SSR 직접 구현 필요 (스트리밍, 라우팅, 코드스플리팅을 전부 손으로). 인력 대비 비용 큼 |
| **Remix** | App Router와 유사하게 SSR 지원하나, 팀 기반이 React 위주라면 Next.js가 레퍼런스가 많음. 프록시 Route Handler도 Next.js 방식이 더 직관적 |
| **Gatsby** | 정적 사이트 생성기 → 실시간 뉴스, 개인화 피드에 근본적으로 맞지 않음 |

### 한 줄 결론

> SSR과 CSR이 한 앱에 섞여 있고, 서버사이드 API 프록시까지 필요한 구조는 **Next.js App Router가 가장 자연스럽게 지원하는 형태**다.

---

## 2. CORS 프록시 (`/api/proxy/*`)

### 이 프로젝트의 문제

```
개인화 서버:  http://121.134.239.75:7000/   ← HTTP
AI 서버:      http://121.134.239.75:8024/   ← HTTP
브리핑 서버:  http://121.134.239.75:9000/   ← HTTP
```

웹 앱은 `https://` 로 서빙된다. 브라우저는 HTTPS 페이지에서 HTTP 리소스를 가져오는 것을 **Mixed Content**로 차단한다. 코드를 아무리 잘 짜도 브라우저가 요청 자체를 막는다.

```
브라우저 → https://newron.shop (웹)
         → http://121.134.239.75:7000 (개인화 서버)  ❌ 브라우저 차단
```

### 대안과 왜 안 되나

| 대안 | 실패 이유 |
|---|---|
| **백엔드에 CORS 헤더 추가** | 백엔드 서버 설정 변경 권한 필요. 근본 문제(HTTP)는 해결 안 됨 |
| **백엔드를 HTTPS로 전환** | 서버 인증서, nginx 설정 필요 → 기존 서버 수정이 전제 조건 (이 프로젝트의 제약 위반) |
| **Nginx 리버스 프록시 별도 구축** | 추가 서버 인프라 관리 필요. Next.js Route Handler가 이미 서버 역할을 하는데 중복 |

### 해결 원리

```
브라우저 → https://웹서버/api/proxy/pers/*  (HTTPS, 브라우저 허용)
         → Next.js 서버사이드 → http://121.134.239.75:7000/  (서버→서버, 브라우저 보안 규칙 미적용)
```

서버사이드에서는 Mixed Content 제한이 없다. Next.js Route Handler가 브라우저와 HTTP 서버 사이의 **안전한 중간자** 역할을 한다. SSE 스트리밍도 `TransformStream`으로 그대로 중계된다.

### 한 줄 결론

> 백엔드 수정 없이 Mixed Content를 해결하는 유일한 방법이다. Next.js가 이미 서버이므로 추가 인프라 없이 구현 가능하다.

---

## 3. Axios

### 이 프로젝트의 문제

4개 서버를 호출해야 하고, 각 서버는 인증 토큰이 필요하다.

```
mainApi  → https://newron.shop/api/v1/
persApi  → /api/proxy/pers/
aiApi    → /api/proxy/ai/
briefApi → /api/proxy/brief/
```

모든 요청에 `Authorization: Bearer <token>` 헤더가 붙어야 한다. 토큰은 세션에서 꺼내야 한다.

### 대안과 왜 안 되나

| 대안 | 실패 이유 |
|---|---|
| **Native fetch** | 인터셉터 없음 → 매 요청마다 `headers: { Authorization: ... }` 반복 작성. baseURL 관리 없음 → 경로 하드코딩 반복 |
| **ky** | fetch 래퍼, hooks로 인터셉터 흉내 낼 수 있지만 `axios.create()` 패턴만큼 4개 인스턴스 분리가 직관적이지 않음. 레퍼런스 적음 |
| **SWR / TanStack Query만 사용** | 데이터 페칭 상태 관리 라이브러리. HTTP 클라이언트 설정(baseURL, 인터셉터)은 본래 역할 밖 |

### Axios가 이 구조에 맞는 이유

```typescript
// 4개 서버를 명확히 분리, 공통 인터셉터 한 번만 설정
export const persApi = withAuth(axios.create({ baseURL: '/api/proxy/pers' }));

// 이후 호출 코드에서 서버 차이를 완전히 숨김
const res = await persApi.get('/api/v1/user/bookmark');
```

### 한 줄 결론

> 서버마다 독립된 인스턴스를 만들고 인터셉터로 공통 처리를 주입하는 패턴이 **4개 서버 구조**에 가장 깔끔하게 맞는다.

---

## 4. TanStack Query

### 이 프로젝트의 문제

홈 피드는 무한스크롤이고, 북마크는 버튼 클릭 즉시 UI가 반응해야 한다.

- **무한스크롤**: cursor 기반 페이지네이션, 새 페이지를 누적 병합해야 함
- **낙관적 업데이트**: 북마크 버튼 클릭 → 서버 응답을 기다리지 않고 UI에 즉시 반영 → 실패하면 롤백
- **캐싱**: 카테고리 탭 전환 시 이미 불러온 데이터를 다시 요청하지 않아야 함

### 대안과 왜 안 되나

| 대안 | 실패 이유 |
|---|---|
| **SWR** | `useSWRInfinite`가 있지만 `getNextPageParam` 방식보다 복잡. 낙관적 업데이트 패턴도 TanStack Query보다 세밀하지 않음 |
| **Redux Toolkit Query** | Redux 전체 설치 필요. 무한스크롤과 낙관적 업데이트 구성이 TanStack Query보다 verbose |
| **수동 `useState` + `useEffect`** | 캐싱 직접 구현 (Map + TTL 관리), 페이지 누적 (배열 merge), 낙관적 업데이트 (스냅샷 저장 + 롤백) → 수백 줄 |

### TanStack Query가 이 구조에 맞는 이유

```typescript
// 무한스크롤: 3줄로 cursor 기반 페이지네이션
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['news', category],
  queryFn: ({ pageParam }) => fetchNewsList({ cursor: pageParam, category }),
  getNextPageParam: (last) => last.meta.has_next ? last.meta.last_id : undefined,
});

// 낙관적 업데이트: 실패 시 자동 롤백
const { mutate } = useMutation({
  mutationFn: (newsId) => persApi.post('/bookmark', { news_id: newsId }),
  onMutate: async (newsId) => {
    const prev = queryClient.getQueryData(['bookmarks']);
    queryClient.setQueryData(['bookmarks'], (old) => toggle(old, newsId)); // 즉시 반영
    return { prev };
  },
  onError: (_, __, ctx) => queryClient.setQueryData(['bookmarks'], ctx.prev), // 롤백
});
```

### 한 줄 결론

> 무한스크롤, 낙관적 업데이트, 캐싱 세 가지를 직접 구현하면 핵심 비즈니스 로직보다 인프라 코드가 많아진다. TanStack Query는 이 세 가지를 API 설계 수준에서 제공한다.

---

## 5. NextAuth.js v5

### 이 프로젝트의 문제

일반적인 Google 로그인은 1단계다. 이 앱은 2단계다.

```
일반:  Google OAuth → Google access_token → 완료
이 앱: Google OAuth → Google id_token → POST /auth/google → newron access_token + user_id
```

newron 서버가 Google id_token을 받아 자체 사용자 데이터베이스와 대조한 뒤 자체 토큰을 발급한다. 이 newron 토큰이 이후 모든 API 요청에 사용된다.

### 대안과 왜 안 되나

| 대안 | 실패 이유 |
|---|---|
| **Passport.js** | Express 미들웨어 기반 → Next.js App Router와 구조가 맞지 않음. 자체 세션 스토리지 설정 필요 |
| **Lucia** | DB 기반 세션 관리가 기본 전제 → 이 프로젝트는 DB가 없음 |
| **직접 구현** | OAuth PKCE flow, state 검증, 토큰 만료 갱신, 세션 암호화, CSRF 방어를 전부 구현해야 함. 보안 취약점 위험 |

### NextAuth가 이 구조에 맞는 이유

```typescript
// jwt 콜백 = "토큰을 저장하기 전에 가공하는 훅"
// 이 안에서 Google id_token → newron 토큰 교환 자연스럽게 삽입
callbacks: {
  async jwt({ token, account }) {
    if (account?.id_token) {
      const res = await mainApi.post('/auth/google', { id_token: account.id_token });
      token.newronToken  = res.data.access_token;
      token.newronUserId = res.data.user_id;
    }
    return token;
  }
}
```

2단계 교환이 콜백 구조에 정확히 들어맞는다. 세션 암호화, CSRF, 쿠키 관리는 NextAuth가 처리한다.

### 한 줄 결론

> newron 전용 토큰 교환이라는 **비표준 2단계 인증**을 보안 인프라(세션/쿠키/CSRF) 없이 빠르게 구현할 수 있는 유일한 선택이다.

---

## 6. Zustand

### 이 프로젝트의 문제

TTS 오디오 재생 중에는 다음 상태가 **앱 전역**에서 공유된다.

```
현재 재생 중인 뉴스 ID
현재 하이라이트된 문단 인덱스
재생 / 일시정지 / 완료 상태
```

뉴스 목록 화면과 뉴스 상세 화면이 동시에 이 상태를 읽고 갱신한다. 서버에서 오는 데이터가 아니다.

### 대안과 왜 안 되나

| 대안 | 실패 이유 |
|---|---|
| **Redux (RTK)** | `createSlice`, `configureStore`, `Provider`, `useSelector`, `useDispatch` → 단순한 재생 상태를 위해 보일러플레이트가 너무 많음 |
| **React Context API** | Context value가 바뀌면 구독 컴포넌트 **전부 리렌더**. 오디오 재생 중 문단 인덱스가 자주 바뀌면 관련 없는 컴포넌트도 계속 리렌더 |
| **TanStack Query** | 서버 상태(API 데이터) 관리용. 오디오 재생 상태는 서버와 무관한 클라이언트 전역 상태 → 역할 밖 |
| **Jotai / Recoil** | 원자 단위 상태 관리, 유효한 대안이지만 Zustand보다 생태계/레퍼런스가 적음 |

### Zustand가 이 구조에 맞는 이유

```typescript
// 스토어 정의: 5줄
const useAudioStore = create<AudioState>((set) => ({
  currentNewsId: null,
  currentParagraph: 0,
  isPlaying: false,
  play: (newsId) => set({ currentNewsId: newsId, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
}));

// 소비: 필요한 상태만 구독 → 관련 없는 컴포넌트 리렌더 없음
const isPlaying = useAudioStore((s) => s.isPlaying);
```

### 한 줄 결론

> Context는 구독 범위를 통제하지 못하고, Redux는 보일러플레이트가 과도하다. Zustand는 **최소 코드로 리렌더 범위를 정밀하게 제어**한다.

---

## 7. `@microsoft/fetch-event-source`

### 이 프로젝트의 문제

AI Q&A와 AI 추천 질문은 SSE(`text/event-stream`)로 답변이 스트리밍된다. 인증이 필요하다.

```
GET /ai/suggested-questions/{newsId}  → SSE 스트림
Authorization: Bearer <newron_token>  ← 이게 문제
```

### 대안과 왜 안 되나

| 대안 | 실패 이유 |
|---|---|
| **브라우저 기본 `EventSource`** | **GET 요청만 지원**. 커스텀 헤더(`Authorization`) 전송 불가. 에러 핸들링, 중단 제어 불가 |
| **WebSocket** | 양방향 통신 프로토콜. AI 답변은 **서버→클라이언트 단방향**. WebSocket은 오버스펙이고 서버에 WebSocket 엔드포인트가 없음 |
| **폴링(setInterval + fetch)** | 답변이 완성되기 전까지 계속 요청. 불필요한 API 호출, 응답 지연 |

### 기술 비유

> WebSocket은 전화기(양방향)고, SSE는 라디오(단방향)다. AI가 답변을 생성해서 흘려보내는 것은 라디오가 맞다. 전화기를 놓을 이유가 없다.  
> 기본 `EventSource`는 인증 헤더를 넣지 못하는 라디오다. `fetch-event-source`는 인증 헤더가 되는 라디오다.

### 한 줄 결론

> SSE가 요구사항에 정확히 맞고, 기본 `EventSource`의 인증 헤더 제한을 `fetch-event-source`가 해결한다.

---

## 8. Tailwind CSS v4 + CSS Variables

### 이 프로젝트의 문제

Android 앱 `Color.kt`에 20개 이상의 컬러 토큰이 정의되어 있다. 웹에서 같은 브랜드 색상을 써야 한다. 다크모드도 지원해야 한다.

### 대안과 왜 안 되나

| 대안 | 실패 이유 |
|---|---|
| **styled-components / Emotion** | CSS-in-JS → 런타임에 CSS 생성. 서버 컴포넌트와 충돌. 번들 크기 증가. SSR 하이드레이션 설정 복잡 |
| **CSS Modules** | 유틸리티 클래스 없음 → 컴포넌트마다 별도 `.module.css`. 디자인 토큰을 전역으로 공유하기 위해 추가 설정 필요 |
| **Plain CSS** | 변수 정의는 가능하지만 일관성 강제 없음. 개발자가 `var(--brand-navy)` 대신 `#0b3268`을 직접 쓰면 막을 방법이 없음 |

### Tailwind v4가 이 구조에 맞는 이유

```css
/* Android Color.kt의 토큰을 한 번만 정의 */
@theme {
  --color-brand-navy: #0b3268;
  --color-brand-green: #78b64b;
}

/* 다크모드: 변수 값만 바꾸면 모든 곳에 적용 */
@media (prefers-color-scheme: dark) {
  :root { --color-brand-canvas: #172033; }
}
```

```tsx
{/* 이후 코드에서는 토큰 이름만 사용 → 직접 색상 코드 금지 */}
<div className="bg-brand-navy text-brand-muted rounded-card" />
```

Android 디자인 토큰 → CSS 변수 → Tailwind 유틸리티 클래스. 한 곳만 바꾸면 앱 전체에 반영된다.

### 한 줄 결론

> CSS-in-JS는 서버 컴포넌트와 충돌하고, 순수 CSS는 일관성을 강제하지 못한다. Tailwind + CSS Variables는 **Android 디자인 토큰을 웹 유틸리티 클래스로 연결하는 가장 깔끔한 경로**다.

---

## 9. TypeScript

### 이 프로젝트의 문제

4개 서버의 응답 포맷이 다르다.

```typescript
// 메인 서버
{ status: "success", data: NewsItem[], meta: { has_next: boolean, last_id: number } }

// 개인화 서버
{ code: 200, result: BookmarkItem[] }
```

코드에서 `.data` 대신 `.result`를 쓰면 `undefined`가 반환되고 런타임에야 에러가 난다.

### 대안

JavaScript로 개발 → 4개 서버 응답 포맷 차이가 타입으로 강제되지 않음 → 컴파일 단계에서 잡을 수 있는 오류가 서비스 중에 발생.

### 한 줄 결론

> 서버 4개, 응답 포맷 2종, 개발자 여러 명. TypeScript가 없으면 **어느 서버에서 `.data`를 쓰고 어디서 `.result`를 쓰는지 기억에 의존**해야 한다.

---

## 10. Biome

### 이 프로젝트의 문제

린팅과 포매팅이 필요하다. ESLint + Prettier는 둘 다 JavaScript 기반으로, 특히 큰 프로젝트에서 느리다.

### 대안과 왜 안 되나

| 대안 | 실패 이유 |
|---|---|
| **ESLint + Prettier** | 두 도구 설정 파일 2개, 충돌 규칙 해결 필요, JavaScript 기반으로 느림 |
| **ESLint만** | 포매팅 없음 |

### 한 줄 결론

> Biome 하나로 ESLint + Prettier를 대체한다. Rust 기반으로 10~100배 빠르고 설정 파일이 하나다.

---

## 11. pnpm

### 이 프로젝트의 문제

Node.js 패키지 설치 속도와 디스크 효율.

### 대안과 왜 안 되나

| 대안 | 실패 이유 |
|---|---|
| **npm** | 느린 설치, `node_modules`가 각 프로젝트마다 패키지를 중복 복사 |
| **yarn** | npm보다 빠르지만 pnpm과 비슷한 디스크 사용 |

### 한 줄 결론

> pnpm은 패키지를 한 번 저장하고 심볼릭 링크로 연결 → **설치가 빠르고 디스크 사용이 적다**.

---

## 전체 결정 지도

```
제약 1: 4개 백엔드 서버, 포맷 제각각
  → Axios (서버별 인스턴스)
  → TypeScript (응답 포맷 타입 안전성)
  → TanStack Query (캐싱/무한스크롤/낙관적 업데이트)

제약 2: 3개 서버가 HTTP
  → Next.js Route Handler 프록시 (브라우저 대신 서버가 HTTP 호출)

제약 3: SSR + CSR 혼재
  → Next.js App Router (페이지별 렌더링 방식 선택)

제약 4: 2단계 토큰 교환
  → NextAuth.js v5 (jwt 콜백에서 교환 처리)

제약 5: SSE + 인증 헤더
  → @microsoft/fetch-event-source (POST + 커스텀 헤더 가능한 SSE)
  → Next.js 프록시 (SSE 스트리밍 중계)

제약 6: TTS 오디오 전역 상태
  → Zustand (Context 리렌더 없이 정밀한 구독 제어)

공통 인프라:
  → Tailwind v4 + CSS Variables (Android 디자인 토큰 연결)
  → Biome (ESLint + Prettier 통합)
  → pnpm (빠른 설치, 디스크 효율)
```

---

*작성자: 클로드코드*  
*작성일: 2026-06-12*  
*참고: `daily_reports/docs/tech-stack-report.md`, `docs/planning/product-plan.md`*
