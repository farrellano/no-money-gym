'use client';

import { useI18n } from '@/lib/i18n';

const steps = {
  es: [
    { emoji: '🎬', title: 'Sube tus videos', desc: 'Graba o descarga videos de ejercicios y súbelos desde tu dispositivo.' },
    { emoji: '✂️', title: 'Recorta y organiza', desc: 'Selecciona la parte activa del video y clasifícalo por grupo muscular.' },
    { emoji: '🔥', title: 'Arma tu circuito', desc: 'Elige ejercicios, configura trabajo/descanso y entrena con un timer.' },
  ],
  en: [
    { emoji: '🎬', title: 'Upload your videos', desc: 'Record or download exercise videos and upload them from your device.' },
    { emoji: '✂️', title: 'Trim & organize', desc: 'Select the active portion of the video and classify by muscle group.' },
    { emoji: '🔥', title: 'Build your circuit', desc: 'Pick exercises, set work/rest intervals, and train with a timer.' },
  ],
};

export function ExplainerVideo() {
  const { locale } = useI18n();
  const items = steps[locale] ?? steps.es;

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center"
            >
              <span className="text-4xl">{step.emoji}</span>
              <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
