import { mockApi } from "./mock"

export async function getBrandHealth(brand_id: string, days: number = 7) {
  return mockApi.getBrandHealth(brand_id, days)
}

export async function getSystemHealth() {
  return mockApi.getSystemHealth()
}

export async function getBusinessMetrics(brand_id: string) {
  return mockApi.getBusinessMetrics()
}

export async function getCollectors() {
  return mockApi.getCollectors()
}

/**
 * Запускает сбор данных для конкретного источника.
 * Соответствует POST /collector/run/{source_id}
 */
export async function runCollector(sourceId: string): Promise<void> {
  mockApi.runCollector(sourceId)
}

/**
 * Запускает пайплайн обработки данных.
 * Соответствует POST /pipeline/run
 */
export async function runPipeline(): Promise<void> {
  mockApi.runPipeline()
}