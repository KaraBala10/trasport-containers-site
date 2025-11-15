import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Transport Containers Site",
  description: "Transport Containers Site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

