import { AuditEvent, AuditFilters } from "../config/audit";
import { mockApi } from "./mock"

export async function getEvents(filters?: AuditFilters) {
  return mockApi.getEvents(filters)
}
