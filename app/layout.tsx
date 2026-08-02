import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from '@/components/Providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NoMoneyGym — Free Workout Routines with Your Videos',
  description: 'Create custom Tabata and circuit training routines using your own exercise videos. 100% free, offline, no subscriptions.',
  metadataBase: new URL('https://www.nomoneygym.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/logonomoneygym.png',
  },
  openGraph: {
    title: 'NoMoneyGym — Build Custom Workout Routines with Your Videos',
    description: 'Create Tabata & circuit routines using your own exercise videos. Free, offline, no cloud.',
    url: 'https://www.nomoneygym.com',
    siteName: 'NoMoneyGym',
    locale: 'es_LA',
    alternateLocale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NoMoneyGym — Create free workout routines with your own exercise videos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoMoneyGym — Free Workout Routines with Your Videos',
    description: 'Build Tabata & circuit routines using your exercise videos. 100% free, offline, no subscriptions.',
    images: ['/og-image.jpg'],
    site: '@nomoneygym',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full bg-zinc-950 text-white font-sans">
        <Providers>
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
