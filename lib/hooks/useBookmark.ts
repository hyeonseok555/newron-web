"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBookmarks, toggleBookmark } from "@/lib/api/news";

export function useBookmarks(userId: string | null) {
  return useQuery({
    queryKey: ["bookmarks", userId],
    queryFn: () => fetchBookmarks(userId as string),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useToggleBookmark(userId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["bookmarks", userId];

  return useMutation({
    mutationFn: (newsId: number) => toggleBookmark(userId as string, newsId),
    onMutate: async (newsId: number) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<number[]>(queryKey) ?? [];
      const next = previous.includes(newsId)
        ? previous.filter((id) => id !== newsId)
        : [...previous, newsId];
      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (_err, _newsId, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
