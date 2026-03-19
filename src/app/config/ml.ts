/**
 * ML Service Configuration and Types
 */

export type MLModelMetrics = {
  type: string
  precision?: number
  recall?: number
  f1?: number
  accuracy?: number
  base_model?: string
  macro_f1?: number
  negative_f1?: number
  neutral_f1?: number
  positive_f1?: number
}

export type MLMetrics = {
  train_rows: number
  test_rows: number
  train_date_range: string
  test_date_range: string
  relevance: MLModelMetrics
  sentiment: MLModelMetrics
}

export type MLFeedbackField = {
  total: number
  last_7d: number
  last_30d: number
}

export type MLFeedback = {
  total: number
  by_field: {
    relevance: MLFeedbackField
    sentiment: MLFeedbackField
  }
  degradation_alert: boolean
}

export type MLHealthResponse = {
  status: "ok" | string
  models_loaded: string[]
  embed_model_loaded: boolean
  model_version: string
  trained_at: string
  sentiment_type: string
  relevance_threshold: number
  uncertainty_upper: number
  metrics: MLMetrics
  feedback: MLFeedback
}
