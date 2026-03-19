"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import { sourceChartConfig, SourceItem } from "@/app/config/analytic"
import { getSources } from "@/app/api/analytic"
import { useBrand } from "@/components/brand-context"

interface SourceChartProps {
  /** Период наблюдения в днях */
  days: number
}

export function SourceChart({ days }: SourceChartProps) {
  const { selectedBrand } = useBrand()
  const [sourceData, setSourceData] = useState<SourceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBrand) {
      setSourceData([])
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    getSources(selectedBrand.id, days)
      .then((res) => {
        if (active && res.status === 200) {
          setSourceData(res.data)
        }
      })
      .catch((err) => {
        console.error('[SourceChart] Ошибка загрузки источников:', err)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Источники упоминаний</CardTitle>
        <CardDescription>Количество по типу источника</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : (
          <ChartContainer config={sourceChartConfig} className="h-64 w-full">
            <BarChart data={sourceData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                type="category"
                dataKey="source"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={70}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="mentions" fill="#4fd168" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
