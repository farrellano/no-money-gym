'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/banco-ejercicios', label: 'Ejercicios', icon: '💪' },
  { href: '/circuitos', label: 'Circuitos', icon: '🔄' },
  { href: '/ajustes', label: 'Ajustes', icon: '⚙️' },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide nav during playback
  if (pathname.endsWith('/play')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm safe-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors ${
                isActive ? 'text-white' : 'text-zinc-500'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
