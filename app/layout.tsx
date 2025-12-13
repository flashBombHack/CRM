import type { Metadata } from "next";
import Script from "next/script";
import { Albert_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import ImagePreloader from "@/components/ImagePreloader";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HTAFC CRM System",
  description: "Professional Customer Relationship Management System for Huddersfield Town AFC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${albertSans.variable} font-sans`}>
        {/* Blocking script to preload critical assets - runs before page becomes interactive */}
        <Script
          id="preload-assets"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const images = [
                  '/assets/hudder-logo.png',
                  '/assets/HeroBG.png',
                  '/assets/SideBG.png',
                  '/assets/DashboardTeaser.png'
                ];
                images.forEach(function(src) {
                  var link = document.createElement('link');
                  link.rel = 'preload';
                  link.as = 'image';
                  link.href = src;
                  link.fetchPriority = 'high';
                  document.head.appendChild(link);
                  
                  // Also create Image object to force immediate loading into memory cache
                  var img = new Image();
                  img.src = src;
                });
              })();
            `,
          }}
        />
        <ImagePreloader />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}




