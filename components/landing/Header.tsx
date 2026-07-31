'use client';

import Image from 'next/image';
import { useI18n, type Locale } from '@/lib/i18n';

export function Header() {
  const { locale, t, setLocale } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src="/logonomoneygym.png" alt="NoMoneyGym" width={32} height={32} className="rounded-md" />
          <span className="hidden sm:inline text-lg font-bold text-white">{t.appName}</span>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4">
          <a href="/blog" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Blog
          </a>
          <a href="#faq" className="text-sm text-zinc-400 hover:text-white transition-colors">
            {t.navFaq}
          </a>
          <a href="#feedback" className="hidden sm:inline text-sm text-zinc-400 hover:text-white transition-colors">
            {t.navFeedback}
          </a>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white"
          >
            <option value="es">🇪🇸 ES</option>
            <option value="en">🇺🇸 EN</option>
          </select>
        </nav>
      </div>
    </header>
  );
}
