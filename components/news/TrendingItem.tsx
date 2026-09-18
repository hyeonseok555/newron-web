import type { NewsItem } from "@/types/news";
import { getBestImageUrl, getFallbackImage } from "@/lib/resolveImage";

export function TrendingItem({ news }: { news: NewsItem }) {
  const image = getBestImageUrl(news) ?? getFallbackImage(news.category);

  return (
    <div className="flex gap-stack-md p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 hover:shadow-sm transition-all group cursor-pointer active:scale-95 duration-150">
      <div className="flex-1">
        <span className="text-label-sm text-secondary">{news.category}</span>
        <h3 className="text-body-lg text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
          {news.title}
        </h3>
      </div>
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <img src={image} alt={news.title} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
