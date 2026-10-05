import React, { ButtonHTMLAttributes } from 'react'

// LoginButton — Unify fixture component
// Implements UNIFY-1 acceptance criteria:
//   AC1: Primary state with brand colour token color.brand.primary (#1A73E8)
//   AC2: Disabled state applies opacity-50 and cursor-not-allowed
//   AC3: Loading state shows spinner, disables click
//
// Figma reference: https://www.figma.com/design/aBcDeFgHiJkL/Unify-Components?node-id=1:2

export type LoginButtonVariant = 'primary' | 'secondary'

export interface LoginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Loading state — shows spinner and disables interaction */
  loading?: boolean
  /** Visual variant */
  variant?: LoginButtonVariant
  /** Button label */
  children: React.ReactNode
}

/**
 * LoginButton
 *
 * Implements UNIFY-1: authenticate CTA matching the approved Figma design.
 * Design token: color.brand.primary → #1A73E8
 */
export const LoginButton: React.FC<LoginButtonProps> = ({
  loading = false,
  variant = 'primary',
  disabled,
  children,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading

  const base =
    'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants: Record<LoginButtonVariant, string> = {
    primary:
      'bg-[#1A73E8] text-white hover:bg-[#1558B0] focus:ring-[#1A73E8]',
    secondary:
      'border border-[#1A73E8] text-[#1A73E8] hover:bg-[#E8F0FE] focus:ring-[#1A73E8]',
  }

  // AC2: Disabled → opacity-50 + cursor-not-allowed
  const disabledClass = isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={loading}
      className={`${base} ${variants[variant]} ${disabledClass} ${className}`.trim()}
      {...props}
    >
      {/* AC3: Loading spinner */}
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

export default LoginButton
