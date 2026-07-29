'use client';

import { useState, useEffect } from 'react';
import { db, type ConfigRecord } from '@/lib/db';
import { useI18n } from '@/lib/i18n';
import { getStorageEstimate, formatBytes, requestPersistentStorage } from '@/lib/storage';

export default function AjustesPage() {
  const [config, setConfig] = useState<ConfigRecord>({
    id: '1',
    vozActivada: true,
    sonidosActivados: true,
    vozLang: 'es-ES',
  });
  const [storageUsage, setStorageUsage] = useState('');
  const [storageQuota, setStorageQuota] = useState('');
  const [persistent, setPersistent] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    // Load config
    db.config.get('1').then((cfg) => {
      if (cfg) setConfig(cfg);
    });

    // Load storage info
    getStorageEstimate().then((est) => {
      setStorageUsage(formatBytes(est.usage));
      setStorageQuota(formatBytes(est.quota));
    });

    // Check persistence
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(setPersistent);
    }
  }, []);

  const updateConfig = async (updates: Partial<ConfigRecord>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    await db.config.put(updated);
  };

  const handleRequestPersistence = async () => {
    const granted = await requestPersistentStorage();
    setPersistent(granted);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">{t.settingsTitle}</h1>

      {/* Audio settings */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">{t.settingsAudioSection}</h2>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white">{t.settingsVoice}</span>
          <input
            type="checkbox"
            checked={config.vozActivada}
            onChange={(e) => updateConfig({ vozActivada: e.target.checked })}
            className="h-5 w-5 accent-white"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white">{t.settingsSounds}</span>
          <input
            type="checkbox"
            checked={config.sonidosActivados}
            onChange={(e) => updateConfig({ sonidosActivados: e.target.checked })}
            className="h-5 w-5 accent-white"
          />
        </label>
      </section>

      {/* Storage */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">{t.settingsStorageSection}</h2>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
          <p className="text-sm text-white">
            {t.settingsUsed}: <span className="font-mono">{storageUsage}</span> / {storageQuota}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {persistent ? t.settingsPersistentActive : t.settingsTemporary}
          </p>
          {!persistent && (
            <button
              onClick={handleRequestPersistence}
              className="mt-2 rounded-md border border-zinc-700 px-3 py-1 text-xs text-white active:bg-zinc-800"
            >
              {t.settingsRequestPersistence}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
