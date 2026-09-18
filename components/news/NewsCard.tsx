"use client";

import type { NewsItem } from "@/types/news";
import { getBestImageUrl, getFallbackImage } from "@/lib/resolveImage";
import { getCategoryClass } from "@/lib/categoryStyle";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export function NewsCard({
  news,
  isBookmarked,
  onToggleBookmark,
}: {
  news: NewsItem;
  isBookmarked: boolean;
  onToggleBookmark: (newsId: number) => void;
}) {
  const image = getBestImageUrl(news) ?? getFallbackImage(news.category);

  return (
    <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow group flex flex-col cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div
          className={`absolute top-3 left-3 px-2 py-1 rounded text-caption-tiny ${getCategoryClass(news.category)}`}
        >
          {news.category}
        </div>
      </div>
      <div className="p-card-padding flex flex-col flex-grow">
        <h4 className="text-headline-md text-on-surface mb-2 group-hover:text-secondary transition-colors line-clamp-2">
          {news.title}
        </h4>
        <p className="text-body-md text-on-surface-variant mb-stack-md line-clamp-3">
          {news.content_preview}
        </p>
        <div className="mt-auto pt-stack-md border-t border-outline-variant/30 flex justify-between items-center">
          <span className="text-label-sm text-outline">
            {news.source_name} · {formatRelativeTime(news.published_at)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(news.id);
            }}
            className={`transition-colors ${isBookmarked ? "text-primary" : "text-outline hover:text-primary"}`}
            aria-label={isBookmarked ? "북마크 해제" : "북마크"}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
            >
              bookmark
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
