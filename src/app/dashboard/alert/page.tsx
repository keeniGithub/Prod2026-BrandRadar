"use client"

import AlertCard from "@/components/alert-card"
import { useAlerts } from "@/components/alert-context"
import { acknowledgeAlert, resolveAlert } from "@/app/api/alerts"
import { Button } from "@/components/ui/button"
import { CheckCheck, Eye, Plus } from "lucide-react"
import toast from "react-hot-toast"
import { addLocalAudit } from "@/lib/local-audit"
import { Skeleton } from "@/components/ui/skeleton"

export default function AlertPage() {
  const { alerts, loading, markAsRead, markAllAsRead, refreshAlerts, unreadCount, injectTestAlert, updateAlertLocal } = useAlerts()

  const handleAcknowledge = async (id: string) => {
    const alert = alerts.find((a) => a.id === id)
    try {
      const res = await acknowledgeAlert(id)
      if (res.status === 200) {
        markAsRead(id)
        await refreshAlerts()
        toast.success('Алерт принят')
        addLocalAudit('Алерт принят', `Алерт "${alert?.title}" принят`)
        return
      }
    } catch (err) {
      // Fallback: применяем изменение локально при сетевой ошибке
      console.error('[Alerts] Ошибка подтверждения алерта:', err)
    }
    updateAlertLocal(id, { status: 'acknowledged', acknowledged_at: new Date().toISOString() })
    markAsRead(id)
    toast.success('Алерт принят')
    addLocalAudit('Алерт принят', `Алерт "${alert?.title}" принят`)
  }

  const handleResolve = async (id: string) => {
    const alert = alerts.find((a) => a.id === id)
    try {
      const res = await resolveAlert(id)
      if (res.status === 200) {
        markAsRead(id)
        await refreshAlerts()
        toast.success('Алерт решён')
        addLocalAudit('Алерт решён', `Алерт "${alert?.title}" решён`)
        return
      }
    } catch (err) {
      console.error('[Alerts] Ошибка перевода алерта в resolved:', err)
    }
    updateAlertLocal(id, { status: 'resolved', resolved_at: new Date().toISOString() })
    markAsRead(id)
    toast.success('Алерт решён')
    addLocalAudit('Алерт решён', `Алерт "${alert?.title}" решён`)
  }

  const handleRead = (id: string) => {
    const alert = alerts.find((a) => a.id === id)
    markAsRead(id)
    toast('Прочитано', { icon: <Eye className="w-4 h-4"/> })
    addLocalAudit('Алерт прочитан', `Алерт "${alert?.title}" прочитан`)
  }

  const readIds = new Set(
    JSON.parse(typeof window !== "undefined" ? localStorage.getItem("readAlertIds") ?? "[]" : "[]") as string[]
  )

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Алерты</h1>
        <div className="flex gap-2">
          {process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={injectTestAlert} className="gap-2 border-dashed">
              <Plus className="size-4" />
              Тест
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => { markAllAsRead(); toast.success('Все алерты прочитаны'); addLocalAudit('Все алерты прочитаны', `Прочитано ${alerts.length} алертов`) }} className="gap-2">
              <CheckCheck className="size-4" />
              Прочитать все
            </Button>
          )}
        </div>
      </div>
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border p-4 shadow-sm bg-card">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Skeleton className="h-3 w-10 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
            </div>
          </div>
        ))
      ) : alerts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Нет алертов</p>
      ) : null}
      {!loading && alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          isRead={readIds.has(alert.id)}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
          onRead={handleRead}
        />
      ))}
    </div>
  )
}
