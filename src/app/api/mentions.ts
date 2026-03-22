import { FeedParams } from "../config/mentions"
import { mockApi } from "./mock"

export async function getSimilar(mentionId: string) {
  return mockApi.getSimilar(mentionId)
}

export async function markAsRead(mentionId: string) {
  return mockApi.markMentionRead(mentionId)
}

export async function getFeed(params: FeedParams) {
  return mockApi.getFeed(params)
}
