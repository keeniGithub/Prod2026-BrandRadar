"use client";

import { useState, useCallback } from "react";
import Navbar from "./navbar";
import Header from "./header";
import { BrandProvider } from "@/components/brand-context";
import { AlertProvider } from "@/components/alert-context";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <BrandProvider>
    <AlertProvider>
    <div className="flex min-h-screen">
      <div className="hidden shrink-0 md:block w-64">
        <div className="fixed inset-y-0 left-0 w-64">
          <Navbar />
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Navbar onNavigate={handleClose} />
      </div>

      <main className="flex-1 overflow-auto">
        <Header onMenuClick={handleOpen} />
        {children}
      </main>
    </div>
    </AlertProvider>
    </BrandProvider>
  );
}
