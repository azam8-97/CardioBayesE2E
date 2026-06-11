/**
 * Integration: LoginForm ↔ authStore ↔ API
 *
 * Unlike LoginForm.test.tsx (which mocks the api module), these tests use
 * MockAdapter on the real axios instance so the full pipeline executes:
 * form submit → real api service → real interceptor → real authStore update.
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MockAdapter from 'axios-mock-adapter'
import LoginForm from '../../src/components/auth/LoginForm'
import { useAuthStore } from '../../src/stores/authStore'
import api from '../../src/services/api'

jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

import { useNavigate } from 'react-router-dom'

const mock = new MockAdapter(api)
let mockNavigate: ReturnType<typeof jest.fn>

beforeEach(() => {
  jest.clearAllMocks()
  mockNavigate = jest.fn()
  jest.mocked(useNavigate).mockReturnValue(mockNavigate)
  useAuthStore.setState({ token: null, refreshToken: null, user: null })
  mock.reset()
  jest.spyOn(window, 'alert').mockImplementation(() => {})
})

afterAll(() => {
  mock.restore()
})

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  )
}

async function submitLogin(
  user: ReturnType<typeof userEvent.setup>,
  email = 'doc@hospital.com',
  password = 'password123'
) {
  await user.type(screen.getByPlaceholderText('you@institution.edu'), email)
  await user.type(screen.getByPlaceholderText('••••••••'), password)
  await user.click(screen.getByRole('button', { name: /sign in/i }))
}

describe('Login flow integration', () => {
  it('stores access token in the real authStore after a successful login', async () => {
    mock.onPost('/api/v1/auth/login').reply(200, {
      access_token: 'real-access-token',
      refresh_token: 'real-refresh-token',
    })
    mock.onGet('/api/v1/auth/me').reply(200, {
      email: 'doc@hospital.com',
      role: 'user',
      full_name: 'Dr House',
    })

    const user = userEvent.setup()
    renderLoginForm()
    await submitLogin(user)

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('real-access-token')
    })
  })

  it('stores refresh token in the real authStore', async () => {
    mock.onPost('/api/v1/auth/login').reply(200, {
      access_token: 'acc',
      refresh_token: 'real-refresh-token-xyz',
    })
    mock.onGet('/api/v1/auth/me').reply(200, { email: 'doc@hospital.com', role: 'user' })

    const user = userEvent.setup()
    renderLoginForm()
    await submitLogin(user)

    await waitFor(() => {
      expect(useAuthStore.getState().refreshToken).toBe('real-refresh-token-xyz')
    })
  })

  it('stores the full user profile from /me in the real authStore', async () => {
    mock.onPost('/api/v1/auth/login').reply(200, { access_token: 'tok' })
    mock.onGet('/api/v1/auth/me').reply(200, {
      email: 'admin@cardio.io',
      role: 'admin',
      full_name: 'Admin User',
    })

    const user = userEvent.setup()
    renderLoginForm()
    await submitLogin(user, 'admin@cardio.io')

    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.user?.email).toBe('admin@cardio.io')
      expect(state.user?.role).toBe('admin')
      expect(state.user?.full_name).toBe('Admin User')
    })
  })

  it('token stored by login is carried by subsequent API requests (interceptor integration)', async () => {
    mock.onPost('/api/v1/auth/login').reply(200, { access_token: 'post-login-token' })
    mock.onGet('/api/v1/auth/me').reply(200, { email: 'doc@hospital.com', role: 'user' })

    let nextRequestAuth: string | undefined
    mock.onGet('/api/v1/inference/status/follow-up').reply((config) => {
      nextRequestAuth = (config.headers as any)?.Authorization
      return [200, { status: 'pending' }]
    })

    const user = userEvent.setup()
    renderLoginForm()
    await submitLogin(user)

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('post-login-token')
    })

    await api.get('/api/v1/inference/status/follow-up')
    expect(nextRequestAuth).toBe('Bearer post-login-token')
  })

  it('navigates to /inference after a successful login', async () => {
    mock.onPost('/api/v1/auth/login').reply(200, { access_token: 'tok' })
    mock.onGet('/api/v1/auth/me').reply(200, { email: 'doc@hospital.com', role: 'user' })

    const user = userEvent.setup()
    renderLoginForm()
    await submitLogin(user)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/inference')
    })
  })

  it('does not update the auth store on a 401 failure', async () => {
    mock.onPost('/api/v1/auth/login').reply(401, { detail: 'Invalid credentials' })

    const user = userEvent.setup()
    renderLoginForm()
    await submitLogin(user)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials')
    })

    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('shows the unverified email banner and does not navigate on 403', async () => {
    mock.onPost('/api/v1/auth/login').reply(403, { detail: 'Email not verified' })

    const user = userEvent.setup()
    renderLoginForm()
    await submitLogin(user, 'unverified@test.com')

    await waitFor(() => {
      expect(screen.getByText('Email not verified')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('authStore is empty before login and populated afterwards', async () => {
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()

    mock.onPost('/api/v1/auth/login').reply(200, { access_token: 'filled-token' })
    mock.onGet('/api/v1/auth/me').reply(200, { email: 'doc@hospital.com', role: 'user' })

    const user = userEvent.setup()
    renderLoginForm()
    await submitLogin(user)

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('filled-token')
      expect(useAuthStore.getState().user).not.toBeNull()
    })
  })
})
