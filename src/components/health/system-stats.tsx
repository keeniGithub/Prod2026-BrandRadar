"use client"

import { useEffect, useState } from "react"
import {
  Activity,
  XCircle,
  Database,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getSystemHealth } from "@/app/api/health"
import { SystemHealthResponse } from "@/app/config/health"

export function SystemStats() {
  const [data, setData] = useState<SystemHealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getSystemHealth()
      .then((res) => {
        if (active && res.status === 200) {
          setData(res.data)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const systemStats = [
    {
      icon: Activity,
      label: "Обработано за час",
      value: data ? String(data.processed_per_hour.toLocaleString("ru-RU")) : "—",
      sublabel: "публикаций",
    },
    {
      icon: XCircle,
      label: "Ошибки обработки",
      value: data ? String(data.error_count_1h) : "—",
      sublabel: "за последний час",
    },
    {
      icon: Database,
      label: "Записей в БД",
      value: data ? data.db_record_count.toLocaleString("ru-RU") : "—",
      sublabel: "всего записей",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Технические показатели системы</CardTitle>
        <CardDescription>Текущее состояние системы мониторинга</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div key={`system-stat-skeleton-${idx}`} className="flex items-center gap-4 rounded-lg border p-4">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            : systemStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="rounded-md bg-muted p-2">
                    <stat.icon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}
