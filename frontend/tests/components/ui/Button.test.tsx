import React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from '../../../src/components/ui/Button'

describe('Button', () => {
  it('renders with default primary variant', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button', { name: 'Click me' })
    expect(btn).toHaveClass('btn')
    expect(btn).toHaveClass('btn-primary')
  })

  it('renders secondary variant with correct classes', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button', { name: 'Secondary' })
    expect(btn).toHaveClass('border-blue-500/60')
    expect(btn).toHaveClass('text-blue-300')
  })

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole('button', { name: 'Ghost' })
    expect(btn).toHaveClass('btn-ghost')
  })

  it('renders danger variant with red background', () => {
    render(<Button variant="danger">Delete</Button>)
    const btn = screen.getByRole('button', { name: 'Delete' })
    expect(btn).toHaveClass('bg-red-600')
    expect(btn).toHaveClass('text-white')
  })

  it('merges additional className alongside variant classes', () => {
    render(<Button className="mt-4 w-full">Submit</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('mt-4')
    expect(btn).toHaveClass('w-full')
    expect(btn).toHaveClass('btn-primary')
  })

  it('defaults to type="button" to prevent accidental form submission', () => {
    render(<Button>Action</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('accepts explicit type="submit"', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('forwards disabled prop to the underlying button element', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders children text content', () => {
    render(<Button>Save changes</Button>)
    expect(screen.getByText('Save changes')).toBeInTheDocument()
  })

  it('asChild clones the child element with merged variant classes', () => {
    render(
      <Button asChild variant="primary">
        <a href="/somewhere">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toHaveClass('btn-primary')
    expect(link).toHaveAttribute('href', '/somewhere')
  })

  it('asChild preserves the child element type (renders <a>, not <button>)', () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Anchor</a>
      </Button>
    )
    expect(container.querySelector('a')).not.toBeNull()
    expect(container.querySelector('button')).toBeNull()
  })
})
