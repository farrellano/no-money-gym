'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, type CircuitoRecord, type EjercicioRecord, type ConfigRecord } from '@/lib/db';
import { CircuitPlayer } from '@/components/CircuitPlayer';

const TIPS = [
  '🧴 Ten una toalla cerca para secarte el sudor',
  '💧 Ten tu botella de agua a mano',
  '🏋️ Asegúrate de tener espacio suficiente para moverte',
  '🔊 Sube el volumen si activaste los avisos de voz',
  '🤸 Haz un calentamiento previo de 5 minutos',
];

function PreStartScreen({ circuito, onStart }: { circuito: CircuitoRecord; onStart: () => void }) {
  // Pick 3 random tips
  const [tips] = useState(() => {
    const shuffled = [...TIPS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950 p-6">
      <h2 className="text-2xl font-bold text-white">{circuito.nombre}</h2>
      <p className="mt-2 text-sm text-zinc-400">
        {circuito.ejercicios.length} ejercicios · {circuito.rondas} rondas
      </p>

      <div className="mt-8 w-full max-w-sm space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Antes de empezar</p>
        {tips.map((tip) => (
          <div key={tip} className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
            {tip}
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="mt-10 rounded-lg bg-green-600 px-10 py-3 text-lg font-medium text-white shadow-lg active:bg-green-700"
      >
        ▶ Iniciar circuito
      </button>
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
    return <PreStartScreen circuito={circuito} onStart={() => setStarted(true)} />;
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
