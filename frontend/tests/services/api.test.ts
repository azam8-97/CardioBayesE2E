import api from '../../src/services/api'
import { useAuthStore } from '../../src/stores/authStore'

// Helper — run the registered request interceptor on a synthetic config object
function runRequestInterceptor(config: Record<string, any>) {
  let result = config
  ;(api.interceptors.request as any).forEach((handler: { fulfilled: (c: any) => any }) => {
    result = handler.fulfilled(result)
  })
  return result
}

beforeEach(() => {
  useAuthStore.setState({ token: null, refreshToken: null, user: null })
})

describe('api service', () => {
  describe('base configuration', () => {
    it('has the expected default timeout of 120 000 ms', () => {
      expect(api.defaults.timeout).toBe(120000)
    })

    it('sets Content-Type to application/json by default', () => {
      const ct = (api.defaults.headers as any)['Content-Type'] ??
        (api.defaults.headers as any).common?.['Content-Type'] ??
        (api.defaults.headers as any).post?.['Content-Type']
      expect(ct).toBe('application/json')
    })
  })

  describe('request interceptor — Authorization header injection', () => {
    it('does NOT add Authorization header when token is null', () => {
      const config = { headers: {} as Record<string, string> }
      const result = runRequestInterceptor(config)
      expect(result.headers['Authorization']).toBeUndefined()
    })

    it('adds "Bearer <token>" Authorization header when token is set', () => {
      useAuthStore.setState({ token: 'my-jwt-token', refreshToken: null, user: null })
      const config = { headers: {} as Record<string, string> }
      const result = runRequestInterceptor(config)
      expect(result.headers['Authorization']).toBe('Bearer my-jwt-token')
    })

    it('reflects the latest token value at request time (dynamic read)', () => {
      // First request: no token
      const config1 = { headers: {} as Record<string, string> }
      const r1 = runRequestInterceptor(config1)
      expect(r1.headers['Authorization']).toBeUndefined()

      // Token is updated
      useAuthStore.setState({ token: 'new-token', refreshToken: null, user: null })

      // Second request: token should now be present
      const config2 = { headers: {} as Record<string, string> }
      const r2 = runRequestInterceptor(config2)
      expect(r2.headers['Authorization']).toBe('Bearer new-token')
    })

    it('removes Authorization header after logout', () => {
      useAuthStore.setState({ token: 'old-token', refreshToken: null, user: null })
      useAuthStore.getState().logout()

      const config = { headers: {} as Record<string, string> }
      const result = runRequestInterceptor(config)
      expect(result.headers['Authorization']).toBeUndefined()
    })
  })
})
