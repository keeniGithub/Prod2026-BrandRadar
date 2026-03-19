import { AxiosResponse } from "axios";
import {
    Source,
    CreateSourcePayload,
    UpdateSourcePayload,
    CollectorLastRunResponse,
} from "../config/sources";
import { path } from "../config/api";
import { API } from "../config/axios";
import { projectId } from "../config/brands";
import { getErrorResponse } from "../config/request";

export async function getCollectorLastRun(): Promise<AxiosResponse<CollectorLastRunResponse>> {
    try {
        const response = await API.get<CollectorLastRunResponse>(path.COLLECTOR.LASTRUN);
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<CollectorLastRunResponse>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getSources(enabledOnly?: boolean): Promise<AxiosResponse<Source[]>> {
    try {
        const response = await API.get<Source[]>(path.SOURCES.LIST(projectId), {
            params: {
                enabled_only: enabledOnly ?? false,
                offset: 0,
                limit: 100,
            },
        });
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Source[]>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getSource(sourceId: string): Promise<AxiosResponse<Source>> {
    try {
        const response = await API.get<Source>(path.SOURCES.GET(sourceId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Source>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function createSource(data: CreateSourcePayload): Promise<AxiosResponse<Source>> {
    try {
        const response = await API.post<Source>(path.SOURCES.CREATE(projectId), data);
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Source>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function updateSource(sourceId: string, data: UpdateSourcePayload): Promise<AxiosResponse<Source>> {
    try {
        const response = await API.put<Source>(path.SOURCES.UPDATE(sourceId), data);
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Source>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function deleteSource(sourceId: string): Promise<AxiosResponse> {
    try {
        const response = await API.delete(path.SOURCES.DELETE(sourceId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse(error);
        if (response) {
            return response;
        }
        throw error;
    }
}
