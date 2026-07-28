'use client';

import { useEffect } from 'react';
import { requestPersistentStorage } from '@/lib/storage';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
    requestPersistentStorage();
  }, []);

  return null;
}
