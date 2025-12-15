// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import Providers from "@/context/Providers";
import RootLayoutClient from "./RootLayoutClient";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "indcric - The Ultimate Cricket Quiz",
  description: "win ₹100 for every 100 seconds!",
  manifest: "/manifest.json",
  themeColor: "#D4AF37",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "indcric",
  },
  // ✅ Logo + favicons – make sure this file exists in /public
  icons: {
    icon: "/Indcric.png",      // e.g. public/logo.png
    shortcut: "/Indcric.png",
    apple: "/Indcric.png",
  },
  // ✅ Social / OpenGraph image (can be same logo or a wider image)
  openGraph: {
    title: "indcric - The Ultimate Cricket Quiz",
    description: "win ₹100 for every 100 seconds!",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} antialiased prevent-select dark`}>
        <Providers>
          <RootLayoutClient>{children}</RootLayoutClient>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
