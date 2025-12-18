import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import ClientOnly from '@/components/ClientOnly';
import Providers from '@/context/Providers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'indcric - The Ultimate Cricket Quiz',
  description: 'win ₹100 for every 100 seconds!',
  manifest: '/manifest.json',
  themeColor: '#D4AF37',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'indcric',
  },
};

const BottomNav = dynamic(() => import('@/components/BottomNav'), {
  ssr: false,
  loading: () => <Skeleton className="h-20 w-full" />,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-background`}>
        <Providers>
          <ClientOnly>
            {/* Main content */}
            <main className="pb-48">{children}</main>

            {/* Bottom Navigation with footer */}
            <BottomNav />
          </ClientOnly>

          <Toaster />
        </Providers>
      </body>
    </html>
  );
}