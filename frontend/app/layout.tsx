import type { Metadata } from "next";
import ClientProviders from "@/components/ClientProviders";
// Import CSS - Next.js will optimize it
import "./globals.css";

export const metadata: Metadata = {
  title: "MEDO-FREIGHT.EU - Freight Route Deliver",
  description: "MEDO-FREIGHT.EU - Freight Route Deliver",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://medo-freight.eu"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    'preload-css': 'true',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `*{font-family:Arial,sans-serif;margin:0;padding:0}html[dir="rtl"]{direction:rtl}html[dir="ltr"]{direction:ltr}body{text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}`
        }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){"use strict";var e=document.querySelectorAll('link[rel="stylesheet"]');e.forEach(function(t){t.href&&t.href.includes("layout.css")&&(t.media="print",t.onload=function(){this.media="all"},t.onload())})}();`,
          }}
        />
        {/* Preload critical images for LCP */}
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1920&q=80"
          fetchPriority="high"
        />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <ClientProviders>
            {children}
          </ClientProviders>
        </div>
      </body>
    </html>
  );
}
