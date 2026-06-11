/**
 * Integration: RegisterForm ↔ API service
 *
 * Unlike RegisterForm.test.tsx (which mocks the api module),
 * these tests use MockAdapter on the real axios instance so the
 * full pipeline runs: form submit → real api service → MockAdapter → response.
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MockAdapter from 'axios-mock-adapter'
import RegisterForm from '../../src/components/auth/RegisterForm'
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
  mock.reset()
  jest.spyOn(window, 'alert').mockImplementation(() => {})
})

afterAll(() => {
  mock.restore()
})

function renderForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  )
}

function getField(name: string): HTMLInputElement {
  return document.querySelector(`input[name="${name}"]`) as HTMLInputElement
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(getField('fullName'), 'Dr Alice Smith')
  await user.type(getField('email'), 'alice@hospital.com')
  await user.type(getField('password'), 'securePass1')
  await user.type(getField('confirm'), 'securePass1')
  await user.click(screen.getByRole('checkbox'))
}

describe('Registration flow integration', () => {
  it('submit button is disabled until all required fields are valid', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(getField('fullName'), 'Dr Smith')
    await user.type(getField('email'), 'smith@hospital.com')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
    })
  })

  it('password mismatch keeps submit disabled regardless of other valid fields', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(getField('fullName'), 'Dr Alice Smith')
    await user.type(getField('email'), 'alice@hospital.com')
    await user.type(getField('password'), 'securePass1')
    await user.type(getField('confirm'), 'different99')
    await user.click(screen.getByRole('checkbox'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
    })
  })

  it('sends the correct JSON payload to the registration endpoint', async () => {
    let capturedPayload: any = null
    mock.onPost('/api/v1/auth/register').reply((config) => {
      capturedPayload = JSON.parse(config.data)
      return [201, {}]
    })

    const user = userEvent.setup()
    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(capturedPayload).toEqual({
        full_name: 'Dr Alice Smith',
        email: 'alice@hospital.com',
        password: 'securePass1',
      })
    })
  })

  it('navigates to /auth?mode=login after a successful 201 response', async () => {
    mock.onPost('/api/v1/auth/register').reply(201, {})

    const user = userEvent.setup()
    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth?mode=login')
    })
  })

  it('shows success alert before navigating away', async () => {
    mock.onPost('/api/v1/auth/register').reply(201, {})

    const user = userEvent.setup()
    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringMatching(/registration successful/i)
      )
    })
  })

  it('shows the API error detail on a 409 conflict response', async () => {
    mock.onPost('/api/v1/auth/register').reply(409, {
      detail: 'Email already registered',
    })

    const user = userEvent.setup()
    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Email already registered')
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows fallback error message on network failure', async () => {
    mock.onPost('/api/v1/auth/register').networkError()

    const user = userEvent.setup()
    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Registration failed')
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows loading state while the request is in-flight', async () => {
    mock.onPost('/api/v1/auth/register').reply(() => new Promise(() => {}))

    const user = userEvent.setup()
    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
    })
  })

  it('confirm password field is not sent to the API (only required fields)', async () => {
    let capturedPayload: any = null
    mock.onPost('/api/v1/auth/register').reply((config) => {
      capturedPayload = JSON.parse(config.data)
      return [201, {}]
    })

    const user = userEvent.setup()
    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(capturedPayload).not.toHaveProperty('confirm')
      expect(capturedPayload).not.toHaveProperty('terms')
    })
  })
})
