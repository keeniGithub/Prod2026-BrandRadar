export type Sentiment = "negative" | "positive" | "neutral"
export type RiskLevel = "high" | "medium" | "low" | null

export interface MentionSource {
  url: string
  title: string
}

export interface MentionCluster {
  label: string
  similarCount: number
}

export interface MentionCardProps {
  source: string
  sourceIcon?: string
  timeAgo: string
  sentiment: Sentiment
  relevance: number
  riskLevel?: RiskLevel
  text: string
  highlightWords?: string[]
  cluster?: MentionCluster
  whyImportant: string
  riskWords?: string[]
  sources: MentionSource[]
}

export const sentimentConfig: Record<Sentiment, { label: string; color: string; border: string; bg: string }> = {
  negative: { label: "Негатив", color: "text-red-600", border: "border-l-red-500", bg: "bg-red-50" },
  positive: { label: "Позитив", color: "text-green-600", border: "border-l-green-500", bg: "bg-green-50" },
  neutral:  { label: "Нейтрально", color: "text-gray-600", border: "border-l-gray-400", bg: "bg-gray-50" },
}

export const riskConfig: Record<string, { label: string; bg: string; text: string }> = {
  high:   { label: "HIGH RISK", bg: "bg-red-100", text: "text-red-700" },
  medium: { label: "MEDIUM RISK", bg: "bg-yellow-100", text: "text-yellow-700" },
  low:    { label: "LOW RISK", bg: "bg-blue-100", text: "text-blue-700" },
}