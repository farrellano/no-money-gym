'use client';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md';
}

export function NumberStepper({ value, onChange, min = 0, max = 999, step = 1, size = 'md' }: NumberStepperProps) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  const btnClass = size === 'sm'
    ? 'flex h-7 w-7 items-center justify-center rounded-md bg-zinc-700 text-sm font-bold text-white active:bg-zinc-600'
    : 'flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-700 text-lg font-bold text-white active:bg-zinc-600';

  const valueClass = size === 'sm'
    ? 'min-w-[2.5rem] text-center text-sm font-medium text-white'
    : 'min-w-[3rem] text-center text-base font-medium text-white';

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={decrement} disabled={value <= min} className={`${btnClass} disabled:opacity-30`}>
        −
      </button>
      <span className={valueClass}>{value}</span>
      <button type="button" onClick={increment} disabled={value >= max} className={`${btnClass} disabled:opacity-30`}>
        +
      </button>
    </div>
  );
}
