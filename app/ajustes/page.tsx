'use client';

import { useState, useEffect } from 'react';
import { db, type ConfigRecord } from '@/lib/db';
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

  const handleExport = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const ejercicios = await db.ejercicios.toArray();
    const circuitos = await db.circuitos.toArray();
    const videos = await db.videos.toArray();

    zip.file('ejercicios.json', JSON.stringify(ejercicios));
    zip.file('circuitos.json', JSON.stringify(circuitos));

    const videosFolder = zip.folder('videos')!;
    for (const video of videos) {
      videosFolder.file(`${video.id}.blob`, video.blob);
      videosFolder.file(`${video.id}.json`, JSON.stringify({
        id: video.id,
        duracionTotal: video.duracionTotal,
        createdAt: video.createdAt,
      }));
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `no-money-gym-backup-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);

    // Import exercises
    const ejerciciosJson = await zip.file('ejercicios.json')?.async('string');
    if (ejerciciosJson) {
      const ejercicios = JSON.parse(ejerciciosJson);
      await db.ejercicios.bulkPut(ejercicios);
    }

    // Import circuits
    const circuitosJson = await zip.file('circuitos.json')?.async('string');
    if (circuitosJson) {
      const circuitos = JSON.parse(circuitosJson);
      await db.circuitos.bulkPut(circuitos);
    }

    // Import videos
    const videosFolder = zip.folder('videos');
    if (videosFolder) {
      const metaFiles = Object.keys(zip.files).filter(
        (name) => name.startsWith('videos/') && name.endsWith('.json')
      );

      for (const metaPath of metaFiles) {
        const metaJson = await zip.file(metaPath)?.async('string');
        if (!metaJson) continue;
        const meta = JSON.parse(metaJson);
        const blobFile = zip.file(`videos/${meta.id}.blob`);
        if (!blobFile) continue;
        const blob = await blobFile.async('blob');

        await db.videos.put({
          id: meta.id,
          blob,
          duracionTotal: meta.duracionTotal,
          createdAt: new Date(meta.createdAt),
        });
      }
    }

    // Refresh storage display
    const est = await getStorageEstimate();
    setStorageUsage(formatBytes(est.usage));
    setStorageQuota(formatBytes(est.quota));
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      {/* Audio settings */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Audio</h2>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white">Voz (indicaciones habladas)</span>
          <input
            type="checkbox"
            checked={config.vozActivada}
            onChange={(e) => updateConfig({ vozActivada: e.target.checked })}
            className="h-5 w-5 accent-white"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white">Sonidos (beeps)</span>
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
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Almacenamiento</h2>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
          <p className="text-sm text-white">
            Usado: <span className="font-mono">{storageUsage}</span> / {storageQuota}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {persistent ? '✓ Almacenamiento persistente activo' : 'Almacenamiento temporal'}
          </p>
          {!persistent && (
            <button
              onClick={handleRequestPersistence}
              className="mt-2 rounded-md border border-zinc-700 px-3 py-1 text-xs text-white active:bg-zinc-800"
            >
              Solicitar persistencia
            </button>
          )}
        </div>
      </section>

      {/* Backup */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Respaldo</h2>

        <button
          onClick={handleExport}
          className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-white active:bg-zinc-800"
        >
          📦 Exportar respaldo (.zip)
        </button>

        <label className="block w-full cursor-pointer rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm text-white active:bg-zinc-800">
          📥 Importar respaldo
          <input
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleImport}
          />
        </label>
      </section>
    </div>
  );
}
