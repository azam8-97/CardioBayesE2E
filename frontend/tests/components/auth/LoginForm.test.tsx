import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginForm from '../../../src/components/auth/LoginForm'
import { useAuthStore } from '../../../src/stores/authStore'

// ── Mocks ────────────────────────────────────────────────────────────────────

// Create a mock module so useNavigate is a plain configurable jest.fn()
// (ES module live bindings on the real module can't be re-assigned).
jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

jest.mock('../../../src/services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

import { useNavigate } from 'react-router-dom'
import api from '../../../src/services/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  )
}

// ── Setup ─────────────────────────────────────────────────────────────────────

let mockNavigate: ReturnType<typeof jest.fn>

beforeEach(() => {
  jest.clearAllMocks()
  mockNavigate = jest.fn()
  jest.mocked(useNavigate).mockReturnValue(mockNavigate)
  useAuthStore.setState({ token: null, refreshToken: null, user: null })
  jest.spyOn(window, 'alert').mockImplementation(() => {})
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LoginForm', () => {
  describe('rendering', () => {
    it('renders email and password inputs', () => {
      renderForm()
      expect(screen.getByPlaceholderText('you@institution.edu')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    })

    it('renders the Sign In submit button', () => {
      renderForm()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('submit button is disabled when the form is empty', () => {
      renderForm()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
    })

    it('submit button is enabled once a valid email and 8-char password are entered', async () => {
      const user = userEvent.setup()
      renderForm()

      await user.type(screen.getByPlaceholderText('you@institution.edu'), 'doc@hospital.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123')

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled()
      })
    })

    it('submit button stays disabled with a password shorter than 8 characters', async () => {
      const user = userEvent.setup()
      renderForm()

      await user.type(screen.getByPlaceholderText('you@institution.edu'), 'doc@hospital.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'short')

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
      })
    })
  })

  describe('successful login', () => {
    it('stores the access token and refresh token in the auth store', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockResolvedValueOnce({
        data: { access_token: 'tok-abc', refresh_token: 'ref-xyz' },
      })
      jest.mocked(api.get).mockResolvedValueOnce({
        data: { email: 'doc@hospital.com', role: 'user', full_name: 'Dr Test' },
      })

      renderForm()
      await user.type(screen.getByPlaceholderText('you@institution.edu'), 'doc@hospital.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(useAuthStore.getState().token).toBe('tok-abc')
        expect(useAuthStore.getState().refreshToken).toBe('ref-xyz')
      })
    })

    it('stores the user profile from /me in the auth store', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockResolvedValueOnce({
        data: { access_token: 'tok-abc' },
      })
      jest.mocked(api.get).mockResolvedValueOnce({
        data: { email: 'doc@hospital.com', role: 'admin', full_name: 'Dr Test' },
      })

      renderForm()
      await user.type(screen.getByPlaceholderText('you@institution.edu'), 'doc@hospital.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(useAuthStore.getState().user?.role).toBe('admin')
      })
    })

    it('navigates to /inference after successful login', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockResolvedValueOnce({
        data: { access_token: 'tok-abc' },
      })
      jest.mocked(api.get).mockResolvedValueOnce({
        data: { email: 'doc@hospital.com', role: 'user' },
      })

      renderForm()
      await user.type(screen.getByPlaceholderText('you@institution.edu'), 'doc@hospital.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/inference')
      })
    })
  })

  describe('error handling', () => {
    it('shows the "Email not verified" banner on a 403 response', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockRejectedValueOnce({
        response: { status: 403, data: { detail: 'Email not verified' } },
      })

      renderForm()
      await user.type(screen.getByPlaceholderText('you@institution.edu'), 'unverified@example.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Email not verified')).toBeInTheDocument()
        expect(screen.getByText(/unverified@example\.com/)).toBeInTheDocument()
      })
    })

    it('calls alert with the detail message on a non-403 error', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockRejectedValueOnce({
        response: { status: 401, data: { detail: 'Invalid credentials' } },
      })

      renderForm()
      await user.type(screen.getByPlaceholderText('you@institution.edu'), 'doc@hospital.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass1')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Invalid credentials')
      })
    })

    it('calls alert with "Login failed" when no detail is available', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockRejectedValueOnce(new Error('Network failure'))

      renderForm()
      await user.type(screen.getByPlaceholderText('you@institution.edu'), 'doc@hospital.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Login failed')
      })
    })
  })

  describe('loading state', () => {
    it('shows "Signing in…" and disables the button during submission', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockReturnValue(new Promise(() => {}))

      renderForm()
      await user.type(screen.getByPlaceholderText('you@institution.edu'), 'doc@hospital.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
      })
    })
  })
})
