/**
 * Integration: api service ↔ authStore
 *
 * Unlike api.test.ts (which calls the interceptor function directly),
 * these tests make real HTTP requests through MockAdapter so the
 * interceptor runs inside the full axios pipeline.
 */
import MockAdapter from 'axios-mock-adapter'
import api from '../../src/services/api'
import { useAuthStore } from '../../src/stores/authStore'

const mock = new MockAdapter(api)

beforeEach(() => {
  useAuthStore.setState({ token: null, refreshToken: null, user: null })
  mock.reset()
})

afterAll(() => {
  mock.restore()
})

describe('API service ↔ Auth Store integration', () => {
  it('unauthenticated GET carries no Authorization header', async () => {
    let capturedAuth: string | undefined

    mock.onGet('/api/v1/auth/me').reply((config) => {
      capturedAuth = (config.headers as any)?.Authorization
      return [200, { email: 'test@example.com' }]
    })

    await api.get('/api/v1/auth/me')
    expect(capturedAuth).toBeUndefined()
  })

  it('authenticated GET carries Bearer token from the real auth store', async () => {
    useAuthStore.getState().setToken('integration-access-token')

    let capturedAuth: string | undefined
    mock.onGet('/api/v1/auth/me').reply((config) => {
      capturedAuth = (config.headers as any)?.Authorization
      return [200, { email: 'test@example.com' }]
    })

    await api.get('/api/v1/auth/me')
    expect(capturedAuth).toBe('Bearer integration-access-token')
  })

  it('authenticated POST carries Bearer token', async () => {
    useAuthStore.getState().setToken('post-token')

    let capturedAuth: string | undefined
    mock.onPost('/api/v1/inference/run').reply((config) => {
      capturedAuth = (config.headers as any)?.Authorization
      return [202, { job_id: 'job-001' }]
    })

    await api.post('/api/v1/inference/run', { model: 'bayesian-cnn' })
    expect(capturedAuth).toBe('Bearer post-token')
  })

  it('token change between requests is reflected immediately in subsequent calls', async () => {
    const capturedAuths: (string | undefined)[] = []

    mock.onGet('/api/v1/inference/status/j1').reply((config) => {
      capturedAuths.push((config.headers as any)?.Authorization)
      return [200, { status: 'pending' }]
    })

    await api.get('/api/v1/inference/status/j1')

    useAuthStore.getState().setToken('token-after-update')
    await api.get('/api/v1/inference/status/j1')

    expect(capturedAuths[0]).toBeUndefined()
    expect(capturedAuths[1]).toBe('Bearer token-after-update')
  })

  it('logout immediately removes the token from subsequent requests', async () => {
    useAuthStore.getState().setToken('pre-logout-token')
    useAuthStore.getState().logout()

    let capturedAuth: string | undefined
    mock.onGet('/api/v1/auth/me').reply((config) => {
      capturedAuth = (config.headers as any)?.Authorization
      return [200, {}]
    })

    await api.get('/api/v1/auth/me')
    expect(capturedAuth).toBeUndefined()
  })

  it('response data is returned correctly through the full pipeline', async () => {
    mock.onGet('/api/v1/inference/status/job-xyz').reply(200, {
      status: 'complete',
      message: 'Inference finished',
    })

    const response = await api.get('/api/v1/inference/status/job-xyz')
    expect(response.data.status).toBe('complete')
    expect(response.data.message).toBe('Inference finished')
  })

  it('network error propagates as a rejected promise', async () => {
    mock.onGet('/api/v1/inference/status/job-err').networkError()

    await expect(api.get('/api/v1/inference/status/job-err')).rejects.toThrow()
  })

  it('server 500 response propagates as a rejected promise', async () => {
    mock.onPost('/api/v1/auth/login').reply(500, { detail: 'Internal server error' })

    await expect(
      api.post('/api/v1/auth/login', { email: 'a@b.com', password: 'pass' })
    ).rejects.toBeDefined()
  })
})
