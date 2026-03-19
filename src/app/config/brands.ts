import { STORAGE_KEYS } from "./constants"

export type Brand = {
    project_id: string;
    name: string;
    id: string;
    keywords: string[];
    exclusions: string[];
    risk_keywords: string[];
    created_at: string;
    updated_at: string;
};

export type BrandPayload = {
    name: string;
    keywords: string[];
    exclusions: string[];
    risk_keywords: string[];
};

export interface BrandContextValue {
  brands: Brand[]
  selectedBrand: Brand | null
  setSelectedBrand: (brand: Brand) => void
  refreshBrands: () => Promise<void>
}

export const SELECTED_BRAND_KEY = STORAGE_KEYS.SELECTED_BRAND_ID
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || ""