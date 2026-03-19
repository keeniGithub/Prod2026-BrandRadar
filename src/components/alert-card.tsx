"use client"

import { BellRing, Check, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, statusConfig } from "@/app/config/alert"
import { Button } from "@/components/ui/button"

interface AlertCardProps {
  alert: Alert
  isRead: boolean
  onAcknowledge?: (id: string) => void
  onResolve?: (id: string) => void
  onRead?: (id: string) => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  if (isToday) return time
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) + ", " + time
}

export default function AlertCard({ alert, isRead, onAcknowledge, onResolve, onRead }: AlertCardProps) {
  const { label, color } = statusConfig[alert.status]

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
        !isRead && alert.status === "fired" ? "bg-red-50 border-red-200" : "bg-card"
      )}
      onClick={() => !isRead && onRead?.(alert.id)}
    >
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
        alert.status === "fired" ? "bg-red-100 text-red-500" :
        alert.status === "acknowledged" ? "bg-yellow-100 text-yellow-600" :
        "bg-green-100 text-green-500"
      )}>
        <BellRing className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground truncate">{alert.title}</p>
          {!isRead && alert.status === "fired" && (
            <span className="inline-block size-2 rounded-full bg-red-500 shrink-0" />
          )}
        </div>
        {alert.message && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {alert.actual_count} упоминаний (порог: {alert.threshold}) &bull; Статус:{" "}
          <span className={cn("font-medium", color)}>{label}</span>
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-sm text-muted-foreground">{formatDate(alert.fired_at)}</span>
        <div className="flex gap-1">
          {alert.status === "fired" && onAcknowledge && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-yellow-600 hover:bg-yellow-50"
              onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id) }}
              title="Принять"
            >
              <Eye className="size-4" />
            </Button>
          )}
          {(alert.status === "fired" || alert.status === "acknowledged") && onResolve && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-green-600 hover:bg-green-50"
              onClick={(e) => { e.stopPropagation(); onResolve(alert.id) }}
              title="Решить"
            >
              <Check className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export type { AlertCardProps }
