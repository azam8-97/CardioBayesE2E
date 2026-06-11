import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../../../src/components/auth/ProtectedRoute'
import { useAuthStore } from '../../../src/stores/authStore'

function renderInRouter(requiredRole?: 'admin' | 'superadmin') {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div>Auth Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  useAuthStore.setState({ token: null, refreshToken: null, user: null })
})

describe('ProtectedRoute', () => {
  it('redirects to /auth when no token is present', () => {
    renderInRouter()
    expect(screen.getByText('Auth Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when token is present and no requiredRole is specified', () => {
    useAuthStore.setState({ token: 'valid-token', user: { role: 'user' }, refreshToken: null })
    renderInRouter()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /dashboard when user role does not match requiredRole', () => {
    useAuthStore.setState({ token: 'valid-token', user: { role: 'user' }, refreshToken: null })
    renderInRouter('admin')
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when user role exactly matches requiredRole', () => {
    useAuthStore.setState({ token: 'valid-token', user: { role: 'admin' }, refreshToken: null })
    renderInRouter('admin')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('allows superadmin to access admin-required routes', () => {
    useAuthStore.setState({ token: 'valid-token', user: { role: 'superadmin' }, refreshToken: null })
    renderInRouter('admin')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('allows superadmin to access superadmin-required routes', () => {
    useAuthStore.setState({ token: 'valid-token', user: { role: 'superadmin' }, refreshToken: null })
    renderInRouter('superadmin')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('rejects an admin user from a superadmin-required route', () => {
    useAuthStore.setState({ token: 'valid-token', user: { role: 'admin' }, refreshToken: null })
    renderInRouter('superadmin')
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
