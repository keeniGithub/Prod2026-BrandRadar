import { path } from "../config/api";
import { path as ml_path } from "../config/router";
import { API, ML } from "../config/axios";
import { MLHealthResponse } from "../config/ml";
import { getErrorResponse } from "../config/request";

export async function pingAPI(): Promise<number> {
    try {
        const response = await API.get(path.PING);
        return response.status
    } catch (error: unknown) {
        const response = getErrorResponse(error);
        if (response) {
            return response.status;
        }
        throw error;
    }
}

export async function pingCollector(): Promise<number> {
    try {
        const response = await API.get<Array<{ status: string }>>(path.HEALTH.COLLECTORS);
        const hasErrors = response.data.some((collector: { status: string }) => collector.status === "error");
        return hasErrors ? 503 : response.status;
    } catch (error: unknown) {
        const response = getErrorResponse(error);
        if (response) {
            return response.status;
        }
        throw error;
    }
}

export async function pingML(): Promise<string> {
    try {
        const response = await ML.get<MLHealthResponse>(ml_path.HEALTH)
        if (!response) return "unavailable"
        const data = response.data
        const status: string = data.status ?? "unavailable"
        return status === "ok" ? "healthy" : status
    } catch {
        return "unavailable"
    }
}

export async function pingDB(): Promise<string> {
    try {
        const response = await API.get(path.HEALTH.STATUS);
        // Ищем компонент "database" в массиве ответа; если не найден — считаем недоступным
        const dbStatus: string | undefined = response.data.find(
            (item: { component: string }) => item.component === "database"
        )?.status;
        return dbStatus ?? "unavailable";
    } catch (error: unknown) {
        const response = getErrorResponse(error);
        if (response) {
            return String(response.status);
        }
        throw error;
    }
}
