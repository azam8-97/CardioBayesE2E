import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterForm from '../../../src/components/auth/RegisterForm'

// ── Mocks ────────────────────────────────────────────────────────────────────

// Create a mock module so useNavigate is a plain configurable jest.fn()
// (ES module live bindings on the real module can't be re-assigned via spyOn).
jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

jest.mock('../../../src/services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}))

import { useNavigate } from 'react-router-dom'
import api from '../../../src/services/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  )
}

// RegisterForm labels don't have htmlFor attributes — query by name attribute.
function getField(name: string): HTMLInputElement {
  return document.querySelector(`input[name="${name}"]`) as HTMLInputElement
}

let mockNavigate: ReturnType<typeof jest.fn>

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(getField('fullName'), 'Dr Alice Smith')
  await user.type(getField('email'), 'alice@hospital.com')
  await user.type(getField('password'), 'securePass1')
  await user.type(getField('confirm'), 'securePass1')
  await user.click(screen.getByRole('checkbox'))
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  mockNavigate = jest.fn()
  jest.mocked(useNavigate).mockReturnValue(mockNavigate)
  jest.spyOn(window, 'alert').mockImplementation(() => {})
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RegisterForm', () => {
  describe('rendering', () => {
    it('renders all required input fields', () => {
      renderForm()
      expect(getField('fullName')).toBeInTheDocument()
      expect(getField('email')).toBeInTheDocument()
      expect(getField('password')).toBeInTheDocument()
      expect(getField('confirm')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders the Create Account submit button', () => {
      renderForm()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('submit button is disabled when the form is empty', () => {
      renderForm()
      expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
    })

    it('submit button is enabled when all fields are valid', async () => {
      const user = userEvent.setup()
      renderForm()
      await fillValidForm(user)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled()
      })
    })

    it('submit button stays disabled when passwords do not match', async () => {
      const user = userEvent.setup()
      renderForm()

      await user.type(getField('fullName'), 'Dr Alice Smith')
      await user.type(getField('email'), 'alice@hospital.com')
      await user.type(getField('password'), 'securePass1')
      await user.type(getField('confirm'), 'differentPass')
      await user.click(screen.getByRole('checkbox'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
      })
    })

    it('submit button stays disabled without the terms checkbox checked', async () => {
      const user = userEvent.setup()
      renderForm()

      await user.type(getField('fullName'), 'Dr Alice Smith')
      await user.type(getField('email'), 'alice@hospital.com')
      await user.type(getField('password'), 'securePass1')
      await user.type(getField('confirm'), 'securePass1')
      // deliberately skip the checkbox

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
      })
    })

    it('submit button stays disabled with a password shorter than 8 characters', async () => {
      const user = userEvent.setup()
      renderForm()

      await user.type(getField('fullName'), 'Dr Alice')
      await user.type(getField('email'), 'alice@hospital.com')
      await user.type(getField('password'), 'short')
      await user.type(getField('confirm'), 'short')
      await user.click(screen.getByRole('checkbox'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
      })
    })
  })

  describe('successful registration', () => {
    it('calls POST /api/v1/auth/register with the correct payload', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockResolvedValueOnce({ data: {} })

      renderForm()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/v1/auth/register', {
          full_name: 'Dr Alice Smith',
          email: 'alice@hospital.com',
          password: 'securePass1',
        })
      })
    })

    it('shows a success alert after registration', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockResolvedValueOnce({ data: {} })

      renderForm()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringMatching(/registration successful/i)
        )
      })
    })

    it('navigates to /auth?mode=login after registration', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockResolvedValueOnce({ data: {} })

      renderForm()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth?mode=login')
      })
    })
  })

  describe('error handling', () => {
    it('calls alert with the API error detail on failure', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockRejectedValueOnce({
        response: { data: { detail: 'Email already registered' } },
      })

      renderForm()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Email already registered')
      })
    })

    it('calls alert with "Registration failed" when no detail is available', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockRejectedValueOnce(new Error('Network error'))

      renderForm()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Registration failed')
      })
    })
  })

  describe('loading state', () => {
    it('shows "Creating account…" and disables the button during submission', async () => {
      const user = userEvent.setup()
      jest.mocked(api.post).mockReturnValue(new Promise(() => {}))

      renderForm()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
      })
    })
  })
})
