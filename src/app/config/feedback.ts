export type FeedbackField = "sentiment" | "relevance"

export type SentimentFeedbackValue = "positive" | "neutral" | "negative"

export type RelevanceFeedbackValue = "relevant" | "uncertain" | "irrelevant"

export type FeedbackValue = SentimentFeedbackValue | RelevanceFeedbackValue

export type FeedbackPayload = {
    mention_id: string
    field: FeedbackField
    predicted: FeedbackValue
    correct: FeedbackValue
    title: string
    text: string
}

export type FeedbackResponse = {
    success?: boolean
    message?: string
}
