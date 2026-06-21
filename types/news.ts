export interface NewsItem {
  id: number;
  title: string;
  source_name: string;
  published_at: string;
  category: string;
  thumbnail_url?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  content_preview?: string;
}

export interface NewsDetail extends NewsItem {
  announcer_tone: string;
  original_url: string;
  script: {
    display: string[];
    audio: string[];
  };
}

export interface AiTemplate {
  id: string;
  label: string;
  type: "SUMMARY" | "DEFINITION" | "REASON" | string;
}

export interface AiAnswer {
  questionId: string;
  answer: string;
  referencedKeywords: string[];
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface BriefingItem {
  newsId: number;
  title: string;
  category: string;
  body: string;
  reason: string;
}

export interface Briefing {
  user_id: string;
  date: string;
  briefing: string;
  curated: BriefingItem[];
  liked_categories: string[];
  generated_at: string;
}

export interface WeeklyStatDay {
  day_name: string;
  this_week_date: string;
  this_week_score: number;
  last_week_date: string;
  last_week_score: number;
}

export interface WeeklyStats {
  weekly_stats: WeeklyStatDay[];
  comparison: {
    target_period_text: string;
    change_rate: number;
    is_upward: boolean;
    summary_message: string;
  };
}
