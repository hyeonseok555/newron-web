# Newron Web 기술 스택 추천 보고서

> 기존 Android 앱(`newron-client-android_v1`)의 웹 버전 전환을 위한 기술 스택 가이드  
> `web-design-spec.md` 의 API 명세 및 디자인 시스템을 기반으로 작성  
> 작성일: 2026-06-05

---

## 0. 핵심 전제

이 프로젝트는 **기존 백엔드 API를 그대로 활용하는 웹 클라이언트**입니다.  
새로운 백엔드 서버 없이, 4개의 기존 서버에 HTTP 요청을 보내는 형태로 개발합니다.

```
[Web Browser]
    │
    ├── 메인 서버       https://newron.shop/api/v1/
    ├── 개인화 서버     http://121.134.239.75:7000/
    ├── AI 가속 서버    http://121.134.239.75:8024/  (SSE 스트리밍)
    └── 브리핑 서버     http://121.134.239.75:9000/
```

---

## 1. 최종 추천 스택 요약

| 분류 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | **Next.js 15 (App Router)** | SSR(뉴스 상세 SEO) + CSR(개인화) 동시 지원 |
| 언어 | **TypeScript** | 팀 협업, API 응답 타입 안전성 |
| 스타일 | **Tailwind CSS v4 + CSS Variables** | 기존 디자인 토큰 직접 연결 가능 |
| 컴포넌트 | **shadcn/ui** | Tailwind 기반, headless 커스터마이징 용이 |
| API 관리 | **Axios + TanStack Query** | 4개 서버 분리 관리, 무한스크롤 내장 |
| 인증 | **NextAuth.js v5 (Auth.js)** | Google OAuth 빠른 연동 |
| 클라이언트 상태 | **Zustand** | 오디오 재생 상태, 북마크 캐시 등 전역 관리 |
| SSE 스트리밍 | **@microsoft/fetch-event-source** | AI Q&A, AI Lens 실시간 출력 |
| 오디오 | **HTML5 Audio API + Custom Hook** | TTS 재생 + 문단 하이라이트 |
| 패키지 관리 | **pnpm** | 빠른 설치, 디스크 효율 |

---

## 2. 아키텍처 전략

### 렌더링 방식 분리

```
SSR (Server Components)         CSR (Client Components)
─────────────────────────       ──────────────────────────────────
/news/{id}  뉴스 상세           /          홈 피드 (개인화)
/login      로그인 페이지       /briefing  AI 브리핑
                                /bookmarks 북마크 목록
                                /profile   프로필 / 통계
                                /lens      AI Lens
```

- 뉴스 상세는 SSR → 검색 엔진 노출, OG 태그 자동 생성
- 개인화 콘텐츠(피드, 추천, 브리핑)는 CSR → user_id 기반 동적 fetch

### CORS 우회 전략 (필수)

HTTP origin이 다른 서버 4개에 직접 요청 시 CORS 에러 발생 가능.  
Next.js `Route Handlers`로 프록시를 두어 해결합니다.

```
Browser → Next.js /api/proxy/* → 각 백엔드 서버
```

```typescript
// app/api/proxy/[...path]/route.ts
export async function GET(request: Request, { params }) {
  const target = resolveTargetServer(params.path);
  return fetch(target, { headers: forwardHeaders(request) });
}
```

---

## 3. 스택 상세 설명

### 3-1. Next.js 15 (App Router)

```
앱 라우팅 구조 (web-design-spec.md §10 대응)

app/
├── page.tsx                  → /           홈 피드
├── news/[id]/page.tsx        → /news/{id}  뉴스 상세 (SSR)
├── briefing/page.tsx         → /briefing
├── lens/page.tsx             → /lens
├── bookmarks/page.tsx        → /bookmarks
├── history/page.tsx          → /history
├── profile/page.tsx          → /profile
├── settings/page.tsx         → /settings
├── login/page.tsx            → /login
└── api/proxy/[...path]/      → 백엔드 프록시
```

- `generateMetadata()` 로 뉴스 상세 페이지 OG 태그 자동 생성
- `loading.tsx` 로 스켈레톤 UI 처리

### 3-2. 디자인 시스템 연동

`web-design-spec.md §4-6` 의 CSS 변수를 Tailwind 설정에 그대로 연결합니다.

```css
/* app/globals.css */
:root {
  --brand-navy:        #0b3268;
  --brand-blue:        #1455a0;
  --brand-green:       #78b64b;
  --brand-yellow:      #f4c542;
  --brand-soft-blue:   #e8f1fb;
  --brand-soft-green:  #edf7e9;
  --brand-soft-yellow: #fff7db;
  --brand-soft-red:    #fff0ee;
  --brand-ink:         #172033;
  --brand-muted:       #6a7485;
  --brand-line:        #d9e1ea;
  --brand-paper:       #ffffff;
  --brand-canvas:      #f4f6fa;
}

@media (prefers-color-scheme: dark) {
  :root {
    --brand-canvas: #172033;
    --brand-paper:  #1e293b;
    --brand-ink:    #f4f6fa;
  }
}
```

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        navy:        'var(--brand-navy)',
        blue:        'var(--brand-blue)',
        green:       'var(--brand-green)',
        yellow:      'var(--brand-yellow)',
        'soft-blue': 'var(--brand-soft-blue)',
        ink:         'var(--brand-ink)',
        muted:       'var(--brand-muted)',
        line:        'var(--brand-line)',
        paper:       'var(--brand-paper)',
        canvas:      'var(--brand-canvas)',
      }
    },
    borderRadius: {
      hero:  '24px',   // 히어로 카드
      card:  '16px',   // 뉴스 리스트 카드
      img:   '12px',   // 카드 내 이미지
      modal: '20px',   // 모달/바텀시트
    },
    fontSize: {
      'brand-logo':     ['1.25rem',   { fontWeight: '900', letterSpacing: '0.5px' }],
      'brand-headline': ['1.125rem',  { fontWeight: '800', lineHeight: '1.44' }],
      'brand-card':     ['0.875rem',  { fontWeight: '700', lineHeight: '1.43' }],
      'brand-chip':     ['0.8125rem', {}],
      'brand-meta':     ['0.6875rem', { fontWeight: '500' }],
      'brand-preview':  ['0.75rem',   { fontWeight: '500' }],
    }
  }
}
```

### 3-3. API 클라이언트 레이어

4개 서버를 명확히 분리한 Axios 인스턴스를 만들고, 공통 인터셉터로 인증 헤더를 주입합니다.

```typescript
// lib/api/clients.ts
import axios from 'axios';

const withAuth = (instance: AxiosInstance) => {
  instance.interceptors.request.use(config => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return instance;
};

export const mainApi  = withAuth(axios.create({ baseURL: '/api/proxy/main' }));
export const persApi  = withAuth(axios.create({ baseURL: '/api/proxy/pers' }));
export const aiApi    = withAuth(axios.create({ baseURL: '/api/proxy/ai'   }));
export const briefApi = withAuth(axios.create({ baseURL: '/api/proxy/brief'}));
```

**서버별 응답 포맷 정규화** (`web-design-spec.md §2` 대응)

```typescript
// 메인 서버: data.xxx
// 개인화 서버: result.xxx
// 두 포맷을 공통 타입으로 래핑
type MainResponse<T>  = { status: string; data: T; meta?: PaginationMeta };
type PersResponse<T>  = { code: number;  result: T };
```

### 3-4. TanStack Query 활용

```typescript
// 무한스크롤 (§7-1: 4개 앞 아이템에서 다음 페이지 요청)
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['news', category],
  queryFn:  ({ pageParam }) => fetchNewsList({ cursor: pageParam, category }),
  getNextPageParam: (last) => last.meta.has_next ? last.meta.last_id : undefined,
});

// Intersection Observer로 '4개 앞 아이템'에서 트리거
```

```typescript
// 북마크 toggle (낙관적 업데이트)
const { mutate: toggleBookmark } = useMutation({
  mutationFn: (newsId: number) => persApi.post('/api/v1/user/bookmark', { user_id, news_id: newsId }),
  onMutate: async (newsId) => {
    await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
    // 즉시 UI 반영 후 API 동기화
  },
});
```

### 3-5. SSE 스트리밍 (AI Q&A + AI Lens)

```typescript
// lib/hooks/useSSE.ts
import { fetchEventSource } from '@microsoft/fetch-event-source';

export function useAISuggestedQuestions(newsId: number) {
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    fetchEventSource(`/api/proxy/ai/ai/suggested-questions/${newsId}`, {
      onmessage(ev) {
        const data = JSON.parse(ev.data);
        setQuestions(data.questions);
      },
    });
  }, [newsId]);

  return questions;
}
```

### 3-6. TTS 오디오 재생 + 문단 하이라이트

```typescript
// §7-2: TTS 재생 시 현재 문단 하이라이트
export function useNewsAudio(scripts: string[]) {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 각 문단 오디오 URL fetch 후 순차 재생
  // 재생 중인 paragraph index → 해당 문단 bg 하이라이트
  return { currentParagraph, audioRef, play, pause };
}
```

### 3-7. Google 인증 (NextAuth.js v5)

```typescript
// auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        // POST /auth/google → newron access_token 교환
        const res = await mainApi.post('/auth/google', { id_token: account.id_token });
        token.newronToken  = res.data.access_token;
        token.newronUserId = res.data.user_id;
      }
      return token;
    }
  }
});
```

### 3-8. 게스트 모드 user_id

```typescript
// lib/guestId.ts (§7-6 대응)
export function getGuestUserId(): string {
  let id = localStorage.getItem('guest_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('guest_user_id', id);
  }
  return id;
}
```

### 3-9. 이미지 처리

```typescript
// lib/resolveImage.ts (§8, §9 대응)
const PERS_BASE = 'http://121.134.239.75:7000';

export function resolveImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  return raw.startsWith('/') ? `${PERS_BASE}${raw}` : raw;
}

export function getBestImageUrl(item: NewsItem): string | null {
  return resolveImageUrl(item.thumbnail_url ?? item.image_url ?? item.imageUrl);
}

export const CATEGORY_FALLBACK: Record<string, string> = {
  '경제':     'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000',
  'IT/과학':  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000',
  '사회':     'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000',
  '생활/문화': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000',
  '정치':     'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1000',
  '세계':     'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1000',
  'default':  'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1000',
};
```

---

## 4. 주요 라이브러리 목록

```json
{
  "dependencies": {
    "next":                    "^15.0.0",
    "react":                   "^19.0.0",
    "typescript":              "^5.0.0",

    "next-auth":               "^5.0.0",
    "axios":                   "^1.7.0",
    "@tanstack/react-query":   "^5.0.0",
    "zustand":                 "^5.0.0",

    "@microsoft/fetch-event-source": "^2.0.0",

    "tailwindcss":             "^4.0.0",
    "@shadcn/ui":              "latest",

    "react-intersection-observer": "^9.0.0"
  },
  "devDependencies": {
    "@biomejs/biome":          "^1.0.0",
    "@types/node":             "^22.0.0"
  }
}
```

---

## 5. 폴더 구조

```
newron-web/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx              ← BottomNav 포함
│   │   ├── page.tsx                ← 홈 피드
│   │   ├── news/[id]/page.tsx      ← SSR
│   │   ├── briefing/page.tsx
│   │   ├── lens/page.tsx
│   │   ├── bookmarks/page.tsx
│   │   ├── history/page.tsx
│   │   └── profile/page.tsx
│   └── api/proxy/[...path]/route.ts
│
├── components/
│   ├── news/
│   │   ├── HeroCard.tsx
│   │   ├── NewsListCard.tsx
│   │   ├── CategoryTabs.tsx
│   │   └── NewsContent.tsx         ← 문단 + 하이라이트
│   ├── ai/
│   │   ├── QAPanel.tsx
│   │   └── SuggestedQuestions.tsx
│   └── briefing/
│       ├── BriefingContent.tsx
│       └── CuratedCard.tsx
│
├── lib/
│   ├── api/
│   │   ├── clients.ts              ← 4개 Axios 인스턴스
│   │   ├── news.ts
│   │   ├── auth.ts
│   │   ├── bookmark.ts
│   │   └── briefing.ts
│   ├── hooks/
│   │   ├── useNewsAudio.ts
│   │   ├── useInfiniteNews.ts
│   │   └── useSSE.ts
│   ├── resolveImage.ts
│   └── guestId.ts
│
├── store/
│   ├── audioStore.ts               ← 재생 상태
│   └── authStore.ts                ← user_id, token
│
└── types/
    ├── api.ts                      ← ApiResponse<T>, ApiV3Response<T>
    └── news.ts
```

---

## 6. 배포 전략

### 개발 환경

```yaml
# docker-compose.yml
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=...
      - GOOGLE_CLIENT_ID=...
      - GOOGLE_CLIENT_SECRET=...
      - MAIN_API_URL=https://newron.shop/api/v1
      - PERS_API_URL=http://121.134.239.75:7000
      - AI_API_URL=http://121.134.239.75:8024/api/v1
      - BRIEF_API_URL=http://121.134.239.75:9000
```

### 프로덕션 추천

| 옵션 | 장점 | 단점 |
|------|------|------|
| **Vercel** | 무중단 배포, Edge 최적화, 설정 0 | 유료 플랜 필요 (SSE 스트리밍 지원) |
| **Docker + Nginx** | 자체 서버, 비용 절감 | 서버 관리 필요 |
| **Railway** | 간단한 배포, 무료 티어 | 성능 제한 |

> SSE 스트리밍(AI Q&A)이 있으므로 Vercel Pro 이상 또는 자체 서버 권장  
> (Vercel 무료 플랜은 응답 제한 시간 10초)

---

## 7. 구현 로드맵

| 주차 | 작업 |
|------|------|
| 1주 | 프로젝트 세팅, 디자인 토큰 연결, API 클라이언트 레이어, 프록시 라우트 |
| 2주 | 인증 (Google OAuth → newron 토큰 교환), 게스트 모드 |
| 3-4주 | 홈 피드 (무한스크롤, 히어로 카드, 카테고리 탭) |
| 5-6주 | 뉴스 상세 (SSR, TTS 재생, 문단 하이라이트, 북마크) |
| 7-8주 | AI Q&A 패널 + SSE 스트리밍 |
| 9주 | 브리핑 탭 (생성/로딩/구독, 취향 피드백) |
| 10주 | 북마크, 히스토리, 프로필, 주간 통계 차트 |
| 11주 | AI Lens (이미지 업로드 + 분석 결과) |
| 12주 | 다크 모드, 반응형 최적화, 성능 튜닝 |

---

## 8. 주의사항 & 결정 필요 항목

| 항목 | 현황 | 권장 조치 |
|------|------|----------|
| **HTTP 서버 보안** | 개인화/AI/브리핑 서버가 `http://` (비암호화) | 프록시 레이어에서 서버사이드 전환으로 브라우저 Mixed Content 에러 방지 |
| **FCM 토큰** | 앱에서는 푸시 알림에 사용 | 웹 Push API (`ServiceWorker`) 로 대체 가능, 초기에는 생략 권장 |
| **브리핑 구독 22:00** | 서버가 매일 22:00 생성 | 웹에서는 `GET /briefing/today` 결과 기반으로 UI 분기 처리 |
| **SSE + Vercel 무료** | Vercel 무료 플랜 10초 제한 | AI 추천 질문 SSE가 10초 초과 시 일반 REST fallback 구현 병행 |

---

*참고 문서: `web-design-spec.md`*  
*최종 업데이트: 2026-06-05*
