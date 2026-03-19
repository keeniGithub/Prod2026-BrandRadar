"use client"

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Alert } from "@/app/config/alert"
import { getAlerts } from "@/app/api/alerts"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import { path } from "@/app/config/api"
import { generateClientId } from "@/lib/utils"
import { showPushNotification } from "@/lib/push"

interface AlertContextValue {
  alerts: Alert[]
  loading: boolean
  unreadCount: number
  markAsRead: (alertId: string) => void
  markAllAsRead: () => void
  refreshAlerts: () => Promise<void>
  injectTestAlert: () => void
  updateAlertLocal: (id: string, patch: Partial<Alert>) => void
}

const STORAGE_KEY = "readAlertIds"

const AlertContext = createContext<AlertContextValue | null>(null)

function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const controllerRef = useRef<AbortController | null>(null)
  const notifiedAlertIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setReadIds(getReadIds())
  }, [])

  const refreshAlerts = useCallback(async () => {
    try {
      const response = await getAlerts()
      if (response.status === 200) {
        setAlerts(response.data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAlerts()
  }, [refreshAlerts])

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return

    const controller = new AbortController()
    controllerRef.current = controller

    const baseURL = process.env.NEXT_PUBLIC_API ?? ""

    fetchEventSource(`${baseURL}${path.ALERTS.STREAM}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      onmessage(event) {
        try {
          const alert = JSON.parse(event.data) as Alert

          if (alert.status === "fired") {
            const shouldNotify = !notifiedAlertIdsRef.current.has(alert.id)
            if (shouldNotify) {
              notifiedAlertIdsRef.current.add(alert.id)
              void showPushNotification(alert.title, {
                body: alert.message ?? `Сработал алерт: ${alert.actual_count} упоминаний (порог: ${alert.threshold})`,
                tag: `alert-${alert.id}`,
                data: { alertId: alert.id },
              })
            }
          }

          setAlerts((prev) => {
            const idx = prev.findIndex((a) => a.id === alert.id)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = alert
              return next
            }
            return [alert, ...prev]
          })
        } catch (err) {
          // Ломаный JSON от SSE не должен крашить стрим — только логируем
          console.error('[AlertContext] Ошибка парсинга SSE-события:', err)
        }
      },
      onerror(err) {
        // SSE-библиотека переподключается самостоятельно; логируем для диагностики
        console.warn('[AlertContext] SSE ошибка соединения, переподключение...', err)
      },
    })

    return () => controller.abort()
  }, [])

  const markAsRead = useCallback((alertId: string) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(alertId)
      saveReadIds(next)
      return next
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev)
      alerts.forEach((a) => next.add(a.id))
      saveReadIds(next)
      return next
    })
  }, [alerts])

  const unreadCount = alerts.filter((a) => a.status === "fired" && !readIds.has(a.id)).length

  const injectTestAlert = useCallback(() => {
    const id = generateClientId()
    const titles = [
      "Всплеск негатива: Сбой сервиса",
      "Всплеск упоминаний: Запуск продукта",
      "Репутационная угроза: Утечка данных",
      "Критический негатив: Судебный иск",
      "Аномальная активность: Спам-атака",
    ]
    const messages = [
      "Обнаружено резкое увеличение негативных упоминаний за последний час.",
      "Количество упоминаний превысило заданный порог.",
      null,
      "Зафиксирован рост негативных публикаций в СМИ.",
    ]
    const now = new Date().toISOString()
    const testAlert: Alert = {
      id,
      project_id: "test-project",
      brand_id: "test-brand",
      cluster_id: null,
      title: titles[Math.floor(Math.random() * titles.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      threshold: Math.floor(Math.random() * 20) + 5,
      window_seconds: 3600,
      cooldown_seconds: 3600,
      actual_count: Math.floor(Math.random() * 50) + 10,
      status: "fired",
      fired_at: now,
      acknowledged_at: null,
      resolved_at: null,
      created_at: now,
      updated_at: now,
    }
    setAlerts((prev) => [testAlert, ...prev])
  }, [])

  const updateAlertLocal = useCallback((id: string, patch: Partial<Alert>) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, ...patch, updated_at: new Date().toISOString() } : a))
  }, [])

  return (
    <AlertContext.Provider value={{ alerts, loading, unreadCount, markAsRead, markAllAsRead, refreshAlerts, injectTestAlert, updateAlertLocal }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlerts() {
  const context = useContext(AlertContext)
  if (!context) throw new Error("useAlerts must be used within AlertProvider")
  return context
}
