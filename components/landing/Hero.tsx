'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="flex flex-col items-center px-4 pt-12 pb-12 text-center">
      <Image
        src="/nomoneygymhero.png"
        alt="NoMoneyGym"
        width={400}
        height={225}
        className="w-full max-w-md rounded-2xl"
        priority
      />
      <h1 className="mt-8 text-4xl font-bold leading-tight text-white sm:text-5xl">
        {t.heroTitle}
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-400">
        {t.heroSubtitle}
      </p>
      <Link
        href="/banco-ejercicios"
        className="mt-8 rounded-lg bg-green-600 px-8 py-3 text-lg font-medium text-white shadow-lg active:bg-green-700 hover:bg-green-500 transition-colors"
      >
        {t.heroCta}
      </Link>
    </section>
  );
}
