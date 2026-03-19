import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { useCheckAuth } from './check-auth'
import { pages } from '@/app/config/pages'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: vi.fn(),
}))

// Import after vi.mock so we get the mocked version
import { usePathname } from 'next/navigation'

function TestComponent() {
  useCheckAuth()
  return null
}

function renderAt(pathname: string) {
  vi.mocked(usePathname).mockReturnValue(pathname)
  render(<TestComponent />)
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('useCheckAuth()', () => {
  // ── HOME (/) ──────────────────────────────────────────────────────────────

  it('redirects HOME → dashboard when a token exists', () => {
    localStorage.setItem('token', 'valid-token')
    renderAt(pages.HOME)
    expect(mockReplace).toHaveBeenCalledWith(pages.DASHBOARD.ROOT)
  })

  it('redirects HOME → login when no token exists', () => {
    renderAt(pages.HOME)
    expect(mockReplace).toHaveBeenCalledWith(pages.AUTH)
  })

  // ── AUTH (/login) ─────────────────────────────────────────────────────────

  it('redirects AUTH → dashboard when a token already exists', () => {
    localStorage.setItem('token', 'valid-token')
    renderAt(pages.AUTH)
    expect(mockReplace).toHaveBeenCalledWith(pages.DASHBOARD.ROOT)
  })

  it('does NOT redirect AUTH when no token exists', () => {
    renderAt(pages.AUTH)
    expect(mockReplace).not.toHaveBeenCalled()
  })

  // ── DASHBOARD (/dashboard/*) ──────────────────────────────────────────────

  it('redirects dashboard/analytic → login when no token exists', () => {
    renderAt(pages.DASHBOARD.ANALYTIC)
    expect(mockReplace).toHaveBeenCalledWith(pages.AUTH)
  })

  it('redirects dashboard/settings → login when no token exists', () => {
    renderAt(pages.DASHBOARD.SETTINGS)
    expect(mockReplace).toHaveBeenCalledWith(pages.AUTH)
  })

  it('does NOT redirect dashboard when token exists', () => {
    localStorage.setItem('token', 'valid-token')
    renderAt(pages.DASHBOARD.ROOT)
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
