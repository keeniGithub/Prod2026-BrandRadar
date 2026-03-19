import { describe, it, expect } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { getErrorResponse } from './request'

function makeAxiosError(status: number, data: unknown): AxiosError {
  const error = new AxiosError('Request failed')
  error.response = {
    status,
    data,
    statusText: String(status),
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  }
  return error
}

describe('getErrorResponse()', () => {
  it('returns the axios response when the error is an AxiosError with a response', () => {
    const error = makeAxiosError(422, { detail: 'Validation error' })
    const result = getErrorResponse(error)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(422)
    expect(result!.data).toEqual({ detail: 'Validation error' })
  })

  it('returns null when the AxiosError has no response (e.g. network timeout)', () => {
    const error = new AxiosError('Network Error')
    // no .response assigned
    const result = getErrorResponse(error)
    expect(result).toBeNull()
  })

  it('returns null for a plain Error (non-Axios)', () => {
    expect(getErrorResponse(new Error('oops'))).toBeNull()
  })

  it('returns null for null', () => {
    expect(getErrorResponse(null)).toBeNull()
  })

  it('returns null for a string', () => {
    expect(getErrorResponse('something went wrong')).toBeNull()
  })

  it('preserves generic type — returned data matches the typed shape', () => {
    type Payload = { token: string }
    const error = makeAxiosError(401, { token: 'abc' })
    const result = getErrorResponse<Payload>(error)
    // TypeScript would enforce this; at runtime we just verify the value
    expect(result!.data.token).toBe('abc')
  })
})
