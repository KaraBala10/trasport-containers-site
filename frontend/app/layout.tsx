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
        {/* Preconnect to external resources for better performance */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Inline critical CSS for better FCP */}
        <style dangerouslySetInnerHTML={{
          __html: `*{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;margin:0;padding:0}html[dir="rtl"]{direction:rtl}html[dir="ltr"]{direction:ltr}body{text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-display:swap}`
        }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){"use strict";var e=document.querySelectorAll('link[rel="stylesheet"]');e.forEach(function(t){t.href&&t.href.includes("layout.css")&&(t.media="print",t.onload=function(){this.media="all"},t.onload())})}();`,
          }}
        />
      </head>
      <body className="font-sans">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
