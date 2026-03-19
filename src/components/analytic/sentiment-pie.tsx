"use client"

import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart } from "recharts"
import { BarChart3 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { sentimentChartConfig, SentimentResponse } from "@/app/config/analytic"
import { getSentiment } from "@/app/api/analytic"
import { useBrand } from "@/components/brand-context"

const sentimentLabels: Record<string, { label: string; fill: string }> = {
  positive: { label: "Позитив", fill: "#4fd168" },
  neutral: { label: "Нейтрально", fill: "#94a3b8" },
  negative: { label: "Негатив", fill: "#ef4444" },
}

interface SentimentPieProps {
  /** Период наблюдения в днях */
  days: number
}

export function SentimentPie({ days }: SentimentPieProps) {
  const { selectedBrand } = useBrand()
  const [sentiment, setSentiment] = useState<SentimentResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBrand) {
      setSentiment(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    getSentiment(selectedBrand.id, days)
      .then((res) => {
        if (active && res.status === 200) {
          setSentiment(res.data)
        }
      })
      .catch((err) => {
        console.error('[SentimentPie] Ошибка загрузки тональности:', err)
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

  const sentimentData = sentiment
    ? Object.entries(sentiment.distribution).map(([key, value]) => ({
        name: sentimentLabels[key]?.label ?? key,
        value,
        fill: sentimentLabels[key]?.fill ?? "#94a3b8",
      }))
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-5" />
          Тональность
        </CardTitle>
        <CardDescription>Распределение за период</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {loading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : (
          <ChartContainer config={sentimentChartConfig} className="h-64 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                strokeWidth={2}
              >
                {sentimentData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                formatter={(value: string) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
