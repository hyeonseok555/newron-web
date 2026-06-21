import type { NewsItem } from "@/types/news";

const PERS_BASE = process.env.NEXT_PUBLIC_PERS_BASE ?? "http://121.134.239.75:7000";

export function resolveImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  return raw.startsWith("/") ? `${PERS_BASE}${raw}` : raw;
}

export function getBestImageUrl(item: NewsItem): string | null {
  const raw = item.thumbnail_url ?? item.image_url ?? item.imageUrl;
  return resolveImageUrl(raw);
}

export const CATEGORY_FALLBACK: Record<string, string> = {
  경제:     "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000",
  "경제/금융": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000",
  사회:     "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000",
  "사회/복지": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000",
  "IT/과학": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000",
  "생활/문화": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000",
  정치:     "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1000",
  세계:     "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1000",
  default:  "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1000",
};

export function getFallbackImage(category: string): string {
  return CATEGORY_FALLBACK[category] ?? CATEGORY_FALLBACK.default;
}
