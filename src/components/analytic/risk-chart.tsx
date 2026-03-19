"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { ShieldAlert } from "lucide-react"
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
import { riskChartConfig, RiskItem } from "@/app/config/analytic"
import { getRisk } from "@/app/api/analytic"
import { useBrand } from "@/components/brand-context"

const riskLabels: Record<string, { label: string; fill: string }> = {
  high: { label: "Высокий", fill: "#ef4444" },
  medium: { label: "Средний", fill: "#f59e0b" },
  low: { label: "Низкий", fill: "#3b82f6" },
  none: { label: "Нет", fill: "#d1d5db" },
}

interface RiskChartProps {
  /** Период наблюдения в днях */
  days: number
}

export function RiskChart({ days }: RiskChartProps) {
  const { selectedBrand } = useBrand()
  const [riskRaw, setRiskRaw] = useState<RiskItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBrand) {
      setRiskRaw([])
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    getRisk(selectedBrand.id, days)
      .then((res) => {
        if (active && res.status === 200) {
          setRiskRaw(res.data)
        }
      })
      .catch((err) => {
        console.error('[RiskChart] Ошибка загрузки рисков:', err)
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

  const riskData = riskRaw.map((item) => ({
    level: riskLabels[item.level]?.label ?? item.level,
    count: item.count,
    fill: riskLabels[item.level]?.fill ?? "#d1d5db",
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-5" />
          Уровень риска
        </CardTitle>
        <CardDescription>Распределение по уровням</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : (
          <ChartContainer config={riskChartConfig} className="h-64 w-full">
            <BarChart data={riskData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="level" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {riskData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
