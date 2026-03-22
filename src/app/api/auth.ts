import { AxiosResponse } from "axios";
import { AuthLogin, AuthResponse } from "../config/auth";
import { mockApi } from "./mock"

export async function auth({username, password}: AuthLogin): Promise<AxiosResponse<AuthResponse>> {
  return mockApi.auth(username.toLowerCase(), password)
}