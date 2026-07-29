'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

const BTC_ADDRESS = 'bc1qwdcy9dmz9f7fmeveffhfzvw6mgxckzf96z57qj';

export function Footer() {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(BTC_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-zinc-800 px-4 py-8 text-center">
      <p className="text-sm text-zinc-400">{t.footerCredit}</p>

      {BTC_ADDRESS && (
        <div className="mt-4 text-xs text-zinc-600">
          <p>{t.footerDonation}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <code className="rounded bg-zinc-800 px-2 py-1 text-zinc-400 text-[10px]">
              {BTC_ADDRESS.slice(0, 12)}...{BTC_ADDRESS.slice(-6)}
            </code>
            <button
              onClick={handleCopy}
              className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? t.footerCopied : t.footerCopy}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
