'use client';

import { useState } from 'react';
import { NumberStepper } from './NumberStepper';

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  gifUrl: string;
}

interface SelectedExercise extends Exercise {
  durationSec: number;
  restSec: number;
}

interface ExercisePickerProps {
  exercises: Exercise[];
  onConfirm: (config: {
    exercises: Array<{ exerciseId: string; name: string; durationSec: number; restSec: number }>;
    rounds: number;
    restBetweenRounds: number;
  }) => void;
}

const BLOB_BASE_URL = process.env.NEXT_PUBLIC_BLOB_BASE_URL || '';

export function ExercisePicker({ exercises, onConfirm }: ExercisePickerProps) {
  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [rounds, setRounds] = useState(3);
  const [restBetweenRounds, setRestBetweenRounds] = useState(30);
  const [step, setStep] = useState<'select' | 'configure'>('select');

  const toggleExercise = (ex: Exercise) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.id === ex.id);
      if (exists) return prev.filter((s) => s.id !== ex.id);
      return [...prev, { ...ex, durationSec: 30, restSec: 10 }];
    });
  };

  const updateTiming = (id: string, field: 'durationSec' | 'restSec', value: number) => {
    setSelected((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  if (step === 'configure') {
    return (
      <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-white">⚙️ Configurar circuito</h3>

        <div className="space-y-2">
          {selected.map((ex) => (
            <div key={ex.id} className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-3">
              <div className="flex items-center gap-2">
                <img
                  src={`${BLOB_BASE_URL}/${ex.gifUrl}`}
                  alt={ex.name}
                  className="h-10 w-10 rounded object-cover"
                />
                <span className="flex-1 truncate text-sm text-white">{ex.name}</span>
                <button
                  onClick={() => setSelected(prev => prev.filter(s => s.id !== ex.id))}
                  className="text-xs text-red-400"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 flex gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500">Trabajo (s)</label>
                  <NumberStepper
                    value={ex.durationSec}
                    onChange={(v) => updateTiming(ex.id, 'durationSec', v)}
                    min={10}
                    max={120}
                    step={5}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500">Descanso (s)</label>
                  <NumberStepper
                    value={ex.restSec}
                    onChange={(v) => updateTiming(ex.id, 'restSec', v)}
                    min={5}
                    max={60}
                    step={5}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-2">
          <div>
            <label className="text-[10px] text-zinc-500">Rondas</label>
            <NumberStepper value={rounds} onChange={setRounds} min={1} max={10} size="sm" />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500">Descanso entre rondas (s)</label>
            <NumberStepper value={restBetweenRounds} onChange={setRestBetweenRounds} min={10} max={120} step={10} size="sm" />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setStep('select')}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 active:bg-zinc-800"
          >
            ← Volver
          </button>
          <button
            onClick={() =>
              onConfirm({
                exercises: selected.map((s) => ({
                  exerciseId: s.id,
                  name: s.name,
                  durationSec: s.durationSec,
                  restSec: s.restSec,
                })),
                rounds,
                restBetweenRounds,
              })
            }
            className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-medium text-white active:bg-green-700"
          >
            ✅ Crear circuito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
      <h3 className="text-sm font-medium text-white">Selecciona ejercicios</h3>
      <div className="grid grid-cols-2 gap-2">
        {exercises.map((ex) => {
          const isSelected = selected.some((s) => s.id === ex.id);
          return (
            <button
              key={ex.id}
              onClick={() => toggleExercise(ex)}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-colors ${
                isSelected
                  ? 'border-green-500 bg-green-950/30'
                  : 'border-zinc-700 bg-zinc-800 active:bg-zinc-700'
              }`}
            >
              <img
                src={`${BLOB_BASE_URL}/${ex.gifUrl}`}
                alt={ex.name}
                className="h-16 w-16 rounded object-cover"
              />
              <span className="text-[11px] leading-tight text-white">{ex.name}</span>
              <span className="text-[9px] text-zinc-400">{ex.target}</span>
              {isSelected && <span className="text-[10px] text-green-400">✓</span>}
            </button>
          );
        })}
      </div>

      {selected.length >= 2 && (
        <button
          onClick={() => setStep('configure')}
          className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 active:bg-zinc-200"
        >
          Configurar tiempos ({selected.length} seleccionados)
        </button>
      )}
      {selected.length > 0 && selected.length < 2 && (
        <p className="text-center text-xs text-zinc-500">Selecciona al menos 2 ejercicios</p>
      )}
    </div>
  );
}
