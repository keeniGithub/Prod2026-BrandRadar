"use client"

import { useEffect, useState } from "react"
import {
  Heart,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBrand } from "@/components/brand-context"
import { getBrandHealth } from "@/app/api/health"
import { BrandHealthResponse } from "@/app/config/health"

export function HealthKpi() {
  const { selectedBrand } = useBrand()
  const [data, setData] = useState<BrandHealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBrand) {
      setData(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    getBrandHealth(selectedBrand.id)
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

  const score = data?.health_score ?? 0
  const scoreColor = score >= 70 ? "text-green-600" : score >= 40 ? "text-yellow-600" : "text-red-600"

  const trend = data?.health_trend ?? []
  const prevScore = trend.length >= 2 ? trend[trend.length - 2].score : score
  const diff = score - prevScore
  const diffLabel = diff >= 0 ? `↑ ${diff} за период` : `↓ ${Math.abs(diff)} за период`

  const rep = data?.reputation
  const positivePct = rep?.positive_pct ?? 0
  const negativePct = rep?.negative_pct ?? 0
  const crisisIncidents = rep?.crisis_incidents ?? 0

  const kpiItems = [
    {
      title: "Индекс здоровья бренда",
      value: String(score),
      suffix: "/100",
      subtitle: diffLabel,
      icon: Heart,
      valueColor: scoreColor,
    },
    {
      title: "Позитивные упоминания",
      value: `${positivePct}%`,
      subtitle: "доля позитива",
      icon: TrendingUp,
      valueColor: "text-green-600",
    },
    {
      title: "Негативные упоминания",
      value: `${negativePct}%`,
      subtitle: "доля негатива",
      icon: TrendingDown,
      valueColor: "text-red-600",
    },
    {
      title: "Кризисные инциденты",
      value: String(crisisIncidents),
      subtitle: `за ${data?.days ?? 7} дн.`,
      icon: TriangleAlert,
      valueColor: crisisIncidents > 0 ? "text-red-600" : "text-green-600",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiItems.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="mt-2 h-3 w-24" />
              </>
            ) : (
              <>
                <div className={`text-2xl font-bold ${kpi.valueColor}`}>
                  {kpi.value}
                  {kpi.suffix && (
                    <span className="text-base font-normal text-muted-foreground">
                      {kpi.suffix}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
