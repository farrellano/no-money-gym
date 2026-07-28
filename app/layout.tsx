import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { BottomNav } from '@/components/BottomNav';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'No Money Gym',
  description: 'Rutinas de ejercicio con videos locales',
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
      <body className="min-h-full bg-zinc-950 text-white font-sans pb-16">
        <main className="flex-1">{children}</main>
        <BottomNav />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
