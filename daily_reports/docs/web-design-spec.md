# Newron Web 디자인 & API 명세서

> 안드로이드 앱(newron-client-android_v1)의 디자인 시스템과 API 명세를 웹 개발 기준으로 정리한 레퍼런스 문서입니다.  
> 앱과 동일한 브랜드 아이덴티티를 웹에서도 유지하기 위해 작성했습니다.

---

## 1. 서버 구조 (Base URLs)

| 서버 | Base URL | 용도 |
|---|---|---|
| **AWS 메인 서버** | `https://newron.shop/api/v1/` | 뉴스 피드, 검색, 인증, AI Q&A |
| **개인화 서버 (Port 7000)** | `http://121.134.239.75:7000/` | 북마크, 읽기 히스토리, 추천, 통계, 이미지 |
| **AI 가속 서버 (Port 8024)** | `http://121.134.239.75:8024/api/v1/` | AI 추천 질문 (SSE 스트리밍) |
| **브리핑 서버 (Port 9000)** | `http://121.134.239.75:9000/` | AI 브리핑, 구독, 취향 피드백 |

---

## 2. 공통 응답 포맷

### 메인 서버 응답 (`ApiResponse<T>`)
```json
{
  "status": "success",
  "meta": {
    "api_version": "1.0",
    "server_time": "2026-06-04T00:00:00Z",
    "pagination": {
      "last_id": 123,
      "has_next": true,
      "limit": 20
    }
  },
  "data": { ... }
}
```

### 개인화 서버 응답 (`ApiV3Response<T>`)
```json
{
  "code": 200,
  "message": "success",
  "result": { ... }
}
```

---

## 3. API 엔드포인트 명세

### 3-1. 인증 (Auth)

#### POST `/auth/google` — 구글 로그인
- **서버**: 메인 서버
- **Request Body**
  ```json
  {
    "id_token": "google_id_token_string",
    "fcm_token": "firebase_push_token (optional)"
  }
  ```
- **Response `data`**
  ```json
  {
    "is_new": false,
    "user_id": 42,
    "access_token": "jwt_token_string",
    "email": "user@gmail.com",
    "name": "홍길동"
  }
  ```

#### POST `/auth/verify` — 토큰 자동 로그인
- **서버**: 메인 서버
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**
  ```json
  { "fcm_token": "firebase_push_token (optional)" }
  ```
- **Response**: 위 로그인 응답과 동일

---

### 3-2. 뉴스 (News)

#### GET `/news` — 뉴스 목록 조회
- **서버**: 메인 서버
- **Query Params**

  | 파라미터 | 타입 | 설명 |
  |---|---|---|
  | `limit` | int | 가져올 개수 (기본 20) |
  | `cursor` | int | 마지막 응답의 `last_id` (커서 페이징) |
  | `category` | string | 카테고리 필터 (`"ALL"` = 전체) |

- **Response `data.news_list`** (배열)
  ```json
  [
    {
      "id": 1,
      "title": "기사 제목",
      "source_name": "연합뉴스",
      "published_at": "2026-06-04T09:00:00Z",
      "category": "경제",
      "thumbnail_url": "/results/news/1/thumb.jpg",
      "image_url": "https://...",
      "content_preview": "기사 본문 미리보기..."
    }
  ]
  ```
  > `thumbnail_url`이 상대 경로(`/results/...`)이면 `http://121.134.239.75:7000`을 prefix로 붙여서 사용

#### GET `/news/search` — 뉴스 키워드 검색
- **서버**: 메인 서버
- **Query Params**: `keyword` (필수), `limit`, `cursor`
- **Response**: 위 목록 조회와 동일

#### GET `/news/{news_id}` — 뉴스 상세 조회
- **서버**: 메인 서버
- **Response `data`**
  ```json
  {
    "id": 1,
    "title": "기사 제목",
    "source_name": "연합뉴스",
    "published_at": "2026-06-04T09:00:00Z",
    "category": "경제",
    "announcer_tone": "neutral",
    "original_url": "https://original-article-url.com",
    "image_url": "https://...",
    "script": {
      "display": ["문단1 텍스트", "문단2 텍스트"],
      "audio": ["문단1 TTS용 보정 텍스트", "문단2 TTS용 보정 텍스트"]
    }
  }
  ```

#### GET `/categories` — 카테고리 목록 조회
- **서버**: 메인 서버
- **Response `data`**
  ```json
  { "categories": ["ALL", "경제", "정치", "사회", "IT/과학", "생활/문화", "세계"] }
  ```

---

### 3-3. AI Q&A

#### POST `/ai/questions` — AI 질문하기
- **서버**: 메인 서버
- **Request Body**
  ```json
  {
    "newsId": 1,
    "question": "이 기사의 핵심 내용은?",
    "history": [
      { "role": "user", "content": "이전 질문" },
      { "role": "assistant", "content": "이전 답변" }
    ],
    "isStreaming": false
  }
  ```
- **Response**
  ```json
  {
    "status": "success",
    "data": {
      "questionId": "uuid-string",
      "answer": "AI 답변 본문",
      "referencedKeywords": ["키워드1", "키워드2"],
      "createdAt": "2026-06-04T10:00:00Z"
    }
  }
  ```

#### GET `/ai/templates/{newsId}` — AI 추천 질문 템플릿
- **서버**: 메인 서버
- **Response `data`**
  ```json
  {
    "newsId": 1,
    "templates": [
      { "id": "t1", "label": "요약해줘", "type": "SUMMARY" },
      { "id": "t2", "label": "용어 설명", "type": "DEFINITION" },
      { "id": "t3", "label": "배경 설명", "type": "REASON" }
    ]
  }
  ```

#### GET `/ai/history/{newsId}` — AI 대화 내역 조회
- **서버**: 메인 서버
- **Response `data`** (배열)
  ```json
  [
    { "role": "user", "content": "질문 내용", "timestamp": "2026-06-04T10:00:00Z" },
    { "role": "assistant", "content": "답변 내용", "timestamp": "2026-06-04T10:00:01Z" }
  ]
  ```

#### GET `http://121.134.239.75:8024/api/v1/ai/suggested-questions/{newsId}` — AI 추천 질문 (SSE)
- **서버**: AI 가속 서버 (직접 주소)
- **Response**
  ```json
  {
    "newsId": 1,
    "questions": ["추천 질문1", "추천 질문2", "추천 질문3"]
  }
  ```

---

### 3-4. 북마크 (Bookmark)

> 모두 **개인화 서버 (Port 7000)** 사용

#### POST `/api/v1/user/bookmark` — 북마크 추가
- **Request Body**
  ```json
  { "user_id": "42", "news_id": 1 }
  ```

#### POST `/api/v1/user/bookmark` — 북마크 삭제
- **Request Body**: 추가와 동일 (서버가 toggle 처리)

#### GET `/api/v1/user/bookmark/{user_id}` — 북마크 목록 조회
- **Response `data`**: `[1, 5, 12, ...]` (북마크된 news_id 배열)

---

### 3-5. 읽기 히스토리 (Read History)

#### POST `/api/v1/user/read-history` — 읽기 히스토리 기록
- **서버**: 개인화 서버
- **Request Body**
  ```json
  {
    "user_id": "42",
    "news_id": 1,
    "stay_duration_sec": 120,
    "listening_duration_sec": 85,
    "scroll_depth": 0.85,
    "is_fully_read": true,
    "device_info": "Web"
  }
  ```

#### GET `/api/v1/user/recent-news/{user_id}` — 최근 읽은 뉴스
- **서버**: 개인화 서버
- **Response `result`**: `ApiNewsItem` 배열

---

### 3-6. 개인화 추천 (Recommend)

#### POST `/api/v1/recommend/` — 맞춤 뉴스 추천
- **서버**: 개인화 서버
- **Request Body**
  ```json
  { "user_id": "42", "limit": 10 }
  ```
- **Response `data`**: `ApiNewsItem` 배열

#### POST `/api/v1/user/taste-score` — 취향 점수 업데이트
- **서버**: 개인화 서버
- **Request Body**
  ```json
  { "user_id": "42", "category": "경제", "score_delta": 1.0 }
  ```

#### GET `/api/v1/recommend/stats/taste/{user_id}` — 취향 통계 조회
- **서버**: 개인화 서버

---

### 3-7. 통계 (Stats)

#### GET `/api/v1/user/stats/listening/{user_id}` — 오늘의 청취 시간
- **서버**: 개인화 서버
- **Response `result`**: `int` (분 단위)

#### GET `/api/v1/user/stats/weekly/{user_id}` — 주간 활동 추이
- **서버**: 개인화 서버
- **Response `result`**
  ```json
  {
    "weekly_stats": [
      {
        "day_name": "월",
        "this_week_date": "2026-06-02",
        "this_week_score": 85.0,
        "last_week_date": "2026-05-26",
        "last_week_score": 72.0
      }
    ],
    "comparison": {
      "target_period_text": "이번 주",
      "change_rate": 18.0,
      "is_upward": true,
      "summary_message": "지난 주보다 18% 더 많이 읽었어요!"
    }
  }
  ```

---

### 3-8. 관심 키워드 (Interests)

> 메인 서버 사용. 모든 요청에 `Authorization: Bearer <token>` 헤더 필요

#### GET `/interests` — 관심 키워드 목록
- **Response `data`**: `{ "interestList": ["AI", "경제", "스타트업"] }`

#### POST `/interests/add` — 관심 키워드 추가
- **Request Body**: `{ "interest": "AI", "keyword": "AI" }`

#### POST `/interests/delete` — 관심 키워드 삭제
- **Request Body**: `{ "interest": "AI", "keyword": "AI" }`

---

### 3-9. AI 브리핑 (Briefing)

> 브리핑 서버 (Port 9000) 사용

#### GET `/api/v1/briefing/today/{user_id}` — 오늘 브리핑 조회
- **Response**
  ```json
  {
    "user_id": "42",
    "date": "2026-06-04",
    "briefing": "오늘의 주요 뉴스 브리핑 텍스트...",
    "curated": [
      {
        "newsId": 1,
        "title": "기사 제목",
        "category": "경제",
        "body": "본문 요약",
        "reason": "이 기사를 추천하는 이유"
      }
    ],
    "liked_categories": ["경제", "IT/과학"],
    "generated_at": "2026-06-04T06:00:00Z"
  }
  ```
  > 404: 브리핑 미생성 / 503: 오늘 발행 뉴스 없음

#### POST `/api/v1/briefing/now/{user_id}` — 브리핑 즉시 생성 (10~30초 소요)
- **Response**: 위 브리핑 조회와 동일

#### GET `/api/v1/briefing/subscribe/{user_id}` — 구독 상태 조회
#### POST `/api/v1/briefing/subscribe/{user_id}` — 구독 등록
#### DELETE `/api/v1/briefing/subscribe/{user_id}` — 구독 해지
- **Response**
  ```json
  { "user_id": "42", "subscribed": true }
  ```

#### POST `/api/v1/preference/{user_id}` — 취향 피드백 (좋아요/싫어요)
- **Request Body**
  ```json
  { "category": "경제", "direction": "up" }
  ```
  > `direction`: `"up"` (좋아요) / `"down"` (싫어요) / `"cancel"` (취소)

---

### 3-10. AI Lens (이미지 분석)

#### POST `/api/v1/vision/analysis` — 이미지 분석
- **서버**: 개인화 서버
- **Request Body**
  ```json
  { "image_url": "https://storage/image.jpg", "user_id": "42" }
  ```
- **Response `data`**
  ```json
  {
    "analysis_result": "이미지에서 분석된 뉴스 관련 정보...",
    "processed_at": "2026-06-04T10:00:00Z"
  }
  ```

#### GET `/api/v1/vision/news/{news_id}/image` — 뉴스 이미지 조회
- **서버**: 개인화 서버 (Vision DB 조회)
- **Response**
  ```json
  { "status": "success", "news_id": 1, "image_url": "https://..." }
  ```

---

## 4. 브랜드 컬러 시스템

> 안드로이드 `Color.kt` 기준. CSS 변수 형태로 웹에 그대로 적용 권장

```css
:root {
  /* Primary Brand */
  --brand-navy:       #0b3268;  /* 메인 브랜드 컬러, 헤더/네비/CTA 버튼 */
  --brand-blue:       #1455a0;  /* 보조 브랜드 컬러, 링크/액센트 */
  --brand-green:      #78b64b;  /* 포인트 그린, 완료/긍정 상태 */
  --brand-yellow:     #f4c542;  /* 포인트 옐로우, 북마크/즐겨찾기 */

  /* Soft (배경 강조, 배지, 인디케이터) */
  --brand-soft-blue:  #e8f1fb;
  --brand-soft-green: #edf7e9;
  --brand-soft-yellow:#fff7db;
  --brand-soft-red:   #fff0ee;

  /* Neutral / Semantic */
  --brand-ink:        #172033;  /* 본문 텍스트 (가장 어두운 색) */
  --brand-muted:      #6a7485;  /* 부연 설명, 비활성 텍스트, placeholder */
  --brand-line:       #d9e1ea;  /* 구분선, 보더, 경계 */
  --brand-paper:      #ffffff;  /* 카드, 모달, 컨테이너 배경 */
  --brand-canvas:     #f4f6fa;  /* 앱 전체 페이지 배경 */
}
```

### 다크 모드 대응

```css
@media (prefers-color-scheme: dark) {
  :root {
    --brand-canvas:   #172033;  /* 앱 배경 → ink 색 */
    --brand-paper:    #1e293b;  /* 카드 배경 */
    --brand-ink:      #f4f6fa;  /* 텍스트 → canvas 색으로 반전 */
  }
}
```

---

## 5. 타이포그래피

> 앱 기준 sp → web rem 환산 (1sp ≈ 1px → 기본 폰트 16px 기준으로 rem 환산)

| 용도 | 앱 (sp) | 웹 (rem) | Font Weight | 비고 |
|---|---|---|---|---|
| 앱 로고 / 브랜드 타이틀 | 20sp | 1.25rem | Black (900) | letter-spacing: 0.5px |
| 브레이킹 뉴스 헤드라인 | 18sp | 1.125rem | ExtraBold (800) | line-height: 1.44 |
| 뉴스 카드 제목 | 14sp | 0.875rem | Bold (700) | line-height: 1.43 |
| 카테고리 칩 | 13sp | 0.8125rem | Bold(선택) / Medium(비선택) | letter-spacing: -0.2px |
| 출처 / 날짜 | 11sp | 0.6875rem | Medium (500) | |
| 카테고리 배지 | 10sp | 0.625rem | Bold (700) | |
| 미리보기 본문 | 12sp | 0.75rem | Medium (500) | |

---

## 6. 스페이싱 & 레이아웃

### 기본 여백

| 용도 | 앱 (dp) | 웹 (px / rem) |
|---|---|---|
| 페이지 좌우 패딩 | 16dp | 16px |
| 카드 내부 패딩 (기본) | 14dp | 14px |
| 카드 내부 패딩 (히어로) | 20dp | 20px |
| 카드 세로 간격 | 6dp (vertical) | 6px |
| 섹션 간격 | 14dp | 14px |
| 칩 가로 패딩 | 16dp | 16px |
| 칩 세로 패딩 | 8dp | 8px |
| 칩 간격 | 8dp | 8px |

### Border Radius

| 컴포넌트 | 앱 (dp) | 웹 (px) |
|---|---|---|
| 히어로 카드 | 24dp | 24px |
| 뉴스 리스트 카드 | 16dp | 16px |
| 카드 내 이미지 | 12dp | 12px |
| 카테고리 칩 | 4dp (배지) / 50% (pill) | 4px / 9999px |
| 모달 / 바텀시트 | 20dp | 20px |

### 이미지 비율

| 컴포넌트 | 비율 |
|---|---|
| 히어로 카드 이미지 | 16:9 (fillMaxWidth + 200dp height) |
| 뉴스 리스트 썸네일 | 80×80dp (1:1 정사각형) |
| 상세 화면 상단 이미지 | 16:9 |

---

## 7. 컴포넌트 UX 패턴

### 7-1. 뉴스 피드 (홈 화면)

- **첫 번째 아이템**: 히어로 카드 (대형 이미지 + 제목 + 카테고리 배지 + 북마크 버튼)
- **이후 아이템**: 가로형 리스트 카드 (왼쪽 텍스트 + 오른쪽 80×80 썸네일)
- **카테고리 탭**: 수평 스크롤, 선택된 탭은 `--brand-navy` 배경 + 흰색 텍스트
- **무한 스크롤**: 목록 끝에서 4개 앞 아이템이 보일 때 다음 페이지 요청
- **북마크 아이콘**: Star(별) 아이콘 — 북마크됨: `--brand-yellow` / 미북마크: `--brand-muted`

### 7-2. 뉴스 상세 화면

- **상단**: 기사 이미지 (16:9) → 제목 → 출처 + 날짜 + 카테고리
- **본문**: 문단(paragraph) 단위로 분리, TTS 재생 시 현재 문단 하이라이트
- **AI Q&A**: 하단 바텀시트 또는 패널로 표시, SSE 스트리밍으로 답변 실시간 출력
- **북마크**: 상단 우측 버튼, 즉시 토글 + API 동기화

### 7-3. 브리핑 탭

- **성공 상태**: 브리핑 텍스트 + 큐레이션 뉴스 카드 목록
- **미생성 상태 (404)**: "지금 생성하기" 버튼 → `POST /briefing/now` 호출 (로딩 10~30초)
- **이른 아침 (503)**: "오늘 뉴스 준비 중" 안내 메시지
- **구독 토글**: 앱 진입 시 `GET /briefing/subscribe` 로 초기 상태 동기화
- **취향 피드백**: 브리핑 기사 카드에 up/down 버튼, 중복 클릭 시 취소(cancel)

### 7-4. AI Lens

- 이미지 업로드 → `POST /vision/analysis` → SSE 스트리밍으로 분석 결과 표시

### 7-5. 인증 흐름

1. 앱 진입 시 로컬 저장 토큰 확인
2. 토큰 있으면 `POST /auth/verify` 자동 로그인 시도
3. 실패 시 로그인 화면으로 이동
4. 구글 로그인 후 `POST /auth/google` → `access_token` + `user_id` 저장
5. 이후 모든 인증 필요 요청에 `Authorization: Bearer <access_token>` 헤더 추가

### 7-6. 게스트 모드

- 비로그인 사용자도 뉴스 피드 조회 가능
- AI Q&A, AI Lens, 북마크는 로그인 필요 → 클릭 시 로그인 안내
- `user_id`는 기기 고유 ID(Android ID) → 웹에서는 `localStorage`에 UUID 생성하여 사용 권장

---

## 8. 뉴스 이미지 URL 처리 규칙

서버에서 내려오는 이미지 경로가 상대 경로인 경우 개인화 서버 Base URL을 prefix로 붙여야 합니다.

```javascript
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('/')) {
    return `http://121.134.239.75:7000${rawUrl}`;
  }
  return rawUrl;  // 이미 절대 URL
}

// 우선순위: thumbnail_url → image_url → imageUrl (camelCase)
function getBestImageUrl(newsItem) {
  const raw = newsItem.thumbnail_url ?? newsItem.image_url ?? newsItem.imageUrl;
  return resolveImageUrl(raw);
}
```

---

## 9. 카테고리 폴백 이미지

썸네일이 없는 기사에 카테고리별 기본 이미지를 표시합니다.

```javascript
const CATEGORY_FALLBACK_IMAGES = {
  '경제':     'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000',
  '경제/금융': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000',
  '사회':     'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000',
  '사회/복지': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000',
  'IT/과학':  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000',
  '생활/문화': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000',
  '정치':     'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1000',
  '세계':     'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1000',
  'default':  'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1000',
};
```

---

## 10. 화면 구조 (네비게이션)

| 화면 | 경로 (웹 제안) | 앱 대응 |
|---|---|---|
| 홈 피드 | `/` | `HomeFeedScreen` |
| 뉴스 상세 | `/news/{id}` | `NewsDetailActivity` |
| 엔터테인 / 브리핑 | `/briefing` | `EntertainScreen` |
| AI Lens | `/lens` | `LensScreen` |
| 북마크 | `/bookmarks` | `BookmarksScreen` |
| 읽기 히스토리 | `/history` | `HistoryScreen` |
| 프로필 / 통계 | `/profile` | `ProfileScreen` |
| 설정 | `/settings` | `SettingsScreen` |
| 로그인 | `/login` | `SplashActivity` |

---

## 11. 주요 상수값

| 상수 | 값 | 설명 |
|---|---|---|
| 기본 페이지 크기 | 20 | 뉴스 목록 1회 로드 개수 |
| 추천 뉴스 limit | 10 | 개인화 추천 API 기본값 |
| 브리핑 구독 시각 | 매일 22:00 | 브리핑 자동 생성 기준 시간 |
| 취향 피드백 방향 | `"up"` / `"down"` / `"cancel"` | `direction` 필드 허용값 |

---

*최종 업데이트: 2026-06-04*  
*참고 파일: `ApiService.kt`, `NetworkManager.kt`, `NetworkModels.kt`, `Color.kt`, `Theme.kt`, `HomeFeedScreen.kt`*
