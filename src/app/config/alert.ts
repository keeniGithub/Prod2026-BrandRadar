export type AlertStatus = "fired" | "acknowledged" | "resolved"

export interface Alert {
  id: string
  project_id: string
  brand_id: string | null
  cluster_id: string | null
  title: string
  message: string | null
  threshold: number
  window_seconds: number
  cooldown_seconds: number
  actual_count: number
  status: AlertStatus
  fired_at: string
  acknowledged_at: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export const statusConfig: Record<AlertStatus, { label: string; color: string }> = {
  fired: { label: "Активен", color: "text-red-500" },
  acknowledged: { label: "Принят", color: "text-yellow-500" },
  resolved: { label: "Решён", color: "text-green-500" },
}

export type SentimentFilter = "positive" | "negative" | "neutral"

export const SENTIMENT_OPTIONS: Array<{ value: SentimentFilter; label: string }> = [
  { value: "negative", label: "Негатив" },
  { value: "positive", label: "Позитив" },
  { value: "neutral", label: "Нейтрал" },
]

export const SENTIMENT_LABELS: Record<SentimentFilter, string> = {
  negative: "негатив",
  positive: "позитив",
  neutral: "нейтрал",
}

export interface AlertRulePayload {
  brand_id: string
  threshold: number
  window_seconds: number
  cooldown_seconds: number
  sentiment_filter: SentimentFilter
  is_enabled: boolean
}

export interface AlertRule extends AlertRulePayload {
  id: string
  last_fired_at: string | null
  created_at: string
  updated_at: string
}

export interface AlertRuleUpdatePayload {
  threshold: number
  window_seconds: number
  cooldown_seconds: number
  sentiment_filter: SentimentFilter
  is_enabled: boolean
}