'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { type CircuitoEjercicio } from '@/lib/db';
import { playBeep, playCountdownBeep, speak } from '@/lib/audio';

export type TimerPhase = 'work' | 'rest' | 'finished';

export interface TimerState {
  phase: TimerPhase;
  secondsLeft: number;
  currentExerciseIndex: number;
  currentRound: number;
  totalRounds: number;
  isRunning: boolean;
}

interface UseCircuitTimerOptions {
  ejercicios: CircuitoEjercicio[];
  rondas: number;
  vozActivada: boolean;
  sonidosActivados: boolean;
  onFinished: () => void;
}

export function useCircuitTimer({
  ejercicios,
  rondas,
  vozActivada,
  sonidosActivados,
  onFinished,
}: UseCircuitTimerOptions) {
  const [state, setState] = useState<TimerState>({
    phase: 'work',
    secondsLeft: ejercicios[0]?.duracionSeg ?? 30,
    currentExerciseIndex: 0,
    currentRound: 1,
    totalRounds: rondas,
    isRunning: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  const announceExercise = useCallback(
    (name: string) => {
      if (sonidosActivados) playBeep();
      if (vozActivada) speak(`Ejercicio: ${name}`);
    },
    [vozActivada, sonidosActivados]
  );

  const advanceExercise = useCallback(
    (s: TimerState) => {
      const nextIndex = s.currentExerciseIndex + 1;

      if (nextIndex >= ejercicios.length) {
        // End of round
        const nextRound = s.currentRound + 1;
        if (nextRound > rondas) {
          // Circuit complete
          if (vozActivada) speak('Circuito completado');
          setState((prev) => ({ ...prev, phase: 'finished', isRunning: false, secondsLeft: 0 }));
          if (intervalRef.current) clearInterval(intervalRef.current);
          onFinished();
          return;
        }
        // Start next round from first exercise
        setState((prev) => ({
          ...prev,
          phase: 'work',
          currentExerciseIndex: 0,
          currentRound: nextRound,
          secondsLeft: ejercicios[0].duracionSeg,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          phase: 'work',
          currentExerciseIndex: nextIndex,
          secondsLeft: ejercicios[nextIndex].duracionSeg,
        }));
      }
    },
    [ejercicios, rondas, vozActivada, onFinished]
  );

  const tick = useCallback(() => {
    const s = stateRef.current;
    const newSeconds = s.secondsLeft - 1;

    // Countdown beeps at 3, 2, 1
    if (newSeconds <= 3 && newSeconds > 0 && sonidosActivados) {
      playCountdownBeep();
    }

    // Prepare announcement at 3s remaining in rest
    if (s.phase === 'rest' && newSeconds === 3 && vozActivada) {
      speak('Prepárate');
    }

    if (newSeconds <= 0) {
      // Transition to next phase
      if (s.phase === 'work') {
        const currentEj = ejercicios[s.currentExerciseIndex];
        if (currentEj.descansoSeg > 0) {
          if (vozActivada) speak('Descanso');
          setState((prev) => ({ ...prev, phase: 'rest', secondsLeft: currentEj.descansoSeg }));
        } else {
          // No rest, go directly to next exercise
          advanceExercise(s);
        }
      } else if (s.phase === 'rest') {
        advanceExercise(s);
      }
    } else {
      setState((prev) => ({ ...prev, secondsLeft: newSeconds }));
    }
  }, [ejercicios, vozActivada, sonidosActivados, advanceExercise]);

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    setState({
      phase: 'work',
      secondsLeft: ejercicios[0]?.duracionSeg ?? 30,
      currentExerciseIndex: 0,
      currentRound: 1,
      totalRounds: rondas,
      isRunning: false,
    });
  }, [ejercicios, rondas, pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { state, start, pause, reset, announceExercise };
}
