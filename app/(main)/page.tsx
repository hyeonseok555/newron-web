"use client";

import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useCategories, useNewsFeed } from "@/lib/hooks/useNewsFeed";
import { useRecommendedNews } from "@/lib/hooks/useRecommendedNews";
import { useBookmarks, useToggleBookmark } from "@/lib/hooks/useBookmark";
import { useUserId } from "@/lib/hooks/useUserId";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsCardSkeleton } from "@/components/news/NewsCardSkeleton";
import { TrendingItem } from "@/components/news/TrendingItem";
import { getBestImageUrl, getFallbackImage } from "@/lib/resolveImage";

const CATEGORY_LABELS: Record<string, string> = {
  ALL: "최신 뉴스",
};

export default function HomePage() {
  const [category, setCategory] = useState("ALL");
  const userId = useUserId();

  const { data: categoriesData } = useCategories();
  const categories = useMemo(() => {
    const rest = (categoriesData ?? []).filter((c) => c !== "ALL");
    return ["ALL", ...rest];
  }, [categoriesData]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNewsFeed(category);

  const { data: recommended } = useRecommendedNews(userId, 3);
  const { data: bookmarkedIds } = useBookmarks(userId);
  const toggleBookmark = useToggleBookmark(userId);

  const newsList = useMemo(() => data?.pages.flatMap((p) => p.data.news_list) ?? [], [data]);
  const [hero, ...grid] = newsList;

  const { ref: loadMoreRef, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const bookmarkedSet = useMemo(() => new Set(bookmarkedIds ?? []), [bookmarkedIds]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-stack-md">
        <span className="material-symbols-outlined text-5xl text-outline">error</span>
        <p className="text-body-lg text-on-surface-variant">뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── 히어로 + 인기 사이드바 ── */}
      <section className="grid grid-cols-1 lg:grid-cols-10 gap-gutter mb-stack-lg">
        {/* 메인 히어로 (70%) */}
        {isLoading || !hero ? (
          <div className="lg:col-span-7 rounded-xl overflow-hidden h-[500px]">
            <div className="w-full h-full bg-surface-container-high animate-pulse" />
          </div>
        ) : (
          <div className="lg:col-span-7 relative group overflow-hidden rounded-xl shadow-md h-[500px] cursor-pointer">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('${getBestImageUrl(hero) ?? getFallbackImage(hero.category)}')`,
              }}
            />
            <div className="absolute inset-0 hero-gradient" />
            <div className="absolute bottom-0 left-0 p-stack-lg text-white">
              <span className="inline-block px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-caption-tiny rounded-full mb-stack-sm">
                {hero.category}
              </span>
              <h1 className="text-headline-lg mb-stack-sm max-w-2xl leading-tight">{hero.title}</h1>
              <p className="text-body-md text-white/80 max-w-xl line-clamp-3">{hero.content_preview}</p>
            </div>
          </div>
        )}

        {/* 실시간 인기 사이드바 (30%) */}
        <aside className="lg:col-span-3 space-y-stack-md">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-headline-md text-primary">실시간 인기 뉴스</h2>
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              trending_up
            </span>
          </div>
          <div className="space-y-stack-md">
            {recommended && recommended.length > 0
              ? recommended.map((item) => <TrendingItem key={item.id} news={item} />)
              : Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-lg bg-surface-container-high animate-pulse"
                  />
                ))}
          </div>
        </aside>
      </section>

      {/* ── 카테고리 필터 ── */}
      <div className="flex items-center gap-stack-sm overflow-x-auto no-scrollbar pb-stack-md mb-stack-lg border-b border-outline-variant/30">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-stack-md py-2 rounded-full text-label-md whitespace-nowrap transition-all active:scale-95 ${
              cat === category
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* ── 뉴스 그리드 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter pb-stack-lg">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)
          : grid.map((news) => (
              <NewsCard
                key={news.id}
                news={news}
                isBookmarked={bookmarkedSet.has(news.id)}
                onToggleBookmark={(newsId) => toggleBookmark.mutate(newsId)}
              />
            ))}
        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, i) => <NewsCardSkeleton key={`next-${i}`} />)}
      </div>

      {!isLoading && hasNextPage && <div ref={loadMoreRef} className="h-1" />}

      {!isLoading && newsList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-stack-md">
          <span className="material-symbols-outlined text-5xl text-outline">inbox</span>
          <p className="text-body-lg text-on-surface-variant">해당 카테고리에 뉴스가 없습니다.</p>
        </div>
      )}
    </>
  );
}
