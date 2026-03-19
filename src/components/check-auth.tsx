"use client"

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { pages } from "@/app/config/pages";

export function useCheckAuth() {
    const router = useRouter()
    const pathname = usePathname()
    
    useEffect(() => {
        const token = window.localStorage.getItem("token")

        if (pathname === pages.HOME) {
            router.replace(token ? pages.DASHBOARD.ROOT : pages.AUTH)
            return
        }

        if (pathname === pages.AUTH && token) {
            router.replace(pages.DASHBOARD.ROOT)
            return
        }

        if (pathname.startsWith(pages.DASHBOARD.ROOT) && !token) {
            router.replace(pages.AUTH)
        }
    }, [pathname, router])
}