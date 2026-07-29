'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { db, type CircuitoRecord, type EjercicioRecord, type ConfigRecord } from '@/lib/db';
import { useCircuitTimer } from '@/hooks/useCircuitTimer';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useI18n } from '@/lib/i18n';
import { Timer } from './Timer';

interface CircuitPlayerProps {
  circuito: CircuitoRecord;
  ejercicios: EjercicioRecord[];
  config: ConfigRecord;
  onExit: () => void;
}

export function CircuitPlayer({ circuito, ejercicios, config, onExit }: CircuitPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const wakeLock = useWakeLock();
  const { t } = useI18n();

  const ejerciciosMap = new Map(ejercicios.map((e) => [e.id, e]));

  const { state, start, pause, reset, announceExercise } = useCircuitTimer({
    ejercicios: circuito.ejercicios,
    rondas: circuito.rondas,
    descansoEntreRondas: circuito.descansoEntreRondas ?? 30,
    vozActivada: config.vozActivada,
    sonidosActivados: config.sonidosActivados,
    speechLang: t.speechLang,
    speechTexts: {
      exercise: t.speechExercise,
      rest: t.speechRest,
      roundRest: t.speechRoundRest,
      prepare: t.speechPrepare,
      finished: t.speechFinished,
    },
    onFinished: () => {
      wakeLock.release();
    },
  });

  const currentEjConfig = circuito.ejercicios[state.currentExerciseIndex];
  const currentEjercicio = currentEjConfig ? ejerciciosMap.get(currentEjConfig.ejercicioId) : null;

  // Load video for current exercise
  useEffect(() => {
    if (!currentEjercicio) return;

    let url: string | null = null;
    db.videos.get(currentEjercicio.videoId).then((video) => {
      if (video) {
        url = URL.createObjectURL(video.blob);
        setVideoUrl(url);
      }
    });

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [currentEjercicio?.videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentEjercicio) return;

    const handleTimeUpdate = () => {
      // Loop the trimmed section
      if (video.currentTime >= currentEjercicio.endSec) {
        video.currentTime = currentEjercicio.startSec;
      }
    };

    const handleLoadedData = () => {
      video.currentTime = currentEjercicio.startSec;
      if (state.isRunning && state.phase === 'work') {
        video.play();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoadedData);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [currentEjercicio, state.isRunning, state.phase]);

  // Announce exercise on change
  useEffect(() => {
    if (currentEjercicio && state.isRunning && state.phase === 'work') {
      announceExercise(currentEjercicio.nombre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentExerciseIndex, state.currentRound]);

  // Pause/play video based on state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isRunning && state.phase === 'work') {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [state.isRunning, state.phase]);

  const handleStart = useCallback(() => {
    wakeLock.request();
    if (currentEjercicio) {
      announceExercise(currentEjercicio.nombre);
    }
    start();
  }, [start, wakeLock, announceExercise, currentEjercicio]);

  const handleExit = () => {
    pause();
    wakeLock.release();
    onExit();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      {/* Video */}
      <div className="flex-1 relative">
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-contain"
            playsInline
            muted
            loop={false}
          />
        )}

        {/* Overlay: round info */}
        <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          Ronda {state.currentRound}/{state.totalRounds}
        </div>

        {/* Exit button */}
        <button
          onClick={handleExit}
          className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white"
        >
          ✕ Salir
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 bg-zinc-900 px-4 py-6 safe-bottom">
        {currentEjercicio && (
          <p className="text-sm font-medium text-white">{currentEjercicio.nombre}</p>
        )}

        <Timer secondsLeft={state.secondsLeft} phase={state.phase} />

        <div className="flex gap-4">
          {state.phase === 'finished' ? (
            <button
              onClick={handleExit}
              className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-zinc-900"
            >
              Terminar
            </button>
          ) : state.isRunning ? (
            <button
              onClick={pause}
              className="rounded-lg border border-zinc-600 px-6 py-3 text-sm text-white"
            >
              ⏸ Pausar
            </button>
          ) : (
            <>
              <button
                onClick={handleStart}
                className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white"
              >
                ▶ {state.secondsLeft === circuito.ejercicios[0]?.duracionSeg && state.currentRound === 1 ? 'Iniciar' : 'Continuar'}
              </button>
              <button
                onClick={reset}
                className="rounded-lg border border-zinc-600 px-6 py-3 text-sm text-white"
              >
                ↺ Reiniciar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
