'use client';

import { useEffect, useState } from 'react';

interface SharedExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyPart: string;
  durationSec: number;
  restSec: number;
  order: number;
}

interface SharedCircuitData {
  id: string;
  name: string;
  rounds: number;
  restBetweenRounds: number;
  createdBy: string;
  shareSlug: string;
  exercises: SharedExercise[];
}

const BLOB_BASE_URL = process.env.NEXT_PUBLIC_BLOB_BASE_URL || '';

export function SharedCircuitView({ slug }: { slug: string }) {
  const [circuit, setCircuit] = useState<SharedCircuitData | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/circuits/shared/${slug}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Not found'))))
      .then((data: SharedCircuitData) => setCircuit(data))
      .catch(() => setError('Circuito no encontrado'));
  }, [slug]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-zinc-400">{error}</p>
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-zinc-400">Cargando...</p>
      </div>
    );
  }

  const totalSec =
    circuit.exercises.reduce((acc, exercise) => acc + exercise.durationSec + exercise.restSec, 0) *
      circuit.rounds +
    circuit.restBetweenRounds * (circuit.rounds - 1);
  const durationMin = Math.ceil(totalSec / 60);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{circuit.name}</h1>
        <p className="text-sm text-zinc-400">
          por @{circuit.createdBy} · {circuit.exercises.length} ejercicios · {circuit.rounds}{' '}
          rondas · {durationMin} min
        </p>
      </div>

      <button
        onClick={handleCopyLink}
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 active:bg-zinc-800"
      >
        {copied ? '✅ Copiado' : '🔗 Copiar link'}
      </button>

      <div className="space-y-3">
        {circuit.exercises.map((exercise) => (
          <div
            key={exercise.order}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3"
          >
            <img
              src={`${BLOB_BASE_URL}/${exercise.gifUrl}`}
              alt={exercise.name}
              className="h-16 w-16 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{exercise.name}</p>
              <p className="text-xs text-zinc-400">
                {exercise.durationSec}s trabajo · {exercise.restSec}s descanso
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
        <p className="text-xs text-zinc-400">
          Descanso entre rondas: {circuit.restBetweenRounds}s
        </p>
      </div>
    </div>
  );
}
