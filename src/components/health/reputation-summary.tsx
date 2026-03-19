"use client"

import { useEffect, useState } from "react"
import {
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Minus,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBrand } from "@/components/brand-context"
import { getBrandHealth } from "@/app/api/health"
import { BrandHealthResponse } from "@/app/config/health"

export function ReputationSummary() {
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

  const rep = data?.reputation

  const summaryItems = [
    {
      icon: ThumbsUp,
      label: "Позитивных упоминаний",
      value: `${rep?.positive_pct ?? 0}%`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Minus,
      label: "Нейтральных упоминаний",
      value: `${rep?.neutral_pct ?? 0}%`,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      icon: ThumbsDown,
      label: "Негативных упоминаний",
      value: `${rep?.negative_pct ?? 0}%`,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: AlertTriangle,
      label: "Кризисных инцидентов",
      value: String(rep?.crisis_incidents ?? 0),
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сводка репутации</CardTitle>
        <CardDescription>Ключевые показатели за неделю</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div key={`reputation-skeleton-${idx}`} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            : summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-md p-2 ${item.bgColor}`}>
                      <item.icon className={`size-4 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className={`text-lg font-bold ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}
