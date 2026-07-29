'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { db, type CircuitoEjercicio, type EjercicioRecord } from '@/lib/db';
import { useI18n } from '@/lib/i18n';

interface SortableItemProps {
  id: string;
  ejercicio: EjercicioRecord;
  config: CircuitoEjercicio;
  onConfigChange: (ejercicioId: string, field: 'duracionSeg' | 'descansoSeg', value: number) => void;
  onRemove: (ejercicioId: string) => void;
}

function SortableItem({ id, ejercicio, config, onConfigChange, onRemove, t }: SortableItemProps & { t: Record<string, unknown> }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab text-zinc-500 active:cursor-grabbing">
          ⠿
        </button>
        <span className="flex-1 text-sm font-medium text-white truncate">{ejercicio.nombre}</span>
        <button onClick={() => onRemove(config.ejercicioId)} className="text-xs text-red-400">✕</button>
      </div>
      <div className="mt-2 flex gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-zinc-500">{t.builderWorkLabel as string}</label>
          <input
            type="number"
            min={5}
            max={120}
            value={config.duracionSeg}
            onChange={(e) => onConfigChange(config.ejercicioId, 'duracionSeg', parseInt(e.target.value) || 30)}
            className="mt-0.5 w-full rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-white"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-zinc-500">{t.builderRestLabel as string}</label>
          <input
            type="number"
            min={0}
            max={60}
            value={config.descansoSeg}
            onChange={(e) => onConfigChange(config.ejercicioId, 'descansoSeg', parseInt(e.target.value) || 10)}
            className="mt-0.5 w-full rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-white"
          />
        </div>
      </div>
    </div>
  );
}

interface CircuitBuilderProps {
  circuitoId?: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function CircuitBuilder({ circuitoId, onSaved, onCancel }: CircuitBuilderProps) {
  const [nombre, setNombre] = useState('');
  const [rondas, setRondas] = useState(3);
  const [descansoEntreRondas, setDescansoEntreRondas] = useState(30);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ejerciciosConfig, setEjerciciosConfig] = useState<CircuitoEjercicio[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const { t } = useI18n();

  const allEjercicios = useLiveQuery(() => db.ejercicios.toArray());

  // Load existing circuit for editing
  useEffect(() => {
    if (circuitoId) {
      db.circuitos.get(circuitoId).then((c) => {
        if (c) {
          setNombre(c.nombre);
          setRondas(c.rondas);
          setDescansoEntreRondas(c.descansoEntreRondas ?? 30);
          setEjerciciosConfig(c.ejercicios);
          setSelectedIds(c.ejercicios.map((e) => e.ejercicioId));
        }
      });
    }
  }, [circuitoId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ejerciciosConfig.findIndex((e) => e.ejercicioId === active.id);
      const newIndex = ejerciciosConfig.findIndex((e) => e.ejercicioId === over.id);
      setEjerciciosConfig(arrayMove(ejerciciosConfig, oldIndex, newIndex));
    }
  };

  const handleToggleEjercicio = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
      setEjerciciosConfig(ejerciciosConfig.filter((e) => e.ejercicioId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
      setEjerciciosConfig([...ejerciciosConfig, { ejercicioId: id, duracionSeg: 30, descansoSeg: 10 }]);
    }
  };

  const handleConfigChange = (ejercicioId: string, field: 'duracionSeg' | 'descansoSeg', value: number) => {
    setEjerciciosConfig(
      ejerciciosConfig.map((e) =>
        e.ejercicioId === ejercicioId ? { ...e, [field]: value } : e
      )
    );
  };

  const handleRemove = (ejercicioId: string) => {
    setSelectedIds(selectedIds.filter((id) => id !== ejercicioId));
    setEjerciciosConfig(ejerciciosConfig.filter((e) => e.ejercicioId !== ejercicioId));
  };

  const handleSave = async () => {
    if (!nombre.trim() || ejerciciosConfig.length === 0) return;

    await db.circuitos.put({
      id: circuitoId ?? crypto.randomUUID(),
      nombre: nombre.trim(),
      rondas,
      descansoEntreRondas,
      ejercicios: ejerciciosConfig,
      createdAt: new Date(),
    });

    onSaved();
  };

  const ejerciciosMap = new Map(allEjercicios?.map((e) => [e.id, e]) ?? []);

  if (showSelector) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{t.builderSelectTitle}</h2>
          <button onClick={() => setShowSelector(false)} className="text-sm text-zinc-400">
            {t.builderSelectDone} ({selectedIds.length})
          </button>
        </div>
        <div className="space-y-2">
          {allEjercicios?.map((ej) => (
            <button
              key={ej.id}
              onClick={() => handleToggleEjercicio(ej.id)}
              className={`w-full rounded-lg border p-3 text-left text-sm ${
                selectedIds.includes(ej.id)
                  ? 'border-white bg-zinc-800 text-white'
                  : 'border-zinc-700 text-zinc-400'
              }`}
            >
              <span className="font-medium">{ej.nombre}</span>
              <span className="ml-2 text-xs text-zinc-500">{ej.grupoMuscular}</span>
            </button>
          ))}
          {(!allEjercicios || allEjercicios.length === 0) && (
            <p className="text-center text-sm text-zinc-500 py-8">
              {t.builderNoExercises}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{circuitoId ? t.builderEditTitle : t.builderNewTitle}</h2>
        <button onClick={onCancel} className="text-sm text-zinc-400">{t.builderCancel}</button>
      </div>

      <div>
        <label className="text-xs text-zinc-500">{t.builderNameLabel}</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={t.builderNamePlaceholder}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500">{t.builderRoundsLabel}</label>
        <input
          type="number"
          min={1}
          max={20}
          value={rondas}
          onChange={(e) => setRondas(parseInt(e.target.value) || 1)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500">{t.builderRestBetweenLabel}</label>
        <input
          type="number"
          min={0}
          max={300}
          value={descansoEntreRondas}
          onChange={(e) => setDescansoEntreRondas(parseInt(e.target.value) || 0)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500">{t.builderExercisesLabel} ({ejerciciosConfig.length})</label>
          <button
            onClick={() => setShowSelector(true)}
            className="text-xs text-white underline"
          >
            {t.builderAddExercises}
          </button>
        </div>

        {ejerciciosConfig.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={ejerciciosConfig.map((e) => e.ejercicioId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mt-2 space-y-2">
                {ejerciciosConfig.map((config) => {
                  const ej = ejerciciosMap.get(config.ejercicioId);
                  if (!ej) return null;
                  return (
                    <SortableItem
                      key={config.ejercicioId}
                      id={config.ejercicioId}
                      ejercicio={ej}
                      config={config}
                      onConfigChange={handleConfigChange}
                      onRemove={handleRemove}
                      t={t}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={!nombre.trim() || ejerciciosConfig.length === 0}
        className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-zinc-900 disabled:opacity-50 active:bg-zinc-200"
      >
        {t.builderSave}
      </button>
    </div>
  );
}
