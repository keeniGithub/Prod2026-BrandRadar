import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Авторизация",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
