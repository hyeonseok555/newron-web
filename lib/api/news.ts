import { mainApi, persApi } from "./clients";
import type { MainResponse, PersResponse } from "@/types/api";
import type { NewsItem, NewsDetail, AiTemplate, AiAnswer, ChatMessage, WeeklyStats } from "@/types/news";

// ── 뉴스 목록 ──────────────────────────────────────────────
export async function fetchNewsList(params: {
  limit?: number;
  cursor?: number;
  category?: string;
}) {
  const res = await mainApi.get<MainResponse<{ news_list: NewsItem[] }>>("/news", { params });
  return res.data;
}

// ── 뉴스 검색 ──────────────────────────────────────────────
export async function searchNews(params: {
  keyword: string;
  limit?: number;
  cursor?: number;
}) {
  const res = await mainApi.get<MainResponse<{ news_list: NewsItem[] }>>("/news/search", { params });
  return res.data;
}

// ── 뉴스 상세 ──────────────────────────────────────────────
export async function fetchNewsDetail(newsId: number) {
  const res = await mainApi.get<MainResponse<NewsDetail>>(`/news/${newsId}`);
  return res.data.data;
}

// ── 카테고리 목록 ──────────────────────────────────────────
export async function fetchCategories() {
  const res = await mainApi.get<MainResponse<{ categories: string[] }>>("/categories");
  return res.data.data.categories;
}

// ── AI Q&A ─────────────────────────────────────────────────
export async function postAiQuestion(payload: {
  newsId: number;
  question: string;
  history: ChatMessage[];
  isStreaming?: boolean;
}) {
  const res = await mainApi.post<MainResponse<AiAnswer>>("/ai/questions", payload);
  return res.data.data;
}

export async function fetchAiTemplates(newsId: number) {
  const res = await mainApi.get<MainResponse<{ newsId: number; templates: AiTemplate[] }>>(
    `/ai/templates/${newsId}`
  );
  return res.data.data.templates;
}

export async function fetchAiHistory(newsId: number) {
  const res = await mainApi.get<MainResponse<ChatMessage[]>>(`/ai/history/${newsId}`);
  return res.data.data;
}

// ── 관심 키워드 ────────────────────────────────────────────
export async function fetchInterests() {
  const res = await mainApi.get<MainResponse<{ interestList: string[] }>>("/interests");
  return res.data.data.interestList;
}

export async function addInterest(interest: string) {
  return mainApi.post("/interests/add", { interest, keyword: interest });
}

export async function removeInterest(interest: string) {
  return mainApi.post("/interests/delete", { interest, keyword: interest });
}

// ── 북마크 ─────────────────────────────────────────────────
export async function fetchBookmarks(userId: string) {
  const res = await persApi.get<PersResponse<number[]>>(`/api/v1/user/bookmark/${userId}`);
  return res.data.result;
}

export async function toggleBookmark(userId: string, newsId: number) {
  return persApi.post("/api/v1/user/bookmark", { user_id: userId, news_id: newsId });
}

// ── 읽기 히스토리 ──────────────────────────────────────────
export async function recordReadHistory(payload: {
  user_id: string;
  news_id: number;
  stay_duration_sec: number;
  listening_duration_sec: number;
  scroll_depth: number;
  is_fully_read: boolean;
}) {
  return persApi.post("/api/v1/user/read-history", { ...payload, device_info: "Web" });
}

export async function fetchRecentNews(userId: string) {
  const res = await persApi.get<PersResponse<NewsItem[]>>(`/api/v1/user/recent-news/${userId}`);
  return res.data.result;
}

// ── 추천 ────────────────────────────────────────────────────
export async function fetchRecommendedNews(userId: string, limit = 10) {
  const res = await persApi.post<PersResponse<NewsItem[]>>("/api/v1/recommend/", {
    user_id: userId,
    limit,
  });
  return res.data.result;
}

// ── 통계 ────────────────────────────────────────────────────
export async function fetchListeningStats(userId: string) {
  const res = await persApi.get<PersResponse<number>>(`/api/v1/user/stats/listening/${userId}`);
  return res.data.result;
}

export async function fetchWeeklyStats(userId: string) {
  const res = await persApi.get<PersResponse<WeeklyStats>>(`/api/v1/user/stats/weekly/${userId}`);
  return res.data.result;
}
