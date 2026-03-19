import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import type { AxiosResponse, AxiosHeaders } from 'axios'
import { BrandProvider, useBrand } from './brand-context'
import type { Brand } from '../app/config/brands'
import { SELECTED_BRAND_KEY } from '../app/config/brands'

vi.mock('../app/api/brands', () => ({
  getBrands: vi.fn(),
}))

import { getBrands } from '../app/api/brands'

/** Builds a minimal but fully-typed AxiosResponse without using `any` */
function axiosResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {} as ReturnType<AxiosHeaders['toJSON']>,
    config: { headers: {} as AxiosHeaders },
  }
}

const mockBrand = (overrides: Partial<Brand> = {}): Brand => ({
  id: 'brand-1',
  name: 'Acme',
  project_id: 'proj-1',
  keywords: ['acme'],
  exclusions: [],
  risk_keywords: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

function ConsumerComponent() {
  const { brands, selectedBrand, setSelectedBrand, refreshBrands } = useBrand()
  return (
    <div>
      <span data-testid="brand-count">{brands.length}</span>
      <span data-testid="selected">{selectedBrand?.name ?? 'none'}</span>
      <button
        onClick={() => setSelectedBrand(mockBrand({ id: 'brand-2', name: 'Beta' }))}
      >
        select-beta
      </button>
      <button onClick={() => refreshBrands()}>refresh</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <BrandProvider>
      <ConsumerComponent />
    </BrandProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('BrandProvider', () => {
  it('fetches brands on mount and selects the first one as default', async () => {
    const brands = [mockBrand({ id: 'b1', name: 'Alpha' }), mockBrand({ id: 'b2', name: 'Beta' })]
    vi.mocked(getBrands).mockResolvedValue(axiosResponse(brands))

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('brand-count').textContent).toBe('2')
      expect(screen.getByTestId('selected').textContent).toBe('Alpha')
    })
  })

  it('restores the previously selected brand from localStorage', async () => {
    const brands = [mockBrand({ id: 'b1', name: 'Alpha' }), mockBrand({ id: 'b2', name: 'Beta' })]
    localStorage.setItem(SELECTED_BRAND_KEY, 'b2')
    vi.mocked(getBrands).mockResolvedValue(axiosResponse(brands))

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('selected').textContent).toBe('Beta')
    })
  })

  it('falls back to the first brand when the saved id is no longer in the list', async () => {
    const brands = [mockBrand({ id: 'b1', name: 'Alpha' })]
    localStorage.setItem(SELECTED_BRAND_KEY, 'deleted-brand-id')
    vi.mocked(getBrands).mockResolvedValue(axiosResponse(brands))

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('selected').textContent).toBe('Alpha')
    })
  })

  it('persists the selection to localStorage when setSelectedBrand is called', async () => {
    const brands = [mockBrand({ id: 'b1', name: 'Alpha' })]
    vi.mocked(getBrands).mockResolvedValue(axiosResponse(brands))

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('brand-count').textContent).toBe('1'))

    await userEvent.click(screen.getByText('select-beta'))

    expect(localStorage.getItem(SELECTED_BRAND_KEY)).toBe('brand-2')
    expect(screen.getByTestId('selected').textContent).toBe('Beta')
  })

  it('does not change state when the API returns a non-200 status', async () => {
    vi.mocked(getBrands).mockResolvedValue(axiosResponse([], 401))

    renderWithProvider()

    await act(async () => {})
    expect(screen.getByTestId('brand-count').textContent).toBe('0')
    expect(screen.getByTestId('selected').textContent).toBe('none')
  })

  it('re-fetches brands when refreshBrands is called', async () => {
    const initial = [mockBrand({ id: 'b1', name: 'Alpha' })]
    const updated = [
      mockBrand({ id: 'b1', name: 'Alpha' }),
      mockBrand({ id: 'b2', name: 'Beta' }),
    ]
    vi.mocked(getBrands)
      .mockResolvedValueOnce(axiosResponse(initial))
      .mockResolvedValueOnce(axiosResponse(updated))

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('brand-count').textContent).toBe('1'))

    await userEvent.click(screen.getByText('refresh'))
    await waitFor(() => expect(screen.getByTestId('brand-count').textContent).toBe('2'))
  })
})

describe('useBrand()', () => {
  it('throws when used outside of BrandProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function BadConsumer() {
      useBrand()
      return null
    }

    expect(() => render(<BadConsumer />)).toThrow('useBrand must be used within BrandProvider')
    spy.mockRestore()
  })
})
