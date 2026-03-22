import { mockApi } from "./mock"

export async function pingAPI(): Promise<number> {
  return mockApi.pingAPI()
}

export async function pingCollector(): Promise<number> {
  return mockApi.pingCollector()
}

export async function pingML(): Promise<string> {
  return mockApi.pingML()
}

export async function pingDB(): Promise<string> {
  return mockApi.pingDB()
}
