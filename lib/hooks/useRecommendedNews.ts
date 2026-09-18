"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRecommendedNews } from "@/lib/api/news";

export function useRecommendedNews(userId: string | null, limit = 3) {
  return useQuery({
    queryKey: ["recommended", userId, limit],
    queryFn: () => fetchRecommendedNews(userId as string, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
