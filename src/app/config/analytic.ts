
import { type ChartConfig } from "@/components/ui/chart"

export type ByRelevance = {
    relevant: number;
    uncertain: number;
    irrelevant: number;
};

export type BySentiment = {
    positive: number;
    neutral: number;
    negative: number;
};

export type SummaryResponse = {
    brand_id: string;
    days: number;
    total: number;
    by_relevance: ByRelevance;
    by_sentiment: BySentiment;
    active_alerts: number;
};

export type TimelineItem = {
    date: string;
    total: number;
    positive: number;
    neutral: number;
    negative: number;
};

export type SentimentResponse = {
    brand_id: string;
    days: number;
    total: number;
    distribution: Record<string, number>;
    percentages: Record<string, number>;
};

export type SourceItem = {
    source: string;
    mentions: number;
};

export type RiskItem = {
    level: string;
    count: number;
};

export const mentionsChartConfig = {
  positive: { label: "Позитив", color: "#4fd168" },
  neutral: { label: "Нейтрально", color: "#94a3b8" },
  negative: { label: "Негатив", color: "#ef4444" },
} satisfies ChartConfig

export const sourceChartConfig = {
  mentions: { label: "Упоминания", color: "#4fd168" },
} satisfies ChartConfig

export const sentimentChartConfig = {
  value: { label: "Кол-во" },
  Позитив: { label: "Позитив", color: "#4fd168" },
  Нейтрально: { label: "Нейтрально", color: "#94a3b8" },
  Негатив: { label: "Негатив", color: "#ef4444" },
} satisfies ChartConfig

export const riskChartConfig = {
  count: { label: "Кол-во" },
  Высокий: { label: "Высокий", color: "#ef4444" },
  Средний: { label: "Средний", color: "#f59e0b" },
  Низкий: { label: "Низкий", color: "#3b82f6" },
  Нет: { label: "Нет", color: "#d1d5db" },
} satisfies ChartConfig

export type Mention = {
    brand_id: string;
    source_id: string;
    external_id: string;
    url: string;
    title: string;
    text: string;
    author: string | null;
    published_at: string;
    id: string;
    relevance_label: string;
    relevance_score: number;
    sentiment_label: string;
    sentiment_score: number;
    cluster_id: string | null;
    ml_metadata: unknown;
    is_duplicate: boolean;
    fingerprint: string;
    created_at: string;
    updated_at: string;
    duplicate_count: number;
    similar_count: number;
    duplicate_sources: { name: string; url: string | null }[];
    is_read: boolean;
};

export const sentimentBadge: Record<string, { label: string; className: string }> = {
  positive: { label: "Позитив", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  neutral: { label: "Нейтрально", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  negative: { label: "Негатив", className: "bg-red-100 text-red-700 hover:bg-red-100" },
}

export const riskBadge: Record<string, { label: string; className: string }> = {
  high: { label: "Высокий", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  medium: { label: "Средний", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  low: { label: "Низкий", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
}