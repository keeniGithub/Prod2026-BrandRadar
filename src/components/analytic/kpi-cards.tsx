"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  MessageSquare,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBrand } from "@/components/brand-context"
import { getSummary } from "@/app/api/analytic"
import { SummaryResponse } from "@/app/config/analytic"

interface KpiCardsProps {
  /** Период наблюдения в днях (передаётся из родительской страницы) */
  days: number
}

export function KpiCards({ days }: KpiCardsProps) {
  const { selectedBrand } = useBrand()
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBrand) {
      setSummary(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    getSummary(selectedBrand.id, days)
      .then((res) => {
        if (active && res.status === 200) {
          setSummary(res.data)
        }
      })
      .catch((err) => {
        console.error('[KpiCards] Ошибка загрузки сводки:', err)
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedBrand, days])

  const total = summary?.by_sentiment
    ? summary.by_sentiment.positive + summary.by_sentiment.neutral + summary.by_sentiment.negative
    : 0
  const positivePercent = total > 0 ? Math.round((summary!.by_sentiment.positive / total) * 100) : 0
  const negativePercent = total > 0 ? Math.round((summary!.by_sentiment.negative / total) * 100) : 0

  const valueContent = (value: string | number, subtitle: string, className?: string) => {
    if (loading) {
      return (
        <>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="mt-2 h-3 w-28" />
        </>
      )
    }

    return (
      <>
        <div className={className ?? "text-2xl font-bold"}>{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Всего упоминаний
          </CardTitle>
          <MessageSquare className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {valueContent(summary?.total ?? 0, `За последние ${days} дней`)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Позитив
          </CardTitle>
          <TrendingUp className="size-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {valueContent(`${positivePercent}%`, `${summary?.by_sentiment.positive ?? 0} упоминаний`, "text-2xl font-bold text-green-600")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Негатив
          </CardTitle>
          <TrendingDown className="size-4 text-red-500" />
        </CardHeader>
        <CardContent>
          {valueContent(`${negativePercent}%`, `${summary?.by_sentiment.negative ?? 0} упоминаний`, "text-2xl font-bold text-red-600")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Активные алерты
          </CardTitle>
          <AlertTriangle className="size-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {valueContent(summary?.active_alerts ?? 0, "Текущие алерты")}
        </CardContent>
      </Card>
    </div>
  )
}
