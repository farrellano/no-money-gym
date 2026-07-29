import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { ExplainerVideo } from '@/components/landing/ExplainerVideo';
import { Faq } from '@/components/landing/Faq';
import { Footer } from '@/components/landing/Footer';
import { JsonLd } from '@/components/landing/JsonLd';
import { LandingFeedback } from '@/components/landing/LandingFeedback';
import { Header } from '@/components/landing/Header';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nomoneygym.com'),
  title: 'NoMoneyGym — Free Workout Routines with Your Own Videos | Rutinas Gratis con Tus Videos',
  description:
    'Create custom Tabata and circuit training routines using your own exercise videos. 100% free, offline, no subscriptions. Crea rutinas personalizadas con tus propios videos de ejercicio.',
  keywords: [
    // Spanish
    'rutina de ejercicios gratis',
    'crear rutinas con videos',
    'app de ejercicios con videos propios',
    'tabata sin internet',
    'circuitos de ejercicio gratis',
    'app de circuitos sin suscripción',
    'ejercicios offline',
    'tabata gratis',
    'rutinas personalizadas',
    'entrenamiento en casa gratis',
    'app fitness sin pagar',
    // English
    'free workout app',
    'create workout routines with videos',
    'custom exercise routines',
    'tabata timer free',
    'circuit training app free',
    'offline workout app',
    'no subscription fitness app',
    'home workout planner',
    'exercise video organizer',
    'HIIT timer free',
    'workout routine builder',
  ],
  openGraph: {
    title: 'NoMoneyGym — Build Custom Workout Routines with Your Videos',
    description: 'Create Tabata & circuit routines using your own exercise videos. Free, offline, no cloud. Gratis, sin nube, sin suscripciones.',
    url: 'https://nomoneygym.com',
    siteName: 'NoMoneyGym',
    type: 'website',
    locale: 'es_LA',
    alternateLocale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoMoneyGym — Free Workout Routines with Your Own Videos',
    description: 'Build Tabata & circuit routines using your exercise videos. 100% free, offline, no subscriptions.',
    images: ['/og-image.png'],
  },
  alternates: {
    languages: {
      'es': 'https://nomoneygym.com',
      'en': 'https://nomoneygym.com',
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <JsonLd />
      <Header />
      <Hero />
      <ExplainerVideo />
      <Faq />
      <LandingFeedback />
      <Footer />
    </div>
  );
}
