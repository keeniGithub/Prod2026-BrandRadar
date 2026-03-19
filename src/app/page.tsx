"use client"

import { Loader2 } from "lucide-react";
import { useCheckAuth } from "@/components/check-auth";

export default function Home() {
  useCheckAuth()

  return (
    <Loader2 className="m-auto animate-spin h-screen"/>
  )
}
