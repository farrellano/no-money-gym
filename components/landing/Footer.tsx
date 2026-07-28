'use client';

import { useState } from 'react';

// Reemplazar con dirección real
const BTC_ADDRESS = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';

export function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(BTC_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-zinc-800 px-4 py-8 text-center">
      <p className="text-sm text-zinc-400">Developed by Fas and Claude</p>

      <div className="mt-4 text-xs text-zinc-600">
        <p>Si quieres aportar, puedes dejar unos satoshis en esta dirección BTC</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <code className="rounded bg-zinc-800 px-2 py-1 text-zinc-400 text-[10px]">
            {BTC_ADDRESS.slice(0, 12)}...{BTC_ADDRESS.slice(-6)}
          </code>
          <button
            onClick={handleCopy}
            className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
          >
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        </div>
      </div>
    </footer>
  );
}
