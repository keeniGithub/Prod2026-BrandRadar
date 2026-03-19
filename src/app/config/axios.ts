import axios from "axios";

export const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API,
    // timeout: 6767,
})

API.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

export const ML = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ML,
    timeout: 6767,
})
