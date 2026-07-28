'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type EjercicioRecord } from '@/lib/db';
import { ExerciseCard } from '@/components/ExerciseCard';
import { ExerciseForm } from '@/components/ExerciseForm';

const GRUPOS_MUSCULARES = [
  'todos',
  'pierna',
  'espalda',
  'pecho',
  'hombro',
  'brazo',
  'core',
  'glúteo',
  'cardio',
];

export default function BancoEjerciciosPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingEjercicio, setEditingEjercicio] = useState<EjercicioRecord | undefined>();
  const [filtro, setFiltro] = useState('todos');

  const ejercicios = useLiveQuery(() => {
    if (filtro === 'todos') {
      return db.ejercicios.orderBy('createdAt').reverse().toArray();
    }
    return db.ejercicios
      .where('grupoMuscular')
      .equals(filtro)
      .reverse()
      .sortBy('createdAt');
  }, [filtro]);

  const handleEdit = (ej: EjercicioRecord) => {
    setEditingEjercicio(ej);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ej = await db.ejercicios.get(id);
    if (!ej) return;

    // Check if video is used by other exercises
    const otherUses = await db.ejercicios
      .where('videoId')
      .equals(ej.videoId)
      .count();

    await db.ejercicios.delete(id);

    // Delete video if no other exercise uses it
    if (otherUses <= 1) {
      await db.videos.delete(ej.videoId);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingEjercicio(undefined);
  };

  if (showForm) {
    return (
      <ExerciseForm
        ejercicio={editingEjercicio}
        onSaved={handleSaved}
        onCancel={() => {
          setShowForm(false);
          setEditingEjercicio(undefined);
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ejercicios</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 active:bg-zinc-200"
        >
          + Nuevo
        </button>
      </div>

      {/* Muscle group filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        {GRUPOS_MUSCULARES.map((g) => (
          <button
            key={g}
            onClick={() => setFiltro(g)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filtro === g
                ? 'bg-white text-zinc-900'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      {ejercicios && ejercicios.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {ejercicios.map((ej) => (
            <ExerciseCard
              key={ej.id}
              ejercicio={ej}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <span className="text-4xl">💪</span>
          <p className="mt-2 text-sm">No hay ejercicios aún</p>
          <p className="text-xs">Toca &quot;+ Nuevo&quot; para agregar uno</p>
        </div>
      )}
    </div>
  );
}
