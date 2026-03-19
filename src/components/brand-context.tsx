'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Brand, BrandContextValue, SELECTED_BRAND_KEY } from '../app/config/brands'
import { getBrands } from '../app/api/brands'

const BrandContext = createContext<BrandContextValue | null>(null)

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrandState] = useState<Brand | null>(null)

  const setSelectedBrand = useCallback((brand: Brand) => {
    setSelectedBrandState(brand)
    localStorage.setItem(SELECTED_BRAND_KEY, brand.id)
  }, [])

  const refreshBrands = useCallback(async () => {
    const response = await getBrands()
    if (response.status === 200) {
      const data = response.data
      setBrands(data)
      setSelectedBrandState((prev) => {
        const savedId = prev?.id ?? localStorage.getItem(SELECTED_BRAND_KEY)
        if (savedId) {
          const found = data.find((b) => b.id === savedId)
          if (found) return found
        }
        const fallback = data[0] ?? null
        if (fallback) localStorage.setItem(SELECTED_BRAND_KEY, fallback.id)
        return fallback
      })
    }
  }, [])

  useEffect(() => {
    refreshBrands()
  }, [refreshBrands])

  return (
    <BrandContext.Provider value={{ brands, selectedBrand, setSelectedBrand, refreshBrands }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const context = useContext(BrandContext)
  if (!context) {
    throw new Error('useBrand must be used within BrandProvider')
  }
  return context
}
