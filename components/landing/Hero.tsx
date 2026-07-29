'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative flex flex-col items-center text-center overflow-hidden">
      {/* Parallax background */}
      <div
        className="absolute inset-0 bg-[url('/nomoneygymhero.png')] bg-cover bg-center bg-fixed"
        aria-hidden="true"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-900/80 to-zinc-900" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-32 pb-24">
        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl drop-shadow-lg">
          {t.heroTitle}
        </h1>
        <p className="mt-4 max-w-md text-lg text-zinc-200 drop-shadow">
          {t.heroSubtitle}
        </p>
        <Link
          href="/banco-ejercicios"
          className="mt-8 rounded-lg bg-green-600 px-8 py-3 text-lg font-medium text-white shadow-lg active:bg-green-700 hover:bg-green-500 transition-colors"
        >
          {t.heroCta}
        </Link>
      </div>
    </section>
  );
}
