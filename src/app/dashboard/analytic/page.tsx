"use client"

import { useState } from "react"
import { KpiCards } from "@/components/analytic/kpi-cards"
import { MentionsChart } from "@/components/analytic/mentions-chart"
import { SentimentPie } from "@/components/analytic/sentiment-pie"
import { SourceChart } from "@/components/analytic/source-chart"
import { RiskChart } from "@/components/analytic/risk-chart"
import { MentionsTable } from "@/components/analytic/mentions-table"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Доступные периоды для фильтра аналитики */
const DAYS_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 1, label: "Сегодня" },
  { value: 7, label: "7 дней" },
  { value: 14, label: "14 дней" },
  { value: 30, label: "30 дней" },
  { value: 90, label: "90 дней" },
]

const DEFAULT_DAYS = 7

export default function Analytic() {
  const [days, setDays] = useState<number>(DEFAULT_DAYS)

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Аналитика</h1>
        {/* Единый фильтр периода — управляет всеми компонентами на странице */}
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground shrink-0">Период:</Label>
          <Select
            value={String(days)}
            onValueChange={(v) => setDays(Number(v))}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <KpiCards days={days} />

      <div className="grid gap-4 lg:grid-cols-3">
        <MentionsChart days={days} />
        <SentimentPie days={days} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SourceChart days={days} />
        <RiskChart days={days} />
      </div>

      <MentionsTable />
    </div>
  )
}
