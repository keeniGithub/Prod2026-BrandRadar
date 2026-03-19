import { Mention } from "../config/analytic";
import { FeedParams, SimilarMention } from "../config/mentions";
import { path } from "../config/api";
import { API } from "../config/axios";
import { projectId } from "../config/brands";
import { getErrorResponse } from "../config/request";

export async function getSimilar(mentionId: string) {
    try {
        const response = await API.get<SimilarMention[]>(path.MENTIONS.SIMILAR(mentionId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<SimilarMention[]>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function markAsRead(mentionId: string) {
    try {
        const response = await API.post(path.MENTIONS.READ(mentionId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getFeed(params: FeedParams) {
    try {
        const response = await API.get<Mention[]>(path.MENTIONS.FEED(projectId), {
            params: {
                brand_id: params.brand_id,
                offset: params.offset ?? 0,
                limit: params.limit ?? 50,
                ...(params.order_by ? { order_by: params.order_by } : {}),
                ...(params.sort_order ? { sort_order: params.sort_order } : {}),
                ...(params.sentiment ? { sentiment: params.sentiment } : {}),
                ...(params.relevant_only !== undefined ? { relevant_only: params.relevant_only } : {}),
                ...(params.source_type ? { source_type: params.source_type } : {}),
                ...(params.q ? { q: params.q } : {}),
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
