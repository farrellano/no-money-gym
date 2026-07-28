'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, type CircuitoRecord, type EjercicioRecord, type ConfigRecord } from '@/lib/db';
import { CircuitPlayer } from '@/components/CircuitPlayer';

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const [circuito, setCircuito] = useState<CircuitoRecord | null>(null);
  const [ejercicios, setEjercicios] = useState<EjercicioRecord[]>([]);
  const [config, setConfig] = useState<ConfigRecord | null>(null);

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

  return (
    <CircuitPlayer
      circuito={circuito}
      ejercicios={ejercicios}
      config={config}
      onExit={() => router.push('/circuitos')}
    />
  );
}
