import type { Metadata } from "next";
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
        <ImagePreloader />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}




