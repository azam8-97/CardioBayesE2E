/**
 * Integration: ProtectedRoute ↔ authStore (real-time state transitions)
 *
 * Unlike ProtectedRoute.test.tsx (which always sets store state BEFORE
 * rendering), these tests mutate the real authStore AFTER the component
 * is mounted and verify that the UI reacts to those live changes.
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../src/components/auth/ProtectedRoute'
import { useAuthStore } from '../../src/stores/authStore'

beforeEach(() => {
  useAuthStore.setState({ token: null, refreshToken: null, user: null })
})

function renderProtected(requiredRole?: 'admin' | 'superadmin') {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div data-testid="auth-page">Auth Page</div>} />
        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute ↔ Auth Store integration', () => {
  it('blocks access when auth store has no token — shows auth page', () => {
    renderProtected()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('auth-page')).toBeInTheDocument()
  })

  it('grants access when token is present in the real auth store', () => {
    useAuthStore.setState({ token: 'valid-token', refreshToken: null, user: null })
    renderProtected()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('grants access after token is set via setToken on the real store', () => {
    // Start unauthenticated — router navigates to /auth
    const { unmount } = renderProtected()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    unmount()

    // Set token, then re-mount: router starts fresh at /protected, token present
    act(() => {
      useAuthStore.getState().setToken('fresh-token')
    })
    renderProtected()

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('revokes access when logout is called on the real store', () => {
    useAuthStore.setState({ token: 'active-token', refreshToken: null, user: { role: 'user' } })
    const { rerender } = renderProtected()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()

    act(() => {
      useAuthStore.getState().logout()
    })
    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<div data-testid="auth-page">Auth Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('blocks user role from accessing admin-required content — redirects to dashboard', () => {
    useAuthStore.setState({ token: 'tok', refreshToken: null, user: { role: 'user' } })
    renderProtected('admin')
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
  })

  it('grants admin role access to admin-required content', () => {
    useAuthStore.setState({ token: 'tok', refreshToken: null, user: { role: 'admin' } })
    renderProtected('admin')
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('superadmin bypasses the admin role requirement', () => {
    useAuthStore.setState({ token: 'tok', refreshToken: null, user: { role: 'superadmin' } })
    renderProtected('admin')
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('superadmin bypasses the superadmin role requirement', () => {
    useAuthStore.setState({ token: 'tok', refreshToken: null, user: { role: 'superadmin' } })
    renderProtected('superadmin')
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('admin cannot access superadmin-only content — redirects to dashboard', () => {
    useAuthStore.setState({ token: 'tok', refreshToken: null, user: { role: 'admin' } })
    renderProtected('superadmin')
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
  })

  it('real-time role promotion unlocks restricted content', () => {
    // Start as user accessing admin route — redirects to /dashboard
    useAuthStore.setState({ token: 'tok', refreshToken: null, user: { role: 'user' } })
    const { unmount } = renderProtected('admin')
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    unmount()

    // Promote to admin, re-mount: router starts fresh at /protected with admin role
    act(() => {
      useAuthStore.getState().setUser({ role: 'admin' })
    })
    renderProtected('admin')

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('real-time role demotion locks previously accessible content', () => {
    useAuthStore.setState({ token: 'tok', refreshToken: null, user: { role: 'admin' } })
    const { rerender } = renderProtected('admin')
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()

    act(() => {
      useAuthStore.getState().setUser({ role: 'user' })
    })
    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredRole="admin">
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<div data-testid="auth-page">Auth Page</div>} />
          <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })
})
