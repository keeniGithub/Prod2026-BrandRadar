import type { AxiosResponse } from "axios"
import type { FeedbackPayload, FeedbackResponse } from "../config/feedback"
import type { Mention } from "../config/analytic"
import { mockApi } from "./mock"

export async function sendMlFeedback(data: FeedbackPayload): Promise<AxiosResponse<FeedbackResponse>> {
  return mockApi.sendMlFeedback(data)
}

export interface RetrainStatus {
    is_training: boolean
    feedback_count: number
    auto_retrain_threshold: number
    trained_at: string | null
    last_error: string | null
}

export async function getRetrainStatus(): Promise<AxiosResponse<RetrainStatus>> {
  return mockApi.getRetrainStatus()
}

export async function triggerRetrain(): Promise<AxiosResponse<RetrainStatus>> {
  return mockApi.triggerRetrain()
}

export async function updateRetrainConfig(threshold: number): Promise<AxiosResponse<{ auto_retrain_threshold: number }>> {
  return mockApi.updateRetrainConfig(threshold)
}

export async function patchMentionFeedback(
    mentionId: string,
    data: { sentiment_label?: string; relevance_label?: string }
): Promise<AxiosResponse<Mention>> {
  return mockApi.patchMentionFeedback(mentionId, data)
}
