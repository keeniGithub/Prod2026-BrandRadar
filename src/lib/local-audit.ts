import { AuditEvent } from "@/app/config/audit"
import { STORAGE_KEYS } from "@/app/config/constants"

const STORAGE_KEY = STORAGE_KEYS.AUDIT_EVENTS
const HIDDEN_STORAGE_KEY = STORAGE_KEYS.HIDDEN_EVENTS

export function getAuditEventKey(event: AuditEvent): string {
  return `${event.id}:${event.time}`
}

export function addLocalAudit(event: string, details: string) {
  const entries = getLocalAuditEvents()
  const entry: AuditEvent = {
    id: -(entries.length + 1),
    time: new Date().toISOString(),
    event,
    type: "alert",
    user: "Вы (локально)",
    details,
  }
  entries.unshift(entry)
  if (entries.length > 200) entries.length = 200
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function getLocalAuditEvents(): AuditEvent[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearLocalAudit() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getHiddenAuditEventKeys(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(HIDDEN_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHiddenAuditEventKeys(keys: string[]) {
  localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify(keys))
}

export function hideAuditEvent(event: AuditEvent) {
  const current = new Set(getHiddenAuditEventKeys())
  current.add(getAuditEventKey(event))
  saveHiddenAuditEventKeys(Array.from(current))
}

export function unhideAuditEvent(event: AuditEvent) {
  const current = new Set(getHiddenAuditEventKeys())
  current.delete(getAuditEventKey(event))
  saveHiddenAuditEventKeys(Array.from(current))
}
