'use client';

import { useI18n } from '@/lib/i18n';

export function Faq() {
  const { t } = useI18n();

  return (
    <section id="faq" className="px-4 py-12">
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        {t.faqTitle}
      </h2>
      <div className="mx-auto max-w-lg space-y-3">
        {t.faqItems.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-lg border border-zinc-800 bg-zinc-900"
          >
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-white list-none flex items-center justify-between">
              {faq.question}
              <span className="text-zinc-500 group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <p className="px-4 pb-3 text-sm text-zinc-400">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
