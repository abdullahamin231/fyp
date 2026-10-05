import { render, screen, fireEvent } from '@testing-library/react'
import { LoginButton } from './LoginButton'

// Tests for UNIFY-1 acceptance criteria
// AC1: Primary state with brand colour
// AC2: Disabled state applies opacity-50 and cursor-not-allowed
// AC3: Loading state shows spinner, disables click

describe('LoginButton — UNIFY-1', () => {

  // AC1
  it('renders in primary state with brand colour class', () => {
    render(<LoginButton>Sign in</LoginButton>)
    const btn = screen.getByRole('button', { name: /sign in/i })
    expect(btn).toBeInTheDocument()
    expect(btn.className).toContain('bg-[#1A73E8]')
  })

  // AC2
  it('applies opacity-50 and cursor-not-allowed when disabled', () => {
    render(<LoginButton disabled>Sign in</LoginButton>)
    const btn = screen.getByRole('button', { name: /sign in/i })
    expect(btn).toBeDisabled()
    expect(btn.className).toContain('opacity-50')
    expect(btn.className).toContain('cursor-not-allowed')
  })

  // AC3 — loading shows spinner and disables click
  it('shows spinner and is not clickable when loading', () => {
    const handleClick = jest.fn()
    render(<LoginButton loading onClick={handleClick}>Sign in</LoginButton>)
    const btn = screen.getByRole('button', { name: /sign in/i })

    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn.className).toContain('opacity-50')
    expect(btn.querySelector('svg')).toBeInTheDocument()

    fireEvent.click(btn)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders secondary variant', () => {
    render(<LoginButton variant="secondary">Sign in</LoginButton>)
    const btn = screen.getByRole('button', { name: /sign in/i })
    expect(btn.className).toContain('border-[#1A73E8]')
  })
})
