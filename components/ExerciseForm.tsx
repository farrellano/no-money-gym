'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, type EjercicioRecord } from '@/lib/db';
import { useI18n } from '@/lib/i18n';
import { VideoTrimmer } from './VideoTrimmer';
import { StorageModal } from './StorageModal';

const GRUPOS_MUSCULARES = [
  'pierna',
  'espalda',
  'pecho',
  'hombro',
  'brazo',
  'core',
  'glúteo',
  'cardio',
] as const;

interface ExerciseFormProps {
  ejercicio?: EjercicioRecord;
  onSaved: () => void;
  onCancel: () => void;
}

export function ExerciseForm({ ejercicio, onSaved, onCancel }: ExerciseFormProps) {
  const [nombre, setNombre] = useState(ejercicio?.nombre ?? '');
  const [grupoMuscular, setGrupoMuscular] = useState(ejercicio?.grupoMuscular ?? GRUPOS_MUSCULARES[0]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startSec, setStartSec] = useState(ejercicio?.startSec ?? 0);
  const [endSec, setEndSec] = useState(ejercicio?.endSec ?? 0);
  const [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const { t } = useI18n();

  // Load existing video URL for edit mode
  useEffect(() => {
    if (ejercicio?.videoId) {
      db.videos.get(ejercicio.videoId).then((video) => {
        if (video) {
          const url = URL.createObjectURL(video.blob);
          setVideoUrl(url);
          setDuration(video.duracionTotal);
        }
      });
    }
  }, [ejercicio?.videoId]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    if (videoUrl) URL.revokeObjectURL(videoUrl);

    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Get duration from video metadata
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      setStartSec(0);
      setEndSec(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  }, [videoUrl]);

  const handleSave = async () => {
    if (!nombre.trim() || (!videoFile && !ejercicio?.videoId)) return;

    setSaving(true);
    try {
      let videoId = ejercicio?.videoId ?? '';

      if (videoFile) {
        videoId = crypto.randomUUID();
        await db.videos.put({
          id: videoId,
          blob: videoFile,
          duracionTotal: duration,
          createdAt: new Date(),
        });
      }

      const record: EjercicioRecord = {
        id: ejercicio?.id ?? crypto.randomUUID(),
        nombre: nombre.trim(),
        grupoMuscular,
        videoId,
        startSec,
        endSec,
        createdAt: ejercicio?.createdAt ?? new Date(),
      };

      await db.ejercicios.put(record);
      onSaved();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        setStorageError(true);
      } else {
        throw err;
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {ejercicio ? t.exerciseEditTitle : t.exerciseNewTitle}
        </h2>
        <button onClick={onCancel} className="text-sm text-zinc-400">
          {t.exerciseCancel}
        </button>
      </div>

      {!videoUrl && (
        <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 text-zinc-400 active:border-zinc-500">
          <span className="text-3xl">📹</span>
          <span className="mt-1 text-sm">{t.exerciseSelectVideo}</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      )}

      {videoUrl && duration > 0 && (
        <VideoTrimmer
          videoUrl={videoUrl}
          duration={duration}
          startSec={startSec}
          endSec={endSec}
          onRangeChange={(s, e) => {
            setStartSec(s);
            setEndSec(e);
          }}
        />
      )}

      <div className="space-y-3">
        <div>
          <label className="text-xs text-zinc-500">{t.exerciseNameLabel}</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={t.exerciseNamePlaceholder}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-500">{t.exerciseGroupLabel}</label>
          <select
            value={grupoMuscular}
            onChange={(e) => setGrupoMuscular(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
          >
            {GRUPOS_MUSCULARES.map((g, i) => (
              <option key={g} value={g}>
                {(t.muscleGroups as string[])[i + 1]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !nombre.trim() || (!videoFile && !ejercicio?.videoId)}
        className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-zinc-900 disabled:opacity-50 active:bg-zinc-200"
      >
        {saving ? t.exerciseSaving : t.exerciseSave}
      </button>

      <StorageModal open={storageError} onClose={() => setStorageError(false)} />
    </div>
  );
}
