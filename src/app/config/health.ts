import { type ChartConfig } from "@/components/ui/chart"

export type HealthTrendItem = {
  date: string;
  score: number;
};

export type Reputation = {
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  crisis_incidents: number;
};

export type BrandHealthResponse = {
  brand_id: string;
  days: number;
  health_score: number;
  health_trend: HealthTrendItem[];
  reputation: Reputation;
};

export type SystemHealthResponse = {
  processed_per_hour: number;
  error_count_1h: number;
  db_record_count: number;
};

export type MetricValue = {
  current: number;
  previous: number;
  trend: number;
};

export type BusinessMetricsResponse = {
  nps: MetricValue;
  positive_to_negative_ratio: MetricValue;
  neutral_share_percent: MetricValue;
  engagement_score: MetricValue;
  crisis_incidents_count: MetricValue;
};

export type Collector = {
  source_id: string;
  name: string;
  source_type: string;
  status: "idle" | "processing" | "error";
  last_fetched_at: string;
  error_message: string | null;
};

export const healthTrendConfig = {
  score: { label: "Индекс здоровья", color: "#4fd168" },
} satisfies ChartConfig
