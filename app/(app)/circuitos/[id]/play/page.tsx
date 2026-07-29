'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, type CircuitoRecord, type EjercicioRecord, type ConfigRecord } from '@/lib/db';
import { useI18n } from '@/lib/i18n';
import { CircuitPlayer } from '@/components/CircuitPlayer';

function PreStartScreen({ circuito, ejercicios, onStart }: { circuito: CircuitoRecord; ejercicios: EjercicioRecord[]; onStart: () => void }) {
  const { t } = useI18n();
  const [videosReady, setVideosReady] = useState(false);

  const [tips] = useState(() => {
    const shuffled = [...t.tips].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  const ejerciciosMap = new Map(ejercicios.map((e) => [e.id, e]));

  const preloadVideos = useCallback(async () => {
    const videoIds = new Set<string>();
    for (const ejConfig of circuito.ejercicios) {
      const ej = ejerciciosMap.get(ejConfig.ejercicioId);
      if (ej) videoIds.add(ej.videoId);
    }

    const preloadPromises = Array.from(videoIds).map(async (videoId) => {
      const video = await db.videos.get(videoId);
      if (!video) return;

      const ej = ejercicios.find((e) => e.videoId === videoId);
      if (!ej) return;

      return new Promise<void>((resolve) => {
        const el = document.createElement('video');
        el.preload = 'auto';
        el.muted = true;
        el.playsInline = true;

        const blobUrl = URL.createObjectURL(video.blob);
        el.src = blobUrl;

        const cleanup = () => {
          URL.revokeObjectURL(blobUrl);
          el.remove();
          resolve();
        };

        el.addEventListener('loadeddata', () => {
          el.currentTime = ej.startSec;
        }, { once: true });

        el.addEventListener('seeked', () => {
          cleanup();
        }, { once: true });

        el.addEventListener('error', () => {
          cleanup();
        }, { once: true });

        // Timeout fallback
        setTimeout(cleanup, 10000);
      });
    });

    await Promise.all(preloadPromises);
    setVideosReady(true);
  }, [circuito.ejercicios, ejercicios, ejerciciosMap]);

  useEffect(() => {
    preloadVideos();
  }, [preloadVideos]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950 p-6">
      <h2 className="text-2xl font-bold text-white">{circuito.nombre}</h2>
      <p className="mt-2 text-sm text-zinc-400">
        {circuito.ejercicios.length} ejercicios · {circuito.rondas} rondas
      </p>

      <div className="mt-8 w-full max-w-sm space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{t.tipsTitle}</p>
        {tips.map((tip) => (
          <div key={tip} className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
            {tip}
          </div>
        ))}
      </div>

      {videosReady ? (
        <button
          onClick={onStart}
          className="mt-10 rounded-lg bg-green-600 px-10 py-3 text-lg font-medium text-white shadow-lg active:bg-green-700"
        >
          {t.startCircuit}
        </button>
      ) : (
        <div className="mt-10 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          <p className="text-sm text-zinc-400">{t.loadingCircuit}</p>
        </div>
      )}
    </div>
  );
}

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const [circuito, setCircuito] = useState<CircuitoRecord | null>(null);
  const [ejercicios, setEjercicios] = useState<EjercicioRecord[]>([]);
  const [config, setConfig] = useState<ConfigRecord | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const id = params.id as string;

    Promise.all([
      db.circuitos.get(id),
      db.ejercicios.toArray(),
      db.config.get('1'),
    ]).then(([c, allEj, cfg]) => {
      if (!c) {
        router.replace('/circuitos');
        return;
      }
      setCircuito(c);
      setEjercicios(allEj);
      setConfig(
        cfg ?? { id: '1', vozActivada: true, sonidosActivados: true, vozLang: 'es-ES' }
      );
    });
  }, [params.id, router]);

  if (!circuito || !config) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!started) {
    return <PreStartScreen circuito={circuito} ejercicios={ejercicios} onStart={() => setStarted(true)} />;
  }

  return (
    <CircuitPlayer
      circuito={circuito}
      ejercicios={ejercicios}
      config={config}
      onExit={() => router.push('/circuitos')}
    />
  );
}
