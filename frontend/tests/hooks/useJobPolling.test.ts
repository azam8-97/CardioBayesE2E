import { renderHook, act } from '@testing-library/react'
import { useJobPolling } from '../../src/hooks/useJobPolling'

jest.mock('../../src/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

import api from '../../src/services/api'

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('useJobPolling', () => {
  it('does not call the API when jobId is undefined', () => {
    renderHook(() => useJobPolling(undefined))
    expect(api.get).not.toHaveBeenCalled()
  })

  it('returns null status/message/error when jobId is undefined', () => {
    const { result } = renderHook(() => useJobPolling(undefined))
    expect(result.current.status).toBeNull()
    expect(result.current.message).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('calls the status endpoint immediately when jobId is provided', async () => {
    jest.mocked(api.get).mockResolvedValue({ data: { status: 'pending', message: 'Queued' } })
    renderHook(() => useJobPolling('job-1'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(api.get).toHaveBeenCalledWith('/api/v1/inference/status/job-1')
  })

  it('updates status and message from a successful response', async () => {
    jest.mocked(api.get).mockResolvedValue({ data: { status: 'inferring', message: 'Running model' } })
    const { result } = renderHook(() => useJobPolling('job-2'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.status).toBe('inferring')
    expect(result.current.message).toBe('Running model')
    expect(result.current.error).toBeNull()
  })

  it('sets null message when response has no message field', async () => {
    jest.mocked(api.get).mockResolvedValue({ data: { status: 'complete' } })
    const { result } = renderHook(() => useJobPolling('job-3'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.message).toBeNull()
  })

  it('sets error from response detail on API failure', async () => {
    jest.mocked(api.get).mockRejectedValue({ response: { data: { detail: 'Job not found' } } })
    const { result } = renderHook(() => useJobPolling('job-4'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.error).toBe('Job not found')
  })

  it('falls back to error message when no response detail is available', async () => {
    jest.mocked(api.get).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useJobPolling('job-5'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.error).toBe('Network error')
  })

  it('falls back to "poll failed" when error has no message or detail', async () => {
    jest.mocked(api.get).mockRejectedValue({})
    const { result } = renderHook(() => useJobPolling('job-6'))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.error).toBe('poll failed')
  })

  it('polls again after the specified intervalMs', async () => {
    jest.mocked(api.get).mockResolvedValue({ data: { status: 'pending' } })
    renderHook(() => useJobPolling('job-7', 2000))

    await act(async () => {
      await Promise.resolve()
    })
    expect(api.get).toHaveBeenCalledTimes(1)

    await act(async () => {
      jest.advanceTimersByTime(2000)
      await Promise.resolve()
    })
    expect(api.get).toHaveBeenCalledTimes(2)
  })

  it('clears the interval on unmount to prevent memory leaks', async () => {
    jest.mocked(api.get).mockResolvedValue({ data: { status: 'pending' } })
    const { unmount } = renderHook(() => useJobPolling('job-8', 2000))

    await act(async () => {
      await Promise.resolve()
    })
    expect(api.get).toHaveBeenCalledTimes(1)

    unmount()

    jest.advanceTimersByTime(6000)
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('exposes a refresh function that polls on demand', async () => {
    jest.mocked(api.get).mockResolvedValue({ data: { status: 'complete' } })
    const { result } = renderHook(() => useJobPolling('job-9'))

    await act(async () => {
      await Promise.resolve()
    })
    expect(api.get).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.refresh()
    })
    expect(api.get).toHaveBeenCalledTimes(2)
  })
})
