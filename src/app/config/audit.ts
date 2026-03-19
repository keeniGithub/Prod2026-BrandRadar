export const typeBadge: Record<AuditEventType, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  alert: { label: "Алерт", variant: "destructive" },
  settings: { label: "Настройки", variant: "outline" },
  system: { label: "Система", variant: "secondary" },
  ml: { label: "ML", variant: "default" },
}

export type AuditEventType = "alert" | "settings" | "system" | "ml"

export type AuditEvent = {
  id: number
  time: string
  event: string
  type: AuditEventType
  user: string
  details: string
}

export type AuditFilters = {
  type?: AuditEventType | null
  since?: string | null
  offset?: number
  limit?: number
}