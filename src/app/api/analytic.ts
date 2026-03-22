import { mockApi } from "./mock"

export async function getSummary(brand_id: string, days: number = 7) {
  return mockApi.getSummary(brand_id, days)
}

export async function getTimeline(brand_id: string, days: number = 7) {
  return mockApi.getTimeline(brand_id, days)
}

export async function getSentiment(brand_id: string, days: number = 7) {
  return mockApi.getSentiment(brand_id, days)
}

export async function getSources(brand_id: string, days: number = 7) {
  return mockApi.getAnalyticSources(brand_id, days)
}

export async function getRisk(brand_id: string, days: number = 7) {
  return mockApi.getRisk(brand_id, days)
}

export async function getMentions(brand_id: string, sentiment?: string) {
  return mockApi.getMentions(brand_id, sentiment)
}