"use client"

import { useCheckAuth } from "@/components/check-auth";
import DashboardShell from "@/components/dashboard-shell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useCheckAuth()

  return <DashboardShell>{children}</DashboardShell>;
}
