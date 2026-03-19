import { AxiosResponse } from "axios";
import { Brand, BrandPayload, projectId } from "../config/brands";
import { path } from "../config/api";
import { API } from "../config/axios";
import { getErrorResponse } from "../config/request";

export async function getBrands(): Promise<AxiosResponse<Brand[]>> {
    try {
        const response = await API.get<Brand[]>(path.BRANDS.GETALL(projectId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Brand[]>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function getBrand(brandId: string): Promise<AxiosResponse<Brand>> {
    try {
        const response = await API.get<Brand>(path.BRANDS.GET(projectId, brandId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Brand>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function createBrand(data: BrandPayload): Promise<AxiosResponse<Brand>> {
    try {
        const response = await API.post<Brand>(path.BRANDS.CREATE(projectId), data);
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Brand>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function updateBrand(brandId: string, data: BrandPayload): Promise<AxiosResponse<Brand>> {
    try {
        const response = await API.put<Brand>(path.BRANDS.UPD(projectId, brandId), data);
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse<Brand>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}

export async function deleteBrand(brandId: string): Promise<AxiosResponse> {
    try {
        const response = await API.delete(path.BRANDS.DEL(projectId, brandId));
        return response;
    } catch (error: unknown) {
        const response = getErrorResponse(error);
        if (response) {
            return response;
        }
        throw error;
    }
}