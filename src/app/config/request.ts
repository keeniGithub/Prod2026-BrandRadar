import { AxiosError, AxiosResponse } from "axios"

export function getErrorResponse<T = unknown>(error: unknown): AxiosResponse<T> | null {
  if (error instanceof AxiosError && error.response) {
    return error.response as AxiosResponse<T>
  }
  return null
}
