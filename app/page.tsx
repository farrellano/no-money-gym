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
  title: 'NoMoneyGym — Rutinas de ejercicio gratis, sin nube, sin suscripciones',
  description:
    'Arma rutinas tipo Tabata con tus propios videos. 100% gratis, offline, tus datos se quedan en tu dispositivo.',
  keywords: [
    'rutina de ejercicios gratis',
    'tabata sin internet',
    'app de circuitos sin suscripción',
    'ejercicios offline',
    'tabata gratis',
  ],
  openGraph: {
    title: 'NoMoneyGym — Rutinas gratis sin suscripciones',
    description: 'Arma circuitos tipo Tabata con tus propios videos. Sin nube, sin pagos.',
    url: 'https://nomoneygym.com',
    siteName: 'NoMoneyGym',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoMoneyGym — Rutinas gratis sin suscripciones',
    description: 'Arma circuitos tipo Tabata con tus propios videos.',
    images: ['/og-image.png'],
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
