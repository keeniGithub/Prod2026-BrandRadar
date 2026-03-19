import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Алерты",
};

export default function Alertayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
