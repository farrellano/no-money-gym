'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { type CircuitoEjercicio } from '@/lib/db';
import { playBeep, playCountdownBeep, speak } from '@/lib/audio';

export type TimerPhase = 'work' | 'rest' | 'round-rest' | 'finished';

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
  descansoEntreRondas: number;
  vozActivada: boolean;
  sonidosActivados: boolean;
  onFinished: () => void;
}

export function useCircuitTimer({
  ejercicios,
  rondas,
  descansoEntreRondas,
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
          if (vozActivada) speak('Circuito terminado');
          setState((prev) => ({ ...prev, phase: 'finished', isRunning: false, secondsLeft: 0 }));
          if (intervalRef.current) clearInterval(intervalRef.current);
          onFinished();
          return;
        }
        // Rest between rounds before starting next round
        if (descansoEntreRondas > 0) {
          if (vozActivada) speak('Descanso entre rondas');
          setState((prev) => ({
            ...prev,
            phase: 'round-rest',
            secondsLeft: descansoEntreRondas,
            currentRound: nextRound,
            currentExerciseIndex: 0,
          }));
        } else {
          // No round rest, start next round immediately
          setState((prev) => ({
            ...prev,
            phase: 'work',
            currentExerciseIndex: 0,
            currentRound: nextRound,
            secondsLeft: ejercicios[0].duracionSeg,
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          phase: 'work',
          currentExerciseIndex: nextIndex,
          secondsLeft: ejercicios[nextIndex].duracionSeg,
        }));
      }
    },
    [ejercicios, rondas, descansoEntreRondas, vozActivada, onFinished]
  );

  const tick = useCallback(() => {
    const s = stateRef.current;
    const newSeconds = s.secondsLeft - 1;

    // Countdown beeps at 3, 2, 1
    if (newSeconds <= 3 && newSeconds > 0 && sonidosActivados) {
      playCountdownBeep();
    }

    // Prepare announcement at 3s remaining in rest
    if ((s.phase === 'rest' || s.phase === 'round-rest') && newSeconds === 3 && vozActivada) {
      speak('Prepárate');
    }

    if (newSeconds <= 0) {
      // Transition to next phase
      if (s.phase === 'work') {
        const currentEj = ejercicios[s.currentExerciseIndex];
        const isLastExerciseLastRound =
          s.currentExerciseIndex === ejercicios.length - 1 && s.currentRound === rondas;

        if (isLastExerciseLastRound) {
          // Circuit complete — no rest needed
          advanceExercise(s);
        } else if (currentEj.descansoSeg > 0) {
          if (vozActivada) speak('Descanso');
          setState((prev) => ({ ...prev, phase: 'rest', secondsLeft: currentEj.descansoSeg }));
        } else {
          // No rest, go directly to next exercise
          advanceExercise(s);
        }
      } else if (s.phase === 'rest') {
        advanceExercise(s);
      } else if (s.phase === 'round-rest') {
        // Round rest finished, start first exercise of this round
        setState((prev) => ({
          ...prev,
          phase: 'work',
          secondsLeft: ejercicios[0].duracionSeg,
        }));
      }
    } else {
      setState((prev) => ({ ...prev, secondsLeft: newSeconds }));
    }
  }, [ejercicios, rondas, vozActivada, sonidosActivados, advanceExercise]);

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
