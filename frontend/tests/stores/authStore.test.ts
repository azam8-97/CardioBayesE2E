import { useAuthStore } from '../../src/stores/authStore'

const blank = { token: null, refreshToken: null, user: null }

beforeEach(() => {
  useAuthStore.setState(blank)
})

describe('authStore', () => {
  describe('initial state', () => {
    it('has null token', () => {
      expect(useAuthStore.getState().token).toBeNull()
    })

    it('has null refreshToken', () => {
      expect(useAuthStore.getState().refreshToken).toBeNull()
    })

    it('has null user', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('setToken', () => {
    it('sets token to a string value', () => {
      useAuthStore.getState().setToken('abc123')
      expect(useAuthStore.getState().token).toBe('abc123')
    })

    it('clears token when called with null', () => {
      useAuthStore.getState().setToken('abc123')
      useAuthStore.getState().setToken(null)
      expect(useAuthStore.getState().token).toBeNull()
    })
  })

  describe('setRefreshToken', () => {
    it('sets refreshToken', () => {
      useAuthStore.getState().setRefreshToken('refresh-xyz')
      expect(useAuthStore.getState().refreshToken).toBe('refresh-xyz')
    })

    it('clears refreshToken when called with null', () => {
      useAuthStore.getState().setRefreshToken('refresh-xyz')
      useAuthStore.getState().setRefreshToken(null)
      expect(useAuthStore.getState().refreshToken).toBeNull()
    })
  })

  describe('setUser', () => {
    it('sets user object', () => {
      useAuthStore.getState().setUser({ email: 'a@b.com', role: 'user', full_name: 'Alice' })
      expect(useAuthStore.getState().user).toEqual({ email: 'a@b.com', role: 'user', full_name: 'Alice' })
    })

    it('updates user with partial object', () => {
      useAuthStore.getState().setUser({ email: 'x@y.com' })
      expect(useAuthStore.getState().user?.email).toBe('x@y.com')
    })

    it('sets user to null', () => {
      useAuthStore.getState().setUser({ email: 'a@b.com' })
      useAuthStore.getState().setUser(null)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('logout', () => {
    it('clears token, refreshToken, and user in one call', () => {
      useAuthStore.getState().setToken('tok')
      useAuthStore.getState().setRefreshToken('ref')
      useAuthStore.getState().setUser({ email: 'x@y.com', role: 'admin' })

      useAuthStore.getState().logout()

      const { token, refreshToken, user } = useAuthStore.getState()
      expect(token).toBeNull()
      expect(refreshToken).toBeNull()
      expect(user).toBeNull()
    })

    it('is idempotent — calling logout twice is safe', () => {
      useAuthStore.getState().logout()
      useAuthStore.getState().logout()
      expect(useAuthStore.getState().token).toBeNull()
    })
  })
})
