'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { db } from '@/lib/db';
import { CircuitBuilder } from '@/components/CircuitBuilder';

export default function CircuitosPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  const circuitos = useLiveQuery(() =>
    db.circuitos.orderBy('createdAt').reverse().toArray()
  );

  const handleDelete = async (id: string) => {
    await db.circuitos.delete(id);
  };

  if (showBuilder) {
    return (
      <CircuitBuilder
        circuitoId={editingId}
        onSaved={() => {
          setShowBuilder(false);
          setEditingId(undefined);
        }}
        onCancel={() => {
          setShowBuilder(false);
          setEditingId(undefined);
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Circuitos</h1>
        <button
          onClick={() => setShowBuilder(true)}
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 active:bg-zinc-200"
        >
          + Nuevo
        </button>
      </div>

      {circuitos && circuitos.length > 0 ? (
        <div className="space-y-3">
          {circuitos.map((c) => {
            const totalSec = c.ejercicios.reduce(
              (acc, e) => acc + e.duracionSeg + e.descansoSeg,
              0
            ) * c.rondas + (c.descansoEntreRondas ?? 0) * (c.rondas - 1);
            const durationMin = Math.ceil(totalSec / 60);

            return (
            <div key={c.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">{c.nombre}</h3>
                  <p className="text-xs text-zinc-400">
                    {c.ejercicios.length} ejercicios · {c.rondas} rondas · {durationMin} min
                  </p>
                </div>
                <Link
                  href={`/circuitos/${c.id}/play`}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white active:bg-green-700"
                >
                  ▶ Iniciar
                </Link>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setShowBuilder(true);
                  }}
                  className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-300 active:bg-zinc-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="rounded-md border border-red-900 px-3 py-1 text-xs text-red-400 active:bg-red-950"
                >
                  Eliminar
                </button>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <span className="text-4xl">🔄</span>
          <p className="mt-2 text-sm">No hay circuitos aún</p>
          <p className="text-xs">Crea ejercicios primero, luego arma circuitos</p>
        </div>
      )}
    </div>
  );
}
