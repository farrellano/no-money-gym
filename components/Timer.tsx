'use client';

import { type TimerPhase } from '@/hooks/useCircuitTimer';
import { useI18n } from '@/lib/i18n';

interface TimerProps {
  secondsLeft: number;
  phase: TimerPhase;
}

export function Timer({ secondsLeft, phase }: TimerProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const { t } = useI18n();

  const phaseColors: Record<TimerPhase, string> = {
    work: 'text-green-400',
    rest: 'text-yellow-400',
    'round-rest': 'text-orange-400',
    finished: 'text-white',
  };

  const phaseLabels: Record<TimerPhase, string> = {
    work: t.phaseWork,
    rest: t.phaseRest,
    'round-rest': t.phaseRoundRest,
    finished: t.phaseFinished,
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-medium uppercase tracking-widest text-zinc-400">
        {phaseLabels[phase]}
      </span>
      <span className={`text-7xl font-bold tabular-nums ${phaseColors[phase]}`}>
        {display}
      </span>
    </div>
  );
}
