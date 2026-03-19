import type { Metadata } from "next";
import { HealthKpi } from "@/components/health/health-kpi"
import { HealthTrend } from "@/components/health/health-trend"
import { ReputationSummary } from "@/components/health/reputation-summary"
import { BusinessMetrics } from "@/components/health/business-metrics"
import { SystemStats } from "@/components/health/system-stats"

export const metadata: Metadata = {
  title: "Здоровье бренда",
};

export default function Health() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Здоровье бренда</h1>
      <HealthKpi />

      <div className="grid gap-4 lg:grid-cols-2">
        <HealthTrend />
        <ReputationSummary />
      </div>

      <BusinessMetrics />
      <SystemStats />
    </div>
  )
}
