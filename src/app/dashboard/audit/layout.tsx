import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Аудит",
};

export default function AuditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
