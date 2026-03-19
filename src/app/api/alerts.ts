import { Alert, AlertRule, AlertRulePayload, AlertRuleUpdatePayload } from "../config/alert";
import { path } from "../config/api";
import { API } from "../config/axios";
import { projectId } from "../config/brands";
import { getErrorResponse } from "../config/request";

export async function getAlerts() {
    try {
        const response = await API.get<Alert[]>(path.ALERTS.LIST(projectId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Alert[]>(error);
        if (response) { return response; }
        throw error;
    }
}

export async function getAlert(alertId: string) {
    try {
        const response = await API.get<Alert>(path.ALERTS.GET(alertId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Alert>(error);
        if (response) { return response; }
        throw error;
    }
}

export async function acknowledgeAlert(alertId: string) {
    try {
        const response = await API.post<Alert>(path.ALERTS.ACKNOWLEDGE(alertId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Alert>(error);
        if (response) { return response; }
        throw error;
    }
}

export async function resolveAlert(alertId: string) {
    try {
        const response = await API.post<Alert>(path.ALERTS.RESOLVE(alertId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Alert>(error);
        if (response) { return response; }
        throw error;
    }
}

export async function createAlertRule(payload: AlertRulePayload) {
    try {
        const response = await API.post(path.ALERT_RULES.CREATE(projectId), payload);
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse(error);
        if (response) { return response; }
        throw error;
    }
}

export async function getAlertRules(brand_id: string) {
    try {
        const response = await API.get<AlertRule[]>(path.ALERT_RULES.LIST(projectId), {
            params: { brand_id, enabled_only: false }
        });
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<AlertRule[]>(error);
        if (response) { return response; }
        throw error;
    }
}

export async function updateAlertRule(ruleId: string, payload: AlertRuleUpdatePayload) {
    try {
        const response = await API.put<AlertRule>(path.ALERT_RULES.UPDATE(ruleId), payload);
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<AlertRule>(error);
        if (response) { return response; }
        throw error;
    }
}

export async function deleteAlertRule(ruleId: string) {
    try {
        const response = await API.delete(path.ALERT_RULES.DELETE(ruleId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse(error);
        if (response) { return response; }
        throw error;
    }
}
