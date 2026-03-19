"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useBrand } from "@/components/brand-context"
import { getBusinessMetrics } from "@/app/api/health"
import { BusinessMetricsResponse, MetricValue } from "@/app/config/health"

type MetricRow = {
  name: string
  key: keyof BusinessMetricsResponse
  format: (v: number) => string
  invertTrend?: boolean
}

const metricRows: MetricRow[] = [
  { name: "NPS (Net Promoter Score)", key: "nps", format: (v) => (v >= 0 ? `+${v}` : String(v)) },
  { name: "Соотношение позитива к негативу", key: "positive_to_negative_ratio", format: (v) => v.toFixed(2) },
  { name: "Доля нейтральных упоминаний", key: "neutral_share_percent", format: (v) => `${v}%` },
  { name: "Вовлечённость аудитории", key: "engagement_score", format: (v) => `${v}%` },
  { name: "Количество кризисных инцидентов", key: "crisis_incidents_count", format: (v) => String(v), invertTrend: true },
]

function formatTrend(metric: MetricValue, invertTrend?: boolean) {
  const { trend } = metric
  const arrow = trend >= 0 ? "↑" : "↓"
  const label = `${arrow} ${Math.abs(trend)}`
  const isNegative = invertTrend ? trend > 0 : trend < 0
  const badgeClass = isNegative
    ? "bg-red-100 text-red-700 hover:bg-red-100"
    : "bg-green-100 text-green-700 hover:bg-green-100"
  return { label, badgeClass }
}

export function BusinessMetrics() {
  const { selectedBrand } = useBrand()
  const [data, setData] = useState<BusinessMetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBrand) {
      setData(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    getBusinessMetrics(selectedBrand.id)
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
  }, [selectedBrand])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ключевые бизнес-метрики репутации</CardTitle>
        <CardDescription>Сравнение текущей и прошлой недели</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Метрика</TableHead>
              <TableHead className="text-right">Текущее значение</TableHead>
              <TableHead className="text-right">Неделю назад</TableHead>
              <TableHead className="text-right">Тренд</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: metricRows.length }).map((_, idx) => (
                  <TableRow key={`business-metric-skeleton-${idx}`}>
                    <TableCell><Skeleton className="h-4 w-56" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-6 w-14 rounded-full" /></TableCell>
                  </TableRow>
                ))
              : metricRows.map((row) => {
              const metric = data?.[row.key]
              const current = metric ? row.format(metric.current) : "—"
              const previous = metric ? row.format(metric.previous) : "—"
              const trend = metric ? formatTrend(metric, row.invertTrend) : null

              return (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right">{current}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {previous}
                  </TableCell>
                  <TableCell className="text-right">
                    {trend && (
                      <Badge variant="secondary" className={trend.badgeClass}>
                        {trend.label}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
