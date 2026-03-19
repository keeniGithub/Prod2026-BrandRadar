import { AuditEvent, AuditFilters } from "../config/audit";
import { path } from "../config/api";
import { API } from "../config/axios";
import { projectId } from "../config/brands";
import { getErrorResponse } from "../config/request";

export async function getEvents(filters?: AuditFilters) {
    try {
        const response = await API.get<AuditEvent[]>(path.BRANDS.EVENTS(projectId), {
            params: {
                type: filters?.type ?? undefined,
                since: filters?.since ?? undefined,
                offset: filters?.offset ?? 0,
                limit: filters?.limit ?? 100,
            }
        });
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<AuditEvent[]>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}
