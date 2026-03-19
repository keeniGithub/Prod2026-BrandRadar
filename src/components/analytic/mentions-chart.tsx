"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { Activity } from "lucide-react"
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
import { mentionsChartConfig, TimelineItem } from "@/app/config/analytic"
import { getTimeline } from "@/app/api/analytic"
import { useBrand } from "@/components/brand-context"

interface MentionsChartProps {
  /** Период наблюдения в днях */
  days: number
}

export function MentionsChart({ days }: MentionsChartProps) {
  const { selectedBrand } = useBrand()
  const [data, setData] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBrand) {
      setData([])
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    getTimeline(selectedBrand.id, days)
      .then((res) => {
        if (active && res.status === 200) {
          setData(res.data)
        }
      })
      .catch((err) => {
        console.error('[MentionsChart] Ошибка загрузки динамики:', err)
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

  const chartData = data.map((item) => {
    const d = new Date(item.date)
    const label = days === 1
      ? d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })
    return {
      date: label,
      positive: item.positive,
      neutral: item.neutral,
      negative: item.negative,
    }
  })

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5" />
          Динамика упоминаний
        </CardTitle>
        <CardDescription>Количество упоминаний по тональности</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-72 w-full rounded-lg" />
        ) : (
          <ChartContainer config={mentionsChartConfig} className="h-72 w-full">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4fd168" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4fd168" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillNeutral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="positive"
              stroke="#4fd168"
              fill="url(#fillPositive)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="neutral"
              stroke="#94a3b8"
              fill="url(#fillNeutral)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="negative"
              stroke="#ef4444"
              fill="url(#fillNegative)"
              strokeWidth={2}
            />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
