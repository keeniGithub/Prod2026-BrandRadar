import type { AxiosResponse } from "axios"
import { path } from "../config/api"
import { API, ML } from "../config/axios"
import type { FeedbackPayload, FeedbackResponse } from "../config/feedback"
import type { Mention } from "../config/analytic"
import { getErrorResponse } from "../config/request"

export async function sendMlFeedback(data: FeedbackPayload): Promise<AxiosResponse<FeedbackResponse>> {
    try {
        const response = await ML.post<FeedbackResponse>(path.ML.FEEDBACK, data)
        return response
    } catch (error: unknown) {
        const response = getErrorResponse<FeedbackResponse>(error)
        if (response) {
            return response
        }
        throw error
    }
}

export interface RetrainStatus {
    is_training: boolean
    feedback_count: number
    auto_retrain_threshold: number
    trained_at: string | null
    last_error: string | null
}

export async function getRetrainStatus(): Promise<AxiosResponse<RetrainStatus>> {
    return ML.get<RetrainStatus>(path.ML.RETRAIN_STATUS)
}

export async function triggerRetrain(): Promise<AxiosResponse<RetrainStatus>> {
    return ML.post<RetrainStatus>(path.ML.RETRAIN)
}

export async function updateRetrainConfig(threshold: number): Promise<AxiosResponse<{ auto_retrain_threshold: number }>> {
    return ML.patch(path.ML.RETRAIN_CONFIG, { auto_retrain_threshold: threshold })
}

export async function patchMentionFeedback(
    mentionId: string,
    data: { sentiment_label?: string; relevance_label?: string }
): Promise<AxiosResponse<Mention>> {
    try {
        const response = await API.patch<Mention>(path.MENTIONS.FEEDBACK(mentionId), data)
        return response
    } catch (error: unknown) {
        const response = getErrorResponse<Mention>(error)
        if (response) {
            return response
        }
        throw error
    }
}
