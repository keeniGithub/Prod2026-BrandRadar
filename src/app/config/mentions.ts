import { Mention } from "./analytic"

export type FeedOrderBy = "published_at" | "relevance_score"
export type FeedSortOrder = "asc" | "desc"

export type FeedParams = {
    brand_id: string
    sentiment?: string | null
    relevant_only?: boolean
    source_type?: string | null
    q?: string | null
    order_by?: FeedOrderBy
    sort_order?: FeedSortOrder
    offset?: number
    limit?: number
}

export type { Mention }

export type SimilarMention = {
    id: string
    title: string | null
    text: string
    url: string | null
    published_at: string
    source_name: string
    sentiment_label: string | null
    relevance_score: number | null
    relation: "duplicate" | "cluster"
}
