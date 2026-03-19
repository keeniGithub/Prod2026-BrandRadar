import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { API } from './axios'

const mock = new MockAdapter(API)

beforeEach(() => {
  mock.reset()
  mock.onAny().reply(200, {})
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('API axios instance — auth interceptor', () => {
  it('injects Authorization header when a token is stored', async () => {
    localStorage.setItem('token', 'test-token-xyz')

    const response = await API.get('/ping')

    expect(response.config.headers['Authorization']).toBe('Bearer test-token-xyz')
  })

  it('does not set Authorization header when no token is stored', async () => {
    const response = await API.get('/ping')

    expect(response.config.headers['Authorization']).toBeUndefined()
  })

  it('uses the most recent token on every request', async () => {
    localStorage.setItem('token', 'first-token')
    await API.get('/ping')

    localStorage.setItem('token', 'second-token')
    const response = await API.get('/ping')

    expect(response.config.headers['Authorization']).toBe('Bearer second-token')
  })

  it('removes the header after the token is cleared', async () => {
    localStorage.setItem('token', 'some-token')
    await API.get('/ping')

    localStorage.removeItem('token')
    const response = await API.get('/ping')

    expect(response.config.headers['Authorization']).toBeUndefined()
  })
})
