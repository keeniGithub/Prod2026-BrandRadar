import { AxiosResponse } from "axios";
import { Brand, BrandPayload } from "../config/brands";
import { mockApi } from "./mock"

export async function getBrands(): Promise<AxiosResponse<Brand[]>> {
  return mockApi.getBrands()
}

export async function getBrand(brandId: string): Promise<AxiosResponse<Brand>> {
  return mockApi.getBrand(brandId)
}

export async function createBrand(data: BrandPayload): Promise<AxiosResponse<Brand>> {
  return mockApi.createBrand(data)
}

export async function updateBrand(brandId: string, data: BrandPayload): Promise<AxiosResponse<Brand>> {
  return mockApi.updateBrand(brandId, data)
}

export async function deleteBrand(brandId: string): Promise<AxiosResponse> {
  return mockApi.deleteBrand(brandId)
}