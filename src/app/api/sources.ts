import { AxiosResponse } from "axios";
import {
    Source,
    CreateSourcePayload,
    UpdateSourcePayload,
    CollectorLastRunResponse,
} from "../config/sources";
import { mockApi } from "./mock"

export async function getCollectorLastRun(): Promise<AxiosResponse<CollectorLastRunResponse>> {
  return mockApi.getCollectorLastRun()
}

export async function getSources(enabledOnly?: boolean): Promise<AxiosResponse<Source[]>> {
  return mockApi.getSources(enabledOnly)
}

export async function getSource(sourceId: string): Promise<AxiosResponse<Source>> {
  return mockApi.getSource(sourceId)
}

export async function createSource(data: CreateSourcePayload): Promise<AxiosResponse<Source>> {
  return mockApi.createSource(data)
}

export async function updateSource(sourceId: string, data: UpdateSourcePayload): Promise<AxiosResponse<Source>> {
  return mockApi.updateSource(sourceId, data)
}

export async function deleteSource(sourceId: string): Promise<AxiosResponse> {
  return mockApi.deleteSource(sourceId)
}
