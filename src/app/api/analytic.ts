import { SummaryResponse, TimelineItem, SentimentResponse, SourceItem, RiskItem, Mention } from "../config/analytic";
import { path } from "../config/api";
import { API } from "../config/axios";
import { projectId } from "../config/brands";
import { getErrorResponse } from "../config/request";

export async function getSummary(brand_id: string, days: number = 7) {
    try {
        const response = await API.get<SummaryResponse>(path.ANALYTICS.SUMMARY(projectId), {
            params: { brand_id, days }
        });
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<SummaryResponse>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getTimeline(brand_id: string, days: number = 7) {
    const granularity = days === 1 ? "hour" : "day"
    try {
        const response = await API.get<TimelineItem[]>(path.ANALYTICS.TIMELINE(projectId), {
            params: { brand_id, days, granularity }
        });
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<TimelineItem[]>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getSentiment(brand_id: string, days: number = 7) {
    try {
        const response = await API.get<SentimentResponse>(path.ANALYTICS.SENTIMENT(projectId), {
            params: { brand_id, days }
        });
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<SentimentResponse>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getSources(brand_id: string, days: number = 7) {
    try {
        const response = await API.get<SourceItem[]>(path.ANALYTICS.SOURCES(projectId), {
            params: { brand_id, days }
        });
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<SourceItem[]>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getRisk(brand_id: string, days: number = 7) {
    try {
        const response = await API.get<RiskItem[]>(path.ANALYTICS.RIKS(projectId), {
            params: { brand_id, days }
        });
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<RiskItem[]>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getMentions(brand_id: string, sentiment?: string) {
    try {
        const response = await API.get<Mention[]>(path.MENTIONS.LIST(projectId), {
            params: {
                brand_id,
                order_by: "published_at",
                exclude_duplicates: true,
                limit: 10,
                offset: 0,
                ...(sentiment ? { sentiment } : {}),
            }
        });
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Mention[]>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}