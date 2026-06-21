import { briefApi } from "./clients";
import type { Briefing } from "@/types/news";

export async function fetchTodayBriefing(userId: string) {
  const res = await briefApi.get<Briefing>(`/api/v1/briefing/today/${userId}`);
  return res.data;
}

export async function generateBriefingNow(userId: string) {
  const res = await briefApi.post<Briefing>(`/api/v1/briefing/now/${userId}`);
  return res.data;
}

export async function fetchBriefingSubscription(userId: string) {
  const res = await briefApi.get<{ user_id: string; subscribed: boolean }>(
    `/api/v1/briefing/subscribe/${userId}`
  );
  return res.data;
}

export async function subscribeBriefing(userId: string) {
  const res = await briefApi.post<{ user_id: string; subscribed: boolean }>(
    `/api/v1/briefing/subscribe/${userId}`
  );
  return res.data;
}

export async function unsubscribeBriefing(userId: string) {
  const res = await briefApi.delete<{ user_id: string; subscribed: boolean }>(
    `/api/v1/briefing/subscribe/${userId}`
  );
  return res.data;
}

export async function postPreferenceFeedback(
  userId: string,
  category: string,
  direction: "up" | "down" | "cancel"
) {
  return briefApi.post(`/api/v1/preference/${userId}`, { category, direction });
}
