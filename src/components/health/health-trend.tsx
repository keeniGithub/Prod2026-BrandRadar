"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp } from "lucide-react"
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
import { healthTrendConfig, BrandHealthResponse } from "@/app/config/health"
import { getBrandHealth } from "@/app/api/health"
import { useBrand } from "@/components/brand-context"

export function HealthTrend() {
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

  const trendData = (data?.health_trend ?? []).map((item) => ({
    date: new Date(item.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
    score: item.score,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          Динамика здоровья бренда
        </CardTitle>
        <CardDescription>Индекс здоровья за последние 2 недели</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : (
          <ChartContainer config={healthTrendConfig} className="h-64 w-full">
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4fd168" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4fd168" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[50, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#4fd168"
              fill="url(#fillScore)"
              strokeWidth={2}
            />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
