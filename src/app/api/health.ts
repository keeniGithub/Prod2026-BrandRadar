import { BrandHealthResponse, BusinessMetricsResponse, SystemHealthResponse, Collector } from "../config/health";
import { path } from "../config/api";
import { API } from "../config/axios";
import { projectId } from "../config/brands";
import { getErrorResponse } from "../config/request";

export async function getBrandHealth(brand_id: string, days: number = 7) {
    try {
        const response = await API.get<BrandHealthResponse>(path.HEALTH.BRAND(projectId), {
            params: { brand_id, days }
        });
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<BrandHealthResponse>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getSystemHealth() {
    try {
        const response = await API.get<SystemHealthResponse>(path.HEALTH.SYSTEM(projectId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<SystemHealthResponse>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getBusinessMetrics(brand_id: string) {
    try {
        const response = await API.get<BusinessMetricsResponse>(path.HEALTH.METRICS(projectId, brand_id));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<BusinessMetricsResponse>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getCollectors() {
    try {
        const response = await API.get<Collector[]>(path.HEALTH.COLLECTORS);
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Collector[]>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

/**
 * Запускает сбор данных для конкретного источника.
 * Соответствует POST /collector/run/{source_id}
 */
export async function runCollector(sourceId: string): Promise<void> {
    try {
        await API.post(path.COLLECTOR.RUN(sourceId));
    } catch (error: unknown) {
        const response = getErrorResponse(error);
        if (response) {
            return;
        }
        throw error;
    }
}

/**
 * Запускает пайплайн обработки данных.
 * Соответствует POST /pipeline/run
 */
export async function runPipeline(): Promise<void> {
    try {
        await API.post(path.PIPELINE.RUN);
    } catch (error: unknown) {
        const response = getErrorResponse(error);
        if (response) {
            return;
        }
        throw error;
    }
}