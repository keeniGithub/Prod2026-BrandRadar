import { AxiosResponse } from "axios";
import { AuthLogin, AuthResponse } from "../config/auth";
import { API } from "../config/axios";
import { path } from "../config/api";
import { getErrorResponse } from "../config/request";

export async function auth({username, password}: AuthLogin): Promise<AxiosResponse<AuthResponse>> {
    try {
        const params = new URLSearchParams();
        params.append("grant_type", "password");
        params.append("username", username.toLocaleLowerCase());
        params.append("password", password);
        params.append("scope", "");

        const response = await API.post<AuthResponse>(path.AUTH, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        
        return response
    } catch (error: unknown) {
        const response = getErrorResponse<AuthResponse>(error);
        if (response) {
            return response;
        }
        throw error;
    }
}