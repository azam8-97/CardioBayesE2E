/**
 * Integration: useJobPolling ↔ authStore ↔ API (real axios pipeline)
 *
 * Unlike useJobPolling.test.ts (which mocks the api module entirely),
 * these tests use MockAdapter on the real axios instance so the full
 * pipeline runs: hook → real api service → real interceptor (reads
 * real authStore) → MockAdapter → response → hook state update.
 */
import { renderHook, act } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { useJobPolling } from '../../src/hooks/useJobPolling'
import { useAuthStore } from '../../src/stores/authStore'
import api from '../../src/services/api'

const mock = new MockAdapter(api)

beforeEach(() => {
  jest.useFakeTimers()
  useAuthStore.setState({ token: null, refreshToken: null, user: null })
  mock.reset()
})

afterEach(() => {
  jest.useRealTimers()
})

afterAll(() => {
  mock.restore()
})

describe('useJobPolling ↔ Auth Store integration', () => {
  it('polling requests carry the Bearer token from the real auth store', async () => {
    useAuthStore.getState().setToken('polling-token')

    const capturedAuths: (string | undefined)[] = []
    mock.onGet('/api/v1/inference/status/job-auth').reply((config) => {
      capturedAuths.push((config.headers as any)?.Authorization)
      return [200, { status: 'pending' }]
    })

    renderHook(() => useJobPolling('job-auth', 1000))

    await act(async () => {
      await Promise.resolve()
    })

    expect(capturedAuths[0]).toBe('Bearer polling-token')
  })

  it('polling requests carry no auth header when the store has no token', async () => {
    const capturedAuths: (string | undefined)[] = []
    mock.onGet('/api/v1/inference/status/job-noauth').reply((config) => {
      capturedAuths.push((config.headers as any)?.Authorization)
      return [200, { status: 'pending' }]
    })

    renderHook(() => useJobPolling('job-noauth', 1000))

    await act(async () => {
      await Promise.resolve()
    })

    expect(capturedAuths[0]).toBeUndefined()
  })

  it('status and message are updated from the real HTTP response body', async () => {
    mock.onGet('/api/v1/inference/status/job-resp').reply(200, {
      status: 'inferring',
      message: 'Bayesian model running',
    })

    const { result } = renderHook(() => useJobPolling('job-resp', 1000))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.status).toBe('inferring')
    expect(result.current.message).toBe('Bayesian model running')
    expect(result.current.error).toBeNull()
  })

  it('error state is populated from a 404 response detail', async () => {
    mock.onGet('/api/v1/inference/status/job-404').reply(404, {
      detail: 'Job not found',
    })

    const { result } = renderHook(() => useJobPolling('job-404', 1000))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.error).toBe('Job not found')
    expect(result.current.status).toBeNull()
  })

  it('error state is populated from a 500 response detail', async () => {
    mock.onGet('/api/v1/inference/status/job-500').reply(500, {
      detail: 'Internal server error',
    })

    const { result } = renderHook(() => useJobPolling('job-500', 1000))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.error).toBe('Internal server error')
  })

  it('multiple polls reflect successive server responses', async () => {
    let callCount = 0
    mock.onGet('/api/v1/inference/status/job-multi').reply(() => {
      callCount++
      if (callCount === 1) return [200, { status: 'pending', message: 'Queued' }]
      return [200, { status: 'complete', message: 'Reconstruction done' }]
    })

    const { result } = renderHook(() => useJobPolling('job-multi', 1000))

    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.status).toBe('pending')
    expect(result.current.message).toBe('Queued')

    await act(async () => {
      jest.advanceTimersByTime(1000)
      await Promise.resolve()
    })
    expect(result.current.status).toBe('complete')
    expect(result.current.message).toBe('Reconstruction done')
  })

  it('token rotation between polls is reflected in the next request', async () => {
    useAuthStore.getState().setToken('old-token')

    const capturedAuths: (string | undefined)[] = []
    mock.onGet('/api/v1/inference/status/job-rotate').reply((config) => {
      capturedAuths.push((config.headers as any)?.Authorization)
      return [200, { status: 'pending' }]
    })

    renderHook(() => useJobPolling('job-rotate', 1000))

    await act(async () => {
      await Promise.resolve()
    })

    useAuthStore.getState().setToken('new-rotated-token')

    await act(async () => {
      jest.advanceTimersByTime(1000)
      await Promise.resolve()
    })

    expect(capturedAuths[0]).toBe('Bearer old-token')
    expect(capturedAuths[1]).toBe('Bearer new-rotated-token')
  })

  it('polling stops making requests after unmount', async () => {
    let callCount = 0
    mock.onGet('/api/v1/inference/status/job-unmount').reply(() => {
      callCount++
      return [200, { status: 'pending' }]
    })

    const { unmount } = renderHook(() => useJobPolling('job-unmount', 1000))

    await act(async () => {
      await Promise.resolve()
    })
    expect(callCount).toBe(1)

    unmount()
    jest.advanceTimersByTime(5000)
    expect(callCount).toBe(1)
  })

  it('no request is made when jobId is undefined', async () => {
    let callCount = 0
    mock.onAny().reply(() => {
      callCount++
      return [200, {}]
    })

    renderHook(() => useJobPolling(undefined, 1000))

    await act(async () => {
      jest.advanceTimersByTime(3000)
      await Promise.resolve()
    })

    expect(callCount).toBe(0)
  })
})
