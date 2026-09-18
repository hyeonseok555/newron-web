"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchNewsList, fetchCategories } from "@/lib/api/news";

const PAGE_SIZE = 13; // 히어로 1 + 그리드 12

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });
}

export function useNewsFeed(category: string) {
  return useInfiniteQuery({
    queryKey: ["news", category],
    queryFn: ({ pageParam }) =>
      fetchNewsList({
        limit: PAGE_SIZE,
        cursor: pageParam,
        category: category === "ALL" ? undefined : category,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.pagination?.has_next ? lastPage.meta.pagination.last_id : undefined,
  });
}
